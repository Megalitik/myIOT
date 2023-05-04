import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { Subscription, interval } from 'rxjs';
import { ApiService } from 'src/app/_services/api/api.service';

const LINE_CHART_SAMPLE_DATA: any[] = [];

const LINE_CHART_LABELS: string[] = ['1', '2', '3', '4', '5', '6'];

@Component({
  selector: 'app-device-line-graph',
  templateUrl: './device-line-graph.component.html',
  styleUrls: ['./device-line-graph.component.css']
})
export class DeviceLineGraphComponent {

  lineChartData: any[] = [];
  lineChartLabels: any[] = [];
  lineChartOptions: any = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 1
        }
      }]
    }
  };
  lineChartLegend: true;
  lineChartType: ChartType = 'line';

  @Input() currentDeviceID: string;

  lineChartSub: Subscription;

  constructor(private api: ApiService) {

    this.lineChartSub = interval(30000).subscribe((func => {
      this.getLineChartData(this.currentDeviceID);

    }))
  }

  ngOnInit(): void {
    this.getLineChartData(this.currentDeviceID);
  }

  ngOnDestroy() {
    this.lineChartSub.unsubscribe();
  }

  getLineChartData(deviceId: string) {
    this.api.getDeviceLineChartMessages(deviceId).subscribe(lineChartData => {

      this.lineChartData = lineChartData.data;
      this.lineChartLabels = lineChartData.messageDate;
      console.log(this.lineChartData);
      console.log(this.lineChartLabels);
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          console.log(`LineChart - O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`);
        } else {
          // Erro no Servidor ou API
          console.log(`LineChart - O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`);
        }
      });
  }

}