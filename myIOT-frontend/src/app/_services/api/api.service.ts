import { Injectable } from '@angular/core';

import * as configurl from '../../_config/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl: string = configurl.apiServer.APIUrl + 'User/';

  constructor(private http : HttpClient) { }

  getAllUsers() {
    return this.http.get<any>(this.baseUrl);
  }
}
