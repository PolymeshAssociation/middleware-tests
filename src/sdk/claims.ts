import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { ClaimType, ScopeType, TransactionStatus } from '@polymeshassociation/polymesh-sdk/types';
import assert from 'node:assert';

/*
  This function showcases Claim related functionality. It:
    - Add a claim
    - Revoke a claim
    - Get CDD claims
    - Get investor uniqueness claims
    - Get claims targeting a given Identity
    - Get claims issued by given Identity
*/
export const manageClaims = async (sdk: Polymesh, targetDid: string): Promise<void> => {
  const identity = await sdk.getSigningIdentity();
  assert(identity, 'The SDK should have a signing Identity in order to manage claims');

  // Prepare and execute the add claim transaction
  const addClaimTx = await sdk.claims.addClaims({
    claims: [
      {
        target: targetDid,
        claim: {
          type: ClaimType.Accredited,
          scope: {
            type: ScopeType.Ticker,
            value: 'TICKER',
          },
        },
      },
    ],
  });
  await addClaimTx.run();
  assert(addClaimTx.status === TransactionStatus.Succeeded, 'Adding a Claim should have succeeded');

  // TODO add revoke claim example

  // This portion demonstrates different ways to fetch claims

  // Note, without specifying `target` the signingIdentity claims will be fetched
  const signerCddClaims = await sdk.claims.getCddClaims();
  assert(
    signerCddClaims.length > 0,
    'The signing Identity should have at least one Customer Due Diligence claim'
  );

  const investorUniquenessClaims = await sdk.claims.getInvestorUniquenessClaims();
  assert(
    Array.isArray(investorUniquenessClaims),
    '`getInvestorUniquenessClaims` should return an Array'
  );

  // Note, with `target` specified Claims for different Identities can be found
  const targetingClaims = await sdk.claims.getTargetingClaims({ target: targetDid });
  assert(Array.isArray(targetingClaims.data), 'Data should be an Array for `getTargetingClaims`');

  // Get any claims the target might have issued
  const issuedClaims = await sdk.claims.getIssuedClaims({ target: targetDid });
  assert(Array.isArray(issuedClaims.data), 'Data should be an Array for `getIssuedClaims`');
};
