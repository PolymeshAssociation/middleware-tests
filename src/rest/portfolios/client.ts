import { RestClient } from '~/rest/client';
import { PostResult } from '~/rest/interfaces';
import { CreatedPortfolioResult } from '~/rest/portfolios/interfaces';
import { moveAssetParams, portfolioParams } from '~/rest/portfolios/params';

export class Portfolios {
  constructor(private client: RestClient) {}

  public async create(params: ReturnType<typeof portfolioParams>): Promise<CreatedPortfolioResult> {
    return this.client.post('portfolios/create', params);
  }

  public async moveFunds(
    did: string,
    params: ReturnType<typeof moveAssetParams>
  ): Promise<PostResult> {
    return this.client.post(`identities/${did}/portfolios/move-assets`, params);
  }

  public async rename(
    did: string,
    portfolioId: string,
    params: ReturnType<typeof portfolioParams>
  ): Promise<PostResult> {
    return this.client.post(`/identities/${did}/portfolios/${portfolioId}/modify-name`, params);
  }
}
