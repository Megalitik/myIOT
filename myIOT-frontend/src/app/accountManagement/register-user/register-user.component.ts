import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import * as configurl from '../../_config/environment';
import { AuthService } from '../../_services/auth/auth.service';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent {
  url = configurl.apiServer.APIUrl;

  data = false;
  submitted = false;
  loading = false;
  UserForm: FormGroup = new FormGroup({});

  eyeIcon: string = "fa-eye-slash";
  showPwd: boolean = false;
  type: string = "password";

  constructor(private formbulider: FormBuilder, private auth : AuthService, 
    private router: Router, private http: HttpClient, private toastr: ToastrService) { }

  ngOnInit() {
    this.UserForm = this.formbulider.group({
      UserName: ['', [Validators.required]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      Confirm_password: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]]
    }, { 
      validator: this.ConfirmedValidator('password', 'confirm_password')
    });
  }

  get f() { return this.UserForm.controls; }

  ConfirmedValidator(controlName: string, matchingControlName: string){
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
            return;
        }
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ confirmedValidator: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}


  onFormSubmit() {
    const user = this.UserForm.value;
    this.RegisterUser(user);
  }

  register() {
    if (!this.UserForm.valid) {
      this.toastr.error('Utilizador e/ou Password é necessário', 'Validation Error');
      return;
    }

    console.log(this.UserForm.value);

    this.auth.SignUp(this.UserForm.value).subscribe(
      {
        next:(res)=>{
          this.toastr.success('Utilizador Registrado com Sucesso', 'Successo');
          console.log(res.message);
          this.UserForm.reset();
          this.router.navigate(["/dashboard"]);
        },
        error:(err)=>{
          this.toastr.error('Erro ao Registar um novo Utilizador: ' + err?.error.message, 'Acesso Falhou');
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

  RegisterUser(register: FormBuilder) {
    const userdata = JSON.stringify(register);

    this.http.post(this.url + "registerUser", userdata, {
      headers: new HttpHeaders(
        {
          "Content-Type": "application/json"
        }
      )
    }).subscribe(
      () => {
        this.loading = false;
        this.data = true;
        this.toastr.success("Novo Utilizador registado com sucesso!")
        this.UserForm.reset();
        this.router.navigate(["/login"]);
      }, err => {
        this.loading = false;
        this.toastr.error("Falha ao registar um novo utilizador. \nErro: " + err.message);
      });
  }
  
}
