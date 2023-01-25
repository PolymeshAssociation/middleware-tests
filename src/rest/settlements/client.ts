import { RestClient } from '~/rest/client';
import { TxBase } from '~/rest/common';
import { PostResult } from '~/rest/interfaces';
import { instructionParams, venueParams } from '~/rest/settlements/params';

export class Settlements {
  constructor(private client: RestClient) {}

  public async createVenue(params: ReturnType<typeof venueParams>): Promise<unknown> {
    return this.client.post('/venues/create', params);
  }

  public async createInstruction(
    venueId: string,
    params: ReturnType<typeof instructionParams>
  ): Promise<PostResult> {
    return this.client.post(`/venues/${venueId}/instructions/create`, params);
  }

  public async affirmInstruction(instructionId: string, txBase: TxBase): Promise<PostResult> {
    return this.client.post(`/instructions/${instructionId}/affirm`, { ...txBase });
  }
}
