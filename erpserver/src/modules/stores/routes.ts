import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

export const storeRouter = Router();

const createStoreSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  isHq: z.boolean().optional(),
});

const createWarehouseSchema = z.object({
  storeId: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
});

storeRouter.get('/', async (_req, res) => {
  const stores = await prisma.store.findMany({ orderBy: { createdAt: 'asc' } });
  res.json({ code: 0, message: 'ok', data: stores });
});

storeRouter.post('/', async (req, res) => {
  if (req.user?.role !== 'HQ') {
    return res.status(403).json({ code: 1003, message: '仅总部可新增门店' });
  }
  const payload = createStoreSchema.parse(req.body);
  const store = await prisma.store.create({ data: payload });
  res.json({ code: 0, message: 'ok', data: store });
});

storeRouter.get('/warehouses', async (req, res) => {
  const storeId = String(req.query.storeId || '');
  const where = storeId ? { storeId } : undefined;
  const warehouses = await prisma.warehouse.findMany({ where, orderBy: { createdAt: 'asc' } });
  res.json({ code: 0, message: 'ok', data: warehouses });
});

storeRouter.post('/warehouses', async (req, res) => {
  if (req.user?.role !== 'HQ') {
    return res.status(403).json({ code: 1003, message: '仅总部可新增仓库' });
  }
  const payload = createWarehouseSchema.parse(req.body);
  const warehouse = await prisma.warehouse.create({ data: payload });
  res.json({ code: 0, message: 'ok', data: warehouse });
});
