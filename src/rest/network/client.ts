import { RestClient } from '~/rest/client';
import { PostResult } from '~/rest/interfaces';
import { transferPolyxParams } from '~/rest/network';

export class Network {
  constructor(private readonly client: RestClient) {}

  public async getMiddlewareMetadata(): Promise<unknown> {
    return this.client.get('/network/middleware-metadata');
  }

  public async transferPolyx(params: ReturnType<typeof transferPolyxParams>): Promise<PostResult> {
    return this.client.post('/accounts/transfer', params);
  }
}
