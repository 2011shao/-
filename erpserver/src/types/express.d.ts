import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'HQ' | 'BRANCH' | 'AUDITOR';
        storeId?: string;
      };
    }
  }
}

export {};
