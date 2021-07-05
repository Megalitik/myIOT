import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

  constructor() { }

  
  public lineChartData: any[] = [
    { data: [85, 72, 78, 75, 77, 75], label: 'Crude oil prices' },
  ];

  public lineChartLabels: any[] = ['January', 'February', 'March', 'April', 'May', 'June'];

  public lineChartOptions = {
    responsive: true,
  };

  public lineChartColors: any[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,255,0,0.28)',
    },
  ];

  public lineChartLegend = true;
  lineChartType: ChartType = 'line';

  ngOnInit(): void {
  }

}


