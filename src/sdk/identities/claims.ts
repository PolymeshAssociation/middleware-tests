import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { ClaimType, ScopeType } from '@polymeshassociation/polymesh-sdk/types';
import assert from 'node:assert';

import { awaitMiddlewareSynced } from '~/util';

/*
  This function showcases Claim related functionality. It:
    - Add a claim
    - Waits for middleware to sync
    - Revoke a claim
    - Get CDD claims
    - Get investor uniqueness claims
    - Get claims targeting a given Identity
    - Get claims issued by given Identity
*/
export const manageClaims = async (
  sdk: Polymesh,
  targetDid: string,
  assetId: string
): Promise<void> => {
  const identity = await sdk.getSigningIdentity();
  assert(identity);

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
              type: ScopeType.Asset,
              value: assetId,
            },
          },
        },
      ],
    },
    { signingAccount }
  );

  await addClaimTx.run();
  assert(addClaimTx.isSuccess);

  await awaitMiddlewareSynced(addClaimTx, sdk, 15, 2000);

  // Get issued claims
  const issuedClaims = await sdk.claims.getIssuedClaims({
    target: identity.did,
    includeExpired: false,
  });
  assert(issuedClaims.data.length, 'The default signer should have at least one issued claim');

  // select the first one to revoke
  const claimToRevoke = issuedClaims.data[0];

  // Prepare and run the revoke claim transaction
  const revokeClaimTx = await sdk.claims.revokeClaims(
    {
      claims: [claimToRevoke],
    },
    { signingAccount }
  );

  await revokeClaimTx.run();
  assert(revokeClaimTx.isSuccess);

  await awaitMiddlewareSynced(revokeClaimTx, sdk, 15, 2000);

  // This following portion demonstrates different ways to fetch claims

  // Note, without specifying `target` the signingIdentity claims will be fetched
  const signerCddClaims = await sdk.claims.getCddClaims();
  assert(
    signerCddClaims.length > 0,
    'The signing Identity should have at least one Customer Due Diligence claim'
  );

  // `target` can specify which Identity to fetch Claims for
  const targetingClaims = await sdk.claims.getTargetingClaims({ target: targetDid });
  assert(Array.isArray(targetingClaims.data), 'Data should be an Array for `getTargetingClaims`');

  // `target` here refers to the issuer of the claim
  const claimsIssuedByTarget = await sdk.claims.getIssuedClaims({ target: targetDid });
  assert(Array.isArray(claimsIssuedByTarget.data), 'Data should be an Array for `getIssuedClaims`');
};
