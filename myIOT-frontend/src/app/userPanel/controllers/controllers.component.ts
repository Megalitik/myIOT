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
  deviceId: string;
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
  DeviceCommands: DeviceCommand[]
  selectedCommand: DeviceCommand;
  selectedDeviceId: string = '';
  selectedDeleteDeviceCommand: string = '';
  newDeviceCommandName: string = '';

  newDeviceCommandCommand: string = '';
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

    this.userDeviceCommandsList(this.deviceId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  
  }

  userDeviceCommandsList(deviceId: string) {
    this.api.getDeviceCommands(deviceId).subscribe(commands => {
      console.log('Sending command: ' + this.selectedCommand.Name);
      this.DeviceCommands = commands
      this.toastr.success("O comando foi enviado", "Comando enviado");
    });
  }

  sendCommand() {
    // API POST request todo
    this.api.sendCommandMessage(this.selectedCommand.Name, this.selectedCommand.Name).subscribe(deviceMessage => {
      console.log('Sending command: ' + this.selectedCommand.Name);
      this.toastr.success("O comando foi enviado", "Comando enviado");
    });
  }

  addDeviceCommand() {
    this.api.addNewDeviceCommand(this.deviceId, this.newDeviceCommandName, this.newDeviceCommandCommand).subscribe(deviceMessage => {
      console.log('Adding command: ' + deviceMessage);
      this.toastr.success("O comando foi enviado", "Comando enviado");
    });
  }

  deleteDeviceCommand() {}

  // userDevices: DeviceCommand[] = [
  //   { Id: "1", deviceId: '2', Name: 'Teste1', command:"command1" },
  //   { Id: "2", deviceId: '2', Name: 'Teste2', command:"command1" },
  //   { Id: "3", deviceId: '2', Name: 'Teste3', command:"command1" },
  //   { Id: "4", deviceId: '2', Name: 'Teste4', command:"command1" },
  // ];


}
