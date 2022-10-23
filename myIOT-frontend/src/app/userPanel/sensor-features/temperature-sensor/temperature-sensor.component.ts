import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { SensorFeaturesConfig } from '../sensor-features-config';

@Component({
  selector: 'app-temperature-sensor',
  templateUrl: './temperature-sensor.component.html',
  styleUrls: ['./temperature-sensor.component.css']
})
export class TemperatureSensorComponent implements OnInit, OnChanges {

  @Input() temperature: any;
  @Input() deviceId: any;
  gaugeValue: any;
  config = SensorFeaturesConfig;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.temp && changes.temp.currentValue == null) {
      this.temperature = changes.temp.previousValue;
    }
    else {
      this.temperature = "N/A";
    }
  }

}
