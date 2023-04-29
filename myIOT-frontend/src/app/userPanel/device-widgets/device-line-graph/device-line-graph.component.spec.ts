import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceLineGraphComponent } from './device-line-graph.component';

describe('DeviceLineGraphComponent', () => {
  let component: DeviceLineGraphComponent;
  let fixture: ComponentFixture<DeviceLineGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceLineGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceLineGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
