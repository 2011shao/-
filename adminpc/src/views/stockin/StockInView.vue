<template>
  <a-card title="入库开单">
    <a-alert type="info" style="margin-bottom: 12px">
      规则：总店可指定任意门店；分店仅能入库到本店（由后端校验权限）。
    </a-alert>

    <a-form layout="vertical">
      <a-grid :cols="4" :col-gap="12">
        <a-grid-item>
          <a-form-item label="目标门店">
            <a-select v-model="form.targetStoreId" placeholder="请选择门店">
              <a-option v-for="s in stores" :key="s.id" :value="s.id">{{ s.name }}</a-option>
            </a-select>
          </a-form-item>
        </a-grid-item>
        <a-grid-item>
          <a-form-item label="目标仓库">
            <a-select v-model="form.targetWarehouseId" placeholder="请选择仓库">
              <a-option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</a-option>
            </a-select>
          </a-form-item>
        </a-grid-item>
        <a-grid-item>
          <a-form-item label="供应商">
            <a-select v-model="form.supplierId" placeholder="请选择供应商">
              <a-option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</a-option>
            </a-select>
          </a-form-item>
        </a-grid-item>
        <a-grid-item>
          <a-form-item label="备注"><a-input v-model="form.remark" /></a-form-item>
        </a-grid-item>
      </a-grid>
    </a-form>

    <a-space style="margin-bottom: 12px">
      <a-button @click="addItem">新增明细</a-button>
      <a-button type="primary" @click="submitOrder">提交入库单</a-button>
      <a-button status="success" @click="approveOrder" :disabled="!orderId">审核入库单</a-button>
    </a-space>

    <a-table :columns="columns" :data="form.items" :pagination="false" row-key="localId">
      <template #brandId="{ record }">
        <a-select v-model="record.brandId" placeholder="品牌">
          <a-option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</a-option>
        </a-select>
      </template>
      <template #categoryLevel1Id="{ record }">
        <a-select v-model="record.categoryLevel1Id" placeholder="一级分类" @change="onCat1Change(record)">
          <a-option v-for="c in level1Categories" :key="c.id" :value="c.id">{{ c.name }}</a-option>
        </a-select>
      </template>
      <template #categoryLevel2Id="{ record }">
        <a-select v-model="record.categoryLevel2Id" placeholder="二级分类">
          <a-option
            v-for="c in getLevel2Options(record.categoryLevel1Id)"
            :key="c.id"
            :value="c.id"
          >
            {{ c.name }}
          </a-option>
        </a-select>
      </template>
      <template #specText="{ record }"><a-input v-model="record.specText" /></template>
      <template #purchasePrice="{ record }"><a-input-number v-model="record.purchasePrice" :min="0" /></template>
      <template #salePrice="{ record }"><a-input-number v-model="record.salePrice" :min="0" /></template>
      <template #qty="{ record }"><a-input-number v-model="record.qty" :min="1" /></template>
      <template #serialMode="{ record }">
        <a-select v-model="record.serialMode" placeholder="串码模式">
          <a-option value="MANUAL">手动录入</a-option>
          <a-option value="AUTO">自动生成</a-option>
        </a-select>
      </template>
    </a-table>

    <a-divider />
    <a-space>
      <a-input v-model="serialItemId" placeholder="明细ID" style="width: 220px" />
      <a-input v-model="manualSerials" placeholder="手动串码，逗号分隔" style="width: 420px" />
      <a-input-number v-model="serialQty" :min="1" />
      <a-button @click="submitManualSerials">提交手动串码</a-button>
      <a-button type="primary" @click="autoGenerate">自动生成串码</a-button>
    </a-space>

    <a-alert v-if="orderId" type="success" style="margin-top: 12px">当前入库单ID：{{ orderId }}</a-alert>
    <a-alert
      v-if="itemHints.length"
      type="warning"
      style="margin-top: 8px"
      :content="`明细ID提示：${itemHints.join(' | ')}`"
    />
  </a-card>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { http } from '../../api/http';

interface StockInItemUI {
  localId: string;
  brandId: string;
  categoryLevel1Id: string;
  categoryLevel2Id: string;
  specText: string;
  purchasePrice: number;
  salePrice: number;
  qty: number;
  serialMode: 'MANUAL' | 'AUTO';
}

const form = reactive({
  targetStoreId: '',
  targetWarehouseId: '',
  supplierId: '',
  remark: '',
  items: [] as StockInItemUI[],
});

const brands = ref<any[]>([]);
const stores = ref<any[]>([]);
const warehouses = ref<any[]>([]);
const suppliers = ref<any[]>([]);
const categories = ref<any[]>([]);

const orderId = ref('');
const serialItemId = ref('');
const manualSerials = ref('');
const serialQty = ref(1);
const itemHints = ref<string[]>([]);

const level1Categories = computed(() => categories.value.filter((c) => c.level === 1));

function getLevel2Options(parentId: string) {
  return categories.value.filter((c) => c.level === 2 && c.parentId === parentId);
}

function onCat1Change(record: StockInItemUI) {
  record.categoryLevel2Id = '';
}

function addItem() {
  form.items.push({
    localId: Math.random().toString(36).slice(2, 8),
    brandId: '',
    categoryLevel1Id: '',
    categoryLevel2Id: '',
    specText: '',
    purchasePrice: 0,
    salePrice: 0,
    qty: 1,
    serialMode: 'MANUAL',
  });
}

const columns = [
  { title: '品牌', slotName: 'brandId' },
  { title: '一级分类', slotName: 'categoryLevel1Id' },
  { title: '二级分类', slotName: 'categoryLevel2Id' },
  { title: '规格', slotName: 'specText' },
  { title: '进价', slotName: 'purchasePrice' },
  { title: '售价', slotName: 'salePrice' },
  { title: '数量', slotName: 'qty' },
  { title: '串码模式', slotName: 'serialMode' },
];

watch(
  () => form.targetStoreId,
  async (storeId) => {
    if (!storeId) return;
    const res = await http.get('/stores/warehouses', { params: { storeId } });
    warehouses.value = res.data.data;
  },
);

async function loadMeta() {
  const [brandRes, storeRes, supplierRes, categoryRes] = await Promise.all([
    http.get('/brands'),
    http.get('/stores'),
    http.get('/suppliers'),
    http.get('/categories/tree'),
  ]);

  brands.value = brandRes.data.data;
  stores.value = storeRes.data.data;
  suppliers.value = supplierRes.data.data;

  const roots = categoryRes.data.data || [];
  const flat: any[] = [];
  for (const root of roots) {
    flat.push({ id: root.id, name: root.name, level: 1, parentId: null });
    for (const child of root.children || []) {
      flat.push({ id: child.id, name: child.name, level: 2, parentId: root.id });
    }
  }
  categories.value = flat;
}

async function submitOrder() {
  if (!form.items.length) {
    Message.warning('请至少添加一条明细');
    return;
  }

  const res = await http.post('/stock-in/orders', {
    targetStoreId: form.targetStoreId,
    targetWarehouseId: form.targetWarehouseId,
    supplierId: form.supplierId,
    remark: form.remark,
    items: form.items.map((item) => ({
      brandId: item.brandId,
      categoryLevel1Id: item.categoryLevel1Id,
      categoryLevel2Id: item.categoryLevel2Id,
      specText: item.specText,
      purchasePrice: Number(item.purchasePrice),
      salePrice: Number(item.salePrice),
      qty: Number(item.qty),
      serialMode: item.serialMode,
    })),
  });

  orderId.value = res.data.data.id;
  itemHints.value = (res.data.data.items || []).map((it: any, idx: number) => `第${idx + 1}行=${it.id}`);
  Message.success(`入库单创建成功: ${orderId.value}`);
}

async function submitManualSerials() {
  if (!orderId.value || !serialItemId.value) return Message.warning('请先填写订单ID和明细ID');
  const serials = manualSerials.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  await http.post(`/stock-in/orders/${orderId.value}/serials`, {
    itemId: serialItemId.value,
    serials,
  });
  Message.success('手动串码提交成功');
}

async function autoGenerate() {
  if (!orderId.value || !serialItemId.value) return Message.warning('请先填写订单ID和明细ID');
  const res = await http.post(`/stock-in/orders/${orderId.value}/serials/auto-generate`, {
    itemId: serialItemId.value,
    qty: Number(serialQty.value || 1),
  });
  Message.success(`自动生成完成：${res.data.data.serials.length} 个`);
}

async function approveOrder() {
  if (!orderId.value) return Message.warning('请先创建入库单');
  await http.post(`/stock-in/orders/${orderId.value}/approve`);
  Message.success('入库单审核成功');
}

addItem();
loadMeta();
</script>
