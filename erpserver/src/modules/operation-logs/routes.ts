import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

export const operationLogRouter = Router();

operationLogRouter.get('/', async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 20), 1), 100);
  const path = req.query.path ? String(req.query.path) : undefined;

  const where = path ? { path: { contains: path } } : undefined;

  const [rows, total] = await Promise.all([
    prisma.operationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.operationLog.count({ where }),
  ]);

  res.json({ code: 0, message: 'ok', data: { rows, total, page, pageSize } });
});
