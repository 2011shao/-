# 部署与回滚手册 v1

## 1. 部署目标

将 ERP 系统部署为可访问的三服务架构：

- `db`: PostgreSQL
- `erpserver`: Node.js API
- `adminpc`: Nginx 承载前端静态资源

## 2. 先决条件

1. Docker / Docker Compose 可用
2. 服务器端口开放：`80/443`（可选）、`3000`（可选）、`5432`（通常内网）
3. 具备数据库持久化卷

## 3. 环境变量

后端关键变量：

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`

参考：`erpserver/.env.example`。

## 4. 首次部署步骤

### 4.1 拉取代码

```bash
git clone <repo-url>
cd <repo-dir>
```

### 4.2 启动服务

```bash
docker compose up -d --build
```

### 4.3 初始化数据库（首次）

```bash
docker compose exec erpserver npm run prisma:generate
docker compose exec erpserver npm run prisma:migrate
docker compose exec erpserver npm run prisma:seed
```

### 4.4 验证

- 访问 `GET /api/v1/health`
- 打开前端页面
- 验证基础查询接口

## 5. 升级发布流程

1. 备份数据库
2. 拉取新版本代码
3. 重新构建并滚动拉起
4. 执行迁移脚本
5. 执行冒烟测试

示例：

```bash
git pull
docker compose up -d --build
docker compose exec erpserver npm run prisma:migrate
```

## 6. 回滚策略

### 6.1 应用层回滚

1. 切换到上一个稳定 tag/commit
2. 重新 `docker compose up -d --build`

### 6.2 数据层回滚

- 若迁移不可逆，使用备份恢复数据库
- 恢复后重新启动 `erpserver`

## 7. 健康检查与监控

### 7.1 健康检查

```bash
curl http://<host>/api/v1/health
```

### 7.2 建议监控项

- API 5xx 比例
- 接口 P95 延时
- 数据库连接数与慢查询
- 容器 CPU/内存
- 审计日志写入量

## 8. 运维巡检清单

每日：

- [ ] 服务进程正常
- [ ] 数据库空间正常
- [ ] 前一天错误日志已处理
- [ ] 自动备份成功

每周：

- [ ] 恢复演练验证
- [ ] 安全补丁检查
- [ ] 依赖漏洞扫描

## 9. 故障应急

### 9.1 API 全部 500

1. 查看 `erpserver` 容器日志
2. 检查数据库连通性
3. 回滚至上一个稳定版本

### 9.2 前端可访问但接口失败

1. 检查 `adminpc/nginx.conf` 反向代理
2. 检查 `erpserver` 服务健康
3. 检查 CORS 与网络策略

### 9.3 审计日志写入异常

- 不影响主流程（当前为容错写入）
- 需排查数据库可用性与权限
