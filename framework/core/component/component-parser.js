import { findPipe } from './component-pipes'
import { setFrameworkMethod } from './component-methods'

export function componentParser(component) {

  const [template, state, name, extensiable] = [component.__f__.template, component.state, 
    component.constructor.name, component.__f__.extensiable]

  // Component elements
  const elements = []
  for (let i = 0; i < template.length; i++) {
    
    if (template[i] === '<') {
      i = recursion(i, elements, template, state, name, extensiable)
    }
  }
  
  // DOM Elements
  const $elements = []
  for (let element of elements) {
    $elements.push(recursion2(element))
  }
  
  return $elements
}



// Some helpers...
const charIsQuotes = char => char === "'" || char === '"'
const charIsGapOrLineBreak = char => char === ' ' || char === '\n'
const charIsBrace = char => char === '{' || char === '}'

const emptySelectors = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr']
const selectorIsEmpty = selector => ~emptySelectors.indexOf(selector)


// Function finds a linkable state and key for this linkable state
function findLinkableStateAndRestKey(overlap, state) {
  const index = overlap.lastIndexOf('.')

  return ~index && [state[overlap.slice(0, index)], overlap.slice(index + 1)]
}



// Function finds a state in a component and create state_nodes
function findState(start, template, state, name, extensiable, attribute) {
  let i = start,
  overlap = '',
  pipeStart = 0

  for (;; i++) {
    
    const char = template[i]
    if (char === '}') {
     
      let pipe = state => state
      if (pipeStart) {
        pipe = findPipe(overlap.slice(pipeStart), name)

        overlap = overlap.slice(0, pipeStart - 1)
      }

      const [linkableState, restKey] = extensiable ? findLinkableStateAndRestKey(overlap, state) || [state, overlap] : 
      [state, overlap]

      // Throw error if cannot find state
      if (!(restKey in linkableState)) throw new Error(`Can't find state ${overlap} in ${name}.`)
      linkableState.__f__.bindings = linkableState.__f__.bindings || []

      const text = pipe(linkableState[restKey]),
      link = linkableState.__f__.bindings.find(state_nodes => state_nodes.state === restKey)
      || linkableState.__f__.bindings[linkableState.__f__.bindings.push({ state: restKey, nodes: [], attributes: [] }) - 1]

      if (attribute) {
        const linkForAttributes = link.attributes[link.attributes.push({ attribute, pipe }) - 1]

        return { link: linkForAttributes, text, state: linkableState, key: restKey }
      }

      return [{ link, text, pipe }, i]
    } else if (char === '|') {
      pipeStart = overlap.length + 1
    }

    // Some optimization...
    (pipeStart && (overlap += char)) || (!charIsGapOrLineBreak(char) && (overlap += char))
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
    i = start

  for (;; i++) {
    const char = template[i]
    if (char === '>' || char === '/') {
      if (attributeName) attributes.push([attributeName, true])

      return [{
        selector,
        attributes,
        listeners,
        statesInAttributes,
        children: selectorIsEmpty(selector) ? [] : [''] 
      }, char === '>' ? i + 1 : i + 2]
    }
    
    if (!selectorComplete) {
      if (char === ' ') selectorComplete = true
      else selector += char
    } else if (!nameComplete) {
      if (char === '=') {
        nameComplete = true
      } else if (!charIsGapOrLineBreak(char)) {
        if (wasGap) {
          if (!charIsQuotes(char)) {
            attributes.push([attributeName, true])
            nameComplete = false
            attributeName = char
          } else {
            nameComplete = true
          }
          wasGap = false
        } else {
          attributeName += char
        }
      } else if (attributeName.length) {
        wasGap = true
      }
    } else if (!valueComplete) {
      if (charIsQuotes(char)) {
        if (++quotesCounter === 2) {
          if (~attributeName.indexOf('*')) {
            setFrameworkMethod(attributeName.slice(1), attributeValue, listeners, attributes)
          } else {
            attributes.push([attributeName, attributeValue])
          }
          attributeName = attributeValue = ''
          nameComplete = valueComplete = false
          quotesCounter = 0
        }
      } else if (charIsBrace(char)) {
        if (++braceCounter === 2) {
          const isFrameworkMethod = ~attributeName.indexOf('*')
          const foundState = findState(0, attributeValue + char, state, name, extensiable, isFrameworkMethod ? attributeName.slice(1) : attributeName)

          if (isFrameworkMethod) {
            setFrameworkMethod(attributeName.slice(1), foundState.text, listeners, attributes, foundState.state, foundState.key)
          } else {
            attributes.push([attributeName, foundState.text])
          }
          
          statesInAttributes.push(foundState.link)
          attributeName = attributeValue = ''
          nameComplete = valueComplete = false
          braceCounter = 0
        }

      } else {
        if (attributeValue.length || !charIsGapOrLineBreak(char)) attributeValue += char
      }
    }
  }
}


// Function parses a template
function recursion(start, children, template, state, name, extensiable) {
  let [element, i] = findSelectorAndAttributes(start + 1, template, state, name, extensiable)
  let indexOfCurrTextNode = 0


  if (!element.children.length) {
    children.push(element)
    return i
  }


  for (;; i++) {
    const char = template[i], 
    preventChar = template[i - 1]

    if (char === '<') {
      if (template[i + 1] === '/') {
        children.push(element)
        return i + 2 + element.selector.length
      } else {
        
        i = recursion(i, element.children, template, state, name, extensiable)
        indexOfCurrTextNode = element.children.push('') - 1
        continue
      }
    }

    if (char === '{') {
      [element.children[++indexOfCurrTextNode], i]
       = findState(i + 1, template, state, name, extensiable)
   
      indexOfCurrTextNode = element.children.push('') - 1
      continue
      }

      
    // Some optimization...
    ((charIsGapOrLineBreak(preventChar) && char === ' ') || char === '\n') || (element.children[indexOfCurrTextNode] += char)
    
  }
}


// Function creates DOM-elements and bind them with component state
function recursion2(element) {
  const $el = document.createElement(element.selector)

  element.attributes.forEach(attribute_value => $el.setAttribute(...attribute_value))
  element.listeners.forEach(({event, fn}) => $el.addEventListener(event, fn))
  element.statesInAttributes.forEach(link => link.element = $el)
  

  for (let child of element.children) {
    if (typeof child === 'string') {
      if (child) {
        const node = document.createTextNode(child)
        $el.append(node)
      }
    } else if (child.link) {
      const node = document.createTextNode(child.text);
      
      const el = (element.children.find(c => c.link === child.link) || child)
      el.link.nodes.push({
        node,
        pipe: child.pipe
      })

      $el.append(node)
    } else {
      $el.append(recursion2(child))
    }
  }

  return $el
}
