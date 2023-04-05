import { Component, Input, OnInit } from '@angular/core';
import { Device } from '../../shared/device';


@Component({
  selector: 'app-user-devices',
  templateUrl: './user-devices.component.html',
  styleUrls: ['./user-devices.component.css']
})
export class UserDevicesComponent implements OnInit {

  constructor () {  }

  @Input() userDevice: Device; 

  ngOnInit(): void {
    
  }

}
