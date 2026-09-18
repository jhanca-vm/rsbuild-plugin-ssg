import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'
import { pluginSsg } from 'rsbuild-plugin-ssg'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginSsg({
      basePath: 'tests/rendering/vue',
      pattern: 'index.vue',
      render(Page) {
        const app = createSSRApp(Page)
        return renderToString(app)
      }
    })
  ]
})
