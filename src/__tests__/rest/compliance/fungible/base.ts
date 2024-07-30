import { assertTagPresent } from '~/assertions';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createAssetParams } from '~/rest/assets/params';
import { ProcessMode, TxBase } from '~/rest/common';
import {
  bothConditionsRequirements,
  complianceRequirementParams,
  complianceRequirementsParams,
  receiverConditionsRequirements,
  senderConditionsRequirements,
} from '~/rest/compliance';
import { Identity } from '~/rest/identities/interfaces';

const handles = ['issuer', 'blocked', 'investor'];
let factory: TestFactory;

describe('Compliance Requirements for Fungible Assets', () => {
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

    await restClient.assets.createAsset(createAssetParams(ticker, signerTxBase));
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should get compliance requirements', async () => {
    const result = await restClient.compliance.getComplianceRequirements(ticker);

    expect(result.requirements).toEqual([]);
  });

  it('should set compliance requirements', async () => {
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

  it('should pause compliance requirements', async () => {
    const txData = await restClient.compliance.pauseRequirements(ticker, signerTxBase);

    expect(txData).toEqual(assertTagPresent(expect, 'complianceManager.pauseAssetCompliance'));
    const result = await restClient.compliance.areRequirementsPaused(ticker);

    expect(result.arePaused).toBeTruthy();
  });

  it('should unpause compliance requirements', async () => {
    const txData = await restClient.compliance.unpauseRequirements(ticker, signerTxBase);

    expect(txData).toEqual(assertTagPresent(expect, 'complianceManager.resumeAssetCompliance'));

    const result = await restClient.compliance.areRequirementsPaused(ticker);

    expect(result.arePaused).toBeFalsy();
  });

  it('should delete compliance requirement with specified id', async () => {
    let requirements = await restClient.compliance.getComplianceRequirements(ticker);
    const id = requirements.requirements[0].id;
    const txData = await restClient.compliance.deleteRequirement(id, ticker, signerTxBase);

    expect(txData).toEqual(
      assertTagPresent(expect, 'complianceManager.removeComplianceRequirement')
    );

    requirements = await restClient.compliance.getComplianceRequirements(ticker);

    expect(requirements.requirements).not.toContainEqual(expect.objectContaining({ id }));
  });

  it('should delete all compliance requirements', async () => {
    const txData = await restClient.compliance.deleteRequirements(ticker, signerTxBase);

    expect(txData).toEqual(assertTagPresent(expect, 'complianceManager.resetAssetCompliance'));

    const requirements = await restClient.compliance.getComplianceRequirements(ticker);

    expect(requirements.requirements).toHaveLength(0);
  });

  it('should add a single compliance requirement', async () => {
    const params = complianceRequirementParams(
      senderConditionsRequirements(issuer.did),

      signerTxBase
    );

    const txData = await restClient.compliance.addRequirement(ticker, params);

    expect(txData).toEqual(assertTagPresent(expect, 'complianceManager.addComplianceRequirement'));

    const requirements = await restClient.compliance.getComplianceRequirements(ticker);

    expect(requirements.requirements).toHaveLength(1);
  });

  it('should modify compliance requirement with the specified id', async () => {
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
});
