import { assertTagPresent } from '~/assertions';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { ProcessMode, TxBase } from '~/rest/common';
import {
  bothConditionsRequirements,
  complianceRequirementParams,
  complianceRequirementsParams,
  receiverConditionsRequirements,
  senderConditionsRequirements,
} from '~/rest/compliance';
import { Identity } from '~/rest/identities/interfaces';
import { createNftCollectionParams } from '~/rest/nfts';

const handles = ['issuer', 'blocked', 'investor'];

let factory: TestFactory;

describe('Compliance Requirements for NFTs', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let blocked: Identity;
  let investor: Identity;
  let ticker: string;
  let signerTxBase: TxBase;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);
    blocked = factory.getSignerIdentity(handles[1]);
    investor = factory.getSignerIdentity(handles[2]);

    ticker = factory.nextTicker();
    signer = issuer.signer;
    signerTxBase = { options: { signer, processMode: ProcessMode.Submit } };

    const nftParams = createNftCollectionParams(
      ticker,
      [{ type: 'Local', name: 'Test', spec: { description: 'test metadata' } }],
      signerTxBase
    );
    await restClient.nfts.createNftCollection(nftParams);
  });

  afterAll(async () => {
    await factory.close();
  });

  it('method: getComplianceRequirements', async () => {
    const result = await restClient.compliance.getComplianceRequirements(ticker);

    expect(result).toMatchObject({
      requirements: expect.any(Array),
    });
  });

  it('method: setRequirements', async () => {
    const params = complianceRequirementsParams(
      [
        bothConditionsRequirements(issuer.did, ticker, blocked.did, 'Us'),
        senderConditionsRequirements(issuer.did),
        receiverConditionsRequirements(investor.did),
      ],
      signerTxBase
    );
    const txData = await restClient.compliance.setRequirements(ticker, params);

    expect(txData).toEqual(assertTagPresent(expect, 'complianceManager.replaceAssetCompliance'));

    const requirements = await restClient.compliance.getComplianceRequirements(ticker);

    expect(requirements).toMatchObject({
      requirements: expect.arrayContaining([
        expect.objectContaining({ conditions: params.requirements[0] }),
      ]),
    });
  });

  it('method: pauseRequirements', async () => {
    const txData = await restClient.compliance.pauseRequirements(ticker, signerTxBase);

    expect(txData).toEqual(assertTagPresent(expect, 'complianceManager.pauseAssetCompliance'));
  });

  it('method: unpauseRequirements', async () => {
    const txData = await restClient.compliance.unpauseRequirements(ticker, signerTxBase);

    expect(txData).toEqual(assertTagPresent(expect, 'complianceManager.resumeAssetCompliance'));
  });

  it('method: deleteRequirement', async () => {
    let requirements = await restClient.compliance.getComplianceRequirements(ticker);
    const id = requirements.requirements[0].id;
    const txData = await restClient.compliance.deleteRequirement(id, ticker, signerTxBase);

    expect(txData).toEqual(
      assertTagPresent(expect, 'complianceManager.removeComplianceRequirement')
    );

    requirements = await restClient.compliance.getComplianceRequirements(ticker);

    expect(requirements.requirements).not.toContainEqual(expect.objectContaining({ id }));
  });

  it('method: deleteRequirements', async () => {
    const txData = await restClient.compliance.deleteRequirements(ticker, signerTxBase);

    expect(txData).toEqual(assertTagPresent(expect, 'complianceManager.resetAssetCompliance'));

    const requirements = await restClient.compliance.getComplianceRequirements(ticker);

    expect(requirements.requirements).toHaveLength(0);
  });

  it('method: addRequirement', async () => {
    const params = complianceRequirementParams(
      senderConditionsRequirements(issuer.did),

      signerTxBase
    );

    const txData = await restClient.compliance.addRequirement(ticker, params);

    expect(txData).toEqual(assertTagPresent(expect, 'complianceManager.addComplianceRequirement'));

    const requirements = await restClient.compliance.getComplianceRequirements(ticker);

    expect(requirements.requirements).toHaveLength(1);
  });

  it('method: modifyComplianceRequirement', async () => {
    const requirements = await restClient.compliance.getComplianceRequirements(ticker);
    const id = requirements.requirements[0].id;
    const params = complianceRequirementParams(
      bothConditionsRequirements(issuer.did, ticker, blocked.did, 'Us'),
      signerTxBase
    );

    const txData = await restClient.compliance.modifyComplianceRequirement(id, ticker, params);

    expect(txData).toEqual(
      assertTagPresent(expect, 'complianceManager.changeComplianceRequirement')
    );

    const updatedRequirements = await restClient.compliance.getComplianceRequirements(ticker);

    expect(updatedRequirements.requirements[0]).toMatchObject({ conditions: params.conditions });
  });

  it('method: areRequirementsPaused', async () => {
    const result = await restClient.compliance.areRequirementsPaused(ticker);

    expect(result).toMatchObject({ arePaused: expect.any(Boolean) });
  });
});
