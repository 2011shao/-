<template>
  <a-layout style="height: 100vh">
    <a-layout-sider :width="240">
      <div class="logo">ERP 管理台</div>
      <a-menu :selected-keys="[selectedKey]" @menu-item-click="onMenuClick">
        <a-menu-item key="/">工作台</a-menu-item>
        <a-sub-menu key="/basic" title="基础资料">
          <a-menu-item key="/basic/brands">品牌管理</a-menu-item>
          <a-menu-item key="/basic/categories">分类管理</a-menu-item>
          <a-menu-item key="/basic/suppliers">供应商管理</a-menu-item>
        </a-sub-menu>
        <a-menu-item key="/stock-in">入库管理</a-menu-item>
        <a-menu-item key="/inventory">库存查询</a-menu-item>
        <a-menu-item key="/transfer">调拨管理</a-menu-item>
        <a-menu-item key="/stocktake">盘点管理</a-menu-item>
        <a-menu-item key="/serial-trace">串码追溯</a-menu-item>
        <a-menu-item key="/operation-logs">操作日志</a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">多店铺线下手机ERP</a-layout-header>
      <a-layout-content class="content">
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const selectedKey = computed(() => route.path);

const onMenuClick = (key: string) => {
  router.push(key);
};
</script>

<style scoped>
.logo {
  height: 56px;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header {
  background: #fff;
  border-bottom: 1px solid #f2f3f5;
  font-weight: 600;
}
.content {
  padding: 16px;
  overflow: auto;
}
</style>
