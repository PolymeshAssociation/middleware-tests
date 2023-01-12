import { cryptoWaitReady } from '@polkadot/util-crypto';
import { waitReady } from '@polkadot/wasm-crypto';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { KnownAssetType } from '@polymeshassociation/polymesh-sdk/types';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';

describe('createAsset', () => {
  let factory: TestFactory;
  let ticker: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    await cryptoWaitReady();
    await waitReady();

    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    ticker = factory.nextTicker();
  });

  it('should execute createAsset without errors', async () => {
    const asset = await createAsset(sdk, {
      ticker,
      name: 'test',
      isDivisible: true,
      requireInvestorUniqueness: false,
      assetType: KnownAssetType.EquityCommon,
    });

    expect(asset.ticker).toEqual(ticker);
  });
});
