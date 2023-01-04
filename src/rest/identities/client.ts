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

  public async createCdd(
    accounts: { initialPolyx: number; address?: string }[],
    signer: string
  ): Promise<Identity[]> {
    const params = {
      accounts,
      signer,
    };

    const response = await this.client.post<Identity[]>(
      '/developer-testing/create-identity-batch',
      params
    );

    return response;
  }

  public async createAdmins(addresses: string[]): Promise<Identity[]> {
    return this.client.post<Identity[]>('developer-testing/create-admins', { addresses });
  }
}
