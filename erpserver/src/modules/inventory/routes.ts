import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

export const inventoryRouter = Router();

inventoryRouter.get('/balances', async (req, res) => {
  const storeId = req.query.storeId ? String(req.query.storeId) : undefined;
  const where = {
    status: 'IN_STOCK' as const,
    ...(storeId ? { storeId } : {}),
  };

  const serials = await prisma.serialNumber.findMany({
    where,
    include: { item: true },
  });

  const map = new Map<string, any>();
  for (const s of serials) {
    const key = `${s.storeId}|${s.warehouseId}|${s.item.brandId}|${s.item.categoryLevel2Id}|${s.item.specText}`;
    const old = map.get(key) || {
      storeId: s.storeId,
      warehouseId: s.warehouseId,
      brandId: s.item.brandId,
      categoryLevel2Id: s.item.categoryLevel2Id,
      specText: s.item.specText,
      qty: 0,
    };
    old.qty += 1;
    map.set(key, old);
  }

  res.json({ code: 0, message: 'ok', data: Array.from(map.values()) });
});

inventoryRouter.get('/transactions', async (_req, res) => {
  const logs = await prisma.serialNumberLog.findMany({
    orderBy: { operatedAt: 'desc' },
    take: 500,
  });
  res.json({ code: 0, message: 'ok', data: logs });
});
