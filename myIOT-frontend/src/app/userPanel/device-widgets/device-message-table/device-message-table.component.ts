import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from 'src/app/_services/api/api.service';
import { Subscription, interval } from 'rxjs';



@Component({
  selector: 'app-device-message-table',
  templateUrl: './device-message-table.component.html',
  styleUrls: ['./device-message-table.component.css']
})
export class DeviceMessageTableComponent {

  messages: any[][] = [];
  currentMessages: any[] = [];
  displayedColumns: string[] = [];
  currentPage = 0;
  totalPages = 0;

  @Input() currentDeviceID: string;

  messageTableSub: Subscription;

  constructor(private http: HttpClient, private api: ApiService) { 

    this.messageTableSub = interval(30000).subscribe((func => {
      this.getMessages(this.currentDeviceID);

    }));
  }

  ngOnInit() {

    this.getMessages(this.currentDeviceID);
  }

  ngOnDestroy() {
    this.messageTableSub.unsubscribe();
  }

  getMessages(deviceID: string)
  {
    this.api.getDeviceMessages(deviceID).subscribe(messages => {
      this.messages = messages;
      // console.log(messages);
      this.totalPages = messages.length;

      if (this.totalPages > 0) {
        this.populateRows();
      }
    });
  }

  populateRows() {
    const firstPage = this.messages[0];
    const firstMessage = firstPage[0];
    const firstObject = JSON.parse(firstMessage);
    this.displayedColumns = Object.keys(firstObject);
    this.currentMessages = firstPage;
    this.currentMessages = firstPage.map(jsonString => this.stringifyNestedJsonObjects(JSON.parse(jsonString)));
    
  }

  private stringifyNestedJsonObjects(obj: any): any {

    if (typeof obj === 'object') {
      for (let key in obj) {

        if (typeof obj[key] === 'object') {
          obj[key] = JSON.stringify(obj[key]);
        }
      }
    }
    return obj;
  }

  previousPage() {
    this.currentPage--;
    this.currentMessages = this.messages[this.currentPage];
    const firstObject = JSON.parse(this.currentMessages[0]);
    this.displayedColumns = Object.keys(firstObject);
    this.currentMessages = this.currentMessages.map(jsonString => this.stringifyNestedJsonObjects(JSON.parse(jsonString)));
    
  }

  nextPage() {
    this.currentPage++;
    this.currentMessages = this.messages[this.currentPage];
    const firstObject = JSON.parse(this.currentMessages[0]);
    this.displayedColumns = Object.keys(firstObject);
    this.currentMessages = this.currentMessages.map(jsonString => this.stringifyNestedJsonObjects(JSON.parse(jsonString)));
    
  }
}
