import type { VNode as PreactNode } from 'preact'
import type { ReactNode } from 'react'
import type { VNode as VueNode } from 'vue'

export type RenderFunction =
  | ((Page: () => ReactNode) => string)
  | ((Page: VueNode) => Promise<string>)
  | ((Page: () => PreactNode) => string)

export type Pages = Map<string, { html: string; css?: string[]; js: string[] }>
