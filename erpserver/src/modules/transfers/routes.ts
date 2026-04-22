import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

export const transferRouter = Router();

const createTransferSchema = z.object({
  fromStoreId: z.string().min(1),
  fromWarehouseId: z.string().min(1),
  toStoreId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  serialNos: z.array(z.string().min(1)).min(1),
  remark: z.string().optional(),
});

function genTransferNo() {
  return `TR${Date.now()}`;
}

transferRouter.get('/', async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 20), 1), 100);
  const status = req.query.status ? String(req.query.status) : undefined;

  const where = status ? { status: status as 'DRAFT' | 'APPROVED' | 'CANCELED' } : undefined;

  const [rows, total] = await Promise.all([
    prisma.transferOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transferOrder.count({ where }),
  ]);

  res.json({ code: 0, message: 'ok', data: { rows, total, page, pageSize } });
});

transferRouter.post('/', async (req, res) => {
  const payload = createTransferSchema.parse(req.body);
  const user = req.user;

  if (!user?.id) {
    return res.status(400).json({ code: 1001, message: '用户上下文缺失' });
  }

  if (user.role !== 'HQ' && user.storeId !== payload.fromStoreId) {
    return res.status(403).json({ code: 1003, message: '分店仅可从本店发起调拨' });
  }

  const serials = await prisma.serialNumber.findMany({
    where: {
      serialNo: { in: payload.serialNos },
      storeId: payload.fromStoreId,
      warehouseId: payload.fromWarehouseId,
      status: 'IN_STOCK',
    },
  });

  if (serials.length !== payload.serialNos.length) {
    return res.status(400).json({ code: 1001, message: '存在无效串码（不在源仓库在库状态）' });
  }

  const order = await prisma.transferOrder.create({
    data: {
      orderNo: genTransferNo(),
      fromStoreId: payload.fromStoreId,
      fromWarehouseId: payload.fromWarehouseId,
      toStoreId: payload.toStoreId,
      toWarehouseId: payload.toWarehouseId,
      remark: payload.remark,
      createdBy: user.id,
      items: {
        create: payload.serialNos.map((serialNo) => ({ serialNo })),
      },
    },
    include: { items: true },
  });

  res.json({ code: 0, message: 'ok', data: order });
});

transferRouter.post('/:id/approve', async (req, res) => {
  const id = req.params.id;
  const user = req.user;

  const order = await prisma.transferOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return res.status(404).json({ code: 1001, message: '调拨单不存在' });
  }

  if (order.status !== 'DRAFT') {
    return res.status(400).json({ code: 1001, message: '仅草稿调拨单可审核' });
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const serial = await tx.serialNumber.findUnique({ where: { serialNo: item.serialNo } });
      if (!serial || serial.storeId !== order.fromStoreId || serial.warehouseId !== order.fromWarehouseId) {
        throw new Error(`串码 ${item.serialNo} 不在源仓库`);
      }

      await tx.serialNumber.update({
        where: { serialNo: item.serialNo },
        data: {
          storeId: order.toStoreId,
          warehouseId: order.toWarehouseId,
          status: 'IN_STOCK',
        },
      });

      await tx.serialNumberLog.create({
        data: {
          serialNo: item.serialNo,
          eventType: 'TRANSFER_IN',
          sourceDocType: 'TRANSFER_ORDER',
          sourceDocId: order.id,
          fromStoreId: order.fromStoreId,
          fromWarehouseId: order.fromWarehouseId,
          toStoreId: order.toStoreId,
          toWarehouseId: order.toWarehouseId,
          operatorId: user?.id || 'system',
          remark: order.remark,
        },
      });
    }

    await tx.transferOrder.update({
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

transferRouter.post('/:id/cancel', async (req, res) => {
  const id = req.params.id;
  const order = await prisma.transferOrder.findUnique({ where: { id } });
  if (!order) {
    return res.status(404).json({ code: 1001, message: '调拨单不存在' });
  }
  if (order.status !== 'DRAFT') {
    return res.status(400).json({ code: 1001, message: '仅草稿调拨单可作废' });
  }

  const canceled = await prisma.transferOrder.update({
    where: { id },
    data: { status: 'CANCELED' },
  });

  res.json({ code: 0, message: 'ok', data: canceled });
});
