import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { environment } from '../environments/environments';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [NgIf,NgFor,FormsModule, MatDatepickerModule, MatInputModule]
})

export class HomeComponent implements OnInit {
  date: Date = new Date();
  fromCurrencyCodes: string[] = [];
  toCurrencyCodes: string[] = [];
  fromCurrency: string = 'GBP';
  toCurrency: string = 'USD';
  amount: number = 1;
  result: string | null = null;
  loading: boolean = false;
  amountError: string | null = null;
  currencyError: string | null = null;
  maxDate: Date = new Date();

  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.getCurrencyCodes();
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.date = event.value || new Date(); 
    this.result = null;
  }

  getCurrencyCodes(): void {
    this.http.get<string[]>(`${environment.apiUrl}/get-currency-codes`)
      .subscribe(data => {
        this.fromCurrencyCodes = data.filter(currency => currency !== this.toCurrency);
        this.toCurrencyCodes = data.filter(currency => currency !== this.fromCurrency);
      });
  }

  convert(): void {
    this.clearErrors();
    this.result = null;

    if (!this.amount || this.amount <= 0) {
      this.amountError = 'Amount must be greater than 0';
      return;
    }

    if (!this.fromCurrency || !this.toCurrency) {
      this.currencyError = 'Both From and To currencies must be selected';
      return;
    }

    this.loading = true;
    const pair = `${this.fromCurrency}/${this.toCurrency}`;

    //Ensure that date conversion does not deduct 1 day and converts the current date
    //selected by the user
    const date = new Date(this.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
  
    this.http.get<{ closeValue: number }>(`${environment.apiUrl}/closeValue?pair=${pair}&date=${formattedDate}`)
    .subscribe({
      next: data => {
        const convertedAmount = +((this.amount * data.closeValue).toFixed(2));
        this.result = convertedAmount.toLocaleString(); 
        this.loading = false;
      },
      error: error => {
        this.currencyError = 'No Data available for selected Forex Pair';
        console.error('Error converting:', error);
        this.loading = false;
      },
      complete: () => {
        console.log('Conversion completed (optional)');
      }
    });
  }

  updateCurrencySelection(): void {
    this.result = null;
    const fromIndex = this.toCurrencyCodes.indexOf(this.fromCurrency);
    if (fromIndex !== -1) {
      this.toCurrencyCodes.splice(fromIndex, 1);
    }

    const toIndex = this.fromCurrencyCodes.indexOf(this.toCurrency);
    if (toIndex !== -1) {
      this.fromCurrencyCodes.splice(toIndex, 1);
    }

    if (this.fromCurrency !== this.toCurrency) {
      this.getCurrencyCodes();
    }
  }

  private clearErrors(): void {
    this.amountError = null;
    this.currencyError = null;
  }

  isConvertEnabled(): boolean {
    return this.date !== null && this.fromCurrency !== null && this.toCurrency !== null;
  }
}
