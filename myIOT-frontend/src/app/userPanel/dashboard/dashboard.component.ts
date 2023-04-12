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

  devices: any[] = [];

  errorMessage: string = "";
  username: string = "";
  role: string = "";
  selectedDeleteDevice: string;
  newDeviceName: string = "";

  addDeviceForm: FormGroup;
  deviceUserId: string;


  constructor(private http: HttpClient, private api: ApiService, private userStore: UserStoreService,
    private auth: AuthService, private toastr: ToastrService, private router: Router) { }

  ngOnInit() {

    const tokenPayload = this.auth.decodedJwtToken();

    this.deviceUserId = tokenPayload.nameid;
    console.log('UserID: ' + this.deviceUserId);

    if (this.isUserAuthenticated()) {
      
      this.api.getAllUserDevices(this.deviceUserId).subscribe(
        {
          next: (userDevices) => {
            this.devices = userDevices;
            console.log(this.devices);

            if (this.devices.length === 0) {
              this.errorMessage = 'Não há dispositivos';
            }
          },
          error: (err) => {
            console.log(err);
            this.toastr.error('Erro ao Entrar', 'Acesso Falhou');

            return;
          }
        }
      );

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


    }
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
    console.log(this.newDeviceName);
    console.log(this.deviceUserId);

    this.api.RegisterNewDeviceAsync(this.newDeviceName, this.deviceUserId).subscribe(data => {
      console.log(data);
      this.toastr.success("O dispositivo foi adicionado com sucesso", "Dispositivo Adicionado");
      window.location.reload();
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
          console.log(this.errorMessage);
          this.toastr.error("Falha ao registar um novo dispositivo", "Erro - Adicionar Dispositivo");
        } else {
          // Erro no Servidor ou API
          this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
          console.log(this.errorMessage);
          this.toastr.error("Falha ao registar um novo dispositivo", "Erro - Adicionar Dispositivo");
        }
      })
  }

  deleteDevice() {
    this.api.DeleteDeviceAsync(this.selectedDeleteDevice, this.deviceUserId).subscribe(data => {
      console.log(data);
      this.toastr.success("O dispositivo foi apagado com sucesso", "Dispositivo Apagado");
      window.location.reload();
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.errorMessage = `Ocorreu um erro: ${error.error.message}`;
          console.log(this.errorMessage);
          this.toastr.error("Falha ao apagar o dispositivo", "Erro - Apagar Dispositivo");
        } else {
          // Erro no Servidor ou API
          this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
          console.log(this.errorMessage);
          this.toastr.error("Falha ao apagar o dispositivo", "Erro - Apagar Dispositivo");
        }
      })
  }

}
