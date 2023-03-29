import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {

  deviceForm!: FormGroup;
  temperatura = '23'
  humidade = '0'
  public lineChartColors: any[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,255,0,0.28)',
    },
  ];
  public lineChartData: any[] = [
    { data: [85, 72, 78, 75, 77, 75], label: 'Crude oil prices' },
  ];
  public lineChartOptions = {
    responsive: true,
  };
  public lineChartLabels: any[] = ['January', 'February', 'March', 'April', 'May', 'June'];
  public lineChartLegend = false;
  lineChartType: ChartType = 'line';

  constructor(private http: HttpClient, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.deviceForm = this.fb.group({
      deviceId: '',
      chartType: 'line',
      showLegend: true
    });
  }
}
