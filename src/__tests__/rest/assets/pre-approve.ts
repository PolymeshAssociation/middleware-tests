import { expectBasicTxInfo } from '~/__tests__/rest/utils';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createAssetParams } from '~/rest/assets';
import { ProcessMode } from '~/rest/common';
import { Identity } from '~/rest/identities/interfaces';

const handles = ['issuer'];
let factory: TestFactory;

describe('Asset pre-approval', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let assetParams: ReturnType<typeof createAssetParams>;
  let asset: string;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);

    asset = factory.nextTicker();
    signer = issuer.signer;

    assetParams = createAssetParams(asset, {
      options: { processMode: ProcessMode.Submit, signer },
    });
    await restClient.assets.createAsset(assetParams);
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should set asset pre-approval', async () => {
    const params = { options: { processMode: ProcessMode.Submit, signer } };
    const txData = await restClient.assets.preApprove(asset, params);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'asset.preApproveTicker',
          type: 'single',
          ...expectBasicTxInfo,
        },
      ]),
    });
  });

  it('should return the asset as pre-approved', async () => {
    const result = await restClient.assets.getIsPreApproved(asset, issuer.did);

    expect(result).toEqual({ did: issuer.did, ticker: asset, isPreApproved: true });
  });

  it('should return a page of pre-approved assets', async () => {
    const results = await restClient.assets.getPreApprovals(issuer.did);

    expect(results).toEqual({
      results: [
        {
          ticker: 'TICKER',
          did: issuer.did,
          isPreApproved: true,
        },
      ],
    });
  });

  it('should remove asset pre-approval', async () => {
    const txData = await restClient.assets.removePreApproval(asset, {
      options: { processMode: ProcessMode.Submit, signer },
    });

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          type: 'single',
          transactionTag: 'asset.removeTickerPreApproval',
          ...expectBasicTxInfo,
        },
      ]),
    });
  });
});
