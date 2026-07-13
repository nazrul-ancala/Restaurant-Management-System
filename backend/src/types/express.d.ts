import type { TokenPayload } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      employee?: TokenPayload;
    }
  }
}

export {};
