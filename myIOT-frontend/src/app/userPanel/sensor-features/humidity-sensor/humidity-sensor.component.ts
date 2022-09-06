import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { SensorFeaturesConfig } from '../sensor-features-config';

@Component({
  selector: 'app-humidity-sensor',
  templateUrl: './humidity-sensor.component.html',
  styleUrls: ['./humidity-sensor.component.css']
})
export class HumiditySensorComponent implements OnInit {

  @Input() humidity: any;
  @Input() deviceId: any;
  config = SensorFeaturesConfig;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.humidity && changes.humidity.currentValue === null) {
      this.humidity = changes.humidity.previousValue;
    }
    else {
      this.humidity = "N/A";
    }
  }

}
