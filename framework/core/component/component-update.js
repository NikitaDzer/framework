export async function componentUpdate(component, target, state, value) {
  
  const f = component.__f__
  if (f.isComponentMounted) {
    if (component.update) {

      if (f.isStateUpdating) {
        tempStorageUpdate(component, target, state, value)
        textNodesUpdate(component, target, state, value)
        attributesUpdate(component, target, state, value)

        
      } else {

        f.isStateUpdating = true
        component.update()
        f.isStateUpdating = false

        const foundState = findStateInTempStorage(component, state)
        if (foundState) {
          textNodesUpdate(component, target, foundState.state, foundState.value)
          attributesUpdate(component, target, foundState.state, foundState.value)
        } else {
          textNodesUpdate(component, target, state, value)
          attributesUpdate(component, target, state, value)
        }
      }
    } else {
      
    
      tempStorageUpdate(component, target, state, value)
      textNodesUpdate(component, target, state, value)
      attributesUpdate(component, target, state, value)
    }

  } 
}

function tempStorageUpdate(component, target, state, value) {
  const foundState = findStateInTempStorage(component, state)
  if (foundState) {
    foundState.value = value
  } else {
    component.__f__.tempStorage.push({ target, state, value })
  }
}


function textNodesUpdate(component, target, state, value) {
  const state_nodes = target.__f__.bindings.find(state_nodes => state_nodes.state === state)

  if (!state_nodes) throw new Error(`The state ${state} is created in ${Object.getPrototypeOf(component).constructor.name}, but isn't used.`)

  state_nodes.nodes.forEach(node_pipe => {
    node_pipe.node.textContent = node_pipe.pipe(value + '')
  })
}

function attributesUpdate(component, target, state, value) {
  const state_nodes = target.__f__.bindings.find(state_nodes => state_nodes.state === state)

  if (!state_nodes) throw new Error(`The state ${state} is created in ${Object.getPrototypeOf(component).constructor.name}, but isn't used.`)

  
  state_nodes.attributes.forEach(attribute_pipe => {
    attribute_pipe.element[attribute_pipe.attribute] = attribute_pipe.pipe(value + '')
  })
}


function findStateInTempStorage(component, state) {
  return component.__f__.tempStorage.find(s => s.state === state)
}
