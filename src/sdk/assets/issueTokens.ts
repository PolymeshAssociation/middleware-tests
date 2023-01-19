import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { TransactionStatus } from '@polymeshassociation/polymesh-sdk/types';
import assert from 'assert';

/*
  This script showcases how to issue tokens for an Asset.

  Note, for this script to work an Asset with the ticker must be made, and the signer has permission to issue tokens for it
*/
export const issueTokens = async (
  sdk: Polymesh,
  ticker: string,
  amount: BigNumber
): Promise<void> => {
  const asset = await sdk.assets.getAsset({ ticker });

  // Sign with the owner of the Asset. This assumes `signingAccount` is present in the SDK's SigningManager
  const { owner } = await asset.details();
  const { account: signingAccount } = await owner.getPrimaryAccount();

  // Prepare and execute Asset issuance
  const issueTokensProcedure = await asset.issuance.issue({ amount }, { signingAccount });

  await issueTokensProcedure.run();
  assert(
    issueTokensProcedure.status === TransactionStatus.Succeeded,
    'Asset issuance transaction should have succeeded'
  );
};
