import { TestFactoryOpts } from '~/helpers/types';
import { Identity, RestClient } from '~/rest';
import { randomNonce } from '~/util';
import { sleep, VaultClient } from '~/vault';

const startingPolyx = 100000;
const restUrl = 'http://localhost:3004';
const vaultUrl = 'http://localhost:8200';
const vaultToken = 'root';
const transitPath = 'v1/transit';

export class TestFactory {
  public nonce: string;
  public restClient: RestClient;
  public vaultClient: VaultClient;
  public handleToIdentity: Record<string, Identity> = {};

  public static async create(opts: TestFactoryOpts): Promise<TestFactory> {
    const { handles: signers } = opts;

    const factory = new TestFactory();

    if (signers) {
      await factory.initIdentities(signers);
    }

    return factory;
  }

  public prefixNonce(value: string): string {
    return `${this.nonce}-${value}`;
  }

  /**
   * Creates a Vault key and DID for each signer.
   * @note This method must be called before using a signer, alternatively signers can be passed to `TestFactory.create`
   */
  public async initIdentities(handles: string[]): Promise<Identity[]> {
    const signerIdentities: Promise<Identity>[] = [];

    const getIdentity = async (handle: string): Promise<Identity> => {
      const vaultKeyName = this.prefixNonce(handle);
      const exitingSigner = this.getCachedSigner(handle);
      if (exitingSigner) {
        return exitingSigner;
      }

      const { address, signer } = await this.vaultClient.createAccount(vaultKeyName);
      const identity = await this.restClient.createCdd(address, { polyx: startingPolyx });
      identity.signer = signer;
      this.handleToIdentity[handle] = identity;

      return identity;
    };

    for (const handle of handles) {
      signerIdentities.push(getIdentity(handle));
      await sleep(18000);
    }

    return Promise.all(signerIdentities);
  }

  public getSignerIdentity(handle: string): Identity {
    const identity = this.handleToIdentity[handle];
    if (!identity) {
      throw new Error(`Identity was not found with ${handle}`);
    }

    return identity;
  }

  private constructor() {
    const nonce = randomNonce(7);
    this.nonce = nonce;
    this.restClient = new RestClient(restUrl);
    this.vaultClient = new VaultClient(vaultUrl, transitPath, vaultToken);
  }

  private getCachedSigner(signer: string): Identity | undefined {
    return this.handleToIdentity[signer];
  }
}
