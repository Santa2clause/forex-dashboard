import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CurrencyListComponent } from './currency-list/currency-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'currency-list', component: CurrencyListComponent }
];
