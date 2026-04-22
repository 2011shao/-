<template>
  <a-card title="操作日志">
    <a-space style="margin-bottom: 12px">
      <a-input v-model="query.path" placeholder="按路径筛选，例如 /api/v1/stock-in" style="width: 320px" />
      <a-button type="primary" @click="load">查询</a-button>
    </a-space>

    <a-table :columns="columns" :data="rows" :pagination="false" row-key="id" />

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
import { http } from '../../api/http';

const query = reactive({ page: 1, pageSize: 10, path: '' });
const rows = ref<any[]>([]);
const total = ref(0);

const columns = [
  { title: '时间', dataIndex: 'createdAt' },
  { title: '用户ID', dataIndex: 'userId' },
  { title: '角色', dataIndex: 'userRole' },
  { title: '方法', dataIndex: 'method' },
  { title: '路径', dataIndex: 'path' },
  { title: '状态码', dataIndex: 'statusCode' },
  { title: '耗时(ms)', dataIndex: 'durationMs' },
];

async function load() {
  const res = await http.get('/operation-logs', { params: query });
  rows.value = res.data.data.rows;
  total.value = res.data.data.total;
}

function onPageChange(page: number) {
  query.page = page;
  load();
}

load();
</script>
