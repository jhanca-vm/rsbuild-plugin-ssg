# rsbuild-plugin-ssg

Prerender your pages at build time with zero client-side JavaScript by default.

## Why?

- **Lightweight**: You don't always need the heavy abstraction of a full
  meta-framework (like Next.js or Astro). If you already have an Rsbuild setup
  and just need to prerender a few pages, this plugin does exactly that with
  minimal configuration.
- **Zero-JS by default**: The generated output is pure, prerendered HTML and
  extracted CSS. There is no hydration tax, no client-side JavaScript bundle,
  and no complex waterfalls unless you explicitly add them.
- **Framework agnostic**: Works seamlessly with Vanilla JS, React, Vue, and
  Preact.
- **Built on Rsbuild**: Leverages Rsbuild's native multi-environment support to
  handle the Node.js prerendering and web bundling in a single, cohesive build
  process.

## Installation

```bash
npm add -D rsbuild-plugin-ssg
```

## Usage

### Vanilla JS

```ts
// src/index.ts
import './style.css'

export default `
  <html lang="en">
    <head>...</head>
    <body>...</body>
  </html>
`
```

```ts
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core'
import { pluginSsg } from 'rsbuild-plugin-ssg'

export default defineConfig({
  plugins: [pluginSsg({ entry: { index: './src/index.ts' } })]
})
```

### React

```bash
npm add react react-dom
```

```bash
npm add -D @rsbuild/plugin-react
```

```ts
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { pluginSsg } from 'rsbuild-plugin-ssg'

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSsg({
      entry: { index: './src/index.tsx' },
      render: (Page: () => ReactNode) => renderToStaticMarkup(Page())
    })
  ]
})
```

### Vue

```bash
npm add vue
```

```bash
npm add -D @rsbuild/plugin-vue
```

```ts
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'
import { pluginSsg } from 'rsbuild-plugin-ssg'
import { createSSRApp, type VNode } from 'vue'
import { renderToString } from 'vue/server-renderer'

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginSsg({
      entry: { index: './src/index.vue' },
      render: async (Page: VNode) => {
        const app = createSSRApp(Page)
        return renderToString(app)
      }
    })
  ]
})
```

### Preact

```bash
npm add preact preact-render-to-string
```

```bash
npm add -D @rsbuild/plugin-preact
```

```ts
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core'
import { pluginPreact } from '@rsbuild/plugin-preact'
import type { VNode } from 'preact'
import { renderToString } from 'preact-render-to-string'
import { pluginSsg } from 'rsbuild-plugin-ssg'

export default defineConfig({
  plugins: [
    pluginPreact(),
    pluginSsg({
      entry: { index: './src/index.tsx' },
      render: (Page: () => VNode)) => renderToString(Page()),
    }),
  ],
})
```

## Options

### `entry`

- Type: `Record<string, string>`
- Required

Object of entry names to their source file paths. Each key becomes the name of
the generated HTML file (e.g. `index` → `index.html`).

- Example:

```ts
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core'
import { pluginSsg } from 'rsbuild-plugin-ssg'

export default defineConfig({
  plugins: [
    pluginSsg({
      entry: {
        index: './src/index.ts',
        about: './src/about.ts'
      }
    })
  ]
})
```

### `render`

- Type: `((Page: () => ReactNode) => string)
| ((Page: VueNode) => Promise<string>)
| ((Page: () => PreactNode) => string)`
- Default: `undefined`

Optional function that receives the default export of your entry and returns the
HTML string. Required when working with framework components ([React](#react),
[Vue](#vue), [Preact](#preact)).

## License

[MIT](./LICENSE)
