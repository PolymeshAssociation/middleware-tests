import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  ModuleName,
  PermissionType,
  TransactionStatus,
} from '@polymeshassociation/polymesh-sdk/types';
import assert from 'node:assert';

/*
  This script demonstrates Asset Corporate Action Agent (CAA) functionality. It:
    - Queries the current CAA
    - Assigns a new CAA
    - Find and Accept the authorization to become CAA
*/
export const manageCAA = async (
  sdk: Polymesh,
  targetDid: string,
  ticker: string
): Promise<void> => {
  const [identity, target] = await Promise.all([
    sdk.getSigningIdentity(),
    sdk.identities.getIdentity({ did: targetDid }),
  ]);
  assert(identity, 'the SDK should have a signing identity to manage CAA');

  const asset = await sdk.assets.getAsset({ ticker });

  const setCorporateActionsAgentTx = await asset.permissions.inviteAgent({
    target,
    permissions: {
      transactions: {
        values: [
          ModuleName.CapitalDistribution,
          ModuleName.CorporateAction,
          ModuleName.CorporateBallot,
        ],
        type: PermissionType.Include,
      },
    },
  });

  const authRequest = await setCorporateActionsAgentTx.run();
  assert(
    setCorporateActionsAgentTx.status === TransactionStatus.Succeeded,
    'set CAA should succeed'
  );

  const pendingAuthorizations = await target.authorizations.getReceived({ includeExpired: false });
  const becomeCAAAuth = pendingAuthorizations.find(({ authId }) => authId.eq(authRequest.authId));
  assert(becomeCAAAuth, 'the authorization should be findable by the target');

  const { account: targetAccount } = await target.getPrimaryAccount();

  const becomeCAATx = await becomeCAAAuth.accept({ signingAccount: targetAccount });
  await becomeCAATx.run();
  assert(becomeCAATx.status === TransactionStatus.Succeeded, 'becoming CAA should succeed');

  // fetch an assets CAAs
  const corporateActionAgents = await asset.corporateActions.getAgents();
  assert(corporateActionAgents.length > 0, 'the asset should have a CAA');
};
