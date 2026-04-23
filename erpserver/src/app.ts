import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { authContext } from './middleware/auth-context.js';
import { errorHandler } from './middleware/error-handler.js';
import { operationLogger } from './middleware/operation-logger.js';
import { brandRouter } from './modules/brands/routes.js';
import { categoryRouter } from './modules/categories/routes.js';
import { healthRouter } from './modules/health/routes.js';
import { inventoryRouter } from './modules/inventory/routes.js';
import { operationLogRouter } from './modules/operation-logs/routes.js';
import { serialRouter } from './modules/serials/routes.js';
import { stockInRouter } from './modules/stockin/routes.js';
import { stocktakeRouter } from './modules/stocktakes/routes.js';
import { storeRouter } from './modules/stores/routes.js';
import { supplierRouter } from './modules/suppliers/routes.js';
import { transferRouter } from './modules/transfers/routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));
  app.use(authContext);
  app.use(operationLogger);

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/brands', brandRouter);
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/suppliers', supplierRouter);
  app.use('/api/v1/stores', storeRouter);
  app.use('/api/v1/serials', serialRouter);
  app.use('/api/v1/stock-in', stockInRouter);
  app.use('/api/v1/inventory', inventoryRouter);
  app.use('/api/v1/transfers', transferRouter);
  app.use('/api/v1/stocktakes', stocktakeRouter);
  app.use('/api/v1/operation-logs', operationLogRouter);

  app.use(errorHandler);

  return app;
}
