import { Injectable } from '@angular/core';

import * as configurl from '../../_config/environment';
import { HttpClient } from '@angular/common/http';
import { ResetPassword } from '../../Models/reset-password.model';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {

  private baseUrl: string = configurl.apiServer.APIUrl + 'User';

  constructor(private http : HttpClient) { }

  SendResetPasswordLink(email: string)
  {
    return this.http.post<any>(`${this.baseUrl}/send-reset-email/${email}`, {})
  }

  ResetPassword(resetPasswordObject: ResetPassword)
  {
    return this.http.post<any>(`${this.baseUrl}/reset-password`, resetPasswordObject);
  }
}
