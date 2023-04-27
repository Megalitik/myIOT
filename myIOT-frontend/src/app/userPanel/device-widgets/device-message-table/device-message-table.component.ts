import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from 'src/app/_services/api/api.service';



@Component({
  selector: 'app-device-message-table',
  templateUrl: './device-message-table.component.html',
  styleUrls: ['./device-message-table.component.css']
})
export class DeviceMessageTableComponent {

  rows: any[] = [];
  columns: string[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  @Input() currentDeviceID: string;

  constructor(private http: HttpClient, private api: ApiService) { }

  ngOnInit() {
    console.log(this.currentDeviceID);
    this.api.getDeviceMessages(this.currentDeviceID).subscribe(data => {
      this.rows = data;
      this.totalPages = Math.ceil(this.rows.length / this.pageSize);
      this.setColumns(this.rows[0]);
    });
  }
  setColumns(row: any) {
    this.columns = Object.keys(row);
  }

  getRowsForPage(page: number) {
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.rows.slice(startIndex, endIndex);
  }

  checkRowProperties(row: any): boolean {
    return this.columns.every(function(c) {
      return row.hasOwnProperty(c);
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.setColumns(this.getRowsForPage(page)[0]);
  }

  hasNextPage() {
    return this.currentPage < this.totalPages;
  }

  hasPreviousPage() {
    return this.currentPage > 1;
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }
}

