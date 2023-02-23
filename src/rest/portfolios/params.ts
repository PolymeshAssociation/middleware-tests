import { TxBase, TxExtras } from '~/rest/common';

export const renamePortfolioParams = (name: string, base: TxBase, extras: TxExtras = {}) =>
  ({
    name,
    ...extras,
    ...base,
  } as const);
