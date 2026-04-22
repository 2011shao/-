# erpserver

Node.js + Express + Prisma 后端服务。

## 开发

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## 关键模块

- 基础资料：brands/categories/suppliers/stores
- 入库：stock-in（创建、串码录入/生成、审核）
- 串码：serials（详情、时间线）
- 库存：inventory（余额、流水日志）
- 调拨：transfers
- 盘点：stocktakes
