import { TestBed } from '@angular/core/testing';

import { FluigService } from './fluig.service';

describe('FluigService', () => {
  let service: FluigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FluigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
