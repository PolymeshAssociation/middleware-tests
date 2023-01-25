import { RestClient } from '~/rest/client';
import { TxBase } from '~/rest/common';
import { Identity, PendingInstructions } from '~/rest/identities/interfaces';
import { ResultSet } from '~/rest/interfaces';

interface CreateTestAccountParams {
  address: string;
  initialPolyx: number;
}

export class Identities {
  constructor(private client: RestClient) {}

  public async getPendingInstructions(did: string): Promise<PendingInstructions> {
    return this.client.get(`/identities/${did}/pending-instructions`);
  }

  public async acceptAuthorization(id: string, params: TxBase): Promise<unknown> {
    return this.client.post(`/authorizations/${id}/accept`, { ...params });
  }

  public async createTestAccounts(
    accounts: CreateTestAccountParams[],
    signer: string
  ): Promise<ResultSet<Identity>> {
    const params = {
      accounts,
      signer,
    };

    const response = await this.client.post<ResultSet<Identity>>(
      '/developer-testing/create-test-accounts',
      params
    );

    return response;
  }

  public async createTestAdmins(accounts: CreateTestAccountParams[]): Promise<ResultSet<Identity>> {
    return this.client.post<ResultSet<Identity>>('/developer-testing/create-test-admins', {
      accounts,
    });
  }
}
