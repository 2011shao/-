<template>
  <a-card title="品牌管理（一期）">
    <a-form :model="form" layout="inline" @submit.prevent="createBrand">
      <a-form-item field="code" label="编码"><a-input v-model="form.code" /></a-form-item>
      <a-form-item field="name" label="名称"><a-input v-model="form.name" /></a-form-item>
      <a-button type="primary" html-type="submit">新增品牌</a-button>
    </a-form>

    <a-table :columns="columns" :data="rows" :pagination="false" style="margin-top: 16px" />
  </a-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { http } from '../../api/http';

const form = reactive({ code: '', name: '' });
const rows = ref<any[]>([]);

const columns = [
  { title: '编码', dataIndex: 'code' },
  { title: '名称', dataIndex: 'name' },
  { title: '状态', dataIndex: 'status' },
];

async function load() {
  const res = await http.get('/brands');
  rows.value = res.data.data;
}

async function createBrand() {
  await http.post('/brands', form);
  form.code = '';
  form.name = '';
  await load();
}

onMounted(load);
</script>
