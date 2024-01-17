import { Connection, Container } from 'rhea-promise';

import { env } from '~/environment';

/**
 * helper to assert basic transaction identifiers are present in a response
 */
export const expectBasicTxInfo = {
  blockNumber: expect.any(String),
  blockHash: expect.stringContaining('0x'),
  transactionHash: expect.stringContaining('0x'),
};

const rheaContainer = new Container();
export const getRheaConnection = (): Promise<Connection> => {
  return rheaContainer.connect({
    port: Number(env.artemisPort),
    host: env.artemisHost,
    username: env.artemisUsername,
    password: env.artemisPassword,
    operationTimeoutInSeconds: 10,
    transport: 'tcp',
  });
};
