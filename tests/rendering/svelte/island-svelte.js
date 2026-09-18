import { hydrate } from 'svelte'

class IslandSvelte extends HTMLElement {
  async connectedCallback() {
    const name = this.getAttribute('data-name')

    if (name) {
      const { default: Component } = await import(`./${name}.svelte`)

      hydrate(Component, { target: this })
    }
  }
}

customElements.define('island-svelte', IslandSvelte)
