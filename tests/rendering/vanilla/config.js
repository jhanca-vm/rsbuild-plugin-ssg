import { defineConfig } from '@rsbuild/core'
import { pluginSsg } from 'rsbuild-plugin-ssg'

export default defineConfig({
  plugins: [
    pluginSsg({ basePath: 'tests/rendering/vanilla', pattern: 'index.js' })
  ]
})
