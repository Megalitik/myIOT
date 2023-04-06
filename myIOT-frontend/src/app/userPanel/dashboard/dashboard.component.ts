import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

import { apiServer } from '../../_config/environment';
import { ApiService } from '../../_services/api/api.service';
import { UserStoreService } from 'src/app/_services/userstore/user-store.service';
import { AuthService } from 'src/app/_services/auth/auth.service';
import { DeviceCommand } from 'src/app/Models/DeviceCommand';
import { ToastrService } from 'ngx-toastr';
import { FormGroup } from '@angular/forms';
import { Device } from 'src/app/Models/Device';

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
  selectedDeleteDevice: string;

  addDeviceForm: FormGroup;
  deviceUserId: string;


  constructor(private http: HttpClient, private api: ApiService, private userStore: UserStoreService,
    private auth: AuthService, private toastr: ToastrService, private router: Router) { }

  ngOnInit() {

    if (this.isUserAuthenticated()) {
      this.api.getAllUsers().subscribe(users => {
        this.users = users;
      })

      const tokenPayload = this.auth.decodedJwtToken();
      this.deviceUserId = tokenPayload.nameid;

      // this.api.sendCommandMessage("SimulatedSensorTest", "command1").subscribe(deviceMessage => {
        
      // })

      this.api.RegisterNewDeviceAsync("SimulatedSensorTest1", this.deviceUserId).subscribe(deviceMessage => {
        
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

      this.api.getAllUserDevices(this.deviceUserId).subscribe(devices => {
        this.devices = devices;
      });

      this.http.get<Device[]>((this.url + 'GetUserDevices')).subscribe(
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
  }

  onClick() {
    console.log('Selected item ID:', this.selectedDeleteDevice);
  }

  isUserAuthenticated() {

    if (this.auth.isUserLoggedIn() == true)
      return true;
    else {
      return false;
    }
  }

  searchValue: string = '';

  selectedOption: any;

  onOptionSelect(option: any) {
    this.selectedOption = option;
  }

  AddDevice() {
    this.api.RegisterNewDeviceAsync(this.addDeviceForm.value, this.deviceUserId).subscribe(data => {
      this.toastr.success("O dispositivo foi adicionado com sucesso", "Dispositivo Adicionado");
    })
  }

  deleteDevice() {
    this.api.DeleteDeviceAsync(this.selectedDeleteDevice, this.deviceUserId).subscribe(data => {
      this.toastr.success("O dispositivo foi apagado com sucesso", "Dispositivo Apagado");
    })
  }

  onSubmit() {
    console.log(this.selectedOption);
  }

  devicestest: Device[] = [
    { Id: 1, Name: 'Teste1' },
    { Id: 2, Name: 'Teste2' },
    { Id: 3, Name: 'Teste3'},
    { Id: 4, Name: 'Teste4'}
  ];


}
