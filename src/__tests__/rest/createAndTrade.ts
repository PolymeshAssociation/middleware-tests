import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createAssetParams } from '~/rest/assets/params';
import { complianceRestrictionParams } from '~/rest/compliance';
import { Identity } from '~/rest/identities/interfaces';
import { instructionParams, venueParams } from '~/rest/settlements';

const handles = ['issuer', 'investor'];
let factory: TestFactory;

describe('Create and trading an Asset', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let investor: Identity;
  let assetParams: ReturnType<typeof createAssetParams>;
  let ticker: string;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);
    investor = factory.getSignerIdentity(handles[1]);

    ticker = factory.nextTicker();
    signer = issuer.signer;

    assetParams = createAssetParams(ticker, { signer });
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should create and fetch the Asset', async () => {
    const txData = await restClient.assets.createAsset(assetParams);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          type: 'batch',
          transactionTags: ['asset.createAsset', 'asset.issue', 'asset.addDocuments'],
          ...expectTxInfo,
        },
      ]),
    });

    const asset = await restClient.assets.getAsset(ticker);
    expect(asset).toMatchObject({
      name: assetParams.name,
      assetType: assetParams.assetType,
    });
  });

  it('should create compliance rules for the Asset', async () => {
    const params = complianceRestrictionParams(ticker, { signer });
    const txData = await restClient.compliance.createRestriction(ticker, params);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'complianceManager.replaceAssetCompliance',
          type: 'single',
          ...expectTxInfo,
        },
      ]),
    });

    const requirements = await restClient.compliance.getRestriction(ticker);

    expect(requirements).toMatchObject({
      requirements: expect.arrayContaining([
        expect.objectContaining({ conditions: params.requirements[0] }),
      ]),
    });
  });

  let venueId: string;
  it('should create a Venue to trade the Asset', async () => {
    const params = venueParams({ signer });
    const txData = await restClient.settlements.createVenue(params);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'settlement.createVenue',
          type: 'single',
          ...expectTxInfo,
        },
      ]),
      venue: expect.any(String),
    });

    ({ venue: venueId } = txData as { venue: string });
  });

  it('should create an instruction', async () => {
    const sender = issuer.did;
    const receiver = investor.did;
    const params = instructionParams(ticker, sender, receiver, { signer });
    const instructionData = await restClient.settlements.createInstruction(venueId, params);

    expect(instructionData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'settlement.addAndAffirmInstructionWithMemo',
          type: 'single',
          ...expectTxInfo,
        },
      ]),
    });
  });

  it('should affirm the created settlement', async () => {
    const result = await restClient.identities.getPendingInstructions(investor.did);

    const { results: pendingInstructions } = result;
    const pendingInstructionId = pendingInstructions[0];

    expect(pendingInstructionId).not.toBeUndefined();

    await restClient.settlements.affirmInstruction(pendingInstructionId, {
      signer: investor.signer,
    });
  });
});

export const expectTxInfo = {
  blockNumber: expect.any(String),
  blockHash: expect.stringContaining('0x'),
  transactionHash: expect.stringContaining('0x'),
};
