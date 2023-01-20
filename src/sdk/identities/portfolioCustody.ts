import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import assert from 'node:assert';

/*
  This script showcases Portfolio's Custodian related functionality. It:
    - Creates a Portfolio
    - Fetches owner and Custodian for that Portfolio
    - Sets a different Custodian to that Portfolio
    - Fetches owned Portfolios
    - Fetches Portfolios in custody
    - Quits Portfolio custody

  It assumes the custodian's primary Account is present in the SDK's signing manager
*/
export const portfolioCustody = async (sdk: Polymesh, custodianDid: string): Promise<void> => {
  const custodian = await sdk.identities.getIdentity({ did: custodianDid });
  const { account: custodianAccount } = await custodian.getPrimaryAccount();

  const identity = await sdk.getSigningIdentity();
  assert(identity, 'The SDK should have a signing account to custody portfolios');

  const createPortfolioTx = await sdk.identities.createPortfolio({ name: 'CUSTODY_PORTFOLIO' });
  const portfolio = await createPortfolioTx.run();

  // Here is how to check ownership and custody of a Portfolio
  const [portfolioCustodian, isOwnedByIdentity, isCustodiedByIdentity] = await Promise.all([
    portfolio.getCustodian(),
    portfolio.isOwnedBy({ identity }),
    portfolio.isCustodiedBy({ identity }),
  ]);
  assert(portfolioCustodian.did === identity.did, `Portfolio custodian should be: ${identity.did}`);
  assert(isOwnedByIdentity, `Portfolio is should be owned by ${identity.did}`);
  assert(isCustodiedByIdentity, `Portfolio is should be custodied by ${identity.did}`);

  const setCustodianTx = await portfolio.setCustodian({ targetIdentity: custodian });

  // The auth request can be retrieved with `custodian.authorizations.getReceived()`
  const authRequest = await setCustodianTx.run();

  // The custodian needs to accept the created authorization
  const acceptTx = await authRequest.accept({ signingAccount: custodianAccount });

  const middlewareSynced = () =>
    new Promise((resolve) => acceptTx.onProcessedByMiddleware(resolve));

  await acceptTx.run();

  const [newCustodian, isCustodiedByOwner] = await Promise.all([
    portfolio.getCustodian(),
    portfolio.isCustodiedBy({ identity }),
  ]);

  assert(
    newCustodian.did === custodian.did,
    `DID ${custodian.did} should now be the custodian of the Portfolio`
  );
  assert(!isCustodiedByOwner, `DID ${identity.did} should no longer be be the custodian`);

  await middlewareSynced();

  // The custodian can get all non owned portfolios where they are the custodian - note there are pagination options
  const custodiedPortfolios = await custodian.portfolios.getCustodiedPortfolios();

  // Quit being a custodian
  const [portfolioToQuit] = custodiedPortfolios.data;

  // TODO, quit custody has a bug where non default account cannot leave the default signer portfolios
  // const quitCustodyTx = await portfolioToQuit.quitCustody({ signingAccount: custodianAccount });
  // await quitCustodyTx.run();
};
