import { Test, TestingModule } from '@nestjs/testing';
import { ErrorhandlerService } from './errorhandler.service';

describe('ErrorhandlerService', () => {
  let service: ErrorhandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorhandlerService],
    }).compile();

    service = module.get<ErrorhandlerService>(ErrorhandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
