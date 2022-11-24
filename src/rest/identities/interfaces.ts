export interface Identity {
  /**
   * The value used to refer to the signer in the REST API
   */
  signer: string;
  did: string;
  primaryAddress: string;
}

export interface PendingInstructions {
  results: string[];
}
