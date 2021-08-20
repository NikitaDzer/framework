import { Component } from '../framework/core'

export class AppComponent extends Component {
  constructor() {
    super() 

    this.storage('main').set({
      name: 'Nikita'
    })
    this.storage('calculator').set({
      a: 5,
      b: 5,
      result: 10
    })
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
