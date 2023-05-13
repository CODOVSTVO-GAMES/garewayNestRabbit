import { DataIntegrityMiddleware } from './data-integrity.middleware';

describe('DataIntegrityMiddleware', () => {
  it('should be defined', () => {
    expect(new DataIntegrityMiddleware()).toBeDefined();
  });
});
