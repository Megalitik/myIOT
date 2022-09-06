import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HumiditySensorComponent } from './humidity-sensor.component';

describe('HumiditySensorComponent', () => {
  let component: HumiditySensorComponent;
  let fixture: ComponentFixture<HumiditySensorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HumiditySensorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HumiditySensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
