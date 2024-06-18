import { TxBase, TxExtras } from '~/rest/common';

export const portfolioParams = (name: string, base: TxBase, extras: TxExtras = {}) =>
  ({
    name,
    ...extras,
    ...base,
  } as const);

export const moveAssetParams = (
  ticker: string,
  from: string,
  to: string,
  base: TxBase,
  extras: TxExtras = {}
) =>
  ({
    from,
    to,
    items: [
      {
        ticker,
        amount: '1000',
        memo: 'Transferring to test redemption',
      },
    ],
    ...extras,
    ...base,
  } as const);

export const setCustodianParams = (
  params: { target: string; expiry?: Date },
  base: TxBase,
  extras: TxExtras = {}
) =>
  ({
    ...params,
    ...extras,
    ...base,
  } as const);
