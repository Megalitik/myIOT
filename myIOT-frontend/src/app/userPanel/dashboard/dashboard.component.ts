import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Device } from '../../shared/device';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private jwtHelper: JwtHelperService, private router: Router) { }

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

  devices: Device[] = [
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

  ngOnInit(): void {
  }

}
