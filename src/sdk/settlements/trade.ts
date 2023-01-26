import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { VenueType } from '@polymeshassociation/polymesh-sdk/types';
import assert from 'node:assert';

interface Leg {
  ticker: string;
  amount: BigNumber;
}

/*
  This script showcases Settlement related functionality. It:
    - Creates a Venue
    - Fetches a Venue's details
    - Fetches all of the signing Identity's Venues
    - Adds an Instruction to a Venue
    - Fetches all of the signing Identity's Pending Instructions
    - Authorize/Unauthorize/Reject an Instruction
*/
export const tradeAsset = async (
  sdk: Polymesh,
  counterPartyDid: string,
  bid: Leg,
  ask: Leg
): Promise<void> => {
  const [identity, recipient] = await Promise.all([
    sdk.getSigningIdentity(),
    sdk.identities.getIdentity({ did: counterPartyDid }),
  ]);
  assert(identity, 'The SDK should have a signing identity to trade Assets');

  const venueTx = await sdk.settlements.createVenue({
    description: 'My Venue',
    type: VenueType.Distribution,
  });

  const venue = await venueTx.run();
  const venueDetails = await venue.details();
  assert(venueDetails.owner.did === identity.did, 'The default signer should own the Venue');

  /* An Identities Venues can be fetched */
  const venues = await identity.getVenues();
  assert(
    venues.some(({ id }) => id.eq(venue.id)),
    'The create venue should be returned'
  );

  const destinationPortfolio = await recipient.portfolios.getPortfolio();

  const instructionQ = await venue.addInstruction({
    legs: [
      {
        to: destinationPortfolio, // passing the Identity (or did) means the default portfolio will be used
        from: identity, // or you can pass a Portfolio
        amount: bid.amount,
        asset: bid.ticker,
      },
      {
        to: destinationPortfolio, // passing the Identity (or did) means the default portfolio will be used
        from: identity, // or you can pass a Portfolio
        amount: ask.amount,
        asset: ask.ticker,
      },
    ],
    endBlock: new BigNumber(10000000),
    tradeDate: undefined,
    memo: 'Some message', // optional - passing a message with the instruction
  });

  console.log('Creating Instruction...\n');
  const instruction = await instructionQ.run();

  /* Pending Instructions can be fetched */
  // const pendingInstructions = await venue.getPendingInstructions();

  const details = await instruction.details();
  console.log(`Instruction Created! Creation Date: ${details.createdAt}`);

  const { data: affirmations } = await instruction.getAffirmations();

  affirmations.forEach(({ identity, status }) => {
    console.log(`- Authorizing DID: ${identity.did}\n- Status: ${status}`); // Authorized/Pending/Rejected/Unknown
  });

  const { data: legs } = await instruction.getLegs();

  legs.forEach(({ from, to, amount, asset }) => {
    console.log(
      `- From: ${from.owner.did}\n- To: ${to.owner.did}\n- Amount: ${amount.toFormat()}\n- Asset: ${
        asset.ticker
      }`
    );
  });

  const authorizeQ = await instruction.affirm();

  await authorizeQ.run();

  /* Instructions can be unauthorized (will be withdrawn) or rejected */
  /*
    const unauthorizeQ = await instruction.unauthorize();
    await unauthorizeQ.run();

    const rejectQ = await instruction.reject();
    await rejectQ.run();
  */
};
