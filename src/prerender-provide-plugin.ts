import type { HtmlRspackPlugin, Rspack } from '@rsbuild/core'

import { Pages } from './types'

export class PrerenderProvidePlugin implements Rspack.RspackPluginInstance {
  readonly name = 'PrerenderProvidePlugin'
  readonly HtmlPlugin: typeof HtmlRspackPlugin
  readonly pages: Pages

  constructor(HtmlPlugin: typeof HtmlRspackPlugin, pages: Pages) {
    this.HtmlPlugin = HtmlPlugin
    this.pages = pages
  }

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.compilation.tap(this.name, (compilation) => {
      const hooks = this.HtmlPlugin.getCompilationHooks(compilation)

      hooks.beforeAssetTagGeneration.tap(this.name, (data) => {
        const page = this.pages.get(data.outputName)

        if (page?.css?.length) {
          data.assets.css.push(...page.css)
        }

        return data
      })

      hooks.afterTemplateExecution.tap(this.name, (data) => {
        const page = this.pages.get(data.outputName)

        if (page) data.html = `<!doctype html>${page.html}`

        // Remove default tags injected by Rsbuild to avoid duplicates with
        // prerendered HTML
        data.headTags.splice(0, 3)

        return data
      })
    })
  }
}
