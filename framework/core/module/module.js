import { initRouter } from "./init-router"
import { initComponents } from "./init-components"

export class Module {
  static async work({ bootstrap, components, routes }) {
    const bootstrapComponent = new bootstrap()
    const { template, selector } = bootstrapComponent.render()

    await bootstrapComponent.initing(template, selector)
    await bootstrapComponent.mounting()
    initComponents(components)
    routes && initRouter(routes)
  }
}




