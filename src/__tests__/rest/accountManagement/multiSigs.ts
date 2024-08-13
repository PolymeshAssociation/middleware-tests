import { BigNumber } from '@polymeshassociation/polymesh-sdk';

import { assertTagPresent, assertTagsPresent } from '~/assertions';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { ProcessMode } from '~/rest/common';
import { Identity } from '~/rest/identities/interfaces';
import { joinCreatorParams } from '~/rest/multiSig';
import { portfolioParams } from '~/rest/portfolios';
import { VaultKey } from '~/vault';

const handles = ['creator'];
const signerOne = 'signerOne';
const signerTwo = 'signerTwo';

let factory: TestFactory;

describe('MultiSig', () => {
  let restClient: RestClient;
  let signer: string;
  let creator: Identity;
  let keyOne: VaultKey;
  let keyTwo: VaultKey;

  let multiSigAddress: string;
  let proposalId: string;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    creator = factory.getSignerIdentity(handles[0]);

    const signerOneKey = factory.prefixNonce(signerOne);
    const signerTwoKey = factory.prefixNonce(signerTwo);

    [keyOne, keyTwo] = await Promise.all([
      factory.vaultClient.createKey(signerOneKey),
      factory.vaultClient.createKey(signerTwoKey),
    ]);

    signer = creator.signer;
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should create a multiSig', async () => {
    const requiredSignatures = new BigNumber(2);
    const result = await restClient.multiSig.create(
      requiredSignatures,
      [keyOne.address, keyTwo.address],
      {
        options: { processMode: ProcessMode.Submit, signer },
      }
    );

    expect(result).toEqual(assertTagPresent(expect, 'multiSig.createMultisig'));

    expect(result.multiSigAddress).toBeDefined();

    multiSigAddress = result.multiSigAddress;
  });

  it('should join the multiSig to the creator', async () => {
    const params = joinCreatorParams({ options: { processMode: ProcessMode.Submit, signer } });

    const result = await restClient.multiSig.joinCreator(multiSigAddress, params);

    expect(result).toEqual(assertTagsPresent(expect, 'multiSig.makeMultisigSecondary'));
  });

  it('should allow signers to join the MultiSig', async () => {
    const [accountOne, accountTwo] = await Promise.all([
      factory.polymeshSdk.accountManagement.getAccount({ address: keyOne.address }),
      factory.polymeshSdk.accountManagement.getAccount({ address: keyTwo.address }),
    ]);

    const [[accountOneAuth], [accountTwoAuth]] = await Promise.all([
      accountOne.authorizations.getReceived(),
      accountTwo.authorizations.getReceived(),
    ]);

    const [resultOne, resultTwo] = await Promise.all([
      restClient.identities.acceptAuthorization(accountOneAuth.authId.toString(), {
        options: { processMode: ProcessMode.Submit, signer: keyOne.signer },
      }),

      restClient.identities.acceptAuthorization(accountTwoAuth.authId.toString(), {
        options: { processMode: ProcessMode.Submit, signer: keyTwo.signer },
      }),
    ]);

    expect(resultOne).toEqual(assertTagPresent(expect, 'multiSig.acceptMultisigSignerAsKey'));
    expect(resultTwo).toEqual(assertTagPresent(expect, 'multiSig.acceptMultisigSignerAsKey'));
  });

  it('should allow a multiSig signer to submit a proposal', async () => {
    const params = portfolioParams('multiSigPortfolio', {
      options: { processMode: ProcessMode.Submit, signer: keyOne.signer },
    });

    const result = await restClient.portfolios.createPortfolio(params);

    expect(result.proposal).toBeDefined();
    expect(result.proposal?.multiSigAddress).toEqual(multiSigAddress);
    expect(result.proposal?.id).toBeDefined();

    proposalId = result.proposal?.id as string;
  });

  it('should fetch proposal details', async () => {
    const proposalDetails = await restClient.multiSig.getProposalDetails(
      multiSigAddress,
      proposalId
    );

    expect(proposalDetails).toBeDefined();
  });

  it('should allow a signer to approve a proposal', async () => {
    const result = await restClient.multiSig.approveProposal(multiSigAddress, proposalId, {
      options: { processMode: ProcessMode.Submit, signer: keyTwo.signer },
    });

    expect(result).toEqual(assertTagPresent(expect, 'multiSig.approveAsKey'));
  });

  it('should allow a signer to reject a proposal', async () => {
    const proposalParams = portfolioParams('rejectPortfolio', {
      options: { processMode: ProcessMode.Submit, signer: keyOne.signer },
    });

    const proposalResult = await restClient.portfolios.createPortfolio(proposalParams);

    expect(proposalResult.proposal).toBeDefined();

    const result = await restClient.multiSig.rejectProposal(
      multiSigAddress,
      proposalResult.proposal?.id as string,
      {
        options: { processMode: ProcessMode.Submit, signer: keyTwo.signer },
      }
    );

    expect(result).toEqual(assertTagPresent(expect, 'multiSig.rejectAsKey'));
  });
});
