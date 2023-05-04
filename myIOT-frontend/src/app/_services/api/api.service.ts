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

  getDeviceWidgets(deviceId: string) {
    return this.http.get<any>(`${this.baseDeviceUrl}GetDeviceWidgets?deviceId=${deviceId}`);
  }

  updateDeviceWidgets(deviceId: string, sendMethod: boolean, eventTable: boolean, lineChart: boolean) {
    return this.http.post<any>(`${this.baseDeviceUrl}UpdateDeviceWidgetsAsync?deviceId=${deviceId}&sendMethod=${sendMethod}&eventTable=${eventTable}&lineChart=${lineChart}`, {});
  }

  getDeviceLineChartMessages(deviceId: string) {
    return this.http.get<any>(`${this.baseDeviceUrl}GetDeviceLineChartMessages?deviceId=${deviceId}`);
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

  sendCommandMethod(deviceId: string, commandId: string) {
    return this.http.post<any>(`${this.baseDeviceCommandUrl}CallMethodOnDeviceAsync?targetDevice=${deviceId}&commandId=${commandId}`, {});
  }

  getDeviceCommands(deviceId: string) {
    return this.http.get<any>(`${this.baseDeviceCommandUrl}GetDeviceCommands?deviceId=${deviceId}`);
  }

  addNewDeviceCommand(deviceId: string, commandName: string, command: string, payload: string) {
    return this.http.post<any>(`${this.baseDeviceCommandUrl}AddDeviceCommandAsync?deviceId=${deviceId}&commandName=${commandName}&command=${command}&payload=${payload}`, {});
  }

  deleteCommandMessage(deviceId: string, commandId: string) {
    return this.http.post<any>(`${this.baseDeviceCommandUrl}DeleteDeviceCommandAsync?deviceId=${deviceId}&deviceCommandId=${commandId}`, {});
  }
}
