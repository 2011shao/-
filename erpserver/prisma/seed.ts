import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hq = await prisma.store.upsert({
    where: { code: 'HQ001' },
    update: {},
    create: { code: 'HQ001', name: '深圳总店', isHq: true },
  });

  const branch = await prisma.store.upsert({
    where: { code: 'BR001' },
    update: {},
    create: { code: 'BR001', name: '南山分店', isHq: false },
  });

  await prisma.warehouse.upsert({
    where: { storeId_code: { storeId: hq.id, code: 'WH-HQ-01' } },
    update: {},
    create: { storeId: hq.id, code: 'WH-HQ-01', name: '总店主仓', type: 'STORE' },
  });

  await prisma.warehouse.upsert({
    where: { storeId_code: { storeId: branch.id, code: 'WH-BR-01' } },
    update: {},
    create: { storeId: branch.id, code: 'WH-BR-01', name: '分店主仓', type: 'STORE' },
  });

  await prisma.brand.upsert({
    where: { code: 'APPLE' },
    update: {},
    create: { code: 'APPLE', name: 'Apple' },
  });

  let phoneL1 = await prisma.category.findFirst({ where: { name: '手机', level: 1 } });
  if (!phoneL1) {
    phoneL1 = await prisma.category.create({ data: { name: '手机', level: 1 } });
  }

  const smartL2 = await prisma.category.findFirst({ where: { name: '智能手机', level: 2, parentId: phoneL1.id } });
  if (!smartL2) {
    await prisma.category.create({ data: { name: '智能手机', level: 2, parentId: phoneL1.id } });
  }

  await prisma.supplier.upsert({
    where: { code: 'SUP001' },
    update: {},
    create: { code: 'SUP001', name: '优质供货商A', contactName: '张三', contactPhone: '13800000000' },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
