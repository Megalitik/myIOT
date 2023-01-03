import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { Router } from "@angular/router";
import { NgForm } from '@angular/forms';

import * as configurl from '../../../_config/config.json';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  invalidLogin?: boolean;
  url = configurl.apiServer.url + '/api/';

  constructor(private router: Router, private http: HttpClient, private jwtHelper: JwtHelperService,
    private toastr: ToastrService) { }


  public login = (form: NgForm) => {
    const credentials = JSON.stringify(form.value);

    this.http.post(this.url + "login", credentials, {
      headers: new HttpHeaders(
        {
          "Content-Type": "application/json"
        }
      )
    }).subscribe(response => {

      const token = (<any>response).token;
      localStorage.setItem("jwt", token);
      this.invalidLogin = false;
      this.toastr.success("Acesso Garantido com sucesso");
      this.router.navigate(["/dashboard"]);
    }, err => {

      this.invalidLogin = true;
      this.toastr.success("Acesso recusado. \nErro: " + err.message);
    });
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
}
