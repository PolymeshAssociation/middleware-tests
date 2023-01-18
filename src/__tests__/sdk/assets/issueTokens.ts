import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { getAssetHolders } from '~/sdk/assets/getAssetHolders';
import { issueTokens } from '~/sdk/assets/issueTokens';

let factory: TestFactory;

describe('issueTokens', () => {
  let ticker: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    ticker = factory.nextTicker();

    await createAsset(sdk, { ticker });
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute issueTokens without errors', async () => {
    await expect(issueTokens(sdk, ticker, new BigNumber(100))).resolves.not.toThrow();
  });

  it('should get asset holders', async () => {
    await expect(getAssetHolders(sdk, ticker)).resolves.not.toThrow();
  });
});
