import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { Identity } from '~/rest/identities';
import { manageClaims } from '~/sdk/claims';

let factory: TestFactory;
const handles = ['claimTarget'];

describe('manageClaims', () => {
  let sdk: Polymesh;
  let targetIdentity: Identity;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    targetIdentity = factory.getSignerIdentity(handles[0]);
    sdk = factory.polymeshSdk;
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should execute manageClaims without errors', async () => {
    await expect(manageClaims(sdk, targetIdentity.did)).resolves.not.toThrow();
  });
});
