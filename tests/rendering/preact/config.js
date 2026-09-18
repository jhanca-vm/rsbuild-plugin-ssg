import { defineConfig } from '@rsbuild/core'
import { pluginPreact } from '@rsbuild/plugin-preact'
import { renderToString } from 'preact-render-to-string'
import { pluginSsg } from 'rsbuild-plugin-ssg'

export default defineConfig({
  plugins: [
    pluginPreact(),
    pluginSsg({
      basePath: 'tests/rendering/preact',
      pattern: 'index.jsx',
      render: (Page) => renderToString(Page())
    })
  ]
})
