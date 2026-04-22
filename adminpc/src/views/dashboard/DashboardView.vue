<template>
  <a-card title="项目进度">
    <a-space direction="vertical" fill>
      <a-alert type="info">一期目标：入库+串码追溯+库存流转。</a-alert>
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="前端框架">Vue3 + setup + Pinia + Arco</a-descriptions-item>
        <a-descriptions-item label="后端框架">Node.js + Express + Prisma</a-descriptions-item>
        <a-descriptions-item label="数据库">PostgreSQL</a-descriptions-item>
        <a-descriptions-item label="部署">Docker Compose</a-descriptions-item>
      </a-descriptions>
    </a-space>
  </a-card>
</template>

<script setup lang="ts"></script>
