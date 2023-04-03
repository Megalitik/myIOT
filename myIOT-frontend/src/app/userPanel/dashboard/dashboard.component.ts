import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Device } from '../../shared/device';

import { apiServer } from '../../_config/environment';
import { ApiService } from '../../_services/api/api.service';
import { UserStoreService } from 'src/app/_services/userstore/user-store.service';
import { AuthService } from 'src/app/_services/auth/auth.service';
import { DeviceCommand } from 'src/app/Models/DeviceCommand';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  url = apiServer.APIUrl + '/api/';
  devices: any[] = [];
  users: any[] = [];
  errorMessage: string = "";
  username: string = "";
  role: string = "";
  iotHubTest: string = "";

  constructor(private http: HttpClient, private api: ApiService, private userStore: UserStoreService,
    private auth: AuthService, private router: Router) { }

  ngOnInit() {

    if (this.isUserAuthenticated()) {
      this.api.getAllUsers().subscribe(users => {
        this.users = users;
      })


      this.api.sendCommandMessage("SimulatedSensorTest", "command1").subscribe(deviceMessage => {
        this.iotHubTest = deviceMessage;
      })

      this.userStore.getUserNameFromUserStore().subscribe(userName => {
        let usernameFromToken = this.auth.getUsernameFromJwtToken();

        this.username = userName || usernameFromToken;
      });

      this.userStore.getRoleFromUserStore().subscribe(roleJwt => {
        let roleFromToken = this.auth.getRoleFromJwtToken();

        this.role = roleJwt || roleFromToken;
        console.log(this.role);
      });

      // this.http.get<any[]>((this.url + 'GetUserDevices')).subscribe(
      //   data => {
      //     this.devices = data;
      //     if (this.devices.length === 0) {
      //       this.errorMessage = 'Não há dispositivos';
      //     }
      //   },
      //   (error: HttpErrorResponse) => {
      //     if (error.error instanceof ErrorEvent) {
      //       //Erro no lado do cliente
      //       this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
      //     } else {
      //       // Erro no Servidor ou API
      //       this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
      //     }
      //   }
      // );
    }
  }

  navigateToDevice(deviceId: number) {
    this.router.navigate(['/device', deviceId]);
  }

  isUserAuthenticated() {

    if (this.auth.isUserLoggedIn() == true)
      return true;
    else {
      return false;
    }
  }

  devicestest: Device[] = [
    {
      DeviceID: 1, Name: 'Teste', DeviceType:
        { ID: 1, Name: 'TipoTeste' }, DeviceState: true
    },
    {
      DeviceID: 2, Name: 'Teste', DeviceType:
        { ID: 1, Name: 'TipoTeste' }, DeviceState: false
    },
    {
      DeviceID: 3, Name: 'Teste', DeviceType:
        { ID: 3, Name: 'TipoTeste3' }, DeviceState: false
    },
    {
      DeviceID: 4, Name: 'Teste', DeviceType:
        { ID: 4, Name: 'TipoTeste4' }, DeviceState: true
    }
  ];


}
