import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceSendCommandsComponent } from './device-send-commands.component';

describe('DeviceSendCommandsComponent', () => {
  let component: DeviceSendCommandsComponent;
  let fixture: ComponentFixture<DeviceSendCommandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceSendCommandsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceSendCommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
