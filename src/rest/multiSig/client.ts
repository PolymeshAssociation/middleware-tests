import { BigNumber } from '@polymeshassociation/polymesh-sdk';

import { RestClient } from '~/rest';
import { TxBase } from '~/rest/common';
import { PostResult } from '~/rest/interfaces';
import { joinCreatorParams, modifyMultiSigParams } from '~/rest/multiSig';

export class MultiSig {
  constructor(private client: RestClient) {}

  public async getProposal(did: string): Promise<unknown> {
    return this.client.get(`/identities/${did}/pending-instructions`);
  }

  public async create(
    requiredSignatures: BigNumber,
    signers: string[],
    params: TxBase
  ): Promise<{ multiSigAddress: string } & PostResult> {
    return this.client.post('/multi-sigs/create', { ...params, requiredSignatures, signers });
  }

  public async joinCreator(
    multiSigAddress: string,
    params: ReturnType<typeof joinCreatorParams>
  ): Promise<PostResult> {
    return this.client.post(`/multi-sigs/${multiSigAddress}/join-creator`, params);
  }

  public async modify(
    multiSigAddress: string,
    requiredSignatures: BigNumber,
    signers: string[],
    params: ReturnType<typeof modifyMultiSigParams>
  ): Promise<PostResult> {
    return this.client.post(`/multi-sigs/${multiSigAddress}/modify`, {
      ...params,
      signers,
      requiredSignatures,
    });
  }

  public async getProposalDetails(multiSigAddress: string, proposalId: string): Promise<unknown> {
    return this.client.get(`/multi-sigs/${multiSigAddress}/proposals/${proposalId}`);
  }

  public async approveProposal(
    multiSigAddress: string,
    proposalId: string,
    params: TxBase
  ): Promise<PostResult> {
    return this.client.post(`/multi-sigs/${multiSigAddress}/proposals/${proposalId}/approve`, {
      ...params,
    });
  }

  public async rejectProposal(
    multiSigAddress: string,
    proposalId: string,
    params: TxBase
  ): Promise<PostResult> {
    return this.client.post(`/multi-sigs/${multiSigAddress}/proposals/${proposalId}/reject`, {
      ...params,
    });
  }
}
