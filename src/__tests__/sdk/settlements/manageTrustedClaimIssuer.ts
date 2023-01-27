import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { manageTrustedClaimIssuers } from '~/sdk/settlements/manageTrustedClaimIssuers';

let factory: TestFactory;

describe('manageTrustedClaimIssuers', () => {
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

  it('should execute without errors', async () => {
    await manageTrustedClaimIssuers(sdk, ticker);
  });
});
