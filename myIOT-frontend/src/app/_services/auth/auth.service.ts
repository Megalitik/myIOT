import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as configurl from '../../_config/environment';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = configurl.apiServer.APIUrl + 'User/';
  private userPayload: any;


  constructor(private http: HttpClient, private router : Router) {
    this.userPayload = this.decodedJwtToken();
   }

  SignUp(userObject: any) {
    return this.http.post<any>(`${this.baseUrl}Register`, userObject)
  }

  Login(loginObject: any) {
    return this.http.post<any>(`${this.baseUrl}Login`, loginObject)
  }

  Logout() {
    localStorage.clear();
    this.router.navigate(['login'])
  }


  //JWT Token Authentication Handling
  storeJwtToken(token: string) {
    localStorage.setItem('token', token)
  }

  getJwtToken() {
    return localStorage.getItem('token')
  }

  getRoleFromJwtToken() {
    if (this.userPayload)
    {
      return this.userPayload.role;
    }
  }

  getUsernameFromJwtToken() {
    if (this.userPayload)
    {
      return this.userPayload.UserName;
    }
  }

  decodedJwtToken() {
    const jwtHelper = new JwtHelperService();
    const jwtToken = this.getJwtToken()!;
    // console.log(jwtHelper.decodeToken(jwtToken));

    return jwtHelper.decodeToken(jwtToken);
  }

  isUserLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }

}
