<template>
  <a-card title="盘点管理">
    <a-form layout="vertical">
      <a-grid :cols="3" :col-gap="12">
        <a-grid-item><a-form-item label="门店ID"><a-input v-model="form.storeId" /></a-form-item></a-grid-item>
        <a-grid-item><a-form-item label="仓库ID"><a-input v-model="form.warehouseId" /></a-form-item></a-grid-item>
        <a-grid-item><a-form-item label="备注"><a-input v-model="form.remark" /></a-form-item></a-grid-item>
      </a-grid>
      <a-form-item label="串码"><a-input v-model="item.serialNo" /></a-form-item>
      <a-form-item label="结果">
        <a-select v-model="item.result" style="width: 180px">
          <a-option value="FOUND">正常</a-option>
          <a-option value="MISSING">缺失</a-option>
          <a-option value="SCRAPPED">报废</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="备注"><a-input v-model="item.remark" /></a-form-item>
    </a-form>

    <a-space>
      <a-button type="primary" @click="createOrder">创建盘点单</a-button>
      <a-input v-model="approveId" placeholder="盘点单ID" style="width: 220px" />
      <a-button status="success" @click="approveOrder">审核</a-button>
      <a-input v-model="unapproveId" placeholder="盘点单ID" style="width: 220px" />
      <a-button status="warning" @click="unapproveOrder">反审核</a-button>
      <a-input v-model="cancelId" placeholder="盘点单ID" style="width: 220px" />
      <a-button status="danger" @click="cancelOrder">作废</a-button>
      <a-select v-model="query.status" placeholder="状态筛选" allow-clear style="width: 150px">
        <a-option value="DRAFT">草稿</a-option>
        <a-option value="APPROVED">已审核</a-option>
        <a-option value="CANCELED">已作废</a-option>
      </a-select>
      <a-button @click="loadOrders">查询</a-button>
    </a-space>

    <a-table :columns="columns" :data="rows" :pagination="false" style="margin-top: 12px">
      <template #status="{ record }">
        <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
      </template>
    </a-table>

    <a-pagination
      :total="total"
      :current="query.page"
      :page-size="query.pageSize"
      size="small"
      show-total
      style="margin-top: 12px"
      @change="onPageChange"
    />
  </a-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { http } from '../../api/http';

const form = reactive({
  storeId: '',
  warehouseId: '',
  remark: '',
});

const item = reactive({
  serialNo: '',
  result: 'FOUND',
  remark: '',
});

const query = reactive({ page: 1, pageSize: 10, status: '' });
const approveId = ref('');
const unapproveId = ref('');
const cancelId = ref('');
const rows = ref<any[]>([]);
const total = ref(0);

const columns = [
  { title: '盘点单号', dataIndex: 'orderNo' },
  { title: '门店', dataIndex: 'storeId' },
  { title: '仓库', dataIndex: 'warehouseId' },
  { title: '状态', slotName: 'status' },
  { title: '创建时间', dataIndex: 'createdAt' },
];

function statusColor(status: string) {
  if (status === 'APPROVED') return 'green';
  if (status === 'CANCELED') return 'red';
  return 'arcoblue';
}

async function loadOrders() {
  const res = await http.get('/stocktakes', { params: query });
  rows.value = res.data.data.rows;
  total.value = res.data.data.total;
}

async function createOrder() {
  const res = await http.post('/stocktakes', {
    ...form,
    items: [item],
  });

  approveId.value = res.data.data.id;
  Message.success(`盘点单创建成功: ${res.data.data.orderNo}`);
  await loadOrders();
}

async function approveOrder() {
  if (!approveId.value) return Message.warning('请先填写盘点单ID');
  await http.post(`/stocktakes/${approveId.value}/approve`);
  Message.success('盘点单审核成功');
  await loadOrders();
}

async function unapproveOrder() {
  if (!unapproveId.value) return Message.warning('请先填写盘点单ID');
  await http.post(`/stocktakes/${unapproveId.value}/unapprove`);
  Message.success('盘点单反审核成功');
  await loadOrders();
}

async function cancelOrder() {
  if (!cancelId.value) return Message.warning('请先填写盘点单ID');
  await http.post(`/stocktakes/${cancelId.value}/cancel`);
  Message.success('盘点单作废成功');
  await loadOrders();
}

function onPageChange(page: number) {
  query.page = page;
  loadOrders();
}

loadOrders();
</script>
