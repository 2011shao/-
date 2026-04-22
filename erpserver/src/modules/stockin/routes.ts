import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

export const stockInRouter = Router();

const createStockInSchema = z.object({
  targetStoreId: z.string().min(1),
  targetWarehouseId: z.string().min(1),
  supplierId: z.string().min(1),
  remark: z.string().optional(),
  items: z
    .array(
      z.object({
        brandId: z.string().min(1),
        categoryLevel1Id: z.string().min(1),
        categoryLevel2Id: z.string().min(1),
        specText: z.string().min(1),
        purchasePrice: z.number().nonnegative(),
        salePrice: z.number().nonnegative(),
        qty: z.number().int().positive(),
        serialMode: z.enum(['MANUAL', 'AUTO']),
      }),
    )
    .min(1),
});

function assertStockInPermission(role: string, userStoreId: string | undefined, targetStoreId: string) {
  if (role === 'HQ') return;
  if (!userStoreId || userStoreId !== targetStoreId) {
    throw new Error('分店仅允许入库到本店');
  }
}

function genOrderNo() {
  return `SI${Date.now()}`;
}

function genSerial(storeId: string, index: number) {
  const day = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  const seq = (index + 1).toString().padStart(6, '0');
  return `${storeId.slice(-4).toUpperCase()}${day}${rand}${seq}`;
}

stockInRouter.get('/orders', async (_req, res) => {
  const orders = await prisma.stockInOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
  res.json({ code: 0, message: 'ok', data: orders });
});

stockInRouter.post('/orders', async (req, res) => {
  const payload = createStockInSchema.parse(req.body);
  assertStockInPermission(req.user?.role || 'BRANCH', req.user?.storeId, payload.targetStoreId);

  const order = await prisma.stockInOrder.create({
    data: {
      orderNo: genOrderNo(),
      targetStoreId: payload.targetStoreId,
      targetWarehouseId: payload.targetWarehouseId,
      supplierId: payload.supplierId,
      remark: payload.remark,
      items: {
        create: payload.items.map((item) => ({
          ...item,
          purchasePrice: new Prisma.Decimal(item.purchasePrice),
          salePrice: new Prisma.Decimal(item.salePrice),
        })),
      },
    },
    include: { items: true },
  });

  res.json({ code: 0, message: 'ok', data: order });
});

stockInRouter.post('/orders/:orderId/serials', async (req, res) => {
  const orderId = req.params.orderId;
  const itemId = String(req.body.itemId || '');
  const serials = (req.body.serials || []) as string[];

  const item = await prisma.stockInItem.findUnique({ where: { id: itemId }, include: { order: true } });
  if (!item || item.orderId !== orderId) {
    return res.status(404).json({ code: 1001, message: '入库明细不存在' });
  }

  if (item.order.status !== 'DRAFT') {
    return res.status(400).json({ code: 1001, message: '非草稿单不可录入串码' });
  }

  if (serials.length !== item.qty) {
    return res.status(400).json({ code: 1001, message: '串码数量与入库数量不一致' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const serialNo of serials) {
        await tx.serialNumber.create({
          data: {
            serialNo,
            stockInOrderId: orderId,
            stockInItemId: item.id,
            storeId: item.order.targetStoreId,
            warehouseId: item.order.targetWarehouseId,
            status: 'IN_STOCK',
          },
        });

        await tx.serialNumberLog.create({
          data: {
            serialNo,
            eventType: 'STOCK_IN',
            sourceDocType: 'STOCK_IN_ORDER',
            sourceDocId: orderId,
            toStoreId: item.order.targetStoreId,
            toWarehouseId: item.order.targetWarehouseId,
            operatorId: req.user?.id || 'system',
            remark: '手动录入入库',
          },
        });
      }
    });
  } catch {
    return res.status(409).json({ code: 2001, message: '存在重复串码，入库失败' });
  }

  return res.json({ code: 0, message: 'ok', data: { count: serials.length } });
});

stockInRouter.post('/orders/:orderId/serials/auto-generate', async (req, res) => {
  const orderId = req.params.orderId;
  const itemId = String(req.body.itemId || '');
  const qty = Number(req.body.qty || 0);

  const item = await prisma.stockInItem.findUnique({ where: { id: itemId }, include: { order: true } });
  if (!item || item.orderId !== orderId) {
    return res.status(404).json({ code: 1001, message: '入库明细不存在' });
  }
  if (item.order.status !== 'DRAFT') {
    return res.status(400).json({ code: 1001, message: '非草稿单不可录入串码' });
  }
  if (qty !== item.qty) {
    return res.status(400).json({ code: 1001, message: '数量与明细不一致' });
  }

  const serials = Array.from({ length: qty }, (_, idx) => genSerial(item.order.targetStoreId, idx));

  try {
    await prisma.$transaction(async (tx) => {
      for (const serialNo of serials) {
        await tx.serialNumber.create({
          data: {
            serialNo,
            stockInOrderId: orderId,
            stockInItemId: item.id,
            storeId: item.order.targetStoreId,
            warehouseId: item.order.targetWarehouseId,
            status: 'IN_STOCK',
          },
        });

        await tx.serialNumberLog.create({
          data: {
            serialNo,
            eventType: 'STOCK_IN',
            sourceDocType: 'STOCK_IN_ORDER',
            sourceDocId: orderId,
            toStoreId: item.order.targetStoreId,
            toWarehouseId: item.order.targetWarehouseId,
            operatorId: req.user?.id || 'system',
            remark: '自动生成串码入库',
          },
        });
      }
    });
  } catch {
    return res.status(409).json({ code: 2001, message: '自动生成串码冲突，请重试' });
  }

  return res.json({ code: 0, message: 'ok', data: { serials } });
});

stockInRouter.post('/orders/:orderId/approve', async (req, res) => {
  const orderId = req.params.orderId;

  const order = await prisma.stockInOrder.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) {
    return res.status(404).json({ code: 1001, message: '入库单不存在' });
  }
  if (order.status !== 'DRAFT') {
    return res.status(400).json({ code: 1001, message: '仅草稿单可审核' });
  }

  for (const item of order.items) {
    const serialCount = await prisma.serialNumber.count({ where: { stockInItemId: item.id } });
    if (serialCount !== item.qty) {
      return res.status(400).json({ code: 1001, message: `明细 ${item.id} 串码数量不完整` });
    }
  }

  const approved = await prisma.stockInOrder.update({
    where: { id: orderId },
    data: { status: 'APPROVED' },
  });

  return res.json({ code: 0, message: 'ok', data: approved });
});
