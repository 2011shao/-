import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function operationLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', async () => {
    if (!MUTATING_METHODS.has(req.method)) return;

    try {
      await prisma.operationLog.create({
        data: {
          userId: req.user?.id,
          userRole: req.user?.role,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - start,
          ip: req.ip,
          userAgent: req.get('user-agent') || null,
          requestBody: req.body ? req.body : undefined,
        },
      });
    } catch {
      // ignore logging failures to avoid impacting business API.
    }
  });

  next();
}
