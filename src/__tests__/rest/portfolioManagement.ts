import { assertTagPresent } from '~/assertions';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { Identity } from '~/rest/identities/interfaces';
import { RestErrorResult } from '~/rest/interfaces';
import { renamePortfolioParams } from '~/rest/portfolios';
import { randomNonce } from '~/util';

const handles = ['issuer'];
let factory: TestFactory;

describe('Portfolio Management', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let portfolioId: string;
  const nonce = randomNonce(12);

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);

    signer = issuer.signer;
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should create a portfolio', async () => {
    const params = renamePortfolioParams(`TEST-${nonce}`, { signer });

    const result = await restClient.portfolioManagement.create(params);

    expect(result).toEqual(assertTagPresent(expect, 'portfolio.createPortfolio'));

    portfolioId = result.portfolio.id;
  });

  it('should rename a portfolio', async () => {
    const params = renamePortfolioParams(`RENAME-${nonce}`, { signer });

    const result = await restClient.portfolioManagement.rename(issuer.did, portfolioId, params);

    expect(result).toEqual(assertTagPresent(expect, 'portfolio.renamePortfolio'));
  });

  it('should return error when renaming to same name', async () => {
    const params = renamePortfolioParams(`RENAME-${nonce}`, { signer });

    const result = (await restClient.portfolioManagement.rename(
      issuer.did,
      portfolioId,
      params
    )) as RestErrorResult;

    expect(result.statusCode).toEqual(400);
  });

  it('should return error when renaming default portfolio', async () => {
    const params = renamePortfolioParams(`RENAME-${nonce}`, { signer });

    const result = (await restClient.portfolioManagement.rename(
      issuer.did,
      '0',
      params
    )) as RestErrorResult;

    expect(result.statusCode).toEqual(400);
  });

  it('should return error when renaming portfolio to an existing portfolio name', async () => {
    const existingPortfolioParams = renamePortfolioParams(`EXISTING-${nonce}`, { signer });

    await restClient.portfolioManagement.create(existingPortfolioParams);

    const result = (await restClient.portfolioManagement.rename(
      issuer.did,
      portfolioId,
      existingPortfolioParams
    )) as RestErrorResult;

    expect(result.statusCode).toEqual(422);
  });
});
