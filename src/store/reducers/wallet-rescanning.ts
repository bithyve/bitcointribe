import { ImageSourcePropType } from 'react-native'
import { TransactionDetails } from '../../bitcoin/utilities/Interface'
import AccountShell from '../../common/data/models/AccountShell'
import { REFRESH_ACCOUNT_SHELL } from '../actions/accounts'
import { WALLET_RESCAN_COMPLETED, WALLET_RESCAN_FAILED, WALLET_RESCAN_SUCCEEDED } from '../actions/wallet-rescanning'


export type RescannedTransactionData = {
  details: TransactionDetails;
  primaryTitleText?: string;
  subtitleText?: string;
  avatarImage?: ImageSourcePropType;
  accountShell?: AccountShell;
}

export type WalletRescanningState = {
  isScanInProgress: boolean;
  hasScanSucceeded: boolean;
  hasScanFailed: boolean;

  accountShellBeingScanned: AccountShell | null;
  foundTransactions: RescannedTransactionData[];
}


const INITIAL_STATE: WalletRescanningState = {
  isScanInProgress: false,
  hasScanSucceeded: false,
  hasScanFailed: false,
  accountShellBeingScanned: null,
  foundTransactions: [],
}


const walletRescanningReducer = ( state = INITIAL_STATE, action ): WalletRescanningState => {
  switch ( action.type ) {
      case REFRESH_ACCOUNT_SHELL:
        return {
          ...state,
          isScanInProgress: true,
          accountShellBeingScanned: action.payload.shell,
        }

      case WALLET_RESCAN_SUCCEEDED:
        return {
          ...state,
          isScanInProgress: false,
          hasScanSucceeded: true,
          hasScanFailed: false,
          foundTransactions: action.payload,
        }

      case WALLET_RESCAN_FAILED:
        return {
          ...state,
          isScanInProgress: false,
          hasScanSucceeded: false,
          hasScanFailed: true,
          foundTransactions: []
        }
      case WALLET_RESCAN_COMPLETED:
        return {
          ...INITIAL_STATE
        }
  }

  return state
}

export default walletRescanningReducer
