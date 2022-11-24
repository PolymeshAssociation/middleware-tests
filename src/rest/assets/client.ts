import { CreateAssetParams } from '~/rest/assets/interfaces';
import { RestClient } from '~/rest/client';

export class Assets {
  constructor(private client: RestClient) {}

  public async createAsset(params: CreateAssetParams): Promise<unknown> {
    return this.client.post('/assets/create', params);
  }

  public async getAsset(ticker: string): Promise<unknown> {
    return this.client.get(`/assets/${ticker}`);
  }
}
