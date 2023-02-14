import { RestClient } from '~/rest/client';
import { PostResult } from '~/rest/interfaces';
import { CreatedPortfolioResult } from '~/rest/portfolios/interfaces';
import { createPortfolioParams, moveAssetParams } from '~/rest/portfolios/params';

export class Portfolios {
  constructor(private client: RestClient) {}

  public async createPortfolio(
    params: ReturnType<typeof createPortfolioParams>
  ): Promise<CreatedPortfolioResult> {
    return this.client.post('portfolios/create', params);
  }

  public async moveFunds(
    did: string,
    params: ReturnType<typeof moveAssetParams>
  ): Promise<PostResult> {
    return this.client.post(`identities/${did}/portfolios/move-assets`, params);
  }
}
