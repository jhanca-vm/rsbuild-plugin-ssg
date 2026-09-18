import { createSSRApp } from 'vue'

class IslandVue extends HTMLElement {
  async connectedCallback() {
    const name = this.getAttribute('data-name')

    if (name) {
      const { default: Component } = await import(`./${name}.vue`)

      createSSRApp(Component).mount(this)
    }
  }
}

customElements.define('island-vue', IslandVue)
