import { expectBasicTxInfo } from '~/__tests__/rest/utils';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { createAssetParams, redeemTokenParams } from '~/rest/assets';
import { Mode } from '~/rest/common';
import { Identity } from '~/rest/identities/interfaces';
import { moveAssetParams, portfolioParams } from '~/rest/portfolios';

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

    assetParams = createAssetParams(asset, {
      options: { processMode: Mode.Submit, signer },
    });
    await restClient.assets.createAsset(assetParams);
  });

  afterAll(async () => {
    await factory.close();
  });

  it('should redeem tokens from default Portfolio', async () => {
    const params = redeemTokenParams('0', { options: { processMode: Mode.Submit, signer } });
    const txData = await restClient.assets.redeem(asset, params);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        {
          transactionTag: 'asset.redeem',
          type: 'single',
          ...expectBasicTxInfo,
        },
      ]),
    });
  });

  it('should redeem tokens from specified Portfolio', async () => {
    const portfolioName = factory.nextPortfolio();
    const createPortfolioParams = portfolioParams(portfolioName, {
      options: { processMode: Mode.Submit, signer },
    });
    const result = await restClient.portfolios.create(createPortfolioParams);
    const createdPortfolio = result.portfolio.id;

    const moveFundParams = moveAssetParams(asset, '0', createdPortfolio, {
      options: { processMode: Mode.Submit, signer },
    });
    await restClient.portfolios.moveFunds(issuer.did, moveFundParams);

    const params = redeemTokenParams(createdPortfolio, {
      options: { processMode: Mode.Submit, signer },
    });
    const txData = await restClient.assets.redeem(asset, params);

    expect(txData).toMatchObject({
      transactions: expect.arrayContaining([
        expect.objectContaining({
          transactionTag: 'asset.redeemFromPortfolio',
          type: 'single',
          ...expectBasicTxInfo,
        }),
      ]),
    });
  });
});
