import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  Asset,
  CreateAssetWithTickerParams,
  KnownAssetType,
} from '@polymeshassociation/polymesh-sdk/types';
import assert from 'assert';

export const createAsset = async (
  sdk: Polymesh,
  args: Partial<CreateAssetWithTickerParams>
): Promise<Asset> => {
  const requiredParams = {
    name: 'Asset Name',
    ticker: 'TICKER',
    isDivisible: false,
    assetType: KnownAssetType.EquityCommon,
    requireInvestorUniqueness: false,
  } as const;

  const params = {
    ...requiredParams,
    ...args,
  };

  // Validates arguments (e.g. ticker is not taken) and returns a Transaction to be ran.
  const createAssetTx = await sdk.assets.createAsset(params);

  // The `Asset` entity will be returned after the transaction is finalized
  const asset = await createAssetTx.run();

  assert(asset.ticker === params.ticker, 'The Asset should have the same ticker as the params');

  return asset;
};
