import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as configurl from '../../_config/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = configurl.apiServer.APIUrl + 'User/';


  constructor(private http: HttpClient, private router : Router) { }

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
    localStorage.getItem('token')
  }

  isUserLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }

}
