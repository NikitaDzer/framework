(function () {
  'use strict';

  function findPipe(pipeOverlap, name) {
    let pipeName = '';
    

    for (let i = 0;; i++) {
      const char = pipeOverlap[i];

      if (char && !charIsGapOrLineBreak(char)) pipeName += char;
      else if (pipeName.length) {
        const foundPipe = frameworkPipes.find(pipe => ~pipe.names.indexOf(pipeName));
        if (!foundPipe) throw new Error(`The pipe ${pipeName} is not available in ${name}.`)

        const foundArgs = findArgumentsForPipe(pipeOverlap.slice(i));
        return (args => (state => foundPipe.fn(state, ...args)))(foundArgs[0] !== '' ? foundArgs : [])
      }
    }
  }

  function findArgumentsForPipe(argumentsOverlap) {
    return argumentsOverlap.split(':').map(arg => arg.trim())
  }

  const frameworkPipes = [{
    names: ['add', '+'],
    fn: (...args) => {
      let result = Number(args[0]);
      for (let i = 1; i < args.length; i++) {
        result += Number(args[i]);
      }

      return result
    }
  }, {
    names: ['subtract', '-'],
    fn: (...args) => {
      let result = Number(args[0]);
      for (let i = 1; i < args.length; i++) {
        result -= Number(args[i]);
      }

      return result
    }
  }, {
    names: ['multiply', '*'],
    fn: (...args) => {
      let result = Number(args[0]);
      for (let i = 1; i < args.length; i++) {
        result *= Number(args[i]);
      }

      return result
    }
  }, {
    names: ['divide', '/'],
    fn: (...args) => {
      let result = Number(args[0]);
      for (let i = 1; i < args.length; i++) {
        result /= Number(args[i]);
      }

      return result
    }
  }, {
    names: ['power', '**'],
    fn: (...args) => {
      let result = Number(args[0]);
      for (let i = 1; i < args.length; i++) {
        result **= Number(args[i]);
      }

      return result
    }
  }, {
    names: ['uppercase', 'up'],
    fn: (...args) => {
      if (args.length > 1) {
        const arrayOfChars = args[0].split('');
        for (let i = 1; i < args.length; i++) {
          const arg = Number(args[i]);
          arrayOfChars[arg] = arrayOfChars[arg].toUpperCase(); 
        }

        return arrayOfChars.join('')
      } else {
        return args[0].toUpperCase()
      }
    }
  }, {
    names: ['lowercase', 'low'], 
    fn: (...args) => {
      if (args.length > 1) {
        const arrayOfChars = args[0].split('');
        for (let i = 1; i < args.length; i++) {
          const arg = Number(args[i]);
          arrayOfChars[arg] = arrayOfChars[arg].toLowerCase(); 
        }

        return arrayOfChars.join('')
      } else {
        return args[0].toLowerCase()
      }
    }
  }];
  const charIsGapOrLineBreak = char => char === ' ' || char === '\n';

  function setFrameworkMethod(name, value, listeners, attributes, state, key) {
    const method = frameworkMethods.find(method => method.name === name);

    if (!method) throw new Error(`There is no method ${name} in framework. Valuable methods: *href, *value.`)

    listeners.push(method.method(value, attributes, state, key));
  }


  const frameworkMethods = [{
    name: 'href',
    method: (value, attributes) => {
      attributes.push(['href', value]);
      return {
        event: 'click',
        fn: e => {
          e.preventDefault();
          window.location.hash = value;
        }
      }
    }
  }, {
    name: 'value',
    method: (value, attributes, state, key) => {
      attributes.push(['value', value]);
      return {
        event: 'input',
        fn: e => {
          state[key] = e.target.value;
        }
      }
    }
  }];

  function componentParser(component) {

    const [template, state, name, extensiable] = [component.__f__.template, component.state, 
      component.constructor.name, component.__f__.extensiable];

    // Component elements
    const elements = [];
    for (let i = 0; i < template.length; i++) {
      
      if (template[i] === '<') {
        i = recursion(i, elements, template, state, name, extensiable);
      }
    }
    
    // DOM Elements
    const $elements = [];
    for (let element of elements) {
      $elements.push(recursion2(element));
    }
    
    return $elements
  }



  // Some helpers...
  const charIsQuotes = char => char === "'" || char === '"';
  const charIsGapOrLineBreak$1 = char => char === ' ' || char === '\n';
  const charIsBrace = char => char === '{' || char === '}';

  const emptySelectors = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];
  const selectorIsEmpty = selector => ~emptySelectors.indexOf(selector);


  // Function finds a linkable state and key for this linkable state
  function findLinkableStateAndRestKey(overlap, state) {
    const index = overlap.lastIndexOf('.');

    return ~index && [state[overlap.slice(0, index)], overlap.slice(index + 1)]
  }



  // Function finds a state in a component and create state_nodes
  function findState(start, template, state, name, extensiable, attribute) {
    let i = start,
    overlap = '',
    pipeStart = 0;

    for (;; i++) {
      
      const char = template[i];
      if (char === '}') {
       
        let pipe = state => state;
        if (pipeStart) {
          pipe = findPipe(overlap.slice(pipeStart), name);

          overlap = overlap.slice(0, pipeStart - 1);
        }

        const [linkableState, restKey] = extensiable ? findLinkableStateAndRestKey(overlap, state) || [state, overlap] : 
        [state, overlap];

        // Throw error if cannot find state
        if (!(restKey in linkableState)) throw new Error(`Can't find state ${overlap} in ${name}.`)
        linkableState.__f__.bindings = linkableState.__f__.bindings || [];

        const text = pipe(linkableState[restKey]),
        link = linkableState.__f__.bindings.find(state_nodes => state_nodes.state === restKey)
        || linkableState.__f__.bindings[linkableState.__f__.bindings.push({ state: restKey, nodes: [], attributes: [] }) - 1];

        if (attribute) {
          const linkForAttributes = link.attributes[link.attributes.push({ attribute, pipe }) - 1];

          return { link: linkForAttributes, text, state: linkableState, key: restKey }
        }

        return [{ link, text, pipe }, i]
      } else if (char === '|') {
        pipeStart = overlap.length + 1;
      }

      // Some optimization...
      (pipeStart && (overlap += char)) || (!charIsGapOrLineBreak$1(char) && (overlap += char));
    }
  }


  // Function finds a selector in component
  function findSelectorAndAttributes(start, template, state, name, extensiable) {
    let selector = '', 
      attributeName = '',
      attributeValue = '',
      attributes = [],
      listeners = [],
      statesInAttributes = [],
      quotesCounter = 0,
      braceCounter = 0,
      nameComplete = false,
      valueComplete = false,
      selectorComplete = false,
      wasGap = false,
      i = start;

    for (;; i++) {
      const char = template[i];
      if (char === '>' || char === '/') {
        if (attributeName) attributes.push([attributeName, true]);

        return [{
          selector,
          attributes,
          listeners,
          statesInAttributes,
          children: selectorIsEmpty(selector) ? [] : [''] 
        }, char === '>' ? i + 1 : i + 2]
      }
      
      if (!selectorComplete) {
        if (char === ' ') selectorComplete = true;
        else selector += char;
      } else if (!nameComplete) {
        if (char === '=') {
          nameComplete = true;
        } else if (!charIsGapOrLineBreak$1(char)) {
          if (wasGap) {
            if (!charIsQuotes(char)) {
              attributes.push([attributeName, true]);
              nameComplete = false;
              attributeName = char;
            } else {
              nameComplete = true;
            }
            wasGap = false;
          } else {
            attributeName += char;
          }
        } else if (attributeName.length) {
          wasGap = true;
        }
      } else if (!valueComplete) {
        if (charIsQuotes(char)) {
          if (++quotesCounter === 2) {
            if (~attributeName.indexOf('*')) {
              setFrameworkMethod(attributeName.slice(1), attributeValue, listeners, attributes);
            } else {
              attributes.push([attributeName, attributeValue]);
            }
            attributeName = attributeValue = '';
            nameComplete = valueComplete = false;
            quotesCounter = 0;
          }
        } else if (charIsBrace(char)) {
          if (++braceCounter === 2) {
            const isFrameworkMethod = ~attributeName.indexOf('*');
            const foundState = findState(0, attributeValue + char, state, name, extensiable, isFrameworkMethod ? attributeName.slice(1) : attributeName);

            if (isFrameworkMethod) {
              setFrameworkMethod(attributeName.slice(1), foundState.text, listeners, attributes, foundState.state, foundState.key);
            } else {
              attributes.push([attributeName, foundState.text]);
            }
            
            statesInAttributes.push(foundState.link);
            attributeName = attributeValue = '';
            nameComplete = valueComplete = false;
            braceCounter = 0;
          }

        } else {
          if (attributeValue.length || !charIsGapOrLineBreak$1(char)) attributeValue += char;
        }
      }
    }
  }


  // Function parses a template
  function recursion(start, children, template, state, name, extensiable) {
    let [element, i] = findSelectorAndAttributes(start + 1, template, state, name, extensiable);
    let indexOfCurrTextNode = 0;


    if (!element.children.length) {
      children.push(element);
      return i
    }


    for (;; i++) {
      const char = template[i], 
      preventChar = template[i - 1];

      if (char === '<') {
        if (template[i + 1] === '/') {
          children.push(element);
          return i + 2 + element.selector.length
        } else {
          
          i = recursion(i, element.children, template, state, name, extensiable);
          indexOfCurrTextNode = element.children.push('') - 1;
          continue
        }
      }

      if (char === '{') {
        [element.children[++indexOfCurrTextNode], i]
         = findState(i + 1, template, state, name, extensiable);
     
        indexOfCurrTextNode = element.children.push('') - 1;
        continue
        }

        
      // Some optimization...
      ((charIsGapOrLineBreak$1(preventChar) && char === ' ') || char === '\n') || (element.children[indexOfCurrTextNode] += char);
      
    }
  }


  // Function creates DOM-elements and bind them with component state
  function recursion2(element) {
    const $el = document.createElement(element.selector);

    element.attributes.forEach(attribute_value => $el.setAttribute(...attribute_value));
    element.listeners.forEach(({event, fn}) => $el.addEventListener(event, fn));
    element.statesInAttributes.forEach(link => link.element = $el);
    

    for (let child of element.children) {
      if (typeof child === 'string') {
        if (child) {
          const node = document.createTextNode(child);
          $el.append(node);
        }
      } else if (child.link) {
        const node = document.createTextNode(child.text);
        
        const el = (element.children.find(c => c.link === child.link) || child);
        el.link.nodes.push({
          node,
          pipe: child.pipe
        });

        $el.append(node);
      } else {
        $el.append(recursion2(child));
      }
    }

    return $el
  }

  async function componentUpdate(component, target, state, value) {
    
    const f = component.__f__;
    if (f.isComponentMounted) {
      if (component.update) {

        if (f.isStateUpdating) {
          tempStorageUpdate(component, target, state, value);
          textNodesUpdate(component, target, state, value);
          attributesUpdate(component, target, state, value);

          
        } else {

          f.isStateUpdating = true;
          component.update();
          f.isStateUpdating = false;

          const foundState = findStateInTempStorage(component, state);
          if (foundState) {
            textNodesUpdate(component, target, foundState.state, foundState.value);
            attributesUpdate(component, target, foundState.state, foundState.value);
          } else {
            textNodesUpdate(component, target, state, value);
            attributesUpdate(component, target, state, value);
          }
        }
      } else {
        
      
        tempStorageUpdate(component, target, state, value);
        textNodesUpdate(component, target, state, value);
        attributesUpdate(component, target, state, value);
      }

    } 
  }

  function tempStorageUpdate(component, target, state, value) {
    const foundState = findStateInTempStorage(component, state);
    if (foundState) {
      foundState.value = value;
    } else {
      component.__f__.tempStorage.push({ target, state, value });
    }
  }


  function textNodesUpdate(component, target, state, value) {
    const state_nodes = target.__f__.bindings.find(state_nodes => state_nodes.state === state);

    if (!state_nodes) throw new Error(`The state ${state} is created in ${Object.getPrototypeOf(component).constructor.name}, but isn't used.`)

    state_nodes.nodes.forEach(node_pipe => {
      node_pipe.node.textContent = node_pipe.pipe(value + '');
    });
  }

  function attributesUpdate(component, target, state, value) {
    const state_nodes = target.__f__.bindings.find(state_nodes => state_nodes.state === state);

    if (!state_nodes) throw new Error(`The state ${state} is created in ${Object.getPrototypeOf(component).constructor.name}, but isn't used.`)

    
    state_nodes.attributes.forEach(attribute_pipe => {
      attribute_pipe.element[attribute_pipe.attribute] = attribute_pipe.pipe(value + '');
    });
  }


  function findStateInTempStorage(component, state) {
    return component.__f__.tempStorage.find(s => s.state === state)
  }

  function createStateWithContext(component) {
    return (state, extensiable) => {
      // use deepProxy, if extensiable === true

      if (extensiable) {
        component.__f__.extensiable = true;
        component.state = deepProxy(state, component);
      } else {
        component.state = poorDeepProxy(state, component);
      }

      if (component.update) {
        component.__f__.isStateUpdating = false;
      }
      
      component.state.__f__ = {};
      component.__f__.tempStorage = [];
    }
  }


  function deepProxy(f = {}, g) {
    const h = d => {
        for (let a in d) c(d[a]) && (d[a] = h(d[a]), d[a].__f__ = {});
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

  const Store = (() => {
    const stores = [];
    const filter = (cbs, cb) => {
      let i = 0,
        lastIndex = cbs.length - 1;

      for (; cbs[i] !== cb;) {
        if (i++ === lastIndex) return false
      }
      for (; i < lastIndex;) {
        cbs[i] = cbs[++i];
      }
      cbs.pop();

      return true
    };

    return key => {
      let foundStore = stores.find(store => store.key === key);

      let store;
      if (foundStore) store = foundStore;
      else {
        store = { key, callbacks: [], value: {} };
        stores.push(store);
      }

      return {
        set(value) {
          store.value = value;
          store.callbacks.forEach(callback => callback(value));
        },
    
        get() {
          return store.value
        },

        update(updater) {
          this.set(updater(store.value));
        },
    
        sub(callback) {
          store.callbacks.push(callback);
          callback(store.value);

          return () => this.unsub(callback)
        },

        unsub(callback) {
          return filter(store.callbacks, callback)
        }
      }
    }
  })();

  class Component {
    constructor() {
      this.__f__ = {
        parent: null,
        isComponentInited: false,
        isComponentMounted: false
      };

      this.createState = createStateWithContext(this);
      this.storage = Store;
    }

    async initing(template, selector) {
      const f = this.__f__;

      f.selector = selector;
      f.template = template;
      f.elements = componentParser(this);

      delete f.extensiable;
      delete f.template;
      delete this.createState;

      f.isComponentInited = true;
    }

    async mounting(grandpa = document) {
      const f = this.__f__;
      const parent = await grandpa.querySelector(f.selector);

      if (!parent) throw new Error(`There is no ${f.selector} in ${grandpa.constructor.name}.`)

      f.isComponentMounted = true;
      this.mount && this.mount();

      await mountComponentToParent(parent, f.elements);

      f.parent = parent;
    }

    async rendering(grandpa) {
      await this.initing();
      await this.mounting(grandpa);
    }

    async unmounting() {
      const f = this.__f__;
      await f.parent.remove();

      this.unmount && this.unmount();

      f.parent = null;
      f.isComponentMounted = false;
    }
  }


  async function mountComponentToParent(parent, elements) {
    let counter = 0;
    
    void async function recursion() {
      if (counter < elements.length) {
        parent.appendChild(elements[counter++]);
        recursion();
      }
    }();
  }

  var component = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Component: Component
  });

  class Router {
    constructor(routes) {
      this.routes = routes;
      this.element = document.querySelector('app-router');
      this.url = null;
      this.component = null;
      this.components_classes = [];

      this.DEFAULT_ROUTE = routes.find(route => route.path === '**');
      if (!this.DEFAULT_ROUTE) throw new Error('You have no 404 page. Make it.')
    }

    async set() {
      const url = await getUrl();

      if (this.url !== url) {
        const DevClass = await (this.routes.find(route => route.path === url) || this.DEFAULT_ROUTE).component;
        const foundComponent = this.components_classes.find(component_class => component_class.DevClass === DevClass); 
        
        let component;
        if (foundComponent) component = foundComponent.component;
        else {
          component = new DevClass();
          const { template, selector } = component.render();
          component.initing(template, selector);
          this.components_classes.push({ DevClass, component });
        }
        const f = component.__f__;
    
        if (this.component) this.component.unmounting();

        this.element.appendChild(document.createElement(f.selector));
    
        component.mounting(this.element);
    
        this.component = component;
        this.url = url;
      }
    }
  }

  const getUrl = async () => window.location.hash.slice(1);

  async function initRouter(routes) {
    const router = new Router(routes);
    
    window.addEventListener('hashchange', () => router.set());
    await router.set();

    window.addEventListener('load', async () => {
      router.routes.forEach(route => {
        if (!router.components_classes.find(component_class => component_class.class === route.component)) {
          const component = new route.component;
          const { template, selector } = component.render();
          component.initing(template, selector);
          router.components_classes.push({ DevClass: route.component, component });
        }
      });
    });
  }

  async function initComponents(components) {
    let counter = 0;

    await async function recursion() {
      if (counter < components.length) {
        const component = await new components[counter++];
        const { template, selector } = component.render();
        
        await component.initing(template, selector);
        await component.mounting();
        await recursion();
      }
    }();
  }

  class Module {
    static async work({ bootstrap, components, routes }) {
      const bootstrapComponent = new bootstrap();
      const { template, selector } = bootstrapComponent.render();

      await bootstrapComponent.initing(template, selector);
      await bootstrapComponent.mounting();
      initComponents(components);
      routes && initRouter(routes);
    }
  }

  var module = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Module: Module
  });

  const { Component: Component$1 } = component;
  const { Module: Module$1 } = module;

  class AppComponent extends Component$1 {
    constructor() {
      super(); 

      this.storage('main').set({
        name: 'Nikita'
      });
      this.storage('calculator').set({
        a: 5,
        b: 5,
        result: 10
      });
    }

    render() {
      return {
        selector: 'app-root',
        template: `
        <app-header></app-header>
        <app-router></app-router>
      `
      }
    }
  }

  class HeaderComponent extends Component$1 {
    constructor() {
      super();

      this.createState({
        title: 'WebCatalyst',
        time: new Date().toLocaleTimeString(),
        number: 10
      });

      this.updateTime = () => {
        setTimeout(() => {
          this.state.time = new Date().toLocaleTimeString();

          this.updateTime();
        }, 1000);
      };
    }

    mount() {
      this.updateTime();
    }

    render() {
      return {
        selector: 'app-header',
        template: `
        <header style='display:flex; justify-content:space-around; align-items:center; width:100vw; height:70px; border-bottom: 1px solid #eee; box-shadow: 0 2px 6px #ccc'>
          <h1>{ title }</h1>
          <h2>Time - { time }</h2>
          <div>
            <a style='font-size:25px; background: #eee; text-decoration:none; padding: 8px 16px' *href='#'>Home</a> 
            <a style='font-size:25px; background: #eee; text-decoration:none; padding: 8px 16px' *href='#lorem'>Lorem</a>
            <a style='font-size:25px; background: #eee; text-decoration:none; padding: 8px 16px' *href='#contacts'>Contacts</a>
            <a style='font-size:25px; background: #eee; text-decoration:none; padding: 8px 16px' *href='#calculator'>Calculator</a>
          </div>
        </header>`
      }
    }
    
  }

  class HomePageComponent extends Component$1 {
    constructor() {
      super();

      this.createState({
        random: Math.random(),
        result: null
      });
      
      this.interval = () => {
        const interval = setInterval(() => this.state.random = Math.random(), 1000);
        return () => clearInterval(interval)
      };
    }

    mount() {
      this.clearInterval = this.interval();
      this.state.result = this.storage('calculator').get().result;
    }

    unmount() {
      this.clearInterval();
    }

    render() {
      return {
        selector: 'app-home_page',
        template: `
        <main>
          <p>Рандомное число раз в секунду - <strong>{ random }</strong></p>
          <p>Result: {result | * 10}</p>
        </main>
      `
      }
    }
  }

  class LoremPageComponent extends Component$1 {
  	render() {
  		return {
  			selector: 'app-lorem_page',
  			template: `<p>Lorem ipsum</p>`
  		}
  	}
  }

  class ContactsPageComponent extends Component$1 {
    constructor() {
      super();

      this.createState({
        surname: 'Dzer',
        age: 16,
        numbers: {
          number: 10
        },
        text: 'Jack'
      }, true);

      this.storage('main').sub(value => this.state.name = value.name);

      this.interval = () => {
        const interval = setInterval(() => this.state.numbers.number++, 1000);
        return () => clearInterval(interval)
      };
    }

    mount() {
      this.clearInterval = this.interval();
    }

    unmount() {
      this.clearInterval();
    }

    render() {
      return {
        selector: 'app-contacts_page',
        template: `
        <p id = 'author'>
          Name - { name }, surname - { surname }, age - { age }.
        </p>
        <p>
          <h3>Number - { numbers.number | + 2 }</h3>
          <h3>Number - { numbers.number | - 2 }</h3>
          <h3>Number - { numbers.number | * 2 }</h3>
          <h3>Number - { numbers.number | / 2 }</h3>
          <h3>Number - { numbers.number | ** 2 }</h3>
          <h3>Text - { text | up 1:3 }</h3>
          <h3>Text - { text | low }</h3>
        </p>
      `
      }
    }
  }

  class CalculatorPageComponent extends Component$1 {
    constructor() {
      super();

      this.createState({
        a: this.storage('calculator').get().a,
        b: this.storage('calculator').get().b
      });

      this.state.result = this.state.a + this.state.b;
      this.state.style = this.state.result > 9 ? 'color: red' : 'color: black';
    }

    update() {
      this.state.result = +this.state.a + +this.state.b;
      this.state.style = this.state.result > 9 ? 'color: red' : 'color: black';

      this.storage('calculator').update(value => ({ ...value, result: this.state.result }));
    }

    render() {
      return {
        selector: 'app-calculator_page',
        template: `
        <div>
          <input type='number' *value = {a} />
          <input type='number' *value = {b} />
          <p style={style}>Result: {result}</p>
        </div>
      `
      }
    }
  }

  class NotFoundPageComponent extends Component$1 {
    constructor() {
      super();

      this.createState({
        text: '404 page'
      });
    }

    render() {
      return {
        selector: 'app-not_found',
        template: `
        <p style='font-size: 40px; color: red;'><strong>{ text }</strong></p>
        <a style='font-size: 34px;' *href='#'>To home page</a>
      `
      }
    }
  }

  const appRoutes = [
    { path: '', component: HomePageComponent },
    { path: 'lorem', component: LoremPageComponent },
    { path: 'contacts', component: ContactsPageComponent },
    { path: 'calculator', component: CalculatorPageComponent },
    { path: '**', component: NotFoundPageComponent }
  ];

  Module$1.work({
    bootstrap: AppComponent,
    components: [ HeaderComponent ],
    routes: appRoutes
  });

}());
//# sourceMappingURL=bundle.js.map
