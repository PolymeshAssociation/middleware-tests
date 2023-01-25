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
  did: string;
  primaryAddress: string;
}

export interface PolymeshLocalSettings {
  restSigners: string;
  restMnemonics: string;
}

interface SingleResult {
  type: 'single';
  blockHash: string;
  transactionHash: string;
  blockNumber: string;
  transactionTag: string;
}
interface BatchResult {
  type: 'batch';
  blockHash: string;
  transactionHash: string;
  blockNumber: string;
  transactionTags: string[];
}

export interface RestSuccessResult<T> {
  transactions: SingleResult[] | BatchResult[];
}
export interface RestErrorResult {
  error: string;
  message: string;
  statusCode: number;
}

export type RestResult<T = unknown> = RestSuccessResult<T> | RestErrorResult;
