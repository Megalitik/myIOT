import { Component, OnInit } from '@angular/core';
import { Device } from '../../shared/device';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  devices: Device[] = [
{ DeviceID: 1, Name: 'Teste', DeviceType: 
  { ID: 1, Name: 'TipoTeste'}, DeviceState: true
},
{ DeviceID: 2, Name: 'Teste', DeviceType: 
  { ID: 1, Name: 'TipoTeste'}, DeviceState: false
},
{ DeviceID: 3, Name: 'Teste', DeviceType: 
  { ID: 3, Name: 'TipoTeste3'}, DeviceState: false
},
{ DeviceID: 4, Name: 'Teste', DeviceType: 
  { ID: 4, Name: 'TipoTeste4'}, DeviceState: true
}
  ];

  ngOnInit(): void {
  }

}
