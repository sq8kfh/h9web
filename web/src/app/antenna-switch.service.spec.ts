import { TestBed } from '@angular/core/testing';

import { AntennaSwitchService } from './antenna-switch.service';

describe('AntennaSwitchService', () => {
  let service: AntennaSwitchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AntennaSwitchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
