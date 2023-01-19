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

  const { account: signingAccount } = await identity.getPrimaryAccount();

  // Prepare and run the add claim transaction
  const addClaimTx = await sdk.claims.addClaims(
    {
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
    },
    { signingAccount }
  );
  await addClaimTx.run();
  assert(addClaimTx.status === TransactionStatus.Succeeded, 'Adding a Claim should have succeeded');

  // Revoke a claim
  const issuedClaims = await sdk.claims.getIssuedClaims({ target: identity.did });

  assert(issuedClaims.data.length, 'The default signer should have at least one issued claim');

  const claimToRevoke = issuedClaims.data[0];

  // Prepare and run the revoke claim transaction
  const revokeQ = await sdk.claims.revokeClaims(
    {
      claims: [claimToRevoke],
    },
    { signingAccount }
  );
  await revokeQ.run();

  // This following portion demonstrates different ways to fetch claims

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

  // `target` can specify which Identity to fetch Claims for
  const targetingClaims = await sdk.claims.getTargetingClaims({ target: targetDid });
  assert(Array.isArray(targetingClaims.data), 'Data should be an Array for `getTargetingClaims`');

  // `target` here refers to the issuer of the claim
  const claimsIssuedByTarget = await sdk.claims.getIssuedClaims({ target: targetDid });
  assert(Array.isArray(claimsIssuedByTarget.data), 'Data should be an Array for `getIssuedClaims`');
};
