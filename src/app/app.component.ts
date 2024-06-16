import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CurrencyListComponent } from './currency-list/currency-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CurrencyListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'forex-dashboard';
}
