import { TxBase, TxExtras } from '~/rest/common';

export const complianceRestrictionParams = (ticker: string, base: TxBase, extras: TxExtras = {}) =>
  ({
    requirements: [
      [
        {
          target: 'Receiver',
          type: 'IsAbsent',
          claim: {
            type: 'Blocked',
            scope: {
              type: 'Ticker',
              value: ticker,
            },
          },
        },
      ],
    ],
    ...extras,
    ...base,
  } as const);
