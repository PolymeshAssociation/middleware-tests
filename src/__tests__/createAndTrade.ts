import {
  makeAssetParams,
  makeComplianceRestrictionParams,
  makeInstructionParams,
  venueParams,
} from '~/consts';
import { TestFactory } from '~/helpers';
import { CreateAssetParams, Identity, RestClient } from '~/rest';

const handles = ['issuer', 'investor'];
const tickerBase = 'TEST';

describe('Create and trading an Asset', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let investor: Identity;
  let assetParams: CreateAssetParams;
  let ticker: string;

  beforeAll(async () => {
    const factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);
    investor = factory.getSignerIdentity(handles[1]);

    ticker = factory.prefixNonce(tickerBase);
    assetParams = makeAssetParams(ticker);

    signer = issuer.signer;
  });

  it('should create and fetch the Asset', async () => {
    const txData = await restClient.createAsset({ ...assetParams, signer });

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          type: 'batch',
          transactionTags: ['asset.createAsset', 'asset.issue', 'asset.addDocuments'],
          ...expectTxInfo,
        },
      ]),
    });

    const asset = await restClient.get(`/assets/${ticker}`);
    expect(asset).toMatchObject({
      name: assetParams.name,
      assetType: assetParams.assetType,
    });
  });

  it('should create compliance rules for the Asset', async () => {
    const complianceRestrictionParams = makeComplianceRestrictionParams(assetParams.ticker);
    const txData = await restClient.post(`/assets/${ticker}/compliance-requirements/set`, {
      ...complianceRestrictionParams,
      signer,
    });

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'complianceManager.replaceAssetCompliance',
          type: 'single',
          ...expectTxInfo,
        },
      ]),
    });

    const requirements = await restClient.get(`/assets/${ticker}/compliance-requirements`);

    expect(requirements).toMatchObject({
      requirements: expect.arrayContaining([
        expect.objectContaining({ conditions: complianceRestrictionParams.requirements[0] }),
      ]),
    });
  });

  let venueId: string;
  it('should create a Venue to trade the Asset', async () => {
    const txData = await restClient.post('/venues/create', { ...venueParams, signer });

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
    const instructionParams = makeInstructionParams(investor.did, assetParams.ticker);
    const instructionData = await restClient.post(`/venues/${venueId}/instructions/create`, {
      signer,
      ...instructionParams,
    });

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
    const result = await restClient.get<{ results: string[] }>(
      `/identities/${investor.did}/pending-instructions`
    );

    const { results: pendingInstructions } = result;
    const pendingId = pendingInstructions[0];

    expect(pendingId).not.toBeUndefined();

    await restClient.post(`/instructions/${pendingId}/affirm`, { signer: investor.signer });
  });
});

export const expectTxInfo = {
  blockNumber: expect.any(String),
  blockHash: expect.stringContaining('0x'),
  transactionHash: expect.stringContaining('0x'),
};
