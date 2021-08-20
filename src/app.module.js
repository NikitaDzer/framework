import { Module } from '../framework/core'
import { AppComponent } from './app.component'
import { HeaderComponent } from './components/header.component'
import { appRoutes } from './app.routes'

Module.work({
  bootstrap: AppComponent,
  components: [ HeaderComponent ],
  routes: appRoutes
})
