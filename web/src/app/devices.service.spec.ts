import { TestBed } from '@angular/core/testing';

import { NodesService } from './nodes.service';

describe('DevicesService', () => {
  let service: NodesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});