import { ClaimType } from '@polymeshassociation/polymesh-sdk/polkadot/polymesh';
import { ConditionTarget, ConditionType, ScopeType } from '@polymeshassociation/polymesh-sdk/types';

import { TxBase, TxExtras } from '~/rest/common';

type ClaimParams = {
  type: ClaimType['type'];
  scope?: { type: ScopeType; value: string };
  code?: string;
};

export type ConditionParams = {
  target: ConditionTarget;
  type: ConditionType;
  trustedClaimIssuers?: { trustedFor: ClaimType['type'][]; identity: string }[];
  claim?: ClaimParams;
  claims?: ClaimParams[];
  identity?: string;
};

export const bothConditionsRequirements = (
  issuer: string,
  ticker: string,
  blockedIdentity: string,
  blockedJurisdiction: string
): ConditionParams[] => [
  {
    target: ConditionTarget.Both,
    type: ConditionType.IsNoneOf,
    claims: [
      { type: 'Blocked', scope: { type: ScopeType.Identity, value: blockedIdentity } },
      {
        type: 'Jurisdiction',
        scope: { type: ScopeType.Ticker, value: ticker },
        code: blockedJurisdiction,
      },
    ],
    trustedClaimIssuers: [{ trustedFor: ['Blocked'], identity: issuer }],
  },
];

export const kycRequirements = (ticker: string, trustedIdentity: string): ConditionParams[] => [
  {
    target: ConditionTarget.Receiver,
    type: ConditionType.IsPresent,
    claim: { type: 'KnowYourCustomer', scope: { type: ScopeType.Ticker, value: ticker } },
    trustedClaimIssuers: [
      {
        trustedFor: ['KnowYourCustomer'],
        identity: trustedIdentity,
      },
    ],
  },
];

export const blockedJurisdictionRequirements = (
  ticker: string,
  trustedIdentity: string,
  code: string
): ConditionParams[] => [
  {
    target: ConditionTarget.Receiver,
    type: ConditionType.IsAbsent,
    claim: { type: 'Jurisdiction', scope: { type: ScopeType.Ticker, value: ticker }, code },
    trustedClaimIssuers: [
      {
        trustedFor: ['Jurisdiction'],
        identity: trustedIdentity,
      },
    ],
  },
];

export const blockedIdentityRequirements = (
  ticker: string,
  targetIdentity: string
): ConditionParams[] => [
  {
    target: ConditionTarget.Receiver,
    type: ConditionType.IsAbsent,
    claim: { type: 'Blocked', scope: { type: ScopeType.Ticker, value: ticker } },
    trustedClaimIssuers: [
      {
        trustedFor: ['Blocked'],
        identity: targetIdentity,
      },
    ],
  },
];

export const receiverConditionsRequirements = (identity: string): ConditionParams[] => [
  {
    target: ConditionTarget.Receiver,
    type: ConditionType.IsIdentity,
    identity,
  },
];

export const senderConditionsRequirements = (identity: string): ConditionParams[] => [
  {
    target: ConditionTarget.Sender,
    type: ConditionType.IsIdentity,
    identity,
  },
];

export const complianceRequirementsParams = (
  requirements: ConditionParams[][],
  base: TxBase,
  extras: TxExtras = {}
) =>
  ({
    requirements,
    ...extras,
    ...base,
  } as const);

export const complianceRequirementParams = (
  conditions: ConditionParams[],
  base: TxBase,
  extras: TxExtras = {}
) =>
  ({
    conditions,
    ...extras,
    ...base,
  } as const);
