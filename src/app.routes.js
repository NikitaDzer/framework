import { HomePageComponent } from './pages/homePage.component'
import { LoremPageComponent } from './pages/loremPage.component'
import { ContactsPageComponent } from './pages/contactsPage.component'
import { CalculatorPageComponent } from './pages/calculatorPage.component'
import { NotFoundPageComponent } from './pages/notFoundPage.component'

export const appRoutes = [
  { path: '', component: HomePageComponent },
  { path: 'lorem', component: LoremPageComponent },
  { path: 'contacts', component: ContactsPageComponent },
  { path: 'calculator', component: CalculatorPageComponent },
  { path: '**', component: NotFoundPageComponent }
]
