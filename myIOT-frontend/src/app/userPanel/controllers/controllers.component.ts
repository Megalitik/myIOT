import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, interval, Subscription, timer } from 'rxjs';

import { ApiService } from 'src/app/_services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/_services/auth/auth.service';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.css']
})
export class ControllersComponent implements OnInit {

  errorMessage: string = "";

  currentDeviceId: string = '';
  currentDeviceName: string = '';

  eventTableDeviceWidget: boolean;
  sendMethodOnDeviceWidget: boolean;
  lineChartDeviceWidget: boolean;

  currentDeviceConnectivityState: any = '';
  currentDeviceConnectionString: any = '';
  currentDeviceUser: any = '';

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
        this.currentDeviceName = params.currentDeviceName;
      }
      );

    this.api.getDeviceUser(this.currentDeviceId).subscribe(deviceUser => {

      this.currentDeviceUser = deviceUser;
    });

    this.api.getDeviceWidgets(this.currentDeviceId).subscribe(result => {

      this.sendMethodOnDeviceWidget = result.sendCommands;
      this.eventTableDeviceWidget = result.messageTable;
      this.lineChartDeviceWidget = result.lineChart;
    });

    
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

  getDeviceWidgets() {
    this.api.getDeviceWidgets(this.currentDeviceId).subscribe(result => {

      this.sendMethodOnDeviceWidget = result.sendCommands;
      this.eventTableDeviceWidget = result.messageTable;
      this.lineChartDeviceWidget = result.lineChart;
    });
  }

  updateWidgets() {
    this.api.updateDeviceWidgets(this.currentDeviceId, this.eventTableDeviceWidget, this.sendMethodOnDeviceWidget, this.lineChartDeviceWidget).subscribe(connString => {

      this.toastr.success("As ferramentas foram atualizadas", "Ferramentas Atualizadas");
      this.getDeviceWidgets();

      const closeButton = document.getElementById("deviceWidgetCloseBtn");
      closeButton?.click();
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
}
