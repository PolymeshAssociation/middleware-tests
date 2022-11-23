import { encodeAddress } from '@polkadot/util-crypto';
import { assert } from 'console';
import fetch from 'cross-fetch';
import { join } from 'path';

import { GetVaultKeyResponse, VaultKey } from '~/vault/interfaces';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class VaultClient {
  constructor(public baseUrl: string, public enginePath: string, private vaultToken: string) {}

  public async createAccount(name: string): Promise<VaultKey> {
    await this.post(`/keys/${name}`, { type: 'ed25519' });
    return await this.getAddress(name);
  }

  public async getAddress(name: string): Promise<VaultKey> {
    const response = await this.get<GetVaultKeyResponse>(`/keys/${name}`);

    const latestVersion = response.data.latest_version;
    const { public_key: publicKey } = response.data.keys[latestVersion];
    const hexPublicKey = `0x${Buffer.from(publicKey, 'base64').toString('hex')}`;
    const address = encodeAddress(hexPublicKey);
    const signer = `${name}-${latestVersion}`;

    return { address, signer };
  }

  public async get<T = unknown>(path: string): Promise<T> {
    const url = new URL(join(this.enginePath, path), this.baseUrl).href;
    const method = 'GET';

    return this.fetch(url, method) as Promise<T>;
  }

  public async post<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
    const url = new URL(join(this.enginePath, path), this.baseUrl).href;
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
      headers: [
        ['Content-Type', 'application/json'],
        ['X-Vault-Token', this.vaultToken],
      ],
      method,
      body,
    });
    this.assertOk(response, { method, url });

    const res = await response.text();

    return res ? JSON.parse(res) : undefined;
  }

  private assertOk(response: Response, opts: { method: string; url: string }) {
    const { method, url } = opts;
    const { status } = response;
    assert(status < 300, `${method}: ${url} had non 2xx status: ${status}`);
  }
}
