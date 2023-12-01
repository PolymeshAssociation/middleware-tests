import {
  CreateClaimParams,
  GetCustomClaimTypesParams,
  registerCustomClaimTypeParams,
} from '~/rest/claims/params';
import { RestClient } from '~/rest/client';
import { PostResult } from '~/rest/interfaces';

export class Claims {
  constructor(private client: RestClient) {}

  public async registerCustomClaimType(
    params: ReturnType<typeof registerCustomClaimTypeParams>
  ): Promise<PostResult> {
    return this.client.post('/claims/custom-claim-type', params);
  }

  public async getCustomClaimType(id: string): Promise<{ id: string; name: string }> {
    return this.client.get(`/claims/custom-claim-types/${id}`);
  }

  public async getCustomClaimTypes(params?: GetCustomClaimTypesParams): Promise<PostResult> {
    return this.client.get('/claims/custom-claim-types', params);
  }

  public async addClaim(params: CreateClaimParams): Promise<PostResult> {
    return this.client.post('/claims/add', params);
  }

  public async removeClaim(params: CreateClaimParams): Promise<PostResult> {
    return this.client.post('/claims/remove', params);
  }
}
