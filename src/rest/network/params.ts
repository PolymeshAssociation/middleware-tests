import { TxBase, TxExtras } from '~/rest/common';

export const transferPolyxParams = (
  to: string,
  amount: string,
  base: TxBase,
  extras: TxExtras = {}
) =>
  ({
    to,
    amount,
    ...extras,
    ...base,
  } as const);
