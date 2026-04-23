<template>
  <a-card title="调拨管理">
    <a-form layout="vertical">
      <a-grid :cols="4" :col-gap="12">
        <a-grid-item><a-form-item label="源门店ID"><a-input v-model="form.fromStoreId" /></a-form-item></a-grid-item>
        <a-grid-item><a-form-item label="源仓库ID"><a-input v-model="form.fromWarehouseId" /></a-form-item></a-grid-item>
        <a-grid-item><a-form-item label="目标门店ID"><a-input v-model="form.toStoreId" /></a-form-item></a-grid-item>
        <a-grid-item><a-form-item label="目标仓库ID"><a-input v-model="form.toWarehouseId" /></a-form-item></a-grid-item>
      </a-grid>
      <a-form-item label="串码列表（逗号分隔）"><a-input v-model="serialNosText" /></a-form-item>
      <a-form-item label="备注"><a-input v-model="form.remark" /></a-form-item>
    </a-form>

    <a-space>
      <a-button type="primary" @click="createOrder">创建调拨单</a-button>
      <a-input v-model="approveId" placeholder="调拨单ID" style="width: 220px" />
      <a-button status="success" @click="approveOrder">审核</a-button>
      <a-input v-model="unapproveId" placeholder="调拨单ID" style="width: 220px" />
      <a-button status="warning" @click="unapproveOrder">反审核</a-button>
      <a-input v-model="cancelId" placeholder="调拨单ID" style="width: 220px" />
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
  fromStoreId: '',
  fromWarehouseId: '',
  toStoreId: '',
  toWarehouseId: '',
  remark: '',
});
const query = reactive({ page: 1, pageSize: 10, status: '' });
const serialNosText = ref('');
const approveId = ref('');
const unapproveId = ref('');
const cancelId = ref('');
const rows = ref<any[]>([]);
const total = ref(0);

const columns = [
  { title: '调拨单号', dataIndex: 'orderNo' },
  { title: '源门店', dataIndex: 'fromStoreId' },
  { title: '目标门店', dataIndex: 'toStoreId' },
  { title: '状态', slotName: 'status' },
  { title: '创建时间', dataIndex: 'createdAt' },
];

function statusColor(status: string) {
  if (status === 'APPROVED') return 'green';
  if (status === 'CANCELED') return 'red';
  return 'arcoblue';
}

async function loadOrders() {
  const res = await http.get('/transfers', { params: query });
  rows.value = res.data.data.rows;
  total.value = res.data.data.total;
}

async function createOrder() {
  const serialNos = serialNosText.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const res = await http.post('/transfers', {
    ...form,
    serialNos,
  });

  approveId.value = res.data.data.id;
  Message.success(`调拨单创建成功: ${res.data.data.orderNo}`);
  await loadOrders();
}

async function approveOrder() {
  if (!approveId.value) return Message.warning('请先填写调拨单ID');
  await http.post(`/transfers/${approveId.value}/approve`);
  Message.success('调拨单审核成功');
  await loadOrders();
}

async function unapproveOrder() {
  if (!unapproveId.value) return Message.warning('请先填写调拨单ID');
  await http.post(`/transfers/${unapproveId.value}/unapprove`);
  Message.success('调拨单反审核成功');
  await loadOrders();
}

async function cancelOrder() {
  if (!cancelId.value) return Message.warning('请先填写调拨单ID');
  await http.post(`/transfers/${cancelId.value}/cancel`);
  Message.success('调拨单作废成功');
  await loadOrders();
}

function onPageChange(page: number) {
  query.page = page;
  loadOrders();
}

loadOrders();
</script>
