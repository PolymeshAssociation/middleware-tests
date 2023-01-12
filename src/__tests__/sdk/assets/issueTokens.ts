import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { getAssetHolders } from '~/sdk/assets/getAssetHolders';
import { issueTokens } from '~/sdk/assets/issueTokens';

describe('issueTokens', () => {
  let factory: TestFactory;
  let ticker: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    ticker = factory.nextTicker();

    await createAsset(sdk, { ticker });
  });

  it('should execute issueTokens without errors', async () => {
    const transaction = await issueTokens(sdk, ticker, new BigNumber(100));

    expect(transaction.blockHash).toEqual(expect.any(String));
  });

  it('should get asset holders', async () => {
    const holders = await getAssetHolders(sdk, ticker);

    expect(holders.data.length).toEqual(1);
  });
});
