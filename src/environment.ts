import * as dotenv from 'dotenv';

dotenv.config();

const restApi = process.env.REST_API_URL || 'http://localhost:3004';
const vaultApi = process.env.VAULT_API_URL || 'http://localhost:8200';
const vaultToken = process.env.VAULT_TOKEN || 'root';
const vaultTransitPath = process.env.VAULT_TRANSIT_PATH || '/v1/transit';

export const urls = {
  restApi,
  vaultApi,
  vaultToken,
  vaultTransitPath,
};
