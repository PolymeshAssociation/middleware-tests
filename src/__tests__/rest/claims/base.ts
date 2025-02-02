import { ClaimType } from '@polymeshassociation/polymesh-sdk/types';

import { expectBasicTxInfo } from '~/__tests__/rest/utils';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createClaimParams } from '~/rest/claims/params';
import { Identity } from '~/rest/identities/interfaces';

const handles = ['issuer', 'target'];
let factory: TestFactory;

// TODO: fix this test
// eslint-disable-next-line
describe.skip('CustomClaim', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let target: Identity;
  let targetDid: string;
  let issuerDid: string;
  let claimParams: ReturnType<typeof createClaimParams>;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);
    target = factory.getSignerIdentity(handles[1]);

    signer = issuer.signer;
    targetDid = target.did;
    issuerDid = issuer.did;

    claimParams = createClaimParams({
      signer,
      dryRun: false,
      claims: [
        {
          target: targetDid,
          claim: {
            type: ClaimType.Exempted,
            scope: {
              type: 'Identity',
              value: issuerDid,
            },
          },
        },
      ],
    });
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should list CDD claims for an identity', async () => {
    const result = await restClient.identities.getCddClaims(issuerDid);

    expect(result.results[0].claim).toMatchObject({
      id: expect.any(String),
      type: ClaimType.CustomerDueDiligence,
    });
  });

  it('should add an `Exempted` claim', async () => {
    const result = await restClient.claims.addClaim(claimParams);

    expect(result).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'identity.addClaim',
          type: 'single',
          ...expectBasicTxInfo,
        },
      ]),
    });
  });

  it('should list Claims issued by an identity', async () => {
    const result = await restClient.identities.getIssuedClaims(issuerDid);

    expect(result).toMatchObject({
      results: expect.arrayContaining([
        expect.objectContaining({
          issuer: issuerDid,
          target: targetDid,
          claim: expect.objectContaining({ claim: ClaimType.Custom }),
        }),
      ]),
    });
  });

  it('should list Claims associated with an identity', async () => {
    const result = await restClient.identities.getAssociatedClaims(targetDid);

    expect(result).toMatchObject({
      results: expect.arrayContaining([
        expect.objectContaining({
          issuer: issuerDid,
          target: targetDid,
          claim: expect.objectContaining({ claim: ClaimType.Custom }),
        }),
      ]),
    });
  });

  it('should find claim scopes by did', async () => {
    const result = await restClient.identities.findClaimScopesByDid(targetDid);

    expect(result).toMatchObject({
      results: expect.arrayContaining([
        expect.objectContaining({
          scope: expect.objectContaining({ type: 'Identity', value: issuerDid }),
        }),
      ]),
    });
  });

  it('should remove an `Exempted` claim', async () => {
    const result = await restClient.claims.removeClaim(claimParams);

    expect(result).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'identity.revokeClaim',
          type: 'single',
          ...expectBasicTxInfo,
        },
      ]),
    });
  });
});
