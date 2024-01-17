import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createAssetParams } from '~/rest/assets/params';
import { ProcessMode } from '~/rest/common';
import { Identity } from '~/rest/identities/interfaces';
import { sleep } from '~/util';

const handles = ['issuer', 'investor'];
let factory: TestFactory;

describe('AMQP process mode', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let ticker: string;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);

    ticker = factory.nextTicker();
    signer = issuer.signer;
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should publish an event when transaction is finalized', async () => {
    const assetParams = createAssetParams(ticker, {
      options: { processMode: ProcessMode.AMQP, signer },
    });

    const txData = await restClient.assets.createAsset(assetParams);

    expect(txData).toMatchObject({
      payload: expect.objectContaining({
        method: expect.any(String),
      }),
      metadata: {
        internalTxId: expect.any(String),
      },
    });

    const pollInterval = 3000;
    let assetMade = false;
    for (let i = 0; i < 10; i++) {
      const response = await restClient.assets.getAsset(ticker);

      const statusCode = (response as { statusCode: number }).statusCode;

      if (statusCode === 404) {
        await sleep(pollInterval);
        continue;
      }

      expect(response).toMatchObject({
        name: assetParams.name,
        assetType: assetParams.assetType,
      });
      assetMade = true;
      break;
    }

    expect(assetMade).toEqual(true);
  });
});
