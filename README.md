# Mobile Store ERP Monorepo

- `adminpc/`: Vue3 + Pinia + Arco PC 管理端
- `erpserver/`: Node.js + Express + Prisma 后端服务
- `doc/`: 项目文档

## 快速启动（Docker）

```bash
docker compose up --build
```

## 本地启动（推荐开发）

后端：

```bash
cd erpserver
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

前端：

```bash
cd adminpc
npm install
npm run dev
```
