import { Router } from '../router/router'

export async function initRouter(routes) {
  const router = new Router(routes)
  
  window.addEventListener('hashchange', () => router.set())
  await router.set()

  window.addEventListener('load', async () => {
    router.routes.forEach(route => {
      if (!router.components_classes.find(component_class => component_class.class === route.component)) {
        const component = new route.component
        const { template, selector } = component.render()
        component.initing(template, selector)
        router.components_classes.push({ DevClass: route.component, component })
      }
    })
  })
}
