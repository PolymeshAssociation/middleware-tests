import { LocalSigningManager } from '@polymeshassociation/local-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { MultiSig, ProposalStatus } from '@polymeshassociation/polymesh-sdk/types';

import { TestFactory } from '~/helpers';
import { runMultiSigExamples } from '~/sdk/accountManagement/multiSig';

let factory: TestFactory;
const handles = ['creator'];

describe('multiSig', () => {
  let sdk: Polymesh;
  let creator: string;
  let signerOne: string;
  let signerTwo: string;
  let multiSig: MultiSig;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    sdk = factory.polymeshSdk;

    // make unattached accounts to serve as the signers
    const mnemonic = LocalSigningManager.generateAccount();

    signerOne = factory.signingManager.addAccount({ mnemonic: `${mnemonic}/one` });
    signerTwo = factory.signingManager.addAccount({ mnemonic: `${mnemonic}/two` });
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute multiSig without errors', async () => {
    await expect(runMultiSigExamples(sdk, creator, signerOne, signerTwo)).resolves.not.toThrow();
  });

  it('should be able to fetch the multiSig via signer', async () => {
    const signerOneAccount = await sdk.accountManagement.getAccount({
      address: signerOne,
    });
    const fetchedMultiSig = await signerOneAccount.getMultiSig();

    if (!fetchedMultiSig) {
      throw new Error('`signerOne.getMultiSig()` did not return a MultiSig');
    }

    multiSig = fetchedMultiSig;
  });

  it('should fetch historical proposals from middleware', async () => {
    const historicalProposals = await multiSig.getHistoricalProposals({});

    expect(historicalProposals.data.length).toEqual(2);

    const details = await Promise.all(
      historicalProposals.data.map((proposals) => proposals.details())
    );

    expect(details.some(({ status }) => status === ProposalStatus.Successful)).toEqual(true);
    expect(details.some(({ status }) => status === ProposalStatus.Rejected)).toEqual(true);
  });
});
