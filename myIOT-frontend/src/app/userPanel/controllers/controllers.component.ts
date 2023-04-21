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

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.css']
})
export class ControllersComponent implements OnInit {

  private apiUrl = apiServer.APIUrl + '/api/devices';

  errorMessage: string = "";

  DeviceCommands: any[] = [];
  selectedCommand: any;
  currentDeviceId: string = '';

  currentDeviceConnectivityState: any = '';
  currentDeviceConnectionString: any = '';
  currentDeviceUser: any = '';

  selectedDeleteDeviceCommand: string = '';

  newDeviceCommandName: string = '';
  newDeviceCommandCommand: string = '';

  @Input() currentDeviceIDe: string;
  mySub: Subscription;

  constructor(private route: ActivatedRoute, private api: ApiService,
    private toastr: ToastrService, private auth: AuthService, private http: HttpClient) {

    this.mySub = interval(5000).subscribe((func => {
      this.deviceConnectionState(this.currentDeviceId);

    }))
  }

  ngOnDestroy() {
    this.mySub.unsubscribe();
  }

  ngOnInit(): void {

    this.route.queryParams
      .subscribe(params => {
        console.log(params);
        this.currentDeviceId = params.currentDeviceID;
      }
      );

    this.api.getDeviceUser(this.currentDeviceId).subscribe(deviceUser => {

      this.currentDeviceUser = deviceUser;
    });

    this.userDeviceCommandsList(this.currentDeviceId);
    this.deviceConnectionState(this.currentDeviceId);
    this.deviceConnectionString(this.currentDeviceId);
  }

  isUserAuthenticated() {

    if (this.auth.isUserLoggedIn() == true && this.currentDeviceId != undefined && this.currentDeviceId != '') {

      return true;
    }
    else {
      return false;
    }
  }

  isDeviceFromUser() {

    const tokenPayload = this.auth.decodedJwtToken();

    if (this.currentDeviceUser == tokenPayload.nameid) {
      return true;
    }
    else {
      return false;
    }
  }

  userDeviceCommandsList(deviceId: string) {
    this.api.getDeviceCommands(deviceId).subscribe(commands => {

      console.log('Command List: ' + commands);
      console.log(commands);
      this.DeviceCommands = commands
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

  deviceConnectionString(deviceId: string) {
    this.api.getDeviceConnectionString(deviceId).subscribe(connString => {

      this.currentDeviceConnectionString = connString
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
          console.log(this.errorMessage);
          this.currentDeviceConnectionString = "Erro - Não foi possível obter a cadeia de ligação do dispositivo"
        } else {
          // Erro no Servidor ou API
          this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
          console.log(this.errorMessage);
          this.currentDeviceConnectionString = "Erro - Não foi possível obter a cadeia de ligação do dispositivo"
        }
      });
  }

  deviceConnectionState(deviceId: string) {
    this.api.getDeviceConnectionState(deviceId).subscribe(connState => {

      this.currentDeviceConnectivityState = connState
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
          console.log(this.errorMessage);
          this.currentDeviceConnectivityState = "Erro - Não foi possível obter o estado de conetividade do dispositivo"
        } else {
          // Erro no Servidor ou API
          this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
          console.log(this.errorMessage);
          this.currentDeviceConnectivityState = "Erro - Não foi possível obter o estado de conetividade do dispositivo"
        }
      });
  }

  sendCommand() {
    // console.log(this.selectedCommand);
    // API POST request todo
    this.api.sendCommandMessage(this.selectedCommand.deviceId, this.selectedCommand.id).subscribe(deviceMessage => {
      
      this.toastr.success("O comando foi enviado", "Comando enviado");
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
          console.log(this.errorMessage);
          this.toastr.error("Houve um erro ao enviar o comando", "Erro")
        } else {
          // Erro no Servidor ou API
          this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
          console.log(this.errorMessage);
          this.toastr.error("Houve um erro ao enviar o comando", "Erro")
        }
      });
  }

  addDeviceCommand() {
    this.api.addNewDeviceCommand(this.currentDeviceId, this.newDeviceCommandName, this.newDeviceCommandCommand).subscribe(deviceMessage => {

      this.toastr.success("O comando foi criado", "Comando criado");
      this.userDeviceCommandsList(this.currentDeviceId);

      const closeButton = document.getElementById("addDeviceCommandCloseBtn");
      closeButton?.click();
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
          console.log(this.errorMessage);
          this.toastr.error("Houve um erro ao adicionar o comando", "Erro")
        } else {
          // Erro no Servidor ou API
          this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
          console.log(this.errorMessage);
          this.toastr.error("Houve um erro ao adicionar o comando", "Erro")
        }
      });
  }

  deleteDeviceCommand() {
    this.api.deleteCommandMessage(this.currentDeviceId, this.selectedDeleteDeviceCommand).subscribe(deviceMessage => {
      this.userDeviceCommandsList(this.currentDeviceId);
      this.toastr.success("O comando foi apagado", "Comando apagado");
      const closeButton = document.getElementById("deleteDeviceCommandCloseBtn");
      closeButton?.click();
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
          console.log(this.errorMessage);
          this.toastr.error("Houve um erro ao apagar o comando", "Erro")
        } else {
          // Erro no Servidor ou API
          this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
          console.log(this.errorMessage);
          this.toastr.error("Houve um erro ao apagar o comando", "Erro")
        }
      });
  }
}
