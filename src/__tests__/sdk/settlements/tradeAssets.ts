import { LocalSigningManager } from '@polymeshassociation/local-signing-manager';
import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { tradeAssets } from '~/sdk/settlements/tradeAssets';

let factory: TestFactory;

describe('tradeAssets', () => {
  let askTicker: string;
  let bidTicker: string;
  let counterDid: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    const targetMnemonic = LocalSigningManager.generateAccount();
    const counterAddress = factory.signingManager.addAccount({ mnemonic: targetMnemonic });

    ({
      results: [{ did: counterDid }],
    } = await factory.createIdentityForAddresses([counterAddress]));

    askTicker = factory.nextTicker();
    bidTicker = factory.nextTicker();
    const initialSupply = new BigNumber(100);
    await Promise.all([
      createAsset(sdk, { ticker: bidTicker, initialSupply }),
      createAsset(sdk, { ticker: askTicker, initialSupply }, { signingAccount: counterAddress }),
    ]);
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute without errors', async () => {
    const bid = { ticker: bidTicker, amount: new BigNumber(10) };
    const ask = { ticker: askTicker, amount: new BigNumber(20) };

    await tradeAssets(sdk, counterDid, bid, ask);
  });
});
