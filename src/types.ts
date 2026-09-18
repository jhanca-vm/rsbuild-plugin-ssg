import type { PluginVueOptions } from '@rsbuild/plugin-vue'
import type { VNode as PreactNode } from 'preact'
import type { ReactNode } from 'react'
import type { Component } from 'svelte'
import type { CompileOptions } from 'svelte/compiler'
import type { VNode as VueNode } from 'vue'

export type RenderFunction =
  | ((Page: () => ReactNode) => string)
  | ((Page: VueNode) => Promise<string>)
  | ((Page: () => PreactNode) => string)
  | ((Page: Component) => string)

export type Pages = Map<string, { html: string; css?: string[]; js: string[] }>

export type VueLoaderOptions = NonNullable<PluginVueOptions['vueLoaderOptions']>

export interface SvelteLoaderOptions {
  compilerOptions: CompileOptions
}
