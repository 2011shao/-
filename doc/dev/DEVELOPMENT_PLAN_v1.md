# 开发执行计划 v1

## 已完成（2026-04-22）

1. 建立仓库结构：`adminpc`、`erpserver`、`doc`
2. 后端完成首版脚手架（Express + Prisma + PostgreSQL）
3. 前端完成首版 PC 管理台脚手架（Vue3 + setup + Pinia + Arco）
4. Docker Compose 部署骨架完成（db + erpserver + adminpc）
5. 第二阶段完成：
   - 后端补齐库存、调拨、盘点模块 API
   - 入库审核前串码数量完整性校验
   - 用户上下文与角色中间件（HQ/BRANCH/AUDITOR）
   - Zod 参数异常统一处理
   - Prisma 种子数据脚本（门店/仓库/品牌/分类/供应商）
   - 前端新增库存查询、串码追溯页面与入库页面元数据联动
6. 第三阶段完成：
   - 调拨单与盘点单改为“创建草稿 -> 审核生效”单据模式
   - Prisma 新增 TransferOrder/TransferItem、StocktakeOrder/StocktakeItem 模型
   - 前端新增调拨管理、盘点管理页面
7. 第四阶段完成：
   - 调拨与盘点列表支持分页与状态筛选
   - 新增单据作废接口（仅草稿可作废）
   - 前端新增状态标签与作废操作
8. 第五阶段完成：
   - 新增操作日志模型 `OperationLog`
   - 新增全局写操作审计中间件（POST/PUT/PATCH/DELETE）
   - 新增操作日志查询接口与前端日志页面

## 下一步（Sprint-5）

1. 后端：补充反审核（带安全校验）与操作日志导出
2. 前端：单据详情页与明细抽屉
3. 测试：新增 API 集成测试和前端 E2E 冒烟
4. 运维：增加 CI/CD 工作流及数据库迁移流水线

## 交付目标

- 支持入库、调拨、盘点三类核心单据从草稿到审核生效（含作废）并可追踪关键操作日志。
