import { Component } from '../../framework/core'

export class HeaderComponent extends Component {
  constructor() {
    super()

    this.createState({
      title: 'WebCatalyst',
      time: new Date().toLocaleTimeString(),
      number: 10
    })

    this.updateTime = () => {
      setTimeout(() => {
        this.state.time = new Date().toLocaleTimeString()

        this.updateTime()
      }, 1000)
    }
  }

  mount() {
    this.updateTime()
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


