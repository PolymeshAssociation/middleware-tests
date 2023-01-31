import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { manageComplianceRequirements } from '~/sdk/settlements/manageComplianceRequirements';

let factory: TestFactory;

describe('manageComplianceRequirements', () => {
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
    await manageComplianceRequirements(sdk, ticker);
  });
});
