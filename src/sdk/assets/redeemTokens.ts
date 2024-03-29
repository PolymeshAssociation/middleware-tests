import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { assert } from 'console';

/*
  This script showcases how to redeem tokens for an Asset.

   Note, for this script to work an Asset with the ticker must be made, and the signer has permission to issue tokens for it
*/
export const redeemTokens = async (
  sdk: Polymesh,
  ticker: string,
  amount: BigNumber
): Promise<void> => {
  const asset = await sdk.assets.getFungibleAsset({ ticker });

  const { owner: identity } = await asset.details();

  const { account: signingAccount } = await identity.getPrimaryAccount();

  const redeemTokensTx = await asset.redeem({ amount: new BigNumber(amount) }, { signingAccount });
  await redeemTokensTx.run();
  assert(redeemTokensTx.isSuccess);
};
