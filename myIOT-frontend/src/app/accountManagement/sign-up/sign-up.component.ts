import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html'
})
export class SignUpComponent implements OnInit {

  constructor(public userService: UserService) { }

  ngOnInit(): void {
    this.userService.formModel.reset();
  }

  onSubmit() {
    console.log("On submit...");


    this.userService.Register().subscribe(
      (response: any) => {
        if (response.succeded) {
          this.userService.formModel.reset();
        }
        else {
          response.errors.array.forEach((element: any) => {
            switch (element.code) {
              case 'DuplicateUserName':
                break;
              default:
                break;
            }
          });
        }
      })
  }

}
