import { RestClient } from '~/rest/client';
import { PostResult } from '~/rest/interfaces';
import { renamePortfolioParams } from '~/rest/portfolios/params';


export class PortfolioManagement {
  constructor(private client: RestClient) {}

  public async create(params: ReturnType<typeof renamePortfolioParams>): Promise<PostResult> {
    return this.client.post('/portfolios/create', params);
  }

  public async rename(did: string, portfolioId: string, params: ReturnType<typeof renamePortfolioParams>): Promise<PostResult> {
    return this.client.post(`/identities/${did}/portfolios/${portfolioId}/modify-name`, params);
  }


}
