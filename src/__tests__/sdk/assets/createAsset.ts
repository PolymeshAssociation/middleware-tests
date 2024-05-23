import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { KnownAssetType, SecurityIdentifierType } from '@polymeshassociation/polymesh-sdk/types';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';

let factory: TestFactory;

describe('createAsset', () => {
  let ticker: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    ticker = factory.nextTicker();
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute createAsset without errors', async () => {
    await expect(
      createAsset(sdk, {
        ticker,
        name: 'test',
        isDivisible: true,
        assetType: KnownAssetType.EquityCommon,
      })
    ).resolves.not.toThrow();
  });

  it('should execute createAsset with a custom type without errors', async () => {
    await expect(
      createAsset(sdk, {
        ticker: factory.nextTicker(),
        name: 'testWithType',
        isDivisible: true,
        assetType: 'customTypeTest',
      })
    ).resolves.not.toThrow();
  });

  it('should execute createAsset with a initial supply, funding round, security identifiers and documents', async () => {
    await expect(
      createAsset(sdk, {
        ticker: factory.nextTicker(),
        name: 'testWithType',
        isDivisible: true,
        assetType: 'Fund',
        initialSupply: new BigNumber(100),
        securityIdentifiers: [
          {
            type: SecurityIdentifierType.Cusip,
            value: '037833100',
          },
        ],
        documents: [
          {
            name: 'Asset Document',
            uri: 'https://ipfs.io/ipfs/QmfUARYf1VrRYPGEmxaKpdJBEyzkDn2nmk7PAX73TENpCo/41.png',
            type: 'Logo',
          },
        ],
        fundingRound: 'Funding Round 1',
      })
    ).resolves.not.toThrow();
  });
});
