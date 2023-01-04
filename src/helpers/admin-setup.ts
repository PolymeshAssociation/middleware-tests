import 'tsconfig-paths/register'; // (Solution from)[https://github.com/facebook/jest/issues/11644#issuecomment-1171646729]

import { writeFileSync } from 'fs';

import { RestClient } from '~/rest';
import { VaultClient } from '~/vault';

import { adminFilePath, urls } from '../environment';

const maxWorkersSupported = 8;

export default async (): Promise<void> => {
  const vaultClient = new VaultClient(urls.vaultApi, urls.vaultTransitPath, urls.vaultToken);
  const restClient = new RestClient(urls.restApi);

  const adminSigners = [...Array(maxWorkersSupported)].map((_, index) => `${index + 1}-admin`);
  const adminSignersWithVersion = adminSigners.map((signer) => `${signer}-1`);

  const keys = await Promise.all(adminSigners.map((s) => vaultClient.createAccount(s)));

  const addresses = keys.map(({ address }) => address);

  await restClient.identities.createAdmins(addresses);

  writeFileSync(adminFilePath, adminSignersWithVersion.toString());
};
