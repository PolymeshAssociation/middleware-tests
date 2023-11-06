import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { ClaimType, ScopeType } from '@polymeshassociation/polymesh-sdk/types';
import assert from 'node:assert';

function hashTimeToLetters(adjust = 0) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const timestamp = new Date().getTime();
  const length = 6;

  const hashValue = timestamp + (adjust % Math.pow(26, length)); // ensures a 6 letter word

  let result = '';
  let number = hashValue;

  for (let i = 0; i < length; i++) {
    result = alphabet[number % 26] + result;
    number = Math.floor(number / 26);
  }

  return result;
}

export const manageCustomClaims = async (sdk: Polymesh, targetDid: string): Promise<void> => {
  const identity = await sdk.getSigningIdentity();

  assert(identity);

  const { account: signingAccount } = await identity.getPrimaryAccount();

  const name = hashTimeToLetters();

  // Prepare and run the add claim transaction
  const registerCustomClaimTypeTx = await sdk.claims.registerCustomClaimType(
    { name },
    { signingAccount }
  );

  const middlewareSyncedOnClaimType = () =>
    new Promise((resolve) => registerCustomClaimTypeTx.onProcessedByMiddleware(resolve));

  const customClaimTypeId = await registerCustomClaimTypeTx.run();

  console.warn(customClaimTypeId.toNumber());

  await middlewareSyncedOnClaimType();

  assert(registerCustomClaimTypeTx.isSuccess, 'Should register a CustomClaimType');
  assert(BigNumber.isBigNumber(customClaimTypeId), 'CustomClaimTypeId should be BigNumber');

  const customClaimTypeById = await sdk.claims.getCustomClaimTypeById(customClaimTypeId);

  assert(
    customClaimTypeById?.name === name,
    'Retrieved CustomClaimType name should equal the one provided'
  );

  const addClaimTx = await sdk.claims.addClaims(
    {
      claims: [
        {
          target: targetDid,
          claim: {
            type: ClaimType.Custom,
            customClaimTypeId: new BigNumber(1),
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

  const middlewareSyncedOnAddClaim = () =>
    new Promise((resolve) => addClaimTx.onProcessedByMiddleware(resolve));

  await addClaimTx.run();

  assert(addClaimTx.isSuccess, 'Should be able to add a custom claim');

  await middlewareSyncedOnAddClaim();

  const issuedClaims = await sdk.claims.getIssuedClaims({
    target: identity.did,
    includeExpired: false,
  });

  assert(issuedClaims.data.length, 'The default signer should have at least one issued claim');

  const customClaim = issuedClaims.data.find(
    (claim) =>
      claim.claim.type === ClaimType.Custom && claim.claim.customClaimTypeId === customClaimTypeId
  );

  assert(customClaim, 'The issed CustomClaim should be found in the issued claims list');

  const revokeClaimTx = await sdk.claims.revokeClaims(
    { claims: [customClaim] },
    { signingAccount }
  );

  assert(revokeClaimTx.isSuccess);
};
