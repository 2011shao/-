# ERD 说明 v1.0

## 1. 关系概览

- `stores 1---n warehouses`
- `stock_in_orders 1---n stock_in_items`
- `stock_in_items 1---n serial_numbers`
- `serial_numbers 1---n serial_number_logs`
- `stores/warehouses 1---n inventory_balances`
- `stores/warehouses 1---n inventory_transactions`

## 2. 关键关系解释

1. 入库单与明细：头明细结构，支持多品牌多分类混合入库。
2. 明细与串码：串码明细级关联，便于追溯到具体价格与规格快照。
3. 串码与日志：一对多事件流，保证可审计。
4. 库存余额与流水：余额用于查询，流水用于追责与核对。

## 3. 状态机（建议）

### 3.1 入库单状态
- DRAFT -> APPROVED
- DRAFT -> CANCELED
- APPROVED 不可直接删除，仅可红冲/反审核（权限控制）

### 3.2 串码状态
- INIT（可选） -> IN_STOCK -> IN_TRANSIT -> IN_STOCK -> SOLD/SCRAPPED

## 4. 性能索引建议

- `serial_numbers(serial_no unique)`
- `serial_number_logs(serial_no, operated_at desc)`
- `inventory_balances(store_id, warehouse_id)`
- `stock_in_orders(order_no unique, created_at)`
