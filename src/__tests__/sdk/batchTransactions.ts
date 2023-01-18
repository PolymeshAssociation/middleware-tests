import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { batchTransactions } from '~/sdk/batchTransactions';

let factory: TestFactory;
const handles = ['batch-tester'];

describe('batchTransactions', () => {
  let ticker: string;
  let sdk: Polymesh;
  let signingAddress: string;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    sdk = factory.polymeshSdk;

    ({
      primaryAccount: {
        account: { address: signingAddress },
      },
    } = factory.getSignerIdentity(handles[0]));

    ticker = factory.nextTicker();
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute batchTransactions without errors', async () => {
    await expect(batchTransactions(sdk, ticker, signingAddress)).resolves.not.toThrow();
  });
});
