import { cryptoWaitReady } from '@polkadot/util-crypto';
import { waitReady } from '@polkadot/wasm-crypto';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { tickerReservation } from '~/sdk/assets/tickerReservation';

describe('createTickerReservation', () => {
  let factory: TestFactory;
  let ticker: string;
  let sdk: Polymesh;

  beforeAll(async () => {
    await cryptoWaitReady();
    await waitReady();

    factory = await TestFactory.create({});
    sdk = factory.polymeshSdk;

    ticker = factory.nextTicker();
  });

  it('should execute tickerReservation without errors', async () => {
    const asset = await tickerReservation(sdk, ticker);

    expect(asset.ticker).toEqual(ticker);
  });
});
