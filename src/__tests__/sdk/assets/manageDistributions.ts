import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { FungibleAsset } from '@polymeshassociation/polymesh-sdk/internal';
import { KnownAssetType } from '@polymeshassociation/polymesh-sdk/types';

import { TestFactory } from '~/helpers';
import { manageDistributions } from '~/sdk/assets/manageDistributions';

let factory: TestFactory;

describe('manageDividends', () => {
  let asset: FungibleAsset;
  let distributionTicker: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    distributionTicker = factory.nextTicker();

    const assetParams = {
      name: 'Dividends test',
      isDivisible: false,
      assetType: KnownAssetType.EquityCommon,
      requireInvestorUniqueness: false,
    };

    sdk = factory.polymeshSdk;

    const createOne = await sdk.assets.createAsset({
      ...assetParams,
      initialSupply: new BigNumber(100),
    });
    const createTwo = await sdk.assets.createAsset({
      ...assetParams,
      ticker: distributionTicker,
      initialSupply: new BigNumber(1000),
    });

    const batch = await sdk.createTransactionBatch({ transactions: [createOne, createTwo] });
    [asset] = await batch.run();
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute without errors', async () => {
    await expect(manageDistributions(sdk, asset, distributionTicker)).resolves.not.toThrow();
  });
});
