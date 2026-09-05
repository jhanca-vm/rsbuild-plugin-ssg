import { createRequire } from 'node:module'
import { createContext, Script } from 'node:vm'

import { type RsbuildPlugin } from '@rsbuild/core'

import { PrerenderProvidePlugin } from './prerender-provide-plugin'
import type { PluginSsgOptions, PrerenderAssets } from './types'

const require = createRequire(import.meta.url)

export const PLUGIN_SSG_NAME = 'rsbuild:ssg'

export const pluginSsg = ({
  entry,
  render
}: PluginSsgOptions): RsbuildPlugin => ({
  name: PLUGIN_SSG_NAME,
  setup(api) {
    const prerenderAssets: PrerenderAssets = {}

    api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) => {
      const nodeEntry: Record<string, string> = {}
      const webEntry: Record<string, string | string[]> = {}

      for (const item in entry) {
        nodeEntry[item] = entry[item]
        webEntry[item] = './fallback'
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
              minify: true,
              module: false,
              target: 'node'
            },
            tools: {
              cssLoader: { esModule: false },
              rspack: { output: { library: { type: 'commonjs-static' } } }
            }
          },
          web: {
            dev: { hmr: false },
            source: { entry: webEntry },
            tools: {
              rspack(config, { mergeConfig, rspack, HtmlPlugin }) {
                return mergeConfig(config, {
                  plugins: [
                    new rspack.experiments.VirtualModulesPlugin({
                      './fallback': ''
                    }),
                    new PrerenderProvidePlugin(HtmlPlugin, prerenderAssets)
                  ],
                  dependencies: ['node']
                })
              }
            }
          }
        },
        server: { htmlFallback: false }
      })
    })

    api.processAssets(
      { stage: 'optimize', environments: ['node'] },
      async ({ assets, compilation }) => {
        for (const file in assets) {
          if (file.endsWith('.js')) {
            const script = new Script(assets[file].source() as string)
            const context = createContext({
              console,
              require,
              exports: {},
              process,
              Buffer
            })

            try {
              script.runInContext(context)

              const element = context.exports.default

              prerenderAssets[`${file.slice(0, -3)}.html`] = {
                html: render ? await render(element) : element
              }

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
          const prerenderAsset = prerenderAssets[`${name}.html`]

          if (prerenderAsset) {
            prerenderAsset.css = namedChunkGroups[name].assets?.map(
              ({ name }) => `/${name}`
            )
          }
        }
      }
    })

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
