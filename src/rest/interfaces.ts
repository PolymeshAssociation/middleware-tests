export interface CreateAssetParams {
  signer: string;
  ticker: string;
  name: string;
  assetType: string;
  isDivisible: boolean;
  requireInvestorUniqueness: boolean;
  [extra: string]: unknown; // allows type to be passed as Record
}

export interface Identity {
  /**
   * The value used to refer to the signer in the REST API
   */
  signer: string;
  did: string;
  primaryAddress: string;
}

export interface PolymeshLocalSettings {
  restSigners: string;
  restMnemonics: string;
}
