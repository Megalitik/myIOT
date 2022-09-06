import { Component, OnInit } from '@angular/core';
import { StreamData } from '../sensor-features/models/stream.data';
import { SignalRService } from '../sensor-features/services/signalR.service';// 

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {

  streamData: StreamData = new StreamData();
  constructor(private signalRService: SignalRService) { }

  ngOnInit(): void {
    this.signalRService.init();
    this.signalRService.mxChipData.subscribe((data: string) => {
      this.streamData = JSON.parse(data);
    });
  }
}
