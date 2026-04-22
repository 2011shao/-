<template>
  <a-card title="库存查询">
    <a-space style="margin-bottom: 12px">
      <a-input v-model="storeId" placeholder="门店ID（可选）" style="width: 220px" />
      <a-button type="primary" @click="load">查询</a-button>
    </a-space>

    <a-table :columns="columns" :data="rows" :pagination="false" />
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { http } from '../../api/http';

const storeId = ref('');
const rows = ref<any[]>([]);

const columns = [
  { title: '门店ID', dataIndex: 'storeId' },
  { title: '仓库ID', dataIndex: 'warehouseId' },
  { title: '品牌ID', dataIndex: 'brandId' },
  { title: '二级分类ID', dataIndex: 'categoryLevel2Id' },
  { title: '规格', dataIndex: 'specText' },
  { title: '在库数量', dataIndex: 'qty' },
];

async function load() {
  const res = await http.get('/inventory/balances', {
    params: { storeId: storeId.value || undefined },
  });
  rows.value = res.data.data;
}

load();
</script>
