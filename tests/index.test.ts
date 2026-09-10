import { createRsbuild } from '@rsbuild/core'
import { pluginPreact } from '@rsbuild/plugin-preact'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginVue } from '@rsbuild/plugin-vue'
import type { VNode as PreactNode } from 'preact'
import * as preact from 'preact-render-to-string'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { createSSRApp, type VNode as VueNode } from 'vue'
import * as vue from 'vue/server-renderer'

import { pluginSsg } from '../src'

const entries = [
  {
    type: 'vanilla',
    plugins: [pluginSsg({ basePath: './tests/vanilla', pattern: 'index.ts' })]
  },
  {
    type: 'react',
    plugins: [
      pluginReact(),
      pluginSsg({
        basePath: './tests/react',
        pattern: 'index.tsx',
        render: (Page: () => ReactNode) => renderToStaticMarkup(Page())
      })
    ]
  },
  {
    type: 'vue',
    plugins: [
      pluginVue(),
      pluginSsg({
        basePath: './tests/vue',
        pattern: 'index.vue',
        async render(Page: VueNode) {
          const page = createSSRApp(Page)
          return vue.renderToString(page)
        }
      })
    ]
  },
  {
    type: 'preact',
    plugins: [
      pluginPreact(),
      pluginSsg({
        basePath: './tests/preact',
        pattern: 'index.tsx',
        render: (Page: () => PreactNode) => preact.renderToString(Page())
      })
    ]
  }
]

test.each(entries)('should support $type entry', async ({ plugins, type }) => {
  const rsbuild = await createRsbuild({ config: { plugins, logLevel: 'warn' } })
  const { environments, close } = await rsbuild.createDevServer()

  try {
    const html = await environments.web.getTransformedHtml('index')

    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<script ')
    expect(html).toContain('rel="stylesheet"')
    expect(html).toContain(`<p>${type}</p>`)
  } finally {
    await close()
  }
})
