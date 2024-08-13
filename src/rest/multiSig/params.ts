import { TxBase, TxExtras } from '~/rest/common';

export const createMultiSigParams = (
  requiredSignatures: number,
  signers: string[],
  base: TxBase,
  extras: TxExtras = {}
) =>
  ({
    requiredSignatures: requiredSignatures.toString(),
    signers,
    ...extras,
    ...base,
  } as const);

export const joinCreatorParams = (base: TxBase, extras: TxExtras = {}) =>
  ({
    asPrimary: false,
    permissions: { transactions: null, portfolios: null, assets: null },
    ...extras,
    ...base,
  } as const);

export const modifyMultiSigParams = (
  requiredSignatures: number,
  signers: string[],
  base: TxBase,
  extras: TxExtras = {}
) =>
  ({
    signers,
    requiredSignatures: requiredSignatures.toString(),
    ...extras,
    ...base,
  } as const);
