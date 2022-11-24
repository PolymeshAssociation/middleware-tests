export interface CreateAssetParams {
  signer: string;
  ticker: string;
  name: string;
  assetType: string;
  isDivisible: boolean;
  requireInvestorUniqueness: boolean;
  [extra: string]: unknown; // allows type to be passed as Record
}
