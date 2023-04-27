import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceMessageTableComponent } from './device-message-table.component';

describe('DeviceMessageTableComponent', () => {
  let component: DeviceMessageTableComponent;
  let fixture: ComponentFixture<DeviceMessageTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceMessageTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceMessageTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
