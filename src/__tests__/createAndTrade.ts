import Keyring from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import {
  assetParams,
  complianceRestrictionParams,
  makeInstructionParams,
  mnemonics,
  venueParams,
} from '~/consts';
import { urls } from '~/environment';
import { Client } from '~/rest/client';
import { Identity } from '~/rest/interfaces';

const { ticker, assetType, name } = assetParams;

describe(`Create and trade: "${ticker}"`, () => {
  let client: Client;
  let investor: Identity;
  beforeAll(async () => {
    client = new Client(urls.restApi);

    await cryptoWaitReady();
    const keyring = new Keyring({ type: 'sr25519' });
    const { address: investorAddress } = keyring.addFromMnemonic(mnemonics.investor);
    investor = await client.createCdd(investorAddress);
  });

  it('should create and fetch the Asset', async () => {
    const txData = await client.createAsset(assetParams);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          type: 'batch',
          transactionTags: ['asset.createAsset', 'asset.issue'],
          ...expectTxInfo,
        },
      ]),
    });

    const asset = await client.get(`/assets/${ticker}`);
    expect(asset).toMatchObject({
      name,
      assetType,
    });
  });

  it('should create compliance rules for the Asset', async () => {
    const txData = await client.post(
      `/assets/${ticker}/compliance-requirements/set`,
      complianceRestrictionParams
    );

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'complianceManager.replaceAssetCompliance',
          type: 'single',
          ...expectTxInfo,
        },
      ]),
    });

    const requirements = await client.get(`/assets/${ticker}/compliance-requirements`);

    expect(requirements).toMatchObject({
      requirements: expect.arrayContaining([
        expect.objectContaining({ conditions: complianceRestrictionParams.requirements[0] }),
      ]),
    });
  });

  let venueId: string;
  it('should create a Venue to trade the Asset in', async () => {
    const txData = await client.post('/venues/create', venueParams);

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
    const instructionParams = makeInstructionParams(investor.did);
    const instructionData = await client.post(
      `/venues/${venueId}/instructions/create`,
      instructionParams
    );

    expect(instructionData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'settlement.addAndAffirmInstruction',
          type: 'single',
          ...expectTxInfo,
        },
      ]),
    });
  });

  it('should affirm the created settlement', async () => {
    const result = await client.get<{ results: string[] }>(
      `/identities/${investor.did}/pending-instructions`
    );

    console.log('pending instructions', result);
    const { results: pendingInstructions } = result;
    const pendingId = pendingInstructions[0];

    expect(pendingId).not.toBeUndefined();

    await client.post(`/instructions/${pendingId}/affirm`, { signer: investor.primaryAddress });
  });
});

export const expectTxInfo = {
  blockNumber: expect.any(String),
  blockHash: expect.stringContaining('0x'),
  transactionHash: expect.stringContaining('0x'),
};
