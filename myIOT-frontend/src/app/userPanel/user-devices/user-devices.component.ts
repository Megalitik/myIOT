import { Component, Input, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ApiService } from 'src/app/_services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { Device } from 'src/app/Models/Device';


@Component({
  selector: 'app-user-devices',
  templateUrl: './user-devices.component.html',
  styleUrls: ['./user-devices.component.css']
})
export class UserDevicesComponent implements OnInit {

  constructor (private route : Router, private api : ApiService, private toastr: ToastrService,) {  }

  @Input() userDevice: Device; 

  ngOnInit(): void {
    
  }

  redirectToDevicePage (deviceName: string) {
    console.log(deviceName)
    this.route.navigate(['/controllers/'], {queryParams: {deviceName: deviceName}});
  }

  getDeviceConnectionState(deviceId : string) {
    this.api.getDeviceConnectionState(deviceId).subscribe(data => {
      return data;
    })
  }

}
