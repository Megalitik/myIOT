import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private readonly baseUrl:string="http://localhost:5000/"; //TODO: Por url em ficheiro json encriptado

  constructor(private httpClient:HttpClient) { }

  public Login (email:string, password:string)
  {
    const body={
      Email:email,
      Password:password
    }
    
    return this.httpClient.post(this.baseUrl+"user/Login", body);
  }

  public Register (email:string, password:string)
  {
    const body={
      Email:email,
      Password:password
    }
    
    return this.httpClient.post(this.baseUrl+"user/RegisterUser", body);
  }
}
