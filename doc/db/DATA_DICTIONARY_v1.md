# 数据字典 v1.0

## 1. 设计原则

1. 串码全局唯一：`serial_numbers.serial_no` 唯一索引
2. 串码轨迹 append-only：`serial_number_logs` 仅新增
3. 所有库存动作产生日志：`inventory_transactions`
4. 关键单据支持软删除与状态机

## 2. 核心表说明

## 2.1 brands
- `id` PK
- `code` varchar(32) unique
- `name` varchar(64)
- `status` smallint
- `created_at` / `updated_at`

## 2.2 categories
- `id` PK
- `name` varchar(64)
- `level` smallint (1/2)
- `parent_id` nullable
- `sort_no` int
- `status` smallint

约束：
- `level=1` 时 `parent_id is null`
- `level=2` 时 `parent_id not null`

## 2.3 suppliers
- `id`, `code`, `name`, `contact_name`, `contact_phone`, `status`, timestamps

## 2.4 stores
- `id`, `code`, `name`, `is_hq` boolean, `status`

## 2.5 warehouses
- `id`, `store_id`, `code`, `name`, `type`, `status`

## 2.6 stock_in_orders
- `id`, `order_no` unique
- `target_store_id`
- `target_warehouse_id`
- `supplier_id`
- `status` (DRAFT/APPROVED/CANCELED)
- `created_by`, `approved_by`, `approved_at`
- `remark`

## 2.7 stock_in_items
- `id`, `order_id`
- `brand_id`
- `category_l1_id`, `category_l2_id`
- `spec_text` varchar(255)
- `purchase_price` numeric(12,2)
- `sale_price` numeric(12,2)
- `qty` int
- `serial_mode` (MANUAL/AUTO)

## 2.8 serial_numbers
- `id`
- `serial_no` varchar(128) unique
- `stock_in_order_id`
- `stock_in_item_id`
- `store_id`, `warehouse_id`
- `status` (IN_STOCK/IN_TRANSIT/SOLD/SCRAPPED)
- `created_at`

## 2.9 serial_number_logs
- `id`
- `serial_no`
- `event_type` (STOCK_IN/TRANSFER_OUT/TRANSFER_IN/STOCKTAKE/SALE/SCRAP)
- `source_doc_type`, `source_doc_id`
- `from_store_id`, `from_warehouse_id`
- `to_store_id`, `to_warehouse_id`
- `operator_id`, `operated_at`
- `remark`

索引：
- `(serial_no, operated_at desc)`

## 2.10 inventory_balances
- `id`
- `store_id`, `warehouse_id`
- `brand_id`
- `category_l1_id`, `category_l2_id`
- `spec_text`
- `qty_available`
- `qty_locked`

建议唯一键：
- `(store_id, warehouse_id, brand_id, category_l2_id, spec_text)`

## 2.11 inventory_transactions
- `id`
- `txn_no`
- `txn_type` (IN/OUT/TRANSFER/STOCKTAKE/SCRAP)
- `store_id`, `warehouse_id`
- `brand_id`, `category_l2_id`, `spec_text`
- `qty_change`
- `source_doc_type`, `source_doc_id`
- `operator_id`, `created_at`

## 3. 权限规则落库建议

- 用户与门店关系：`users.store_id`
- 角色数据范围：`roles.data_scope`（ALL/HQ/SELF_STORE）

## 4. 审计建议

- `operation_logs` 记录关键操作入参摘要、结果、操作者、IP、UA
