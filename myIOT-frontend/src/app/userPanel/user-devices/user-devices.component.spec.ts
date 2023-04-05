import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDevicesComponent } from './user-devices.component';

describe('UserDevicesComponent', () => {
  let component: UserDevicesComponent;
  let fixture: ComponentFixture<UserDevicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserDevicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
