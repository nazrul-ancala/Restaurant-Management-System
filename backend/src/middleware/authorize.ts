import { Request, Response, NextFunction } from 'express';

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.employee || !allowedRoles.includes(req.employee.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}
