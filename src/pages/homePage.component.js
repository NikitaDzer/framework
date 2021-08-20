import { Component } from '../../framework/core'

export class HomePageComponent extends Component {
  constructor() {
    super()

    this.createState({
      random: Math.random(),
      result: null
    })
    
    this.interval = () => {
      const interval = setInterval(() => this.state.random = Math.random(), 1000)
      return () => clearInterval(interval)
    }
  }

  mount() {
    this.clearInterval = this.interval()
    this.state.result = this.storage('calculator').get().result
  }

  unmount() {
    this.clearInterval()
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
