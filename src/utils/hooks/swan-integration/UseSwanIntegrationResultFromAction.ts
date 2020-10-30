import { SwanActionKind } from '../../../store/actions/SwanIntegration';
import useSwanIntegrationState from '../state-selectors/accounts/UseSwanIntegrationState';
import { useMemo } from 'react';

export default function useSwanIntegrationResultFromAction(actionKind: SwanActionKind): string {
  const swanIntegrationState = useSwanIntegrationState();

  return useMemo(() => {
    switch (actionKind) {
      case SwanActionKind.AUTHENTICATE:
        if (swanIntegrationState.isFetchingSwanToken) {
          return `In Progress`;
        } else if (swanIntegrationState.fetchSwanTokenFailed) {
          return `Failed. Message: ${swanIntegrationState.fetchSwanTokenFailedMessage}`;
        } else {
          return `Succeed. Token Details: ${swanIntegrationState.swanTokenDetails}`;
        }

      case SwanActionKind.CREATE_SWAN_ACCOUNT_SHELL:
        if (swanIntegrationState.isAddingSwanMetadata) {
          return `In Progress`;
        } else if (swanIntegrationState.addSwanMetadataFailed) {
          return `Failed. Message: ${swanIntegrationState.addSwanMetadataFailedMessage}`;
        } else {
          return `Succeed. Metadata Details: ${swanIntegrationState.swanMetadataDetails}`;
        }

      case SwanActionKind.LINK_HEXA_AND_SWAN_SUB_ACCOUNTS:
        if (swanIntegrationState.isLinkingSwanWallet) {
          return `In Progress`;
        } else if (swanIntegrationState.linkSwanWalletFailed) {
          return `Failed. Message: ${swanIntegrationState.linkSwanWalletFailedMessage}`;
        } else {
          return `Succeed. Wallet Details: ${swanIntegrationState.swanWalletDetails}`;
        }

      case SwanActionKind.SYNC_SWAN_ACCOUNT_DATA:
        if (swanIntegrationState.isSyncingSwanWallet) {
          return `In Progress`;
        } else if (swanIntegrationState.syncSwanWalletFailed) {
          return `Failed. Message: ${swanIntegrationState.syncSwanWalletFailedMessage}`;
        } else {
          return `Succeed. Wallet Details: ${swanIntegrationState.swanWalletDetails}`;
        }
    }
  }, [actionKind, swanIntegrationState]);
}
