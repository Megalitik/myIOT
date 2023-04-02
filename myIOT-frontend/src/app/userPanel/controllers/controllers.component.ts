import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, interval, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';


import { apiServer } from '../../_config/environment';

interface Device {
  deviceId: string;
  deviceName: string;
  LastActivityTime: any;
  IsConnected: any;
}

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.css']
})
export class ControllersComponent implements OnInit {

  private apiUrl =  apiServer.APIUrl + '/api/devices';
  public deviceId: string = "";
  private pollingInterval = 5000; // in milliseconds
  private failedRequests = 0;
  deviceMessages: string[] = [];
  selectedDeviceId: string = '';
  userDevices: Device[] = [];

  temperatureData!: ChartDataSets[];
  humidityData!: ChartDataSets[];
  chartLabels!: Label[];
  chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10
        }
      }]
    }
  };
  chartType: ChartType = 'line';
  commands: string[] = ['command1', 'command2', 'command3'];

  private destroy$ = new Subject<void>();
  private pollingSubscription!: Subscription;

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.deviceId = id !== null ? id : "";
    this.startPolling();

    this.userDeviceList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startPolling(): void {
    this.pollingSubscription = interval(this.pollingInterval)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.http.get<any>(`${this.apiUrl}/${this.deviceId}/temperatureAndHumidityData`)
          .subscribe(
            data => {
              this.temperatureData.push(data.temperature);
              this.humidityData.push(data.humidity);
              const timestamp = new Date(data.timestamp).toLocaleTimeString();
              this.chartLabels.push(timestamp);
              this.failedRequests = 0;
            },
            error => {
              this.failedRequests++;
              if (this.failedRequests === 3) {
                console.error('Não foi possível obter dados do Servidor');
                this.pollingSubscription.unsubscribe();
              }
            }
          );
      });
  }

  userDeviceList() {
    return this.http.get<Device[]>('https://localhost:5001/api/Device/GetDevices/?userId=admin').subscribe(devices => {
      this.userDevices = devices;
    });
  }

  onDeviceSelection() {
    if (this.selectedDeviceId != '') {
      console.log('Selected device ID:', this.selectedDeviceId);
      const url = apiServer.APIUrl + `/api/DeviceMessage/GetDeviceMessages/?deviceId=${this.selectedDeviceId}`;
      this.http.get<string[]>(url);

      this.http.get<string[]>(url).subscribe((messages) => {
        this.deviceMessages = messages;
      });

      timer(0, 5000).subscribe(() => {
        this.http.get<string[]>(url).subscribe((messages) => {
          this.deviceMessages = messages;
        });
      });
    }
  }

  sendCommand(command: string) {
    // API POST request todo
    console.log('Sending command: ' + command);
  }


}
