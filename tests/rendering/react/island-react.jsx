import { hydrateRoot } from 'react-dom/client'

class IslandReact extends HTMLElement {
  async connectedCallback() {
    const name = this.getAttribute('data-name')

    if (name) {
      const { default: Component } = await import(`./${name}.jsx`)

      hydrateRoot(this, <Component />)
    }
  }
}

customElements.define('island-react', IslandReact)
