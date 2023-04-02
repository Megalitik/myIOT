import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import * as configurl from '../../../_config/environment';
import { AuthService } from '../../../_services/auth/auth.service';

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

  eyeIcon: string = "fa-eye-slash";
  showPwd: boolean = false;
  type: string = "password";

  url = configurl.apiServer.APIUrl;

  constructor(private router: Router, private auth: AuthService, private http: HttpClient,
    private toastr: ToastrService, private formBuilder: FormBuilder) { }

    ngOnInit(): void {
      this.loginForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
    }


  login() {
    if (!this.loginForm.valid) {
      this.toastr.error('Utilizador e/ou Password é necessário', 'Validation Error');
      return;
    }

    console.log(this.loginForm.value);

    this.auth.Login(this.loginForm.value).subscribe(
      {
        next:(res)=>{
          this.toastr.success('Utilizador com Acesso Garantido', 'Successo');
          console.log(res.message);
          this.loginForm.reset();
          this.router.navigate(["/dashboard"]);
        },
        error:(err)=>{
          this.toastr.error('Erro ao Entrar: ' + err?.error.message, 'Acesso Falhou');
          console.log(err?.error.message);
          return;
        }
      }
    )
  }

  ShowOrHidePassword() {
    this.showPwd = !this.showPwd;
    this.showPwd ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.showPwd ? this.type = "text" : this.type = "password";
  }
  

}
