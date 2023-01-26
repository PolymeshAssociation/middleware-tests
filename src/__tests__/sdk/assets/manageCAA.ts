import { LocalSigningManager } from '@polymeshassociation/local-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { manageCAA } from '~/sdk/assets/manageCAA';

let factory: TestFactory;

describe('manageCAA', () => {
  let ticker: string;
  let targetDid: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    const targetMnemonic = LocalSigningManager.generateAccount();
    const targetAddress = factory.signingManager.addAccount({ mnemonic: targetMnemonic });

    ({
      results: [{ did: targetDid }],
    } = await factory.createIdentityForAddresses([targetAddress]));

    ticker = factory.nextTicker();
    await createAsset(sdk, { ticker });
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute without errors', async () => {
    await manageCAA(sdk, targetDid, ticker);
  });
});
