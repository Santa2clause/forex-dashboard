import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { environment } from '../environments/environments';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [NgIf,NgFor,FormsModule]
})

export class HomeComponent implements OnInit {
  lastWeekday!: string;
  fromCurrencyCodes: string[] = [];
  toCurrencyCodes: string[] = [];
  fromCurrency: string = 'GBP';
  toCurrency: string = 'USD';
  amount: number = 0;
  result: number | null = null;
  loading: boolean = false;
  amountError: string | null = null;
  currencyError: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.lastWeekday = this.getLastWeekday();
    this.getCurrencyCodes();
  }

  getLastWeekday(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -2 : day === 6 ? -1 : 0;
    const lastWeekday = new Date(today);
    lastWeekday.setDate(today.getDate() + diff);
    return lastWeekday.toISOString().split('T')[0];
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

    if (!this.amount || this.amount <= 0) {
      this.amountError = 'Amount must be greater than 0';
      return;
    }

    if (!this.fromCurrency || !this.toCurrency) {
      this.currencyError = 'Both From and To currencies must be selected';
      return;
    }

    this.loading = true;
    const date = this.lastWeekday;
    const pair = `${this.fromCurrency}/${this.toCurrency}`;
  
    this.http.get<{ closeValue: number }>(`${environment.apiUrl}/closeValue?pair=${pair}&date=${date}`)
    .subscribe({
      next: data => {
        this.result = +((this.amount * data.closeValue).toFixed(2));
        this.loading = false;
      },
      error: error => {
        console.error('Error converting:', error);
        this.loading = false;
      },
      complete: () => {
        console.log('Conversion completed (optional)');
      }
    });
  }

  updateCurrencySelection(): void {
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
}
