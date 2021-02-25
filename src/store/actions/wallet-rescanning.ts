import { Action } from 'redux'
import { RescannedTransactionData } from '../reducers/wallet-rescanning'

export const WALLET_RESCAN_SUCCEEDED = 'WALLET_RESCAN_SUCCEEDED'
export const WALLET_RESCAN_FAILED = 'WALLET_RESCAN_FAILED'
export const WALLET_RESCAN_COMPLETED = 'WALLET_RESCAN_COMPLETED'


export interface WalletRescanningSuccessAction extends Action {
  type: typeof WALLET_RESCAN_SUCCEEDED;
  payload: RescannedTransactionData[];
}

export const rescanSucceeded = ( payload: RescannedTransactionData[] ): WalletRescanningSuccessAction => {
  return {
    type: WALLET_RESCAN_SUCCEEDED,
    payload,
  }
}


export interface WalletRescanningFailureAction extends Action {
  type: typeof WALLET_RESCAN_FAILED;
}

export const rescanFailed = ( payload: RescannedTransactionData[] ): WalletRescanningFailureAction => {
  return {
    type: WALLET_RESCAN_FAILED,
  }
}


export interface WalletRescanningCompletionAction extends Action {
  type: typeof WALLET_RESCAN_COMPLETED;
  payload: RescannedTransactionData[];
}

export const rescanCompleted = ( payload: RescannedTransactionData[] ): WalletRescanningCompletionAction => {
  return {
    type: WALLET_RESCAN_COMPLETED,
    payload,
  }
}

