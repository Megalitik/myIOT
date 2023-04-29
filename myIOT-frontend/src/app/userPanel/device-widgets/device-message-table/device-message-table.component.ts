import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from 'src/app/_services/api/api.service';



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

  constructor(private http: HttpClient, private api: ApiService) { }

  ngOnInit() {
    console.log(this.currentDeviceID);
    
    this.api.getDeviceMessages(this.currentDeviceID).subscribe(messages => {
      this.messages = messages;
      console.log(messages);
      this.totalPages = messages.length;

      if (this.totalPages > 0) {
        const firstPage = messages[0];
        const firstMessage = firstPage[0];
        const firstObject = JSON.parse(firstMessage);
        this.displayedColumns = Object.keys(firstObject);
        this.currentMessages = firstPage;
        console.log(this.currentMessages);
      }
    });
  }

  previousPage() {
    this.currentPage--;
    this.currentMessages = this.messages[this.currentPage];
    const firstObject = JSON.parse(this.currentMessages[0]);
    this.displayedColumns = Object.keys(firstObject);
  }

  nextPage() {
    this.currentPage++;
    this.currentMessages = this.messages[this.currentPage];
    const firstObject = JSON.parse(this.currentMessages[0]);
    this.displayedColumns = Object.keys(firstObject);
  }  
}

