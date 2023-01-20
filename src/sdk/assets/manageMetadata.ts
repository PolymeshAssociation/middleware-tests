import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { MetadataEntry, MetadataLockStatus } from '@polymeshassociation/polymesh-sdk/types';
import assert from 'node:assert';

/*
  This script showcases Metadata related functionality. It:
    - Get all the Global Metadata Keys
    - Get Metadata Entry for a specific id and type
    - Global Asset Metadata
      - Set value for Global Asset Metadata
      - Setting details (expiry and lockStatus) for the Metadata value
      - Fetching the newly set value for Global Metadata
    - Local Asset Metadata
      - Register a new local Asset Metadata
      - Set value for the newly created Metadata
      - Set details for the Metadata value
      - Register and set value for a local Asset Metadata
    - Fetch all Metadata for a Ticker
*/
export const manageMetadata = async (sdk: Polymesh, ticker: string): Promise<void> => {
  const identity = await sdk.getSigningIdentity();
  assert(identity, 'The SDK should have a signing Identity to manage Metadata');

  const asset = await sdk.assets.getAsset({ ticker });

  /**
   * Sets metadata value and details about the metadata value
   *
   * Demonstrates wrapping
   */
  const setMetadataValueAndDetails = async (metadata: MetadataEntry): Promise<void> => {
    const value = 'Example Metadata';
    const setMetadataTx = await metadata.set({
      value,
    });
    await setMetadataTx.run();

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const lockedUntil = new Date(new Date().getTime() + 30 * 24 * 60 * 60);

    const setDetailsTx = await metadata.set({
      details: {
        expiry,
        lockStatus: MetadataLockStatus.LockedUntil,
        lockedUntil,
      },
    });
    await setDetailsTx.run();
  };

  // register a new metadata key for the asset
  const registerTx = await asset.metadata.register({
    name: 'LOCAL-METADATA',
    specs: { description: 'This is a local asset metadata', url: 'https://www.example.com' },
  });
  const localMetadata = await registerTx.run();

  // Now set values for the metadata
  await setMetadataValueAndDetails(localMetadata);

  // register another metadata key and set values for it
  const registerAndSetTx = await asset.metadata.register({
    name: 'LOCAL-METADATA-2',
    specs: { description: 'This is a local asset metadata 2', url: 'https://www.example.com/2' },
    value: 'Metadata Value',
    details: {
      expiry: null,
      lockStatus: MetadataLockStatus.Locked,
    },
  });
  await registerAndSetTx.run();

  // Fetch all metadata
  const allMetadata = await asset.metadata.get();
  allMetadata.forEach((metadata) => console.log(metadata.toHuman()));

  // Fetch global metadata keys
  await sdk.assets.getGlobalMetadataKeys();
};
