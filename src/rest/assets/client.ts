import {
  createAssetParams,
  createMetadataParams,
  MetadataType,
  setMetadataParams,
} from '~/rest/assets/params';
import { RestClient } from '~/rest/client';
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
}
