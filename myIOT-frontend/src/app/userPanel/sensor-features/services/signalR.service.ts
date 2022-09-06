import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { SignalRConnection } from '../models/signal-r-connection.model';
import { UserService } from 'src/app/shared/user.service';
import { browser } from 'protractor';
import * as SignalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})

export class SignalRService {
  mxChipData: Subject<string> = new Subject();
  private hubConnection: SignalR.HubConnection | any;

  constructor(public userService: UserService, private http: HttpClient) {
  }

  private getSignalRConnection(): Observable<SignalRConnection> {
    return this.http.get<SignalRConnection>(`${(browser.BaseURI + 'api/')}SignalRConnection`);
  }

  init() {
    this.getSignalRConnection().subscribe(con => {
      const options = {
        accessTokenFactory: () => con.accessToken
      };

      this.hubConnection = new SignalR.HubConnectionBuilder()
        .withUrl(con.url, options)
        .configureLogging(SignalR.LogLevel.Information)
        .build();

      this.hubConnection.on('notify', (data: string) => {
        this.mxChipData.next(data);
      });

      this.hubConnection.start()
        .catch((error: any) => console.error(error));

      this.hubConnection.serverTimeoutInMilliseconds = 300000;
      this.hubConnection.keepAliveIntervalInMilliseconds = 300000;

      this.hubConnection.onclose((error: any) => {
        this.hubConnection.start();
        console.error(`Something went wrong: ${error}`);
      });
    });
  }
}