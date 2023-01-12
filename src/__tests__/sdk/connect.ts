import { cryptoWaitReady } from '@polkadot/util-crypto';
import { waitReady } from '@polkadot/wasm-crypto';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { getPolymeshSdk } from '~/sdk/connect';

describe('SDK', () => {
  let sdk: Polymesh;

  beforeAll(async () => {
    await cryptoWaitReady();
    await waitReady();

    sdk = await getPolymeshSdk();
  });

  afterAll(async () => {
    await sdk.disconnect();
  });

  it('should be defined', () => {
    expect(sdk).toBeDefined();
  });

  it('should be able to query the latest block', async () => {
    const latestBlockId = await sdk.network.getLatestBlock();

    expect(latestBlockId.gt(0)).toBe(true);
  });
});
