import type { VNode as PreactNode } from 'preact'
import type { ReactNode } from 'react'
import type { VNode as VueNode } from 'vue'

interface PrerenderAssetDescription {
  html: string
  /** CSS file paths to be injected into the HTML. */
  css?: string[]
}

export type PrerenderAssets = Record<
  string,
  PrerenderAssetDescription | undefined
>

export type RenderFunction =
  | ((Page: () => ReactNode) => string)
  | ((Page: VueNode) => Promise<string>)
  | ((Page: () => PreactNode) => string)

export interface PluginSsgOptions {
  /** Entry names and their corresponding source file paths. */
  entry: Record<string, string>
  /** Function to convert the exported component/page into an HTML string. */
  render?: RenderFunction
}
