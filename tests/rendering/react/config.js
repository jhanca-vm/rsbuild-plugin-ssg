import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { renderToStaticMarkup } from 'react-dom/server'
import { pluginSsg } from 'rsbuild-plugin-ssg'

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSsg({
      basePath: 'tests/rendering/react',
      pattern: 'index.jsx',
      render: (Page) => renderToStaticMarkup(Page())
    })
  ]
})
