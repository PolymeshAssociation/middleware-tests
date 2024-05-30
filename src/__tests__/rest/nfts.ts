import { expectBasicTxInfo } from '~/__tests__/rest/utils';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createMetadataParams } from '~/rest/assets';
import { ProcessMode } from '~/rest/common';
import { complianceRestrictionParams } from '~/rest/compliance';
import { Identity } from '~/rest/identities/interfaces';
import { createNftCollectionParams, issueNftParams } from '~/rest/nfts';
import { nftInstructionParams, venueParams } from '~/rest/settlements';

const handles = ['issuer', 'collector'];
let factory: TestFactory;

describe('NFTs', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let collector: Identity;
  let ticker: string;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);
    collector = factory.getSignerIdentity(handles[1]);

    ticker = factory.nextTicker();
    signer = issuer.signer;
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should create a collection', async () => {
    const nftParams = createNftCollectionParams(
      ticker,
      [{ type: 'Local', name: 'Test', spec: { description: 'test metadata' } }],
      { options: { processMode: ProcessMode.Submit, signer } }
    );
    const result = await restClient.nfts.createNftCollection(nftParams);

    expect(result).toMatchObject({
      transactions: expect.arrayContaining([
        expect.objectContaining({
          transactionTags: expect.arrayContaining([
            'asset.createAsset',
            'asset.registerAssetMetadataLocalType',
            'asset.addDocuments',
            'nft.createNftCollection',
          ]),
          type: 'batch',
        }),
      ]),
    });
  });

  it('should return collection keys', async () => {
    const keys = await restClient.nfts.getCollectionKeys(ticker);

    expect(keys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          type: 'Local',
          name: 'Test',
          specs: expect.objectContaining({
            description: 'test metadata',
          }),
        }),
      ])
    );
  });

  it('should issue an NFT', async () => {
    const params = issueNftParams(ticker, [{ type: 'Local', id: '1', value: 'test value' }], {
      options: { processMode: ProcessMode.Submit, signer },
    });

    const result = await restClient.nfts.issueNft(ticker, params);

    expect(result).toMatchObject({
      transactions: expect.arrayContaining([
        expect.objectContaining({
          ...expectBasicTxInfo,
          transactionTag: 'nft.issueNft',
        }),
      ]),
    });
  });

  it('should return NFT details', async () => {
    const result = await restClient.nfts.getNftDetails(ticker, '1');

    expect(result).toMatchObject({
      id: '1',
      imageUri: null,
      metadata: expect.arrayContaining([
        expect.objectContaining({
          key: expect.objectContaining({ id: '1', type: 'Local', ticker }),
          value: 'test value',
        }),
      ]),
    });
  });

  it('should pause compliance requirements', async () => {
    const params = complianceRestrictionParams(ticker, {
      options: { processMode: ProcessMode.Submit, signer },
    });
    const result = await restClient.compliance.createRestriction(ticker, params);

    expect(result).toMatchObject({
      transactions: expect.arrayContaining([
        expect.objectContaining({
          ...expectBasicTxInfo,
          transactionTag: 'complianceManager.replaceAssetCompliance',
        }),
      ]),
    });
  });

  let venueId: string;
  it('should create a Venue to trade the NFTs', async () => {
    const params = venueParams({ options: { processMode: ProcessMode.Submit, signer } });
    const txData = await restClient.settlements.createVenue(params);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'settlement.createVenue',
          type: 'single',
          ...expectBasicTxInfo,
        },
      ]),
      venue: expect.any(String),
    });

    ({ venue: venueId } = txData as { venue: string });
  });

  it('should allow NFT instruction to be created', async () => {
    const sender = issuer.did;
    const receiver = collector.did;
    const params = nftInstructionParams(ticker, sender, receiver, ['1'], {
      options: { processMode: ProcessMode.Submit, signer },
    });

    const result = await restClient.settlements.createInstruction(venueId, params);
    expect(result).toMatchObject({
      transactions: expect.arrayContaining([
        expect.objectContaining({
          transactionTag: 'settlement.addAndAffirmWithMediators',
          ...expectBasicTxInfo,
        }),
      ]),
    });
  });

  let instructionId: string;
  it('should allow instruction with NFT leg to be viewed', async () => {
    const pendingResult = await restClient.identities.getPendingInstructions(collector.did);

    const { results: pendingInstructions } = pendingResult;
    instructionId = pendingInstructions[0];

    expect(instructionId).toBeDefined();

    const result = await restClient.settlements.getInstruction(instructionId);

    expect(result).toMatchObject({
      legs: expect.arrayContaining([
        expect.objectContaining({
          asset: ticker,
          nfts: expect.arrayContaining(['1']),
        }),
      ]),
    });
  });

  it('should allow instruction to be affirmed', async () => {
    const result = await restClient.settlements.affirmInstruction(instructionId, {
      options: { processMode: ProcessMode.Submit, signer: collector.signer },
    });
    expect(result).toMatchObject({
      transactions: expect.arrayContaining([
        expect.objectContaining({
          ...expectBasicTxInfo,
          transactionTag: 'settlement.affirmInstructionWithCount',
        }),
      ]),
    });
  });

  it('should set NFT Collection metadata', async () => {
    const params = createMetadataParams({ options: { processMode: ProcessMode.Submit, signer } });
    const result = await restClient.assets.createMetadata(ticker, params);

    expect(result).toMatchObject({
      transactions: expect.arrayContaining([
        expect.objectContaining({
          ...expectBasicTxInfo,
          transactionTag: 'asset.registerAndSetLocalAssetMetadata',
        }),
      ]),
    });
  });

  it('should get an NFT collection metadata', async () => {
    const result = await restClient.assets.getMetadata(ticker);

    expect(result).toEqual({
      results: expect.arrayContaining([
        expect.objectContaining({ asset: ticker, id: '1', type: 'Local' }),
        expect.objectContaining({ asset: ticker, id: '2', type: 'Local' }),
      ]),
    });
  });
});
