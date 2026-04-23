import { NextFunction, Request, Response } from 'express';

export function authContext(req: Request, _res: Response, next: NextFunction) {
  const id = String(req.header('x-user-id') || 'u_system');
  const roleRaw = String(req.header('x-user-role') || 'BRANCH').toUpperCase();
  const storeId = req.header('x-user-store-id') || undefined;

  const role = roleRaw === 'HQ' || roleRaw === 'AUDITOR' ? roleRaw : 'BRANCH';
  req.user = { id, role, storeId };
  next();
}

export function requireRole(...roles: Array<'HQ' | 'BRANCH' | 'AUDITOR'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ code: 1003, message: '无权限执行当前操作' });
    }
    next();
  };
}
