export class Router {
  constructor(routes) {
    this.routes = routes
    this.element = document.querySelector('app-router')
    this.url = null
    this.component = null
    this.components_classes = []

    this.DEFAULT_ROUTE = routes.find(route => route.path === '**')
    if (!this.DEFAULT_ROUTE) throw new Error('You have no 404 page. Make it.')
  }

  async set() {
    const url = await getUrl()

    if (this.url !== url) {
      const DevClass = await (this.routes.find(route => route.path === url) || this.DEFAULT_ROUTE).component
      const foundComponent = this.components_classes.find(component_class => component_class.DevClass === DevClass) 
      
      let component
      if (foundComponent) component = foundComponent.component
      else {
        component = new DevClass()
        const { template, selector } = component.render()
        component.initing(template, selector)
        this.components_classes.push({ DevClass, component })
      }
      const f = component.__f__
  
      if (this.component) this.component.unmounting()

      this.element.appendChild(document.createElement(f.selector))
  
      component.mounting(this.element)
  
      this.component = component
      this.url = url
    }
  }
}

const getUrl = async () => window.location.hash.slice(1)
