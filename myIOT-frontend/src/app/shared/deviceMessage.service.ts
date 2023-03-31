import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private readonly apiUrl = 'http://localhost:5000/device';

  constructor(private readonly http: HttpClient) { }

  public getDeviceMessages(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getdevicemessages`);
  }
}
