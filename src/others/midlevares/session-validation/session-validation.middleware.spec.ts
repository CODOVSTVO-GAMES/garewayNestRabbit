import { SessionValidationMiddleware } from './session-validation.middleware';

describe('SessionValidationMiddleware', () => {
  it('should be defined', () => {
    expect(new SessionValidationMiddleware()).toBeDefined();
  });
});
