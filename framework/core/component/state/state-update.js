export function stateUpdateBeforeMounting(tempStorage) {
  if (tempStorage && tempStorage.length) {
    tempStorage.forEach(data => {
      const binding = data.target.__f__.bindings.find(state_nodes => state_nodes.state === data.state)

      binding.nodes.forEach(node_pipe => {
        node_pipe.node.textContent = node_pipe.pipe(data.value)
      })
      binding.attributes.forEach(attribute_pipe => {
        attribute_pipe.element[attribute_pipe.attribute] = data.value
      })
    })
    tempStorage.length = 0
  }
}
