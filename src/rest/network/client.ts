import { RestClient } from '~/rest/client';
import { PostResult } from '~/rest/interfaces';
import { transferPolyxParams } from '~/rest/network';

export class Network {
  constructor(private client: RestClient) {}

  public async transferPolyx(params: ReturnType<typeof transferPolyxParams>): Promise<PostResult> {
    return this.client.post('/accounts/transfer', params);
  }
}
