import { componentParser } from "./component-parser"
import { createStateWithContext } from "./state/state-create"
import { Store } from "./store/store"


export class Component {
  constructor() {
    this.__f__ = {
      parent: null,
      isComponentInited: false,
      isComponentMounted: false
    }

    this.createState = createStateWithContext(this)
    this.storage = Store
  }

  async initing(template, selector) {
    const f = this.__f__

    f.selector = selector
    f.template = template
    f.elements = componentParser(this)

    delete f.extensiable
    delete f.template
    delete this.createState

    f.isComponentInited = true
  }

  async mounting(grandpa = document) {
    const f = this.__f__
    const parent = await grandpa.querySelector(f.selector)

    if (!parent) throw new Error(`There is no ${f.selector} in ${grandpa.constructor.name}.`)

    f.isComponentMounted = true
    this.mount && this.mount()

    await mountComponentToParent(parent, f.elements)

    f.parent = parent
  }

  async rendering(grandpa) {
    await this.initing()
    await this.mounting(grandpa)
  }

  async unmounting() {
    const f = this.__f__
    await f.parent.remove()

    this.unmount && this.unmount()

    f.parent = null
    f.isComponentMounted = false
  }
}


async function mountComponentToParent(parent, elements) {
  let counter = 0
  
  void async function recursion() {
    if (counter < elements.length) {
      parent.appendChild(elements[counter++])
      recursion()
    }
  }()
}




