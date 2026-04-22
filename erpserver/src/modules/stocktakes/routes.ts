import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

export const stocktakeRouter = Router();

const createStocktakeSchema = z.object({
  storeId: z.string().min(1),
  warehouseId: z.string().min(1),
  remark: z.string().optional(),
  items: z
    .array(
      z.object({
        serialNo: z.string().min(1),
        result: z.enum(['FOUND', 'MISSING', 'SCRAPPED']),
        remark: z.string().optional(),
      }),
    )
    .min(1),
});

function genStocktakeNo() {
  return `ST${Date.now()}`;
}

stocktakeRouter.get('/', async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 20), 1), 100);
  const status = req.query.status ? String(req.query.status) : undefined;

  const where = status ? { status: status as 'DRAFT' | 'APPROVED' | 'CANCELED' } : undefined;

  const [rows, total] = await Promise.all([
    prisma.stocktakeOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.stocktakeOrder.count({ where }),
  ]);

  res.json({ code: 0, message: 'ok', data: { rows, total, page, pageSize } });
});

stocktakeRouter.post('/', async (req, res) => {
  const payload = createStocktakeSchema.parse(req.body);
  const user = req.user;

  if (!user?.id) {
    return res.status(400).json({ code: 1001, message: '用户上下文缺失' });
  }

  if (user.role !== 'HQ' && user.storeId !== payload.storeId) {
    return res.status(403).json({ code: 1003, message: '分店仅可对本店创建盘点单' });
  }

  const order = await prisma.stocktakeOrder.create({
    data: {
      orderNo: genStocktakeNo(),
      storeId: payload.storeId,
      warehouseId: payload.warehouseId,
      remark: payload.remark,
      createdBy: user.id,
      items: {
        create: payload.items,
      },
    },
    include: { items: true },
  });

  res.json({ code: 0, message: 'ok', data: order });
});

stocktakeRouter.post('/:id/approve', async (req, res) => {
  const id = req.params.id;
  const user = req.user;

  const order = await prisma.stocktakeOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return res.status(404).json({ code: 1001, message: '盘点单不存在' });
  }

  if (order.status !== 'DRAFT') {
    return res.status(400).json({ code: 1001, message: '仅草稿盘点单可审核' });
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const serial = await tx.serialNumber.findUnique({ where: { serialNo: item.serialNo } });
      if (!serial || serial.storeId !== order.storeId || serial.warehouseId !== order.warehouseId) {
        throw new Error(`串码 ${item.serialNo} 不在指定仓库`);
      }

      const nextStatus = item.result === 'SCRAPPED' ? 'SCRAPPED' : serial.status;

      if (nextStatus !== serial.status) {
        await tx.serialNumber.update({
          where: { serialNo: item.serialNo },
          data: { status: nextStatus },
        });
      }

      await tx.serialNumberLog.create({
        data: {
          serialNo: item.serialNo,
          eventType: item.result === 'SCRAPPED' ? 'SCRAP' : 'STOCKTAKE',
          sourceDocType: 'STOCKTAKE_ORDER',
          sourceDocId: order.id,
          fromStoreId: serial.storeId,
          fromWarehouseId: serial.warehouseId,
          toStoreId: serial.storeId,
          toWarehouseId: serial.warehouseId,
          operatorId: user?.id || 'system',
          remark: item.remark || order.remark,
        },
      });
    }

    await tx.stocktakeOrder.update({
      where: { id: order.id },
      data: {
        status: 'APPROVED',
        approvedBy: user?.id,
        approvedAt: new Date(),
      },
    });
  });

  res.json({ code: 0, message: 'ok', data: { id, status: 'APPROVED' } });
});

stocktakeRouter.post('/:id/cancel', async (req, res) => {
  const id = req.params.id;
  const order = await prisma.stocktakeOrder.findUnique({ where: { id } });
  if (!order) {
    return res.status(404).json({ code: 1001, message: '盘点单不存在' });
  }
  if (order.status !== 'DRAFT') {
    return res.status(400).json({ code: 1001, message: '仅草稿盘点单可作废' });
  }

  const canceled = await prisma.stocktakeOrder.update({
    where: { id },
    data: { status: 'CANCELED' },
  });

  res.json({ code: 0, message: 'ok', data: canceled });
});
