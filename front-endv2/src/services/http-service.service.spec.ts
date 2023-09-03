import { TestBed } from '@angular/core/testing';

import { httpService } from './http-service.service';

describe('HttpService', () => {
  let service: httpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(httpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
