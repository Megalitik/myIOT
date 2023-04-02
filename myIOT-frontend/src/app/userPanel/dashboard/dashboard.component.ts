import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Device } from '../../shared/device';

import { apiServer } from '../../_config/environment';
import { ApiService } from '../../_services/api/api.service';
import { UserStoreService } from 'src/app/_services/userstore/user-store.service';
import { AuthService } from 'src/app/_services/auth/auth.service';

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

  constructor(private http: HttpClient, private api : ApiService, private userStore : UserStoreService,
    private jwtHelper: JwtHelperService, private auth : AuthService, private router: Router) { }

  ngOnInit() {
    this.api.getAllUsers().subscribe(users => {
      this.users = users;
    })

    this.userStore.getUserNameFromUserStore().subscribe(userName => {
      let usernameFromToken = this.auth.getUsernameFromJwtToken();

      this.username = userName || usernameFromToken;
    });

    this.http.get<any[]>((this.url + 'GetUserDevices')).subscribe(
      data => {
        this.devices = data;
        if (this.devices.length === 0) {
          this.errorMessage = 'Não há dispositivos';
        }
      },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
        } else {
          // Erro no Servidor ou API
          this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
        }
      }
    );
  }

  navigateToDevice(deviceId: number) {
    this.router.navigate(['/device', deviceId]);
  }

  isUserAuthenticated() 
  {
    const token = localStorage.getItem("jwt");

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return true;
    }
    else {
      return false;
    }
  }
  public logOut = () => {
    localStorage.removeItem("jwt");
    this.router.navigate(["login"]);
  }

  devicestest: Device[] = [
{ DeviceID: 1, Name: 'Teste', DeviceType: 
  { ID: 1, Name: 'TipoTeste'}, DeviceState: true
},
{ DeviceID: 2, Name: 'Teste', DeviceType: 
  { ID: 1, Name: 'TipoTeste'}, DeviceState: false
},
{ DeviceID: 3, Name: 'Teste', DeviceType: 
  { ID: 3, Name: 'TipoTeste3'}, DeviceState: false
},
{ DeviceID: 4, Name: 'Teste', DeviceType: 
  { ID: 4, Name: 'TipoTeste4'}, DeviceState: true
}
  ];


}
