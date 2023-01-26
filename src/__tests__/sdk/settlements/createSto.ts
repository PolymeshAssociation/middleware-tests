import { LocalSigningManager } from '@polymeshassociation/local-signing-manager';
import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { createSto } from '~/sdk/settlements/createSto';

let factory: TestFactory;

describe('createSto', () => {
  let offeringTicker: string;
  let raisingTicker: string;
  let investorDid: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    const targetMnemonic = LocalSigningManager.generateAccount();
    const investorAddress = factory.signingManager.addAccount({ mnemonic: targetMnemonic });

    ({
      results: [{ did: investorDid }],
    } = await factory.createIdentityForAddresses([investorAddress]));

    offeringTicker = factory.nextTicker();
    raisingTicker = factory.nextTicker();
    const initialSupply = new BigNumber(1000)
    await Promise.all([
      createAsset(sdk, { ticker: offeringTicker, initialSupply }),
      createAsset(
        sdk,
        { ticker: raisingTicker, initialSupply },
        { signingAccount: investorAddress }
      ),
    ]);
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute without errors', async () => {
    await createSto(sdk, investorDid, offeringTicker, raisingTicker);
  });
});
