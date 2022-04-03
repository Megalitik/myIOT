import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginForm = this.formBuilder.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', Validators.required]
  });
  constructor(private formBuilder: FormBuilder, private userService: UserService) { }

  ngOnInit(): void {
  }
  onSubmit() {
    // console.log("On submit...")
    // let email = this.loginForm.controls["email"].value;
    // let password = this.loginForm.controls["password"].value;


    // this.userService.Login(email, password).subscribe((data) => {
    //   console.log("Response: ", data);
    // })
  }
}
