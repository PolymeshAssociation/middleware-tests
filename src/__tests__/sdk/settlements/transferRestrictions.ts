import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { transferRestrictions } from '~/sdk/settlements/transferRestrictions';

let factory: TestFactory;

describe('transferRestrictions', () => {
  let ticker: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    ticker = factory.nextTicker();
    const initialSupply = new BigNumber(1000);
    await createAsset(sdk, { ticker: ticker, initialSupply });
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute without errors', async () => {
    await transferRestrictions(sdk, ticker);
  });
});
