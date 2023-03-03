import { RestClient } from '~/rest/client';
import { PostResult } from '~/rest/interfaces';
import { renamePortfolioParams } from '~/rest/portfolios/params';

type CreatePortfolioResult = PostResult & {
  portfolio: {
    id: string;
  };
};

export class PortfolioManagement {
  constructor(private client: RestClient) {}

  public async create(
    params: ReturnType<typeof renamePortfolioParams>
  ): Promise<CreatePortfolioResult> {
    return this.client.post<CreatePortfolioResult>('/portfolios/create', params);
  }

  public async rename(
    did: string,
    portfolioId: string,
    params: ReturnType<typeof renamePortfolioParams>
  ): Promise<PostResult> {
    return this.client.post(`/identities/${did}/portfolios/${portfolioId}/modify-name`, params);
  }
}
