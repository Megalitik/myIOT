import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginForm = this.formBuilder.group({
    email:['', [Validators.email, Validators.required]],
    password:['', Validators.required]
  });
  constructor(private formBuilder:FormBuilder) { }

  ngOnInit(): void {
  }
  onSubmit() {
    console.log("On submit...")
  }

}
