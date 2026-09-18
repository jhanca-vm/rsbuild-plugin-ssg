import { defineConfig } from '@rsbuild/core'
import { pluginSvelte } from '@rsbuild/plugin-svelte'
import { pluginSsg } from 'rsbuild-plugin-ssg'
import { render } from 'svelte/server'

export default defineConfig({
  plugins: [
    pluginSvelte(),
    pluginSsg({
      basePath: 'tests/rendering/svelte',
      pattern: 'index.svelte',
      render(Page) {
        const { head, body } = render(Page)
        return `<html><head>${head}</head><body>${body}</body></html>`
      }
    })
  ]
})
