import { Test, TestingModule } from '@nestjs/testing';
import { DataStorageController } from './data-storage.controller';

describe('DataStorageController', () => {
  let controller: DataStorageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataStorageController],
    }).compile();

    controller = module.get<DataStorageController>(DataStorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
