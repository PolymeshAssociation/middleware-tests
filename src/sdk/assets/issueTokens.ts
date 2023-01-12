import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { Asset } from '@polymeshassociation/polymesh-sdk/internal';
import {
  GenericPolymeshTransaction,
  TransactionStatus,
} from '@polymeshassociation/polymesh-sdk/types';
import assert from 'assert';

/*
  This script showcases how to issue tokens for an Asset.
*/
export const issueTokens = async (
  sdk: Polymesh,
  ticker: string,
  amount: BigNumber
): Promise<GenericPolymeshTransaction<Asset, Asset>> => {
  const identity = await sdk.getSigningIdentity();
  assert(identity, 'The SDK should have a signing identity to issue a token');

  const asset = await sdk.assets.getAsset({ ticker });

  // Prepare and execute Asset issuance
  const issueTokensProcedure = await asset.issuance.issue({ amount });

  await issueTokensProcedure.run();

  assert(
    issueTokensProcedure.status === TransactionStatus.Succeeded,
    'Asset issuance transaction should have succeeded'
  );

  return issueTokensProcedure;
};
