<template>
  <a-card title="分类管理（严格二级）">
    <a-form :model="form" layout="inline" style="margin-bottom: 12px" @submit.prevent="create">
      <a-form-item label="名称"><a-input v-model="form.name" /></a-form-item>
      <a-form-item label="级别">
        <a-select v-model="form.level" :style="{ width: '120px' }">
          <a-option :value="1">一级</a-option>
          <a-option :value="2">二级</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="父级" v-if="form.level === 2">
        <a-select v-model="form.parentId" :style="{ width: '200px' }">
          <a-option v-for="p in rootCategories" :key="p.id" :value="p.id">{{ p.name }}</a-option>
        </a-select>
      </a-form-item>
      <a-button type="primary" html-type="submit">新增分类</a-button>
    </a-form>

    <a-alert type="warning" style="margin-bottom: 12px">仅允许一级与二级分类，不支持三级。</a-alert>
    <a-tree :data="treeData" block-node />
  </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { http } from '../../api/http';

const treeData = ref<any[]>([]);
const raw = ref<any[]>([]);

const form = reactive({
  name: '',
  level: 1 as 1 | 2,
  parentId: '',
});

const rootCategories = computed(() => raw.value.filter((node) => !node.parentId));

async function load() {
  const res = await http.get('/categories/tree');
  raw.value = (res.data.data || []).flatMap((node: any) => [
    { id: node.id, name: node.name, parentId: null },
    ...(node.children || []).map((sub: any) => ({ id: sub.id, name: sub.name, parentId: node.id })),
  ]);

  treeData.value = (res.data.data || []).map((node: any) => ({
    key: node.id,
    title: node.name,
    children: (node.children || []).map((sub: any) => ({ key: sub.id, title: sub.name })),
  }));
}

async function create() {
  if (form.level === 2 && !form.parentId) {
    Message.warning('二级分类必须选择父级');
    return;
  }

  await http.post('/categories', {
    name: form.name,
    level: form.level,
    parentId: form.level === 2 ? form.parentId : undefined,
  });

  form.name = '';
  form.parentId = '';
  await load();
  Message.success('新增分类成功');
}

onMounted(load);
</script>
