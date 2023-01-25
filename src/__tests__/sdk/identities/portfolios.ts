import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { managePortfolios } from '~/sdk/identities/portfolios';

let factory: TestFactory;

describe('manageClaims', () => {
  let sdk: Polymesh;
  let ticker: string;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    ticker = factory.nextTicker();
    await createAsset(sdk, { ticker, initialSupply: new BigNumber(1000) });
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute manageClaims without errors', async () => {
    await expect(managePortfolios(sdk, ticker)).resolves.not.toThrow();
  });
});
