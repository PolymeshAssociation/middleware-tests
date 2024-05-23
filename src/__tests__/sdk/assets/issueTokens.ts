import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { NumberedPortfolio } from '@polymeshassociation/polymesh-sdk/types';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { getAssetHolders } from '~/sdk/assets/getAssetHolders';
import { issueTokens } from '~/sdk/assets/issueTokens';
import { createPortfolio } from '~/sdk/identities/portfolios';
import { randomNonce } from '~/util';

let factory: TestFactory;

describe('issueTokens', () => {
  let ticker: string;
  let sdk: Polymesh;
  let portfolio: NumberedPortfolio;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    ticker = factory.nextTicker();

    portfolio = await createPortfolio(sdk, randomNonce(12));

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

  it('should execute issueTokens for issuing in a specific portfolio without errors', async () => {
    await expect(issueTokens(sdk, ticker, new BigNumber(100), portfolio.id)).resolves.not.toThrow();
  });
});
