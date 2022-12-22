import assert from 'assert';

import { RestClient } from '~/rest/client';
import { TxBase } from '~/rest/common';
import { Identity, PendingInstructions } from '~/rest/identities/interfaces';

export class Identities {
  constructor(private client: RestClient) {}

  public async getPendingInstructions(did: string): Promise<PendingInstructions> {
    return this.client.get(`/identities/${did}/pending-instructions`);
  }

  public async acceptAuthorization(id: string, params: TxBase): Promise<unknown> {
    return this.client.post(`/authorizations/${id}/accept`, { ...params });
  }

  public async createCdd(address: string, opts: { polyx: number }): Promise<Identity> {
    const { polyx } = opts || { polyx: 100000 };
    const params = {
      address,
      initialPolyx: polyx,
    };
    const response = await this.client.post<Identity>('/identities/mock-cdd', params);

    assert(!!response && response.did, 'createCdd response should have `did`');

    return response;
  }
}
