import { Asset } from '@polymeshassociation/polymesh-sdk/types';

/**
 * This function showcases how get various information about an Asset. It:
 *  - Fetches the assetHolders
 */
export const readAssetData = async (asset: Asset): Promise<void> => {
  // Note, the response is paginated in case there are many holders
  const { data } = await asset.assetHolders.get();

  console.log(`Holders of ${asset.ticker}: \n`);

  data.forEach(({ identity, balance }) => {
    console.log(`- Identity: ${identity.did}, Balance: ${balance.toFormat()}`);
  });
};
