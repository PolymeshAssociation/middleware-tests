import { CreateAssetParams } from '~/rest/interfaces';

import { randomNonce, signer } from './util';

const nonce = randomNonce(7);

const ticker = `TEST-${nonce}`;
const name = `Test Corp #${nonce}`;
const assetType = 'EquityCommon';

export const aliceDid = '0x01'.padEnd(66, '0');

export const assetParams: CreateAssetParams = {
  signer,
  name,
  ticker,
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
} as const;

export const complianceRestrictionParams = {
  signer,
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
} as const;

export const venueParams = {
  signer,
  description: 'A test Venue',
  type: 'Exchange',
};

/**
 * @note should probably be scoped to a factory type class
 */
export const makeInstructionParams = (to: string) =>
  ({
    signer,
    memo: 'Testing settlements',
    legs: [
      {
        amount: '10',
        from: {
          did: aliceDid,
          id: 0,
        },
        to: {
          did: to,
          id: 0,
        },
        asset: ticker,
      },
    ],
  } as const);
