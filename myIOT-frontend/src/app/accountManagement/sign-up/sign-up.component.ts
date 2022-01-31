import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  public registerForm = this.formBuilder.group({
    email:['', [Validators.email, Validators.required]],
    password:['', Validators.required],
    confirmPassword:['', Validators.required]
  });

  constructor(private formBuilder:FormBuilder, private userService:UserService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    console.log("On submit...");
    let email = this.registerForm.controls["email"].value;
    let password = this.registerForm.controls["password"].value;

    this.userService.Register(email, password).subscribe((data)=>{
      console.log("Response: ", data);
    })
  }

}
