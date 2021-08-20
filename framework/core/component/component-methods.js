export function setFrameworkMethod(name, value, listeners, attributes, state, key) {
  const method = frameworkMethods.find(method => method.name === name)

  if (!method) throw new Error(`There is no method ${name} in framework. Valuable methods: *href, *value.`)

  listeners.push(method.method(value, attributes, state, key))
}


const frameworkMethods = [{
  name: 'href',
  method: (value, attributes) => {
    attributes.push(['href', value])
    return {
      event: 'click',
      fn: e => {
        e.preventDefault()
        window.location.hash = value
      }
    }
  }
}, {
  name: 'value',
  method: (value, attributes, state, key) => {
    attributes.push(['value', value])
    return {
      event: 'input',
      fn: e => {
        state[key] = e.target.value
      }
    }
  }
}]
