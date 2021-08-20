import { Component } from '../../framework/core'

export class ContactsPageComponent extends Component {
  constructor() {
    super()

    this.createState({
      surname: 'Dzer',
      age: 16,
      numbers: {
        number: 10
      },
      text: 'Jack'
    }, true)

    this.storage('main').sub(value => this.state.name = value.name)

    this.interval = () => {
      const interval = setInterval(() => this.state.numbers.number++, 1000)
      return () => clearInterval(interval)
    }
  }

  mount() {
    this.clearInterval = this.interval()
  }

  unmount() {
    this.clearInterval()
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
