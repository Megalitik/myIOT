import { Component, OnInit } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Toast, ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  formModel = {
    UserName: '',
    Password: ''
  };

  constructor(private userService: UserService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    if (localStorage.getItem("token") != null) {
      this.router.navigateByUrl('');
    }
  }
  onSubmit(form: NgForm) {

    this.userService.Login(form.value).subscribe(
      (res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('');
      },
      error => {
        if (error.status == 400) {
          this.toastr.error("Nome de Utilizador ou Password incorrecto.", "Autenticação falhou.")
        }
        else {
          console.log(error);
        }
      }
    );

  }
}
