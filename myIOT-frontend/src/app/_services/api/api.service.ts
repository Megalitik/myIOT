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
    return this.http.get<any>(`${this.baseUserUrl}GetDevices?username=${username}`);
  }

  getDeviceConnectionState(deviceId: string) {
    return this.http.get<any>(`${this.baseDeviceUrl}GetDeviceConnectionStateAsync?deviceId=${deviceId}`);
  }

  RegisterNewDeviceAsync(deviceName: string, userID: string) {
    return this.http.post<any>(`${this.baseDeviceUrl}RegisterNewDeviceAsync?deviceName=${deviceName}&userID=${userID}`, {});
  }

  DeleteDeviceAsync(deviceId: string, userId: string) {
    return this.http.post<any>(`${this.baseDeviceUrl}DeleteDeviceAsync?deviceId=${deviceId}&deviceId=${deviceId}`, {});
  }

  sendCommandMessage(deviceId: string, commandId: string) {
    return this.http.post<any>(`${this.baseDeviceUrl}SendCloudToDeviceMessageAsync?targetDevice=${deviceId}&message=${commandId}`, {});
  }

  deleteCommandMessage(deviceId: string, commandId: string) {
    return this.http.post<any>(`${this.baseDeviceUrl}DeleteDeviceCommand?targetDevice=${deviceId}&command=${commandId}`, {});
  }
}
