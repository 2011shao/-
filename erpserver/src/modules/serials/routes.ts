import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

export const serialRouter = Router();

serialRouter.get('/:serialNo', async (req, res) => {
  const serialNo = req.params.serialNo;
  const serial = await prisma.serialNumber.findUnique({ where: { serialNo } });
  if (!serial) {
    return res.status(404).json({ code: 1001, message: '串码不存在' });
  }
  res.json({ code: 0, message: 'ok', data: serial });
});

serialRouter.get('/:serialNo/timeline', async (req, res) => {
  const serialNo = req.params.serialNo;
  const logs = await prisma.serialNumberLog.findMany({
    where: { serialNo },
    orderBy: { operatedAt: 'asc' },
  });
  res.json({ code: 0, message: 'ok', data: logs });
});
