import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createAssetParams, createMetadataParams, setMetadataParams } from '~/rest/assets';
import { ProcessMode } from '~/rest/common';
import { Identity } from '~/rest/identities/interfaces';

const handles = ['issuer'];
let factory: TestFactory;

describe('Metadata', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let assetParams: ReturnType<typeof createAssetParams>;
  let asset: string;

  beforeAll(async () => {
    console.log('before all meta');
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);

    asset = factory.nextTicker();
    signer = issuer.signer;

    assetParams = createAssetParams(asset, {
      options: { processMode: ProcessMode.Submit, signer },
    });
    console.log('calling create');
    await restClient.assets.createAsset(assetParams);
    console.log('created asset');
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should list the global metadata', async () => {
    const result = await restClient.assets.getGlobalMetadata();

    expect(result).toEqual([]);
  });

  it('should set an Assets metadata', async () => {
    const params = createMetadataParams({ options: { processMode: ProcessMode.Submit, signer } });
    const result = await restClient.assets.createMetadata(asset, params);

    expect(result).toEqual(
      expect.objectContaining({
        metadata: {
          asset,
          id: '1',
          type: 'Local',
        },
      })
    );
  });

  it('should get an Assets metadata', async () => {
    const result = await restClient.assets.getMetadata(asset);

    expect(result).toEqual({ results: [{ asset: asset, id: '1', type: 'Local' }] });
  });

  it('should update metadata', async () => {
    const params = setMetadataParams({ options: { processMode: ProcessMode.Submit, signer } });

    const result = await restClient.assets.setMetadataValue(asset, 'Local', '1', params);

    expect(result).toEqual(
      expect.objectContaining({
        transactions: expect.arrayContaining([
          expect.objectContaining({
            transactionTag: 'asset.setAssetMetadata',
            type: 'single',
          }),
        ]),
      })
    );
  });

  it('should get metadata by id', async () => {
    const result = await restClient.assets.getMetadataById(asset, 'Local', '1');

    expect(result).toEqual(
      expect.objectContaining({
        asset,
        id: '1',
        specs: {
          description: 'Some description',
          url: 'https://example.com',
        },
        type: 'Local',
        value: {
          value: 'Set Value',
          lockStatus: 'LockedUntil',
          lockedUntil: '2030-05-23T00:00:00.000Z',
          expiry: null,
        },
      })
    );
  });
});
