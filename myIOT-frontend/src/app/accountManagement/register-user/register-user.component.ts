import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import * as configurl from '../../_config/config.json';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent {
  url = configurl.apiServer.url + '/api/';

  data = false;
  submitted = false;
  loading = false;
  UserForm: FormGroup = new FormGroup({});

  constructor(private formbulider: FormBuilder, private router: Router, private http: HttpClient, private toastr: ToastrService) { }

  ngOnInit() {
    this.UserForm = this.formbulider.group({
      UserName: ['', [Validators.required]],
      Name: ['', [Validators.required]],
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
        this.toastr.success("Falha ao registar um novo utilizador. \nErro: " + err.message);
      });
  }
  
}
