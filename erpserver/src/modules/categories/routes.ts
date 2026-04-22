import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

export const categoryRouter = Router();

const createCategorySchema = z.object({
  name: z.string().min(1),
  level: z.union([z.literal(1), z.literal(2)]),
  parentId: z.string().optional(),
  sortNo: z.number().int().optional(),
});

categoryRouter.get('/tree', async (_req, res) => {
  const roots = await prisma.category.findMany({
    where: { level: 1 },
    orderBy: { sortNo: 'asc' },
    include: { children: { orderBy: { sortNo: 'asc' } } },
  });
  res.json({ code: 0, message: 'ok', data: roots });
});

categoryRouter.post('/', async (req, res) => {
  const payload = createCategorySchema.parse(req.body);

  if (payload.level === 1 && payload.parentId) {
    return res.status(400).json({ code: 1001, message: '一级分类不能有父级' });
  }
  if (payload.level === 2 && !payload.parentId) {
    return res.status(400).json({ code: 1001, message: '二级分类必须有父级' });
  }

  const category = await prisma.category.create({ data: payload });
  res.json({ code: 0, message: 'ok', data: category });
});
