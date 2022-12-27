import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private fb:UntypedFormBuilder, private http:HttpClient) { }

  readonly BaseURI = 'http://localhost:5000/api';

  formModel = this.fb.group({
    UserName :['', Validators.required],
    Email :['', Validators.email],
    FullName :[''],
    Passwords : this.fb.group({
      Password :['', [Validators.required, Validators.minLength(5)]],
      ConfirmPassword :['', Validators.required]
    },{validator : this.comparePasswords})
    
  });

  comparePasswords(fb:UntypedFormGroup){
    let confirmPasswordCtrl = fb.get('ConfirmPassword');

    if(confirmPasswordCtrl?.errors == null || 'passwordMismatch' in confirmPasswordCtrl.errors){
      if(fb.get('Password')?.value != confirmPasswordCtrl?.value)
      {
        confirmPasswordCtrl?.setErrors({ passwordMismatch: true });
      }
      else {
        confirmPasswordCtrl?.setErrors(null);
      }
    }
  }

  Register(){
    var body = {
      UserName: this.formModel.value.UserName,
      Email: this.formModel.value.Email,
      FullName: this.formModel.value.FullName,
      Password: this.formModel.value.Passwords.Password
    };

    return this.http.post(this.BaseURI + '/AppUser/RegisterUser', body);
  }

  Login(formData: any){

    return this.http.post(this.BaseURI + '/AppUser/LoginUser', formData);
  }
}
