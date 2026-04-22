# API 规范 v1.0

## 1. 通用规范

- Base URL: `/api/v1`
- 认证：`Authorization: Bearer <token>`
- 数据格式：JSON

### 1.1 统一响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "requestId": "uuid"
}
```

- `code=0` 成功
- 非 0 为业务/权限/系统错误

### 1.2 常用错误码

- `1001` 参数错误
- `1002` 未认证
- `1003` 无权限
- `2001` 业务冲突（如重复串码）
- `3001` 系统异常

## 2. 权限与上下文

- 后端根据用户门店权限决定可见数据范围。
- 总店角色可指定目标门店入库。
- 分店角色提交入库时，目标门店必须等于本人门店。

## 3. 核心 API 清单

## 3.1 Auth

- `POST /auth/login`
- `GET /auth/profile`
- `POST /auth/refresh`

## 3.2 基础资料

### 品牌
- `GET /brands`
- `POST /brands`
- `PUT /brands/{id}`
- `PATCH /brands/{id}/status`

### 分类（二级）
- `GET /categories/tree`
- `POST /categories`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`

### 供应商
- `GET /suppliers`
- `POST /suppliers`
- `PUT /suppliers/{id}`

### 门店/仓库
- `GET /stores`
- `GET /warehouses?storeId=xxx`

## 3.3 入库管理

### 新建入库单
`POST /stock-in/orders`

请求示例：
```json
{
  "targetStoreId": "store_001",
  "targetWarehouseId": "wh_001",
  "supplierId": "sup_001",
  "items": [
    {
      "brandId": "brand_001",
      "categoryLevel1Id": "cat_01",
      "categoryLevel2Id": "cat_02",
      "specText": "iPhone 15 Pro 256G 黑色",
      "purchasePrice": 6100,
      "salePrice": 6999,
      "qty": 2,
      "serialMode": "MANUAL"
    }
  ],
  "remark": "首批到货"
}
```

### 提交串码
`POST /stock-in/orders/{orderId}/serials`

```json
{
  "itemId": "item_001",
  "serials": ["SN001", "SN002"]
}
```

### 自动生成串码
`POST /stock-in/orders/{orderId}/serials/auto-generate`

```json
{
  "itemId": "item_001",
  "qty": 100,
  "ruleCode": "DEFAULT"
}
```

### 审核入库
`POST /stock-in/orders/{orderId}/approve`

- 行为：
  1. 校验权限与状态
  2. 校验串码数量
  3. 校验串码全局唯一
  4. 写库存余额/流水
  5. 写串码主档/日志

## 3.4 串码查询

- `GET /serials/{serialNo}`：串码主档
- `GET /serials/{serialNo}/timeline`：串码轨迹

## 3.5 库存与调拨盘点

- `GET /inventory/balances`
- `GET /inventory/transactions`
- `POST /transfers`
- `POST /stocktakes`
- `POST /inventory/write-offs`

## 4. 幂等与并发建议

- 入库审核接口支持幂等键（可选）
- 串码写入采用唯一索引捕获冲突
- 冲突时返回 `2001` 并给出冲突串码列表

## 5. API 文档协作要求

- 所有字段需注明：类型、是否必填、示例、业务说明
- 变更必须记录在 Changelog
