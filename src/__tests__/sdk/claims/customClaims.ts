import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { TestFactory } from '~/helpers';
import { Identity } from '~/rest/identities';
import { manageCustomClaims } from '~/sdk/identities/customClaims';

let factory: TestFactory;
const handles = ['claimTarget'];

describe('manageCustomClaims', () => {
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

  it('should execute manageClaimsCustomClaims without errors', async () => {
    await expect(manageCustomClaims(sdk, targetIdentity.did)).resolves.not.toThrow();
  });
});
