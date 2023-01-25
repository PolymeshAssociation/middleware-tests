import { LocalSigningManager } from '@polymeshassociation/local-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { addAssetAgent } from '~/sdk/assets/addAssetAgent';
import { createAsset } from '~/sdk/assets/createAsset';

let factory: TestFactory;

describe('addAssetAgent', () => {
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

  it('should execute addAssetAgent without errors', async () => {
    await addAssetAgent(sdk, targetDid, ticker);
  });
});
