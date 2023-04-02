import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as configurl from '../../_config/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = configurl.apiServer.APIUrl + 'User/';


  constructor(private http: HttpClient) { }

  SignUp(userObject: any) {
    return this.http.post<any>(`${this.baseUrl}Register`, userObject)
  }

  Login(loginObject: any) {
    return this.http.post<any>(`${this.baseUrl}Login`, loginObject)
  }

}
