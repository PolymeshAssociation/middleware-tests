import {
  assetMediatorsParams,
  createAssetParams,
  createMetadataParams,
  issueAssetParams,
  MetadataType,
  redeemTokenParams,
  setAssetDocumentParams,
  setMetadataParams,
  transferAssetOwnershipParams,
} from '~/rest/assets/params';
import { RestClient } from '~/rest/client';
import { TxBase } from '~/rest/common';
import { PostResult } from '~/rest/interfaces';

export class Assets {
  constructor(private client: RestClient) {}

  public async createAsset(params: ReturnType<typeof createAssetParams>): Promise<PostResult> {
    return this.client.post('/assets/create', params);
  }

  public async getAsset(ticker: string): Promise<unknown> {
    return this.client.get(`/assets/${ticker}`);
  }

  public async getGlobalMetadata(): Promise<unknown> {
    return this.client.get('/assets/global-metadata');
  }

  public async getMetadata(ticker: string): Promise<unknown> {
    return this.client.get(`/assets/${ticker}/metadata`);
  }

  public async getMetadataById(ticker: string, type: MetadataType, id: string): Promise<unknown> {
    return this.client.get(`assets/${ticker}/metadata/${type}/${id}`);
  }

  public async createMetadata(
    ticker: string,
    params: ReturnType<typeof createMetadataParams>
  ): Promise<PostResult> {
    return this.client.post(`/assets/${ticker}/metadata/create`, params);
  }

  public async setMetadataValue(
    ticker: string,
    type: MetadataType,
    id: string,
    params: ReturnType<typeof setMetadataParams>
  ): Promise<PostResult> {
    return this.client.post(`/assets/${ticker}/metadata/${type}/${id}/set`, params);
  }

  public async getDocuments(ticker: string): Promise<unknown> {
    return this.client.get(`assets/${ticker}/documents`);
  }

  public async getAssetMediators(ticker: string): Promise<unknown> {
    return this.client.get(`assets/${ticker}/required-mediators`);
  }

  public async setDocuments(
    ticker: string,
    params: ReturnType<typeof setAssetDocumentParams>
  ): Promise<PostResult> {
    return this.client.post(`assets/${ticker}/documents/set`, params);
  }

  public async redeem(
    ticker: string,
    params: ReturnType<typeof redeemTokenParams>
  ): Promise<PostResult> {
    return this.client.post(`assets/${ticker}/redeem`, params);
  }

  public async addAssetMediators(
    ticker: string,
    params: ReturnType<typeof assetMediatorsParams>
  ): Promise<PostResult> {
    return this.client.post(`assets/${ticker}/add-required-mediators`, params);
  }

  public async removeAssetMediators(
    ticker: string,
    params: ReturnType<typeof assetMediatorsParams>
  ): Promise<PostResult> {
    return this.client.post(`assets/${ticker}/remove-required-mediators`, params);
  }

  public async transferAssetOwnership(
    ticker: string,
    params: ReturnType<typeof transferAssetOwnershipParams>
  ): Promise<Record<string, unknown>> {
    return this.client.post(`assets/${ticker}/transfer-ownership`, params);
  }

  public async preApprove(ticker: string, params: TxBase): Promise<PostResult> {
    return this.client.post(`assets/${ticker}/pre-approve`, { ...params });
  }

  public async removePreApproval(ticker: string, params: TxBase): Promise<PostResult> {
    return this.client.post(`assets/${ticker}/remove-pre-approval`, { ...params });
  }

  public async getIsPreApproved(ticker: string, did: string): Promise<unknown> {
    return this.client.get(`identities/${did}/is-pre-approved?ticker=${ticker}`);
  }

  public async getPreApprovals(did: string): Promise<unknown> {
    return this.client.get(`identities/${did}/pre-approved-assets`);
  }

  public async issue(
    ticker: string,
    params: ReturnType<typeof issueAssetParams>
  ): Promise<PostResult> {
    return this.client.post(`assets/${ticker}/issue`, params);
  }

  public async freeze(ticker: string, params: TxBase): Promise<PostResult> {
    return this.client.post(`assets/${ticker}/freeze`, { ...params });
  }

  public async unfreeze(ticker: string, params: TxBase): Promise<PostResult> {
    return this.client.post(`assets/${ticker}/unfreeze`, { ...params });
  }
}
