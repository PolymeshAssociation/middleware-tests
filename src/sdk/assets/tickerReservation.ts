import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { Asset, KnownAssetType } from '@polymeshassociation/polymesh-sdk/types';
import assert from 'assert';

/*
  This function showcases ticker reservation related functionality. It:
    - Reserves a Asset with the specified ticker
    - Fetches its details
    - Creates the Asset
*/
export const tickerReservation = async (sdk: Polymesh, ticker: string): Promise<Asset> => {
  const identity = await sdk.getSigningIdentity();

  assert(identity, 'The SDK should have a signing account to reserve a ticker');

  // Prepare the reservation transaction. Note, this call will validate the ticker is available
  const reserveTx = await sdk.assets.reserveTicker({
    ticker,
  });

  // Reserve the ticker
  const reservation = await reserveTx.run();

  // the Reservation has methods to get its details, or to finish creating the Asset
  const { expiryDate, owner } = await reservation.details();

  assert(
    owner?.did === identity.did,
    'The owner of the Reservation should be the signer of the transaction'
  );
  assert(
    expiryDate && expiryDate > new Date(),
    'The expiry date should be a defined date in the future'
  );

  // Prepare the Asset creation transaction
  const createTx = await reservation.createAsset({
    name: 'Reservation Demo',
    isDivisible: true,
    assetType: KnownAssetType.EquityCommon,
    requireInvestorUniqueness: false,
  });

  // Create the Asset
  const asset = await createTx.run();

  const { expiryDate: expiryAfterCreate } = await reservation.details();

  assert(!expiryAfterCreate, 'The expiry after Asset creation should be null');

  return asset;
};
