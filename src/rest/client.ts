import { assert } from 'console';
import fetch from 'cross-fetch';
import { join } from 'path';

import { CreateAssetParams, Identity } from '~/rest/interfaces';

export class Client {
  constructor(public baseUrl: string) {}

  public async get<T = unknown>(path: string): Promise<T> {
    const url = join(this.baseUrl, path);
    const method = 'GET';

    return this.fetch(url, method) as Promise<T>;
  }

  public async createAsset(params: CreateAssetParams): Promise<unknown> {
    return this.post('/assets/create', params);
  }

  public async createCdd(address: string, opts?: { polyx: number }): Promise<Identity> {
    const { polyx } = opts || { polyx: 100000 };
    const params = {
      address,
      initialPolyx: polyx,
    };
    const response = await this.post<Identity>('/identities/mock-cdd', params);

    assert(!!response && response.did, 'createCdd response should have `did`');

    return response;
  }

  public async post<T = unknown>(path: string, body?: Record<string, unknown>): Promise<T> {
    const url = join(this.baseUrl, path);
    const method = 'POST';

    return this.fetch(url, method, body) as Promise<T>;
  }

  private async fetch(
    url: string,
    method: string,
    reqBody?: Record<string, unknown>
  ): Promise<unknown> {
    const body = reqBody ? JSON.stringify(reqBody) : undefined;

    const response = await fetch(url, {
      headers: [['Content-Type', 'application/json']],
      method,
      body,
    });
    this.assertOk(response, { method, url });

    return response.json();
  }

  private assertOk(response: Response, opts: { method: string; url: string }) {
    const { method, url } = opts;
    const { status } = response;
    assert(status < 300, `${method}: ${url} had non 2xx status: ${status}`);
  }
}
