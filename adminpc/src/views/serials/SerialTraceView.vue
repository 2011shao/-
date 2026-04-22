<template>
  <a-card title="串码追溯">
    <a-space style="margin-bottom: 12px">
      <a-input v-model="serialNo" placeholder="请输入串码" style="width: 320px" />
      <a-button type="primary" @click="query">查询</a-button>
    </a-space>

    <a-descriptions v-if="serial" bordered :column="2" style="margin-bottom: 12px">
      <a-descriptions-item label="串码">{{ serial.serialNo }}</a-descriptions-item>
      <a-descriptions-item label="状态">{{ serial.status }}</a-descriptions-item>
      <a-descriptions-item label="门店">{{ serial.storeId }}</a-descriptions-item>
      <a-descriptions-item label="仓库">{{ serial.warehouseId }}</a-descriptions-item>
    </a-descriptions>

    <a-timeline>
      <a-timeline-item v-for="item in logs" :key="item.id">
        {{ item.operatedAt }} - {{ item.eventType }} - {{ item.remark || '-' }}
      </a-timeline-item>
    </a-timeline>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { http } from '../../api/http';

const serialNo = ref('');
const serial = ref<any>(null);
const logs = ref<any[]>([]);

async function query() {
  if (!serialNo.value) {
    Message.warning('请先输入串码');
    return;
  }

  try {
    const [serialRes, logsRes] = await Promise.all([
      http.get(`/serials/${serialNo.value}`),
      http.get(`/serials/${serialNo.value}/timeline`),
    ]);
    serial.value = serialRes.data.data;
    logs.value = logsRes.data.data;
  } catch {
    Message.error('串码不存在或查询失败');
  }
}
</script>
