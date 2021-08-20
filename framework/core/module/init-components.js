export async function initComponents(components) {
  let counter = 0

  await async function recursion() {
    if (counter < components.length) {
      const component = await new components[counter++]
      const { template, selector } = component.render()
      
      await component.initing(template, selector)
      await component.mounting()
      await recursion()
    }
  }()
}
