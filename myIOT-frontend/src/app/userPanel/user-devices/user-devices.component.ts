import { Component, Input, OnInit } from '@angular/core';
import { Device } from '../../shared/device';
import { Route, Router } from '@angular/router';


@Component({
  selector: 'app-user-devices',
  templateUrl: './user-devices.component.html',
  styleUrls: ['./user-devices.component.css']
})
export class UserDevicesComponent implements OnInit {

  constructor (private route : Router) {  }

  @Input() userDevice: Device; 

  ngOnInit(): void {
    
  }

  redirectToDevicePage (deviceName: string) {
    console.log(deviceName)
    this.route.navigate(['/controllers/'], {queryParams: {deviceName: deviceName}});
  }

}
