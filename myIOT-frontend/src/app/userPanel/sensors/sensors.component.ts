import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { DeviceService } from '../../shared/deviceMessage.service';
import { Observable, timer } from 'rxjs';
import { apiServer } from '../../_config/environment';
import { ToastrService } from 'ngx-toastr';

interface Device {
  deviceId: string;
  deviceName: string;
  LastActivityTime: any;
  IsConnected: any;
}

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {

  deviceForm!: FormGroup;
  temperatura = '23'
  deviceMessages: string[] = [];
  selectedDeviceId: string = '';
  userDevices: Device[] = [];

  public lineChartColors: any[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,255,0,0.28)',
    },
  ];
  public lineChartData: any[] = [
    { data: [45, 42, 38, 35, 37, 35], label: 'Temperatura' },
  ];
  public lineChartOptions = {
    responsive: true,
  };
  public lineChartLabels: any[] = ['January', 'February', 'March', 'April', 'May', 'June'];
  public lineChartLegend = false;
  lineChartType: ChartType = 'line';

  constructor(private http: HttpClient, private fb: FormBuilder) {   }

  ngOnInit(): void {

    this.deviceForm = this.fb.group({
      deviceId: '',
      chartType: 'line',
      showLegend: true
    });

    this.userDeviceList();
    console.log('Devices:', this.userDevices);

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

  // getDeviceMessages(): Observable<string[]> {
  //   const url = `https://localhost:5001/api/device?deviceId=${this.deviceId}`;
  //   return this.http.get<string[]>(url);
  // }
}

