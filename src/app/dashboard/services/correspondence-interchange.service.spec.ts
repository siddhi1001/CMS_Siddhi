import { TestBed } from '@angular/core/testing';

import { CorrespondenceInterchangeService } from './correspondence-interchange.service';

describe('CorrespondenceInterchangeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CorrespondenceInterchangeService = TestBed.get(CorrespondenceInterchangeService);
    expect(service).toBeTruthy();
  });
});
