import { TestBed } from '@angular/core/testing';
import { SignalRService } from './signalR.service';



describe('SignalRService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('SignalR should be created', () => {
    const service: SignalRService = TestBed.get(SignalRService);
    expect(service).toBeTruthy();
  });
});