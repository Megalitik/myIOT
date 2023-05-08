import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ResetPassword } from 'src/app/Models/reset-password.model';
import { ResetPasswordService } from 'src/app/_services/api/reset-password.service';
import { ConfirmPasswordValidator } from 'src/app/_services/helper/confirm-password.validator';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent {

  resetPwdForm!: FormGroup;
  emailToReset!: string;
  emailToken!: string;
  resetPasswordObject = new ResetPassword();

  hasPassword: boolean = true;

  constructor(private formBuilder: FormBuilder, private activatedRoute : ActivatedRoute,
    private resetService : ResetPasswordService, private toastr : ToastrService, private router : Router) {  }

  ngOnInit() {
    this.resetPwdForm = this.formBuilder.group({
      password: [null, Validators.required],
      confirmPassword: [null, Validators.required]
    },
    {
      validator: ConfirmPasswordValidator("password", "confirmPassword")
    });

    this.activatedRoute.queryParams.subscribe(params => {
      this.emailToReset = params['email'];
      let uriToken = params['code'];

      this.emailToken = uriToken.replace(/ /g, '+');
    });
  }

  reset() {
    console.log('reset');
    if (this.resetPwdForm.valid) {
      this.resetPasswordObject.email = this.emailToReset;
      this.resetPasswordObject.newPassword = this.resetPwdForm.value.password;
      this.resetPasswordObject.confirmPassword = this.resetPwdForm.value.confirmPassword;
      this.resetPasswordObject.emailToken = this.emailToken;

      this.resetService.ResetPassword(this.resetPasswordObject).subscribe({
        next:(res)=> {
          this.toastr.success('A Palavra-passe foi reposta', 'Successo');
          this.router.navigate(['login']);
        },
        error:(err)=> {
          this.toastr.error('Erro ao Repor a Palavra-Passe ', 'Acesso Falhou');
        }
      });
    }
    else {
    }
  }

}
