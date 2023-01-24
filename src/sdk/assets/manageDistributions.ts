import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { TargetTreatment } from '@polymeshassociation/polymesh-sdk/types';
import { isCheckpoint } from '@polymeshassociation/polymesh-sdk/utils';
import assert from 'node:assert';

/*
  This script showcases Dividend Distribution related functionality. It:
    - Creates a Dividend Distribution
    - Modifies its Checkpoint
    - Fetches the new Checkpoint
    - Fetches the Distribution details
    - Fetches all the Distribution participants
    - Pushes dividend payments
    - Claims dividend payment
    - Reclaims remaining funds
    - Fetches Dividend Distributions
*/
export const manageDistributions = async (
  sdk: Polymesh,
  ticker: string,
  distributionTicker: string
): Promise<void> => {
  const signingIdentity = await sdk.getSigningIdentity();
  assert(signingIdentity, 'The SDK should have a signer to manage dividends');

  // The signing identity should be an agent of the Asset and have appropriate permission
  const asset = await sdk.assets.getAsset({ ticker });

  // fetch all current distributions for the Asset
  const allDistributions = await asset.corporateActions.distributions.get();
  assert(Array.isArray(allDistributions), 'allDistributions should be an array');

  const paymentDate = new Date();
  paymentDate.setDate(paymentDate.getDate() + 30);

  // create a checkpoint. The recipients will be calculated by their balance at this checkpoint
  const checkpointTx = await asset.checkpoints.create();
  const checkpoint = await checkpointTx.run();

  const declarationDate = new Date();
  declarationDate.setDate(declarationDate.getDate() - 1);
  // this creates a Corporate Action under the hood and then uses it to create the Dividend Distribution
  const createDistributionTx =
    await asset.corporateActions.distributions.configureDividendDistribution({
      checkpoint,
      currency: distributionTicker,
      perShare: new BigNumber(10),
      maxAmount: new BigNumber(500),
      paymentDate,
      declarationDate,
      expiryDate: undefined, // never expire
      description: 'A sample distribution',
      // set the default tax rate to withhold
      defaultTaxWithholding: new BigNumber(10),
      // (optional) Individuals can be excluded from distributions
      targets: {
        identities: ['0x0200000000000000000000000000000000000000000000000000000000000000'], // can be Identity objects as well
        treatment: TargetTreatment.Exclude,
      },
      // (optional) Individual holders can be targeted with a different rate
      taxWithholdings: [
        {
          identity: '0x0100000000000000000000000000000000000000000000000000000000000000',
          percentage: new BigNumber(25),
        },
      ],
    });
  const distribution = await createDistributionTx.run();

  // const [{ checkpoint }] = (await asset.checkpoints.get()).data;

  // the Checkpoint can be modified before the payment date
  // const modifyCheckpointQ = await distribution.modifyCheckpoint({ checkpoint });
  // await modifyCheckpointQ.run();

  // fetch distribution details (whether funds have been reclaimed and the amount of remaining funds)
  const { remainingFunds, fundsReclaimed } = await distribution.details();
  console.log(`Reclaimed: ${fundsReclaimed}. Remaining funds: ${remainingFunds.toFormat()}`);

  // get all participants, their owed amount and whether they have been paid or not (this is SLOW)
  const participants = await distribution.getParticipants();
  console.log(participants);
  assert(participants.length, 'The distribution should have at least one participant');

  // Once the payment date has been reached these actions can be taken

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const afterPaymentDataActions = async () => {
    // claim Dividend payment for the signing Identity
    const claimTx = await distribution.claim();
    await claimTx.run();

    // push Dividend payments to specific participants
    const paymentTx = await distribution.pay({
      targets: [participants[0].identity],
    });
    await paymentTx.run();

    // reclaim remaining funds after expiry
    const reclaimTx = await distribution.reclaimFunds();
    await reclaimTx.run();
  };
};
