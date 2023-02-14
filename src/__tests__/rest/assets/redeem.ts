import { expectTxInfo } from '~/__tests__/rest/createAndTrade';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createAssetParams, redeemTokenParams } from '~/rest/assets';
import { Identity } from '~/rest/identities/interfaces';
import { createPortfolioParams, moveAssetParams } from '~/rest/portfolios';

const handles = ['issuer'];
let factory: TestFactory;

describe('Redeem', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let assetParams: ReturnType<typeof createAssetParams>;
  let asset: string;

  beforeAll(async () => {
    factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);

    asset = factory.nextTicker();
    signer = issuer.signer;

    assetParams = createAssetParams(asset, { signer });
    await restClient.assets.createAsset(assetParams);
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should redeem tokens from default Portfolio', async () => {
    const params = redeemTokenParams('0', { signer });
    const txData = await restClient.assets.redeem(asset, params);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'asset.redeem',
          type: 'single',
          ...expectTxInfo,
        },
      ]),
    });
  });

  it('should redeem tokens from specified Portfolio', async () => {
    const portfolioName = factory.nextPortfolio();
    const portfolioParams = createPortfolioParams(portfolioName, { signer });
    const result = await restClient.portfolios.createPortfolio(portfolioParams);
    const createdPortfolio = result.portfolio.id;

    const moveFundParams = moveAssetParams(asset, '0', createdPortfolio, { signer });
    await restClient.portfolios.moveFunds(issuer.did, moveFundParams);

    const params = redeemTokenParams(createdPortfolio, { signer });
    const txData = await restClient.assets.redeem(asset, params);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'asset.redeem',
          type: 'single',
          ...expectTxInfo,
        },
      ]),
    });
  });
});
