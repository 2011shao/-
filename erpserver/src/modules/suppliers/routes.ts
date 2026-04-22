import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

export const supplierRouter = Router();

const createSupplierSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
});

supplierRouter.get('/', async (_req, res) => {
  const suppliers = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ code: 0, message: 'ok', data: suppliers });
});

supplierRouter.post('/', async (req, res) => {
  const payload = createSupplierSchema.parse(req.body);
  const supplier = await prisma.supplier.create({ data: payload });
  res.json({ code: 0, message: 'ok', data: supplier });
});
