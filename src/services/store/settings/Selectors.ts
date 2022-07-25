import type { TRootState } from '../index';
export const isProductionEvironmentSelector = (store: TRootState) =>
  store.settings.isProductionEnv;
