# 测试运行文档 v1

## 1. 目标

本文件用于指导当前 ERP 项目的联调测试、接口冒烟和回归测试执行。

- 前端：`adminpc`（Vue3 + Arco）
- 后端：`erpserver`（Express + Prisma）
- 数据库：PostgreSQL

## 2. 测试范围（当前版本）

1. 基础资料：品牌、分类（二级）、供应商、门店/仓库
2. 入库流程：建单 -> 串码录入/自动生成 -> 审核
3. 调拨流程：建单 -> 审核 -> 库存位置变化
4. 盘点流程：建单 -> 审核 -> 串码状态变化
5. 串码追溯：串码详情 + 时间线
6. 操作日志：写请求记录、查询分页

## 3. 测试环境准备

### 3.1 Docker 一键方式（推荐）

```bash
docker compose up --build
```

> 说明：首次启动较慢；若数据库是空库，需要执行 Prisma 迁移与种子数据。

### 3.2 本地分服务启动

后端：

```bash
cd erpserver
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

前端：

```bash
cd adminpc
cp .env.example .env
npm install
npm run dev
```

## 4. 角色模拟

默认通过请求头模拟角色：

- `x-user-role`: `HQ` / `BRANCH` / `AUDITOR`
- `x-user-id`: 用户ID
- `x-user-store-id`: 当前门店ID

前端通过 `localStorage` 注入：

```js
localStorage.setItem('x-user-role', 'HQ')
localStorage.setItem('x-user-id', 'u_demo_hq')
localStorage.setItem('x-user-store-id', 'store_id')
```

## 5. 冒烟测试清单（必须）

### 5.1 健康检查

- `GET /api/v1/health`
- 期望：`code=0`，`status=UP`

### 5.2 入库主链路

1. 创建入库单 `POST /api/v1/stock-in/orders`
2. 手动串码 `POST /api/v1/stock-in/orders/{id}/serials`
3. 或自动串码 `POST /api/v1/stock-in/orders/{id}/serials/auto-generate`
4. 审核入库 `POST /api/v1/stock-in/orders/{id}/approve`
5. 串码查询 `GET /api/v1/serials/{serialNo}`

### 5.3 调拨主链路

1. 创建调拨单 `POST /api/v1/transfers`
2. 审核 `POST /api/v1/transfers/{id}/approve`
3. 作废（草稿）`POST /api/v1/transfers/{id}/cancel`

### 5.4 盘点主链路

1. 创建盘点单 `POST /api/v1/stocktakes`
2. 审核 `POST /api/v1/stocktakes/{id}/approve`
3. 作废（草稿）`POST /api/v1/stocktakes/{id}/cancel`

### 5.5 审计链路

- 执行任意写操作后查询：`GET /api/v1/operation-logs`
- 期望：新增对应日志（method/path/status/duration）

## 6. 回归重点

1. 分店越权校验：不能跨店创建入库/调拨/盘点
2. 串码唯一性：重复串码必须拦截
3. 状态机约束：仅草稿可审核/作废
4. 审核生效一致性：串码状态与库存查询一致
5. 列表分页：`page/pageSize/status` 参数生效

## 7. 缺陷提交流程

- 标题格式：`[模块][环境] 问题简述`
- 必填字段：复现步骤、期望结果、实际结果、日志/截图
- 优先级：P0/P1/P2/P3

## 8. 已知限制

- 当前环境可能受网络策略影响，`npm install` 或 `git push` 可能出现 403。
- 当前尚未接入 CI 自动化测试流水线（计划在 Sprint-5 完成）。
