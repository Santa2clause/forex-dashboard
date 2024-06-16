import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { environment } from '../environments/environments';

interface CurrencyPair {
  id: number;
  symbol: string;
  open: string;
  high: string;
  low: string;
  close: string;
  change: string;
  change_percent: string;
  datetime: string;
}

@Component({
  selector: 'app-currency-list',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.css']
})

export class CurrencyListComponent implements OnInit {
  currencyPairs: CurrencyPair[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchCurrencyData();
  }

  fetchCurrencyData() {
    this.http.get<CurrencyPair[]>(`${environment.apiUrl}/get-todays-rates`)
      .subscribe(data => this.currencyPairs = data);
  }
}
