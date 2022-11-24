import { CreateAssetParams } from '~/rest/assets/interfaces';
import { TxBase, TxExtras } from '~/rest/common';

const assetType = 'EquityCommon';

const defaultAssetParams = {
  assetType,
  initialSupply: '100000',
  isDivisible: false,
  requireInvestorUniqueness: false,
  securityIdentifiers: [{ type: 'Isin', value: 'US0846707026' }],
  fundingRound: 'Series A',
  documents: [
    {
      name: 'Test document',
      uri: 'https://example.com/',
      contentHash:
        '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      type: 'Private Placement Memorandum',
      filedAt: '2022-05-23T04:00:00.000Z',
    },
  ],
};

export const createAssetParams = (
  ticker: string,
  base: TxBase,
  extras: Record<string, unknown> = {}
): CreateAssetParams =>
  ({
    name: `Test Corp - ${ticker}`,
    ticker,
    ...defaultAssetParams,
    ...extras,
    ...base,
  } as const);
