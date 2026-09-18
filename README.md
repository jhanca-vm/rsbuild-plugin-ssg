# rsbuild-plugin-ssg

Prerender your pages at build time with zero client-side JavaScript by default,
and opt-in interactivity via Islands Architecture.

## Why?

- **Lightweight**: Delivers an Astro-like experience (file-system routing, SSG,
  islands) without heavy meta-framework abstraction.
- **Zero-JS by default**: Pure prerendered HTML and CSS. No hydration tax unless
  you explicitly add it.
- **True Islands**: Opt-in interactivity with real client-side scripts that
  manipulate the DOM.
- **Framework agnostic**: Works with Vanilla JS, React, Vue, Preact and Svelte.
- **Built on Rsbuild**: Native multi-environment support for Node.js
  prerendering and web bundling.

## Installation

```bash
npm add -D rsbuild-plugin-ssg
```

## Usage

Create pages in a dedicated directory (e.g., src/pages). The plugin generates an
HTML file for each matched file.

### Vanilla JS

```ts
// src/pages/index.ts
import '../style.css'

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
  plugins: [pluginSsg({ pattern: '**/*.ts' })]
})
```

### React

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
      pattern: '**/*.tsx',
      render: (Page: () => ReactNode) => renderToStaticMarkup(Page())
    })
  ]
})
```

### Vue

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
      pattern: '**/*.vue',
      render(Page: VNode) {
        const app = createSSRApp(Page)
        return renderToString(app)
      }
    })
  ]
})
```

### Preact

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
      pattern: '**/*.tsx',
      render: (Page: () => VNode) => renderToString(Page())
    })
  ]
})
```

### Svelte

```ts
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core'
import { pluginSvelte } from '@rsbuild/plugin-svelte'
import { pluginSsg } from 'rsbuild-plugin-ssg'
import type { Component } from 'svelte'
import { render } from 'svelte/server'

export default defineConfig({
  plugins: [
    pluginSvelte(),
    pluginSsg({
      pattern: '**/*.svelte',
      render(Page: Component) {
        const { head, body } = render(Page)
        return `<html lang="en"><head>${head}</head><body>${body}</body></html>`
      }
    })
  ]
})
```

## Islands Architecture

This plugin implements the original
[Islands Architecture concept](https://jasonformat.com/islands-architecture/)
as defined by Jason Miller, where islands are **standalone client-side scripts**
that manipulate their own DOM regions independently.

### Adding islands

Append `?client` to any import to mark it as an island. The marked file becomes
a real client-side script that runs in the browser, giving you full control over
how interactivity is added to that specific region of the page.

To prevent TypeScript from throwing errors when using the `?client` suffix on
imports, add module declarations to your `src/env.d.ts`:

```ts
// src/env.d.ts
declare module '*?client' {}
```

### Hydrating framework components

The most optimized approach is to create a **reusable Web Component** that acts
as a generic mount point. It receives the component name as an attribute and
dynamically imports it using a convention-based path.

<details>

<summary>
  <strong>React</strong>
</summary>

<p />

```tsx
// src/islands/react.tsx
import { hydrateRoot } from 'react-dom/client'

class IslandReact extends HTMLElement {
  async connectedCallback() {
    const name = this.getAttribute('data-name')

    if (name) {
      const { default: Component } = await import(`../components/${name}.tsx`)

      hydrateRoot(this, <Component />)
    }
  }
}

customElements.define('island-react', IslandReact)
```

```ts
// src/env.d.ts
declare namespace React.JSX {
  interface IntrinsicElements {
    'island-react': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >
  }
}
```

```tsx
// src/pages/index.tsx
import { renderToString } from 'react-dom/server'
import Counter from '../components/counter'
import RootLayout from '../layouts/root'
import '../islands/react?client'

export default function Home() {
  return (
    <RootLayout>
      <island-react
        data-name="counter"
        dangerouslySetInnerHTML={{ __html: renderToString(<Counter />) }}
      />
    </RootLayout>
  )
}
```

</details>

<details>

<summary>
  <strong>Vue</strong>
</summary>

<p />

```ts
// src/islands/vue.ts
import { createSSRApp } from 'vue'

class IslandVue extends HTMLElement {
  async connectedCallback() {
    const name = this.getAttribute('data-name')

    if (name) {
      const { default: Component } = await import(`../components/${name}.vue`)

      createSSRApp(Component).mount(this)
    }
  }
}

customElements.define('island-vue', IslandVue)
```

```vue
<!-- src/pages/index.vue -->
<script setup>
import Counter from '../components/counter.vue'
import Layout from '../layouts/default.vue'
import '../islands/vue?client'
</script>

<template>
  <Layout>
    <island-vue data-name="counter">
      <Counter />
    </island-vue>
  </Layout>
</template>
```

</details>

<details>

<summary>
  <strong>Preact</strong>
</summary>

<p />

```tsx
// src/islands/preact.tsx
import { hydrate } from 'preact'

class IslandPreact extends HTMLElement {
  async connectedCallback() {
    const name = this.getAttribute('data-name')

    if (name) {
      const { default: Component } = await import(`../components/${name}.tsx`)

      hydrate(<Component />, this)
    }
  }
}

customElements.define('island-preact', IslandPreact)
```

```ts
// src/env.d.ts
declare namespace preact.JSX {
  interface IntrinsicElements {
    'island-preact': preact.HTMLAttributes<HTMLElement>
  }
}
```

```tsx
// src/pages/index.tsx
import { renderToString } from 'preact-render-to-string'
import Counter from '../components/counter'
import RootLayout from '../layouts/root'
import '../islands/preact?client'

export default function Home() {
  return (
    <RootLayout>
      <island-preact
        data-name="counter"
        dangerouslySetInnerHTML={{ __html: renderToString(<Counter />) }}
      />
    </RootLayout>
  )
}
```

</details>

<details>

<summary>
  <strong>Svelte</strong>
</summary>

<p />

```ts
// src/islands/svelte.ts
import { hydrate } from 'svelte'

class IslandSvelte extends HTMLElement {
  async connectedCallback() {
    const name = this.getAttribute('data-name')

    if (name) {
      const { default: Component } = await import(
        `../components/${name}.svelte`
      )

      hydrate(Component, { target: this })
    }
  }
}

customElements.define('island-svelte', IslandSvelte)
```

```svelte
<!-- src/pages/index.svelte -->
<script>
  import Counter from '../components/counter.svelte'
  import BaseLayout from '../layouts/base.svelte'
  import '../islands/svelte?client'
</script>

<BaseLayout>
  <island-svelte data-name="counter">
    <Counter />
  </island-svelte>
</BaseLayout>
```

</details>

## Options

### `basePath`

- Type: `string | undefined`
- Default: `src/pages`

Directory containing page files.

### `pattern`

- Type: `string`
- Required

Glob pattern to match page files inside the `basePath`.

### `render`

- Type: `((Page: () => ReactNode) => string)
| ((Page: VNode) => Promise<string>)
| ((Page: () => VNode) => string)
| ((Page: Component) => string)`
- Default: `undefined`

Function that receives the default export of your page entry and returns the
HTML string. Required when working with framework components ([React](#react),
[Vue](#vue), [Preact](#preact), [Svelte](#svelte)).

## License

[MIT](./LICENSE)
