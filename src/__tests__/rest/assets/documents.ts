import { expectTxInfo } from '~/__tests__/rest/createAndTrade';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createAssetParams, setAssetDocumentParams } from '~/rest/assets';
import { Identity } from '~/rest/identities/interfaces';

const handles = ['issuer'];
let factory: TestFactory;

describe('AssetDocument', () => {
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

    assetParams = createAssetParams(asset, { signer });
    await restClient.assets.createAsset(assetParams);
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should set Asset Documents', async () => {
    const params = setAssetDocumentParams({ signer });
    const txData = await restClient.assets.setDocuments(asset, params);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTags: ['asset.removeDocuments', 'asset.addDocuments'],
          type: 'batch',
          ...expectTxInfo,
        },
      ]),
    });
  });

  it('should get an Asset documents', async () => {
    const result = await restClient.assets.getDocuments(asset);

    expect(result).toEqual(
      expect.objectContaining({
        results: [
          {
            name: 'Document 1',
            uri: 'https://example.com/document.pdf',
            type: 'PDF',
          },
          {
            name: 'Document 2',
            uri: 'https://example.com/document2.pdf',
            type: 'PDF',
          },
        ],
      })
    );
  });
});
