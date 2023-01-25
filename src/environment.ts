import * as dotenv from 'dotenv';

dotenv.config();

const nodeUrl = process.env.NODE_URL || 'ws://localhost:9944';
const restApi = process.env.REST_API_URL || 'http://localhost:3004';
const vaultUrl = process.env.VAULT_API_URL || 'http://localhost:8200';
const vaultTransitPath = process.env.VAULT_TRANSIT_PATH || '/v1/transit';
const vaultToken = process.env.VAULT_TOKEN || 'root';
const toolingGqlUrl = process.env.TOOLING_GQL_URL || 'http://localhost:3007/graphql';
/**
 * Set to a truthy value to remove used Vault keys
 */
const deleteUsedKeys = !!process.env.DELETE_USED_KEYS || false;

export const env = {
  nodeUrl,
  restApi,
  vaultUrl,
  vaultToken,
  vaultTransitPath,
  toolingGqlUrl,
  deleteUsedKeys,
};
