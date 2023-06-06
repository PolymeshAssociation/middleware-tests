import 'tsconfig-paths/register'; // (Solution from)[https://github.com/facebook/jest/issues/11644#issuecomment-1171646729]

import { RestClient } from '~/rest';
import { VaultClient } from '~/vault';

import { config } from '../config';

const maxWorkersSupported = 8;

const initialPolyx = 100000000;

export default async (): Promise<void> => {
  const vaultClient = new VaultClient(config.vaultUrl, config.vaultTransitPath, config.vaultToken);
  const restClient = new RestClient(config.restApi);

  const adminSigners = [...Array(maxWorkersSupported)].map((_, index) => `${index + 1}-admin`);

  const keys = await Promise.all(adminSigners.map((s) => vaultClient.createKey(s)));

  const accounts = keys.map(({ address }) => ({ address, initialPolyx }));

  await restClient.identities.createTestAdmins(accounts);
};
