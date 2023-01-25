export interface TxBase {
  signer: string;
}

/**
 * Allows overriding of default test parameters
 */
export interface TxExtras {
  [key: string]: unknown;
}
