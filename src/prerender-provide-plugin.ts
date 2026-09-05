import type { HtmlRspackPlugin, Rspack } from '@rsbuild/core'

import type { PrerenderAssets } from './types'

export class PrerenderProvidePlugin implements Rspack.RspackPluginInstance {
  readonly name = 'PrerenderProvidePlugin'
  readonly HtmlPlugin: typeof HtmlRspackPlugin
  readonly prerenderAssets: PrerenderAssets

  constructor(
    HtmlPlugin: typeof HtmlRspackPlugin,
    prerenderAssets: PrerenderAssets
  ) {
    this.HtmlPlugin = HtmlPlugin
    this.prerenderAssets = prerenderAssets
  }

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.compilation.tap(this.name, (compilation) => {
      const hooks = this.HtmlPlugin.getCompilationHooks(compilation)

      hooks.beforeAssetTagGeneration.tap(this.name, (data) => {
        const prerenderAsset = this.prerenderAssets[data.outputName]

        if (prerenderAsset?.css?.length) {
          data.assets.css.push(...prerenderAsset.css)
        }

        return data
      })

      hooks.afterTemplateExecution.tap(this.name, (data) => {
        const prerenderAsset = this.prerenderAssets[data.outputName]

        if (prerenderAsset) data.html = `<!doctype html>${prerenderAsset.html}`

        // Remove default tags injected by Rsbuild to avoid duplicates with
        // prerendered HTML
        data.headTags.splice(0, 3)

        return data
      })
    })
  }
}
