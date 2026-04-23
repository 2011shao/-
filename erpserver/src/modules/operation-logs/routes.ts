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

operationLogRouter.get('/export', async (req, res) => {
  const path = req.query.path ? String(req.query.path) : undefined;
  const limit = Math.min(Math.max(Number(req.query.limit || 1000), 1), 5000);

  const where = path ? { path: { contains: path } } : undefined;

  const logs = await prisma.operationLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const header = ['createdAt', 'userId', 'userRole', 'method', 'path', 'statusCode', 'durationMs', 'ip'];
  const rows = logs.map((log) =>
    [
      log.createdAt.toISOString(),
      log.userId || '',
      log.userRole || '',
      log.method,
      log.path,
      String(log.statusCode),
      String(log.durationMs),
      log.ip || '',
    ]
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(','),
  );

  const csv = [header.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="operation-logs-${Date.now()}.csv"`);
  res.send(`\uFEFF${csv}`);
});
