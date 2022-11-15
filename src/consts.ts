import { CreateAssetParams } from '~/rest/interfaces';

import { randomNonce, signer } from './util';

const nonce = randomNonce(7);

const ticker = `TEST-${nonce}`;
const name = `Test Corp #${nonce}`;
const assetType = 'EquityCommon';

export const aliceDid = '0x01'.padEnd(66, '0');

export const mnemonics = {
  alice: '//Alice',
  issuer: 'aware vibrant play ginger sample melt turtle drift brother interest pioneer minor',
  investor: 'rural together attract maze stem version drill fade vacuum kid fee swallow',
};

export const assetParams: CreateAssetParams = {
  signer,
  name,
  ticker,
  assetType,
  initialSupply: '100000',
  isDivisible: false,
  requireInvestorUniqueness: false,
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
