import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import * as configurl from '../../../_config/config.json';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  invalidLogin?: boolean;
  username: string = "";
  password: string = "";
  loginForm!: FormGroup;
  url = configurl.apiServer.url + '/api/';

  constructor(private router: Router, private http: HttpClient, private jwtHelper: JwtHelperService,
    private toastr: ToastrService, private formBuilder: FormBuilder) { }

    ngOnInit(): void {
      this.loginForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
    }


  login(username: string, password: string) {
    if (!username || !password) {
      this.toastr.error('Username and password are required', 'Validation Error');
      return;
    }

    const loginUrl = this.url + '/AppUser/LoginUser';
    const credentials = {
      username: username,
      password: password
    };

    this.http.post(loginUrl, credentials).subscribe((data: any) => {

      console.log(data);
      // Store the JWT token in the local storage
      localStorage.setItem('token', data['token']);
      this.toastr.success('Acesso feito com Sucesso', 'Successo');
    }, error => {
      console.error(error);
      this.toastr.error(error.error.message, 'Erro');
    });

  }

  register(fullname: string, email: string, password: string, confirmPassword: string) {
    if (!fullname || !email || !password || !confirmPassword) {
      this.toastr.error('Falta campos a preencher', 'Erro de Validação');
      return;
    }
  
    if (password !== confirmPassword) {
      this.toastr.error('Palavras-passe não estão iguais', 'Erro de Validação');
      return;
    }
  
    const registerUrl = this.url + '/AppUser/UserRegister';
    const newUser = {
      fullname: fullname,
      email: email,
      password: password
    };
  
    this.http.post(registerUrl, newUser).subscribe(data => {
      console.log(data);
      this.toastr.success('Registo feito com sucesso', 'Successo');
    }, error => {
      console.error(error);
      this.toastr.error(error.error.message, 'Erro');
    });
  }
  

}
