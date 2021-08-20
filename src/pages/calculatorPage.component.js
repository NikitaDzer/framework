import { Component } from '../../framework/core'

export class CalculatorPageComponent extends Component {
  constructor() {
    super()

    this.createState({
      a: this.storage('calculator').get().a,
      b: this.storage('calculator').get().b
    })

    this.state.result = this.state.a + this.state.b
    this.state.style = this.state.result > 9 ? 'color: red' : 'color: black'
  }

  update() {
    this.state.result = +this.state.a + +this.state.b
    this.state.style = this.state.result > 9 ? 'color: red' : 'color: black'

    this.storage('calculator').update(value => ({ ...value, result: this.state.result }))
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
