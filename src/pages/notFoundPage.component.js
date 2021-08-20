import { Component } from '../../framework/core'

export class NotFoundPageComponent extends Component {
  constructor() {
    super()

    this.createState({
      text: '404 page'
    })
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
