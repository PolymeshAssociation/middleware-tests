import { HashicorpVaultSigningManager } from '@polymeshassociation/hashicorp-vault-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { urls } from '~/environment';
import { TestFactoryOpts } from '~/helpers/types';
import { RestClient } from '~/rest';
import { Identity } from '~/rest/identities';
import { alphabet, randomNonce } from '~/util';
import { VaultClient } from '~/vault';

const nonceLength = 8;
const startingPolyx = 100000;
const { nodeUrl, vaultUrl: vaultApi } = urls;
const vaultToken = urls.vaultToken;
const transitPath = urls.vaultTransitPath;

export class TestFactory {
  public nonce: string;
  public restClient: RestClient;
  public vaultClient: VaultClient;

  public handleToIdentity: Record<string, Identity> = {};
  #alphabetIndex = 0;
  #adminSigner = '';

  public static async create(opts: TestFactoryOpts): Promise<TestFactory> {
    const { handles: signers } = opts;

    const signingManager = new HashicorpVaultSigningManager({
      url: urls.vaultUrl,
      token: urls.vaultToken,
    });
    const polymesh = await Polymesh.connect({ nodeUrl, signingManager });

    const factory = new TestFactory(polymesh);

    if (signers) {
      await factory.initIdentities(signers);
    }

    // default to signing with the admin account for the SDK
    const adminAddress = await factory.adminAddress();
    await polymesh.setSigningAccount(adminAddress);

    return factory;
  }

  public prefixNonce(value: string): string {
    return `${this.nonce}-${value}`;
  }

  /**
   * returns unique tickers every time its called. e.g. AAA, AAB, AAC...
   */
  public nextTicker(): string {
    const a = this.#alphabetIndex % alphabet.length;
    const b = Math.floor((this.#alphabetIndex / alphabet.length) % alphabet.length);
    const c = Math.floor(this.#alphabetIndex / alphabet.length ** 2);
    this.#alphabetIndex += 1;
    return this.prefixNonce(`${alphabet[c]}${alphabet[b]}${alphabet[a]}`);
  }

  /**
   * Creates a Vault key and DID for each signer.
   * @note This method must be called before using a signer, alternatively signers can be passed to `TestFactory.create`
   */
  public async initIdentities(handles: string[]): Promise<Identity[]> {
    const accounts = [];
    const signers: string[] = [];

    for (const handle of handles) {
      const vaultKeyName = this.prefixNonce(handle);
      const { address, signer } = await this.vaultClient.createKey(vaultKeyName);
      accounts.push({ address, initialPolyx: startingPolyx });
      signers.push(signer);
    }

    const { results } = await this.restClient.identities.createTestAccounts(
      accounts,
      this.readAdminSigner()
    );

    results.forEach((identity, index) => {
      const signer = signers[index];
      const handle = handles[index];
      identity.signer = signer;
      this.setCachedSigner(handle, identity);
    });

    return handles.map((handle) => this.getSignerIdentity(handle));
  }

  public getSignerIdentity(handle: string): Identity {
    const identity = this.handleToIdentity[handle];
    if (!identity) {
      throw new Error(`Identity was not found with ${handle}`);
    }

    return identity;
  }

  private setCachedSigner(signer: string, identity: Identity) {
    this.handleToIdentity[signer] = identity;
  }

  private readAdminSigner(): string {
    if (this.#adminSigner === '') {
      const workerId = Number(process.env.JEST_WORKER_ID);
      this.#adminSigner = `${workerId}-admin-1`;
    }

    return this.#adminSigner;
  }

  private async adminAddress(): Promise<string> {
    const adminName = this.readAdminSigner().replace(/-\d+/, ''); // remove "version"
    const { address } = await this.vaultClient.getAddress(adminName);

    return address;
  }

  private constructor(public readonly polymeshSdk: Polymesh) {
    const nonce = randomNonce(nonceLength);
    this.nonce = nonce;
    this.restClient = new RestClient(urls.restApi);
    this.vaultClient = new VaultClient(vaultApi, transitPath, vaultToken);
  }
}
