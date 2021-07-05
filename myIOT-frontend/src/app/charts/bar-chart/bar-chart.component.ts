import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';

const TEST_BARCHART_DATA: any[] = [ 
  { data: [23, 25, 31, 27, 21, 18, 19], label: 'temperatura quarto'},
  { data: [25, 22, 28, 32, 24, 18, 17], label: 'temperatura sala'}
];

const TEST_BARCHART_LABELS: Label[] = [ 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  constructor() { }

  public barChartData: any[] = TEST_BARCHART_DATA;
  public barChartLabels: Label[] = TEST_BARCHART_LABELS;
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public barChartOptions: any = {
      showLines: false,
      responsive: true
  };

  ngOnInit(): void {
  }

}
