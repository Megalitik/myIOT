import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, interval, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';


import { apiServer } from '../../_config/environment';
import { ApiService } from 'src/app/_services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/_services/auth/auth.service';

interface Device {
  deviceId: string;
  deviceName: string;
  deviceUserId: string;
}

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.css']
})
export class ControllersComponent implements OnInit {

  private apiUrl =  apiServer.APIUrl + '/api/devices';
  public deviceId: string = "";
  deviceMessages: string[] = [];
  selectedCommand = null;
  selectedDeviceId: string = '';
  userDevices: Device[] = [];

  commands: string[] = ['command1', 'command2', 'command3'];

  private destroy$ = new Subject<void>();
  private pollingSubscription!: Subscription;

  @Input() deviceName: string;

  constructor(private route: ActivatedRoute, private api: ApiService,
    private toastr : ToastrService, private auth: AuthService, private http: HttpClient) { }

  ngOnInit(): void {

    console.log(this.deviceName);
    const tokenPayload = this.auth.decodedJwtToken();

    this.userDeviceCommandsList(tokenPayload.nameid);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  
  }

  userDeviceCommandsList(userId: string) {
    return this.http.get<Device[]>(`https://localhost:5001/api/Device/GetDevices/?deviceName=${this.deviceName}&userId=${userId}`).subscribe(devices => {
      console.log(devices);
      this.userDevices = devices;
    });
  }

  sendCommand(device: string, command: string) {
    // API POST request todo
    this.api.sendCommandMessage(device, command).subscribe(deviceMessage => {
      console.log('Sending command: ' + command);
      this.toastr.success("O comando foi enviado", "Comando enviado");
    });
  }


}
