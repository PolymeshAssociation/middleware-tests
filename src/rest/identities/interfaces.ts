export interface Identity {
  /**
   * The value used to refer to the signer in the REST API
   */
  signer: string;
  did: string;
  primaryAccount: {
    account: {
      address: string;
    };
  };
}

export interface PendingInstructions {
  results: string[];
}
