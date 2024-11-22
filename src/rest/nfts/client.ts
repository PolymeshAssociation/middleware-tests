import { RestClient } from '~/rest/client';
import { PostResult, RestSuccessResult } from '~/rest/interfaces';
import { createNftCollectionParams, issueNftParams } from '~/rest/nfts/params';

export class Nfts {
  constructor(private client: RestClient) {}

  public async createAndGetNftCollection(
    params: ReturnType<typeof createNftCollectionParams>
  ): Promise<string> {
    const result = (await this.createNftCollection(params)) as RestSuccessResult;

    return result.asset as string;
  }

  public async createNftCollection(
    params: ReturnType<typeof createNftCollectionParams>
  ): Promise<PostResult> {
    return this.client.post('/nfts/create', params);
  }

  public async issueNft(
    ticker: string,
    params: ReturnType<typeof issueNftParams>
  ): Promise<PostResult> {
    return this.client.post(`/nfts/${ticker}/issue`, params);
  }

  public async getCollectionKeys(ticker: string): Promise<unknown> {
    return this.client.get(`/nfts/${ticker}/collection-keys`);
  }

  public async getNftDetails(ticker: string, id: string): Promise<unknown> {
    return this.client.get(`/nfts/${ticker}/${id}`);
  }
}
