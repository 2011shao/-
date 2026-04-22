<template>
  <a-card title="供应商管理">
    <a-form :model="form" layout="inline" style="margin-bottom: 12px" @submit.prevent="createSupplier">
      <a-form-item label="编码"><a-input v-model="form.code" /></a-form-item>
      <a-form-item label="名称"><a-input v-model="form.name" /></a-form-item>
      <a-form-item label="联系人"><a-input v-model="form.contactName" /></a-form-item>
      <a-form-item label="电话"><a-input v-model="form.contactPhone" /></a-form-item>
      <a-button type="primary" html-type="submit">新增供应商</a-button>
    </a-form>

    <a-table :columns="columns" :data="rows" :pagination="false" />
  </a-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { http } from '../../api/http';

const rows = ref<any[]>([]);
const form = reactive({ code: '', name: '', contactName: '', contactPhone: '' });

const columns = [
  { title: '编码', dataIndex: 'code' },
  { title: '名称', dataIndex: 'name' },
  { title: '联系人', dataIndex: 'contactName' },
  { title: '电话', dataIndex: 'contactPhone' },
];

async function load() {
  const res = await http.get('/suppliers');
  rows.value = res.data.data;
}

async function createSupplier() {
  await http.post('/suppliers', form);
  form.code = '';
  form.name = '';
  form.contactName = '';
  form.contactPhone = '';
  await load();
}

onMounted(load);
</script>
