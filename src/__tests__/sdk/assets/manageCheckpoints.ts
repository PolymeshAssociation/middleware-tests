import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { manageCheckpoints } from '~/sdk/assets/manageCheckpoints';

let factory: TestFactory;

describe('manageCheckpoints', () => {
  let ticker: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    ticker = factory.nextTicker();
    await createAsset(sdk, { ticker, initialSupply: new BigNumber(100) });
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute mangeCheckpoints without errors', async () => {
    await expect(manageCheckpoints(sdk, ticker)).resolves.not.toThrow();
  });
});
