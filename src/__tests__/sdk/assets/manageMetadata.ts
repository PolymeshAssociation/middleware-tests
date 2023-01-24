import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { manageMetadata } from '~/sdk/assets/manageMetadata';

let factory: TestFactory;

describe('manageMetadata', () => {
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

  it('should execute manageMetadata without errors', async () => {
    await manageMetadata(sdk, ticker);
  });
});
