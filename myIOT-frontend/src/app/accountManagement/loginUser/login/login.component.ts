import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import * as configurl from '../../../_config/environment';
import { AuthService } from '../../../_services/auth/auth.service';
import { UserStoreService } from 'src/app/_services/userstore/user-store.service';
import { ResetPasswordService } from 'src/app/_services/api/reset-password.service';

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

  isValidEmail!: boolean;
  resetPwdEmail: string = "";

  eyeIcon: string = "fa-eye-slash";
  showPwd: boolean = false;
  type: string = "password";

  url = configurl.apiServer.APIUrl;

  constructor(private router: Router, 
    private auth: AuthService, 
    private http: HttpClient,
    private toastr: ToastrService, private formBuilder: FormBuilder,
    private userStore : UserStoreService,
    private resetService : ResetPasswordService) { }

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
        next: (res) =>{
          this.toastr.success('Utilizador com Acesso Garantido', 'Successo');
          console.log(res);
          this.loginForm.reset();
          this.auth.storeJwtToken(res.token); 


          const tokenPayload = this.auth.decodedJwtToken();
          console.log(tokenPayload);
          this.userStore.setUserNameForUserStore(tokenPayload.unique_name);
          this.userStore.setRoleForUserStore(tokenPayload.role);

          this.router.navigate(["/dashboard"]);
        },
        error: (err) =>{
          console.log(err);
          this.toastr.error('Erro ao Entrar', 'Acesso Falhou');
          
          return;
        }
      }
    )
  }

  RecoverPassword() {
    if (this.ValidateEmail(this.resetPwdEmail))
    {
      console.log(this.resetPwdEmail);

      const closeButton = document.getElementById("resetPwdCloseBtn");

      this.resetService.SendResetPasswordLink(this.resetPwdEmail).subscribe({
        next:(response) => {
          console.log(response);
          this.resetPwdEmail = "";
          
          closeButton?.click();

          this.toastr.success(response.message, "Sucesso");
        },
        error:(err)=>{
          console.log('Erro --: ' + err);
          this.toastr.error("Email inválido", "Erro ao repor a Palavra-Passe");
          closeButton?.click();
        }
      });
    }
  }

  ShowOrHidePassword() {
    this.showPwd = !this.showPwd;
    this.showPwd ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.showPwd ? this.type = "text" : this.type = "password";
  }

  ValidateEmail(email: string) {
    const regEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    this.isValidEmail = regEx.test(email);

    return this.isValidEmail;
  }
  

}
