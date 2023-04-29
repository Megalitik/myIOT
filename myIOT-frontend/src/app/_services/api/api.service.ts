import { Injectable } from '@angular/core';

import * as configurl from '../../_config/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUserUrl: string = configurl.apiServer.APIUrl + 'User/';
  private baseDeviceUrl: string = configurl.apiServer.APIUrl + 'Device/';
  private baseDeviceCommandUrl: string = configurl.apiServer.APIUrl + 'DeviceCommand/';

  constructor(private http : HttpClient) { }

  getAllUserDevices(username: string) {
    return this.http.get<any>(`${this.baseDeviceUrl}GetDevices?userId=${username}`);
  }

  getDeviceConnectionState(deviceId: string) {
    return this.http.get(`${this.baseDeviceUrl}GetDeviceConnectionStateAsync?deviceId=${deviceId}`, {responseType: 'text'});
  }

  getDeviceConnectionString(deviceId: string) {
    return this.http.get(`${this.baseDeviceUrl}GetDeviceConnectionStringAsync?deviceId=${deviceId}`, {responseType: 'text'});
  }

  getDeviceMessages(deviceId: string) {
    return this.http.get<any[][]>(`${this.baseDeviceUrl}GetDeviceMessages?deviceId=${deviceId}`);
  }

  getDeviceUser(deviceId: string) {
    return this.http.get<any>(`${this.baseDeviceUrl}GetDeviceUser?deviceId=${deviceId}`);
  }

  RegisterNewDeviceAsync(deviceName: string, userID: string) {
    return this.http.post<any>(`${this.baseDeviceUrl}RegisterNewDeviceAsync?deviceName=${deviceName}&userID=${userID}`, {});
  }

  DeleteDeviceAsync(deviceId: string, userId: string) {
    return this.http.post<any>(`${this.baseDeviceUrl}DeleteDeviceAsync?deviceId=${deviceId}&userId=${userId}`, {});
  }

  sendCommandMessage(deviceId: string, commandId: string) {
    return this.http.post<any>(`${this.baseDeviceCommandUrl}SendCloudToDeviceMessageAsync?targetDevice=${deviceId}&commandId=${commandId}`, {});
  }

  getDeviceCommands(deviceId: string) {
    return this.http.get<any>(`${this.baseDeviceCommandUrl}GetDeviceCommands?deviceId=${deviceId}`);
  }

  addNewDeviceCommand(deviceId: string, commandName: string, command: string) {
    return this.http.post<any>(`${this.baseDeviceCommandUrl}AddDeviceCommandAsync?deviceId=${deviceId}&commandName=${commandName}&command=${command}`, {});
  }

  deleteCommandMessage(deviceId: string, commandId: string) {
    return this.http.post<any>(`${this.baseDeviceCommandUrl}DeleteDeviceCommandAsync?deviceId=${deviceId}&deviceCommandId=${commandId}`, {});
  }
}
