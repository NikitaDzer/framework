import { componentUpdate } from "../component-update"



export function createStateWithContext(component) {
  return (state, extensiable) => {
    // use deepProxy, if extensiable === true

    if (extensiable) {
      component.__f__.extensiable = true
      component.state = deepProxy(state, component)
    } else {
      component.state = poorDeepProxy(state, component)
    }

    if (component.update) {
      component.__f__.isStateUpdating = false
    }
    
    component.state.__f__ = {}
    component.__f__.tempStorage = []
  }
}


function deepProxy(f = {}, g) {
  const h = d => {
      for (let a in d) c(d[a]) && (d[a] = h(d[a]), d[a].__f__ = {})
      return b(d)
    },
    b = b => new Proxy(b, {
      async set(b, a, d) {
        return b[a] !== d && (b[a] = c(d) ? (h(d), b.__f__ = {}) : d, await componentUpdate(g, b, a, d)), !0
      }
    }),
    c = b => "object" == typeof b && !(b instanceof Text);
  return h(f)
}

function poorDeepProxy(c = {}, e) {
  return new Proxy(c, {
    async set(b, a, c) {
      return b[a] !== c && (b[a] = c, await componentUpdate(e, b, a, c)), !0
    }
  })
}
