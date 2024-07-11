import { AuthorizationType } from '@polymeshassociation/polymesh-sdk/types';

import { assertTagPresent } from '~/assertions';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createAssetParams } from '~/rest/assets/params';
import { ProcessMode, TxBase } from '~/rest/common';
import { Identity } from '~/rest/identities/interfaces';
import { moveAssetParams, portfolioParams, setCustodianParams } from '~/rest/portfolios';
import { randomNonce } from '~/util';

const handles = ['issuer', 'custodian'];
let factory: TestFactory;

describe('Portfolio Asset Transfers', () => {
  let restClient: RestClient;
  let issuer: Identity;
  let custodian: Identity;
  let custodyPortfolioId: string;
  let authId: string;
  let ticker: string;
  const nonce = randomNonce(12);
  let issuerBasePrams: TxBase;
  let custodianBaseParams: TxBase;
  let custodyPortfolioName: string;

  beforeAll(async () => {
    // prepare identities
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);
    custodian = factory.getSignerIdentity(handles[1]);
    ticker = factory.nextTicker();
    issuerBasePrams = {
      options: { processMode: ProcessMode.Submit, signer: issuer.signer },
    };
    custodianBaseParams = {
      options: { processMode: ProcessMode.Submit, signer: custodian.signer },
    };

    // create portfolios
    custodyPortfolioName = `CUSTODY-${nonce}`;
    const { portfolio: custodyPortfolio } = await restClient.portfolios.createPortfolio(
      portfolioParams(custodyPortfolioName, issuerBasePrams)
    );
    custodyPortfolioId = custodyPortfolio.id;

    // create custody portfolio
    await restClient.portfolios.setCustodian(
      issuer.did,
      custodyPortfolioId,
      setCustodianParams(
        {
          target: custodian.did,
        },
        issuerBasePrams
      )
    );

    const pendingAuthorizations = await restClient.identities.getPendingAuthorizations(
      custodian.did,
      AuthorizationType.PortfolioCustody
    );
    authId = pendingAuthorizations.received[0].id;

    await restClient.identities.acceptAuthorization(authId, custodianBaseParams);

    // create and issue an Asset to move
    await restClient.assets.createAsset(createAssetParams(ticker, issuerBasePrams));
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should have issued the asset to the Default portfolio of the issuer', async () => {
    const result = await restClient.portfolios.getPortfolio(issuer.did, '0');

    expect(result).toEqual(
      expect.objectContaining({
        name: 'default',
        assetBalances: [
          {
            asset: ticker,
            free: expect.any(String),
            locked: expect.any(String),
            total: expect.any(String),
          },
        ],
        id: '0',
        owner: issuer.did,
      })
    );
  });

  it('should transfer the asset from the issuer to the custody portfolio', async () => {
    const result = await restClient.portfolios.moveAssets(
      issuer.did,
      moveAssetParams(ticker, '0', custodyPortfolioId, issuerBasePrams)
    );

    expect(result).toEqual(assertTagPresent(expect, 'portfolio.movePortfolioFunds'));

    const portfolio = await restClient.portfolios.getPortfolio(issuer.did, custodyPortfolioId);

    expect(portfolio).toEqual(
      expect.objectContaining({
        name: custodyPortfolioName,
        assetBalances: [
          {
            asset: ticker,
            free: '1000',
            locked: '0',
            total: '1000',
          },
        ],
        id: custodyPortfolioId,
        owner: issuer.did,
        custodian: custodian.did,
      })
    );
  });

  it('should allow custodian to transfer the asset to the default portfolio', async () => {
    const result = await restClient.portfolios.moveAssets(
      issuer.did,
      moveAssetParams(ticker, custodyPortfolioId, '0', custodianBaseParams)
    );

    expect(result).toEqual(assertTagPresent(expect, 'portfolio.movePortfolioFunds'));

    const portfolio = await restClient.portfolios.getPortfolio(issuer.did, custodyPortfolioId);

    expect(portfolio).toEqual(
      expect.objectContaining({
        name: custodyPortfolioName,
        assetBalances: [
          {
            asset: ticker,
            free: '0',
            locked: '0',
            total: '0',
          },
        ],
        id: custodyPortfolioId,
        owner: issuer.did,
        custodian: custodian.did,
      })
    );
  });

  // TODO: this throws an internal server error "Error: Error in middleware V2 query: more than one row returned by a subquery used as an expression"
  it.skip("should have created transaction history for the asset's transfer", async () => {
    const result = await restClient.portfolios.getTransactionHistory(issuer.did, '0');

    expect(result.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          asset: ticker,
          amount: '1000',
          from: custodyPortfolioId,
          to: '0',
        }),
        expect.objectContaining({
          asset: ticker,
          amount: '1000',
          from: '0',
          to: custodyPortfolioId,
        }),
      ])
    );
  });
});
