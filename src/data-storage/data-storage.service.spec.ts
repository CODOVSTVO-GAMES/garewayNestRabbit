import { Test, TestingModule } from '@nestjs/testing';
import { DataStorageService } from './data-storage.service';

describe('DataStorageService', () => {
  let service: DataStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataStorageService],
    }).compile();

    service = module.get<DataStorageService>(DataStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
