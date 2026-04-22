import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

export const brandRouter = Router();

const createBrandSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
});

brandRouter.get('/', async (_req, res) => {
  const brands = await prisma.brand.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ code: 0, message: 'ok', data: brands });
});

brandRouter.post('/', async (req, res) => {
  const payload = createBrandSchema.parse(req.body);
  const brand = await prisma.brand.create({ data: payload });
  res.json({ code: 0, message: 'ok', data: brand });
});
