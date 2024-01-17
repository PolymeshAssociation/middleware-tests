export enum Mode {
  Submit = 'submit',
  SubmitWithCallback = 'submitWithCallback',
  Offline = 'offline',
  DryRun = 'dryRun',

  AMQP = 'AMQP',
}
export interface TxBase {
  options: { processMode: Mode; signer: string };
}

/**
 * Allows overriding of default test parameters
 */
export interface TxExtras {
  [key: string]: unknown;
}
