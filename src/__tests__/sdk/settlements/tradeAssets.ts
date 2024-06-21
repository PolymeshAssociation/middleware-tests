import { LocalSigningManager } from '@polymeshassociation/local-signing-manager';
import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { createAsset } from '~/sdk/assets/createAsset';
import { tradeAssets } from '~/sdk/settlements/tradeAssets';
import { tradeOffChainAssets } from '~/sdk/settlements/tradeOffChainAssets';

let factory: TestFactory;
let counterPartyDid: string;

describe('tradeAssets', () => {
  let askTicker: string;
  let bidTicker: string;
  let sdk: Polymesh;

  let askOffChainTicker: string;
  let bidOffChainTicker: string;

  let offChainSenderDid: string;
  let counterPartyAddress: string;

  beforeAll(async () => {
    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    const targetMnemonic = LocalSigningManager.generateAccount();
    console.log(targetMnemonic);
    counterPartyAddress = factory.signingManager.addAccount({ mnemonic: targetMnemonic });

    offChainSenderDid = '0xd99b7c317566c53af54f111e7f82579207f72197e76ec31204ece65cf8db3eb8';

    ({
      results: [{ did: counterPartyDid }],
    } = await factory.createIdentityForAddresses([counterPartyAddress]));

    askTicker = factory.nextTicker();
    bidTicker = factory.nextTicker();
    askOffChainTicker = factory.nextTicker();
    bidOffChainTicker = factory.nextTicker();

    const initialSupply = new BigNumber(100);
    await Promise.all([
      createAsset(sdk, { ticker: bidTicker, initialSupply }),
      createAsset(
        sdk,
        { ticker: askTicker, initialSupply },
        { signingAccount: counterPartyAddress }
      ),
    ]);
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should transfer fungible assets', async () => {
    const bid = { ticker: bidTicker, amount: new BigNumber(10) };
    const ask = { ticker: askTicker, amount: new BigNumber(20) };

    await tradeAssets(sdk, counterPartyDid, bid, ask);
  });

  it('should check canTransfer without error', async () => {
    const [asset, to] = await Promise.all([
      sdk.assets.getFungibleAsset({ ticker: askTicker }),
      sdk.identities.getIdentity({ did: counterPartyDid }),
    ]);

    const { owner: from } = await asset.details();

    return expect(
      asset.settlements.canTransfer({ from, to, amount: new BigNumber(10) })
    ).resolves.not.toThrow();
  });

  it('should transfer off chain assets', async () => {
    const bid = { ticker: bidOffChainTicker, offChainAmount: new BigNumber(10) };
    const ask = { ticker: askOffChainTicker, offChainAmount: new BigNumber(20) };

    await tradeOffChainAssets(
      sdk,
      offChainSenderDid,
      counterPartyDid,
      counterPartyAddress,
      bid,
      ask
    );
  });
});
