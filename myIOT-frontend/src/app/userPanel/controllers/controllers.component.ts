import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, interval, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';


import { apiServer } from '../../_config/environment';
import { ApiService } from 'src/app/_services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/_services/auth/auth.service';
import { Device } from 'src/app/Models/Device';

interface DeviceCommand {
  Id: string;
  deviceId: string;
  Name: string;
  Command: string;
}

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.css']
})
export class ControllersComponent implements OnInit {

  private apiUrl =  apiServer.APIUrl + '/api/devices';

  errorMessage: string = "";

  deviceMessages: string[] = [];
  DeviceCommands: any[] = [];
  selectedCommand: any;
  currentDeviceId: string = '';
  selectedDeleteDeviceCommand: string = '';
  newDeviceCommandName: string = '';

  testDevice: Device;

  newDeviceCommandCommand: string = '';
  // userDevices: DeviceCommand[] = [];

  commands: string[] = ['command1', 'command2', 'command3'];

  private destroy$ = new Subject<void>();
  private pollingSubscription!: Subscription;

  @Input() currentDeviceID: string;

  constructor(private route: ActivatedRoute, private api: ApiService,
    private toastr : ToastrService, private auth: AuthService, private http: HttpClient) { }

  ngOnInit(): void {

    this.route.queryParams
      .subscribe(params => {
        console.log(params); 
        this.currentDeviceId = params.currentDeviceID;
      }
    );

    const tokenPayload = this.auth.decodedJwtToken();

    this.userDeviceCommandsList(this.currentDeviceId);
  }


  isUserAllowed() {

  }

  userDeviceCommandsList(deviceId: string) {
    this.api.getDeviceCommands(deviceId).subscribe(commands => {
      
      console.log('Command List: ' + commands);
      console.log(commands);
      this.DeviceCommands = commands
      // this.toastr.success("O comando foi enviado", "Comando enviado");
    });
  }

  sendCommand() {
    console.log(this.selectedCommand);
    // API POST request todo
    this.api.sendCommandMessage(this.selectedCommand.deviceId, this.selectedCommand.id).subscribe(deviceMessage => {
      console.log('Sending command: ' + this.selectedCommand.Name);
      this.toastr.success("O comando foi enviado", "Comando enviado");
    });
  }

  addDeviceCommand() {
    this.api.addNewDeviceCommand(this.currentDeviceId, this.newDeviceCommandName, this.newDeviceCommandCommand).subscribe(deviceMessage => {
      console.log('Adding command: ' + deviceMessage);
      this.toastr.success("O comando foi enviado", "Comando enviado");
    },
    (error: HttpErrorResponse) => {
      if (error.error instanceof ErrorEvent) {
        //Erro no lado do cliente
        this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
        console.log(this.errorMessage);
      } else {
        // Erro no Servidor ou API
        this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
        console.log(this.errorMessage);
      }
    });
  }

  deleteDeviceCommand() {
    this.api.deleteCommandMessage(this.currentDeviceId, this.selectedDeleteDeviceCommand).subscribe(deviceMessage => {
      
      this.toastr.success("O comando foi apagado", "Comando apagado");
    },
    (error: HttpErrorResponse) => {
      if (error.error instanceof ErrorEvent) {
        //Erro no lado do cliente
        this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
        console.log(this.errorMessage);
      } else {
        // Erro no Servidor ou API
        this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
        console.log(this.errorMessage);
      }
    });
  }

  // userDevices: DeviceCommand[] = [
  //   { Id: "1", deviceId: '2', Name: 'Teste1', command:"command1" },
  //   { Id: "2", deviceId: '2', Name: 'Teste2', command:"command1" },
  //   { Id: "3", deviceId: '2', Name: 'Teste3', command:"command1" },
  //   { Id: "4", deviceId: '2', Name: 'Teste4', command:"command1" },
  // ];


}
