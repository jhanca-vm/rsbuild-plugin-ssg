import { Buffer } from 'node:buffer'
import { globSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { createContext, Script } from 'node:vm'

import type { RsbuildPlugin } from '@rsbuild/core'

import { PrerenderProvidePlugin } from './prerender-provide-plugin'
import type { Pages, RenderFunction, SvelteLoaderOptions } from './types'

export interface PluginSsgOptions {
  /**
   * Directory containing page files.
   * @default 'src/pages'
   */
  basePath?: string
  /**
   * Glob pattern to match page files.
   * @example '*.tsx'
   */
  pattern: string
  /** Function to render a page component into an HTML string. */
  render?: RenderFunction
}

const require = createRequire(import.meta.url)

export const PLUGIN_SSG_NAME = 'rsbuild:ssg'

export const pluginSsg = ({
  basePath = 'src/pages',
  pattern,
  render
}: PluginSsgOptions): RsbuildPlugin => ({
  name: PLUGIN_SSG_NAME,
  setup(api) {
    const pages: Pages = new Map()

    api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) => {
      const nodeEntry: Record<string, string> = {}
      const modules: Record<string, string> = {}
      const webEntry: Record<string, string> = {}

      for (const filePath of globSync(`${basePath}/${pattern}`)) {
        const { name, dir } = path.parse(path.relative(basePath, filePath))

        let entryName = name

        if (dir) {
          if (name === 'index') {
            entryName = dir
          } else {
            entryName = `${dir}/${name}`
          }
        }

        nodeEntry[entryName] = `./${filePath}`
        modules[`./${entryName}.client`] = ''
        webEntry[entryName] = `./${entryName}.client`
      }

      return mergeRsbuildConfig(config, {
        environments: {
          node: {
            splitChunks: {
              cacheGroups: {
                extractedCss: {
                  type: 'css/mini-extract',
                  chunks: 'all',
                  enforce: true
                }
              }
            },
            source: { entry: nodeEntry },
            output: {
              autoExternal: true,
              emitCss: true,
              externals: ['svelte/internal/server'],
              minify: true,
              module: false,
              target: 'node'
            },
            tools: {
              bundlerChain(chain, { CHAIN_ID }) {
                if (chain.module.rules.has(CHAIN_ID.RULE.SVELTE)) {
                  chain.module
                    .rule(CHAIN_ID.RULE.SVELTE)
                    .use(CHAIN_ID.USE.SVELTE)
                    .tap((options) => {
                      const { compilerOptions } = options as SvelteLoaderOptions

                      compilerOptions.dev = false
                      compilerOptions.generate = 'server'

                      return options
                    })
                }
              },
              cssLoader: { esModule: false },
              rspack: { output: { library: { type: 'commonjs-static' } } }
            }
          },
          web: {
            dev: { hmr: false },
            source: { entry: webEntry },
            output: { emitCss: false },
            tools: {
              rspack(config, { mergeConfig, rspack, HtmlPlugin }) {
                return mergeConfig(config, {
                  plugins: [
                    new rspack.experiments.VirtualModulesPlugin(modules),
                    new PrerenderProvidePlugin(HtmlPlugin, pages)
                  ],
                  dependencies: ['node']
                })
              }
            }
          }
        },
        dev: {
          watchFiles: {
            paths: [`${basePath}/${pattern}`],
            events: ['add', 'unlink'],
            type: 'restart'
          }
        },
        server: { htmlFallback: false }
      })
    })

    api.transform(
      { resourceQuery: /^\?client$/, environments: ['node'] },
      ({ resourcePath }) => `globalThis.exports.js.push('${resourcePath}')`
    )

    api.processAssets(
      { stage: 'optimize', environments: ['node'] },
      async ({ assets, compilation }) => {
        for (const file in assets) {
          if (file.endsWith('.js')) {
            const script = new Script(assets[file].source() as string)
            const context = createContext({
              console,
              require,
              exports: { js: [] },
              process,
              Buffer,
              queueMicrotask
            })

            try {
              script.runInContext(context)

              const { default: element, js } = context.exports

              pages.set(`${file.slice(0, -3)}.html`, {
                html: render ? await render(element) : element,
                js
              })

              compilation.deleteAsset(file)
            } catch (error) {
              api.logger.error(error)
            }
          }
        }
      }
    )

    api.onAfterEnvironmentCompile(({ environment, stats }) => {
      if (environment.name === 'node' && stats) {
        const { namedChunkGroups } = stats.toJson({
          all: false,
          chunkGroups: true
        })

        for (const name in namedChunkGroups) {
          const page = pages.get(`${name}.html`)

          if (page) {
            page.css = namedChunkGroups[name].assets?.map(
              ({ name }) => `/${name}`
            )
          }
        }
      }
    })

    api.transform(
      { test: /\.client$/, environments: ['web'] },
      ({ resourcePath, environment, addContextDependency, code }) => {
        addContextDependency(path.resolve(environment.config.root, basePath))

        const name = resourcePath.slice(environment.config.root.length + 1, -7)
        const page = pages.get(`${name}.html`)

        if (page?.js.length) {
          for (const jsPath of page.js) {
            code += `import('${jsPath}')\n`
          }
        }

        return code
      }
    )

    if (process.env.NODE_ENV === 'production') {
      api.processAssets(
        { stage: 'optimize-inline', environments: ['web'] },
        ({ assets, compilation }) => {
          for (const file in assets) {
            if (!assets[file].source()) {
              compilation.deleteAsset(file)
            }
          }
        }
      )
    }
  }
})
