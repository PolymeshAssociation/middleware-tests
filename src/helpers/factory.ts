import { LocalSigningManager } from '@polymeshassociation/local-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

import { env } from '~/environment';
import { TestFactoryOpts } from '~/helpers/types';
import { RestClient } from '~/rest';
import { Identity } from '~/rest/identities';
import { alphabet, randomNonce } from '~/util';
import { VaultClient } from '~/vault';

const nonceLength = 8;
const startingPolyx = 100000;
const { nodeUrl, vaultUrl, vaultToken, vaultTransitPath } = env;

export class TestFactory {
  public nonce: string;
  public restClient: RestClient;
  public vaultClient: VaultClient;

  public handleToIdentity: Record<string, Identity> = {};
  #alphabetIndex = 0;
  #adminSigner = '';

  public static async create(opts: TestFactoryOpts): Promise<TestFactory> {
    const { handles: signers } = opts;

    const middleware = {
      link: env.toolingGqlUrl,
      key: '',
    };

    const polymesh = await Polymesh.connect({ nodeUrl, middleware });

    const factory = new TestFactory(polymesh);

    await factory.setupSdk();

    if (signers) {
      await factory.initIdentities(signers);
    }

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

  public async close(): Promise<void> {
    await Promise.all([this.cleanupIdentities(), this.polymeshSdk.disconnect()]);
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

  private async setupSdk(): Promise<void> {
    const mnemonic = LocalSigningManager.generateAccount();
    const signingManager = await LocalSigningManager.create({ accounts: [{ mnemonic }] });

    await this.polymeshSdk.setSigningManager(signingManager);

    const addresses = await signingManager.getAccounts();

    const accounts = addresses.map((address) => ({ address, initialPolyx: startingPolyx }));

    // note this is inefficient and should be batched with given identities to be made
    await this.restClient.identities.createTestAccounts(accounts, this.readAdminSigner());
  }

  private async cleanupIdentities(): Promise<void> {
    if (env.deleteUsedKeys) {
      await Promise.all(
        Object.keys(this.handleToIdentity).map(async (handle) => {
          const keyName = this.prefixNonce(handle);

          await this.vaultClient.updateKey(keyName, true);
          await this.vaultClient.deleteKey(keyName);
        })
      );
    }
  }

  private constructor(public readonly polymeshSdk: Polymesh) {
    this.nonce = randomNonce(nonceLength);
    this.restClient = new RestClient(env.restApi);
    this.vaultClient = new VaultClient(vaultUrl, vaultTransitPath, vaultToken);
  }
}
