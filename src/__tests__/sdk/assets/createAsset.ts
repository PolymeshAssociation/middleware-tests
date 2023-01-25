import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { KnownAssetType } from '@polymeshassociation/polymesh-sdk/types';

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
        requireInvestorUniqueness: false,
        assetType: KnownAssetType.EquityCommon,
      })
    ).resolves.not.toThrow();
  });
});
