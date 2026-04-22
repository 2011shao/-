import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: 1001,
      message: '参数校验失败',
      data: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  return res.status(500).json({ code: 3001, message, data: null });
}
