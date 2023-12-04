import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  ClaimTarget,
  ClaimType,
  CustomClaim,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';
import assert from 'node:assert';

import { randomString } from '~/util';

export const manageCustomClaims = async (sdk: Polymesh, targetDid: string): Promise<void> => {
  const identity = await sdk.getSigningIdentity();

  assert(identity);

  const { account: signingAccount } = await identity.getPrimaryAccount();

  const name = randomString(12);

  // Prepare and run the add claim transaction
  const registerCustomClaimTypeTx = await sdk.claims.registerCustomClaimType(
    { name },
    { signingAccount }
  );

  const middlewareSyncedOnClaimType = () =>
    new Promise((resolve) => registerCustomClaimTypeTx.onProcessedByMiddleware(resolve));

  const customClaimTypeId = await registerCustomClaimTypeTx.run();

  await middlewareSyncedOnClaimType();

  const registeredCustomClaimTypes = await sdk.claims.getAllCustomClaimTypes();

  assert(
    registeredCustomClaimTypes.count?.isGreaterThanOrEqualTo(1),
    'There should be at least one registered CustomClaimType'
  );

  assert(registerCustomClaimTypeTx.isSuccess, 'Should register a CustomClaimType');
  assert(BigNumber.isBigNumber(customClaimTypeId), 'CustomClaimTypeId should be BigNumber');

  const customClaimTypeById = await sdk.claims.getCustomClaimTypeById(customClaimTypeId);

  assert(
    customClaimTypeById?.name === name,
    'Retrieved CustomClaimType name should equal the one provided'
  );

  const customClaim: Omit<ClaimTarget, 'expiry'> = {
    target: targetDid,
    claim: {
      type: ClaimType.Custom,
      customClaimTypeId,
      scope: {
        type: ScopeType.Ticker,
        value: 'TICKER',
      },
    },
  };

  const addClaimTx = await sdk.claims.addClaims(
    {
      claims: [customClaim],
    },
    { signingAccount }
  );

  const middlewareSyncedOnAddClaim = () =>
    new Promise((resolve) => addClaimTx.onProcessedByMiddleware(resolve));

  await addClaimTx.run();

  assert(addClaimTx.isSuccess, 'Should be able to add a custom claim');

  await middlewareSyncedOnAddClaim();

  const revokeClaimTx = await sdk.claims.revokeClaims(
    { claims: [customClaim] },
    { signingAccount }
  );
  await revokeClaimTx.run();

  assert(revokeClaimTx.isSuccess, 'Should be able to revoke a custom claim');
};
