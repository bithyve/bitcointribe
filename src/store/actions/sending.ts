import { Action } from 'redux'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import AccountShell from '../../common/data/models/AccountShell'
import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import { TransactionPrerequisite, TransactionPrerequisiteElements, TxPriority } from '../../bitcoin/utilities/Interface'

export const RESET_SEND_STATE = 'RESET_SEND_STATE'
export const SOURCE_ACCOUNT_SELECTED_FOR_SENDING = 'SOURCE_ACCOUNT_SELECTED_FOR_SENDING'
export const ADD_RECIPIENT_FOR_SENDING = 'ADD_RECIPIENT_FOR_SENDING'
export const RECIPIENT_REMOVED_FROM_SENDING = 'RECIPIENT_REMOVED_FROM_SENDING'
export const RECIPIENT_SELECTED_FOR_AMOUNT_SETTING = 'RECIPIENT_SELECTED_FOR_AMOUNT_SETTING'
export const AMOUNT_FOR_RECIPIENT_UPDATED = 'AMOUNT_FOR_RECIPIENT_UPDATED'
export const SET_BALANCE_FOR_SENDING_RECIPIENT = 'SET_BALANCE_FOR_SENDING_RECIPIENT'
export const EXECUTE_SEND_STAGE1 = 'EXECUTE_SEND_STAGE1'
export const SEND_STAGE1_EXECUTED = 'SEND_STAGE1_EXECUTED'
export const RESET_SEND_STAGE1 = 'RESET_SEND_STAGE1'
export const FEE_INTEL_MISSING = 'FEE_INTEL_MISSING'
export const EXECUTE_SEND_STAGE2 = 'EXECUTE_SEND_STAGE2'
export const SEND_STAGE2_EXECUTED = 'SEND_STAGE2_EXECUTED'
export const SENDING_FAILED = 'SENDING_FAILED'
export const SENDING_SUCCEEDED = 'SENDING_SUCCEEDED'
export const SENDING_COMPLETED = 'SENDING_COMPLETED'
export const CALCULATE_SEND_MAX_FEE = 'CALCULATE_SEND_MAX_FEE'
export const CLEAR_SEND_MAX_FEE = 'CLEAR_SEND_MAX_FEE'
export const SEND_MAX_FEE_CALCULATED = 'SEND_MAX_FEE_CALCULATED'
export const CALCULATE_CUSTOM_FEE = 'CALCULATE_CUSTOM_FEE'
export const CUSTOM_FEE_CALCULATED = 'CUSTOM_FEE_CALCULATED'
export const CUSTOM_SEND_MAX_CALCULATED = 'CUSTOM_SEND_MAX_CALCULATED'
export const SEND_TX_NOTIFICATION = 'SEND_TX_NOTIFICATION'

export interface ResetSendState extends Action {
  type: typeof RESET_SEND_STATE;
}

export const resetSendState = (
): ResetSendState => {
  return {
    type: RESET_SEND_STATE,
  }
}

export interface SourceAccountSelectedForSendingAction extends Action {
  type: typeof SOURCE_ACCOUNT_SELECTED_FOR_SENDING;
  payload: AccountShell;
}

export const sourceAccountSelectedForSending = (
  payload: AccountShell
): SourceAccountSelectedForSendingAction => {
  return {
    type: SOURCE_ACCOUNT_SELECTED_FOR_SENDING,
    payload,
  }
}


export interface AddRecipientForSendingAction extends Action {
  type: typeof ADD_RECIPIENT_FOR_SENDING;
  payload: RecipientDescribing;
}

export const addRecipientForSending = (
  payload: RecipientDescribing
): AddRecipientForSendingAction => {
  return {
    type: ADD_RECIPIENT_FOR_SENDING,
    payload,
  }
}

export interface RecipientSelectedForAmountSettingAction extends Action {
  type: typeof RECIPIENT_SELECTED_FOR_AMOUNT_SETTING;
  payload: RecipientDescribing;
}

export const recipientSelectedForAmountSetting = (
  payload: RecipientDescribing
): RecipientSelectedForAmountSettingAction => {
  return {
    type: RECIPIENT_SELECTED_FOR_AMOUNT_SETTING,
    payload,
  }
}


export interface RecipientRemovedFromSendingAction extends Action {
  type: typeof RECIPIENT_REMOVED_FROM_SENDING;
  payload: RecipientDescribing;
}

export const recipientRemovedFromSending = (
  payload: RecipientDescribing
): RecipientRemovedFromSendingAction => {
  return {
    type: RECIPIENT_REMOVED_FROM_SENDING,
    payload,
  }
}



export interface AmountForRecipientUpdatedAction extends Action {
  type: typeof AMOUNT_FOR_RECIPIENT_UPDATED;
  payload: {
    recipient: RecipientDescribing;
    amount: Satoshis;
  }
}

export const amountForRecipientUpdated = (
  payload: {
    recipient: RecipientDescribing;
    amount: Satoshis;
  }
): AmountForRecipientUpdatedAction => {
  return {
    type: AMOUNT_FOR_RECIPIENT_UPDATED,
    payload,
  }
}

export interface ExecuteSendStage1Action extends Action {
  type: typeof EXECUTE_SEND_STAGE1;
  payload: {
    accountShell: AccountShell;
  };
}

export const executeSendStage1 = (
  payload: {
    accountShell: AccountShell;
  },
): ExecuteSendStage1Action => {
  return {
    type: EXECUTE_SEND_STAGE1,
    payload,
  }
}

export interface SendStage1ExecutedAction extends Action {
  type: typeof SEND_STAGE1_EXECUTED;
  payload: {successful: boolean, carryOver?: {
    txPrerequisites?: TransactionPrerequisite,
    recipients?: {
    address: string;
    amount: number;
    name?: string
  }[] }, err?: string };
}

export const sendStage1Executed = (
  payload: {successful: boolean, carryOver?: {
    txPrerequisites?: TransactionPrerequisite,
    recipients: {
    address: string;
    amount: number;
    name?: string
  }[] }, err?: string },
): SendStage1ExecutedAction => {
  return {
    type: SEND_STAGE1_EXECUTED,
    payload,
  }
}

export interface ResetSendStage1Action extends Action {
  type: typeof RESET_SEND_STAGE1;
}

export const resetSendStage1 = (): ResetSendStage1Action => {
  return {
    type: RESET_SEND_STAGE1,
  }
}

export interface FeeIntelMissingAction extends Action {
  type: typeof FEE_INTEL_MISSING;
  payload: {
    intelMissing: boolean;
  };
}

export const feeIntelMissing = (
  payload: {
    intelMissing: boolean;
  },
): FeeIntelMissingAction => {
  return {
    type: FEE_INTEL_MISSING,
    payload,
  }
}

export interface ExecuteSendStage2Action extends Action {
  type: typeof EXECUTE_SEND_STAGE2;
  payload: {
    accountShell: AccountShell;
    txnPriority: TxPriority,
    token?: number
  };
}

export const executeSendStage2 = (
  payload: {
    accountShell: AccountShell;
    txnPriority: TxPriority,
    token?: number,
    note?: string
    },
): ExecuteSendStage2Action => {
  return {
    type: EXECUTE_SEND_STAGE2,
    payload,
  }
}

export interface SendStage2ExecutedAction extends Action {
  type: typeof SEND_STAGE2_EXECUTED;
  payload: {successful: boolean, txid?: string, err?: string};
}

export const sendStage2Executed = (
  payload: {successful: boolean, txid?: string, err?: string},
): SendStage2ExecutedAction => {
  return {
    type: SEND_STAGE2_EXECUTED,
    payload,
  }
}
export interface SendingFailureAction extends Action {
  type: typeof SENDING_FAILED;
}

export const sendingFailed = (): SendingFailureAction => {
  return {
    type: SENDING_FAILED,
  }
}


export interface SendingSuccessAction extends Action {
  type: typeof SENDING_SUCCEEDED;
}

export const sendingSucceeded = (): SendingSuccessAction => {
  return {
    type: SENDING_SUCCEEDED,
  }
}

export interface SendingCompletionAction extends Action {
  type: typeof SENDING_COMPLETED;
}

export const sendingCompleted = (): SendingCompletionAction => {
  return {
    type: SENDING_COMPLETED,
  }
}


export interface CalculateSendMaxFeeAction extends Action {
  type: typeof CALCULATE_SEND_MAX_FEE;
  payload: {
    numberOfRecipients: number;
    accountShell: AccountShell;
  };
}

export const calculateSendMaxFee = (
  payload: {
    numberOfRecipients: number;
    accountShell: AccountShell;
  },
): CalculateSendMaxFeeAction => {
  return {
    type: CALCULATE_SEND_MAX_FEE,
    payload,
  }
}

export const clearSendMaxFee = (
) => {
  return {
    type: CLEAR_SEND_MAX_FEE,
  }
}

export interface SendMaxFeeCalculatedAction extends Action {
  type: typeof SEND_MAX_FEE_CALCULATED;
  payload: Satoshis;
}

export const sendMaxFeeCalculated = (
  payload: Satoshis,
): SendMaxFeeCalculatedAction => {
  return {
    type: SEND_MAX_FEE_CALCULATED,
    payload,
  }
}

export interface CalculateCustomFeeAction extends Action {
  type: typeof CALCULATE_CUSTOM_FEE;
  payload: {
    accountShell: AccountShell,
    feePerByte: string,
    customEstimatedBlocks: string,
  };
}

export const calculateCustomFee = (
  payload: {
    accountShell: AccountShell,
    feePerByte: string,
    customEstimatedBlocks: string,
  },
): CalculateCustomFeeAction => {
  return {
    type: CALCULATE_CUSTOM_FEE,
    payload,
  }
}

export interface CustomFeeCalculatedAction extends Action {
  type: typeof CUSTOM_FEE_CALCULATED;
  payload: {
    successful: boolean,
    carryOver?: {customTxPrerequisites: TransactionPrerequisiteElements},
    err?: string | null,
  };
}

export const customFeeCalculated = (
  payload: {
    successful: boolean,
    carryOver?: {customTxPrerequisites: TransactionPrerequisiteElements},
    err?: string | null,
  }
): CustomFeeCalculatedAction => {
  return {
    type: CUSTOM_FEE_CALCULATED,
    payload
  }
}


export interface CustomSendMaxCalculatedAction extends Action {
  type: typeof CUSTOM_SEND_MAX_CALCULATED;
  payload: {
   recipients: RecipientDescribing[]
  };
}

export const customSendMaxUpdated = (
  payload: {
    recipients: RecipientDescribing[]
  }
): CustomSendMaxCalculatedAction => {
  return {
    type: CUSTOM_SEND_MAX_CALCULATED,
    payload
  }
}


export interface SendTxNotificationAction extends Action {
  type: typeof SEND_TX_NOTIFICATION;
}

export const sendTxNotification = (): SendTxNotificationAction => {
  return {
    type: SEND_TX_NOTIFICATION,
  }
}


