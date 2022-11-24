import { RestClient } from '~/rest/client';
import { complianceRestrictionParams } from '~/rest/compliance/params';

export class Compliance {
  constructor(private client: RestClient) {}

  public async createRestriction(
    ticker: string,
    params: ReturnType<typeof complianceRestrictionParams>
  ): Promise<unknown> {
    return this.client.post(`/assets/${ticker}/compliance-requirements/set`, params);
  }

  public async getRestriction(ticker: string): Promise<unknown> {
    return this.client.get(`/assets/${ticker}/compliance-requirements`);
  }
}
