import { hydrate } from 'preact'

class IslandPreact extends HTMLElement {
  async connectedCallback() {
    const name = this.getAttribute('data-name')

    if (name) {
      const { default: Component } = await import(`./${name}.jsx`)

      hydrate(<Component />, this)
    }
  }
}

customElements.define('island-preact', IslandPreact)
