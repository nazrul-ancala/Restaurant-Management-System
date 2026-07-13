import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    req.employee = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
