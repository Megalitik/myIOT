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

interface DeviceCommand {
  Id: string;
  Name: string;
  command: string;
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
  selectedCommand: DeviceCommand;
  selectedDeviceId: string = '';
  // userDevices: DeviceCommand[] = [];

  commands: string[] = ['command1', 'command2', 'command3'];

  private destroy$ = new Subject<void>();
  private pollingSubscription!: Subscription;

  @Input() deviceName: string;

  constructor(private route: ActivatedRoute, private api: ApiService,
    private toastr : ToastrService, private auth: AuthService, private http: HttpClient) { }

  ngOnInit(): void {

    console.log(this.deviceName);
    const tokenPayload = this.auth.decodedJwtToken();

    // this.userDeviceCommandsList(tokenPayload.nameid);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  
  }

  userDeviceCommandsList(userId: string) {
    return this.http.get<DeviceCommand[]>(`https://localhost:5001/api/Device/GetDevices/?deviceName=${this.deviceName}&userId=${userId}`).subscribe(devices => {
      console.log(devices);
      this.userDevices = devices;
    });
  }

  sendCommand() {
    // API POST request todo
    this.api.sendCommandMessage(this.selectedCommand.Name, this.selectedCommand.Name).subscribe(deviceMessage => {
      console.log('Sending command: ' + this.selectedCommand.Name);
      this.toastr.success("O comando foi enviado", "Comando enviado");
    });
  }

  userDevices: DeviceCommand[] = [
    { Id: "1", Name: 'Teste1', command:"command1" },
    { Id: "2", Name: 'Teste1', command:"command1" },
    { Id: "3", Name: 'Teste1', command:"command1" },
    { Id: "4", Name: 'Teste1', command:"command1" },
  ];


}
