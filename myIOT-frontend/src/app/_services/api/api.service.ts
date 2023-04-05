import { Injectable } from '@angular/core';

import * as configurl from '../../_config/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUserUrl: string = configurl.apiServer.APIUrl + 'User/';
  private baseDeviceUrl: string = configurl.apiServer.APIUrl + 'Device/';

  constructor(private http : HttpClient) { }

  getAllUsers() {
    return this.http.get<any>(this.baseUserUrl);
  }

  getAllUserDevices(username: string) {
    return this.http.get<any>(`${this.baseUserUrl}GetAllUserDevices?username=${username}`);
  }

  RegisterNewDeviceAsync(deviceId: string) {
    return this.http.post<any>(`${this.baseDeviceUrl}RegisterNewDeviceAsync?newDeviceId=${deviceId}`, {});
  }

  sendCommandMessage(deviceId: string, commandId: string) {
    return this.http.post<any>(`${this.baseDeviceUrl}SendCloudToDeviceMessageAsync?targetDevice=${deviceId}&message=${commandId}`, {});
  }
}
