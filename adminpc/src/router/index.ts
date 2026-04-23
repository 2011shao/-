import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import DashboardView from '../views/dashboard/DashboardView.vue';
import BrandView from '../views/basic/BrandView.vue';
import CategoryView from '../views/basic/CategoryView.vue';
import SupplierView from '../views/basic/SupplierView.vue';
import StockInView from '../views/stockin/StockInView.vue';
import InventoryView from '../views/inventory/InventoryView.vue';
import SerialTraceView from '../views/serials/SerialTraceView.vue';
import TransferView from '../views/transfer/TransferView.vue';
import StocktakeView from '../views/stocktake/StocktakeView.vue';
import OperationLogView from '../views/audit/OperationLogView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { path: '/basic/brands', name: 'brands', component: BrandView },
        { path: '/basic/categories', name: 'categories', component: CategoryView },
        { path: '/basic/suppliers', name: 'suppliers', component: SupplierView },
        { path: '/stock-in', name: 'stockin', component: StockInView },
        { path: '/inventory', name: 'inventory', component: InventoryView },
        { path: '/transfer', name: 'transfer', component: TransferView },
        { path: '/stocktake', name: 'stocktake', component: StocktakeView },
        { path: '/serial-trace', name: 'serial-trace', component: SerialTraceView },
        { path: '/operation-logs', name: 'operation-logs', component: OperationLogView },
      ],
    },
  ],
});

export default router;
