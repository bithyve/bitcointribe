import { Action } from "redux";
import SubAccountDescribing from "../../common/data/models/SubAccountInfo/Interfaces";
import { RecipientDescribing } from "../../common/data/models/interfaces/RecipientDescribing";

export const SOURCE_ACCOUNT_SELECTED_FOR_SENDING = 'SOURCE_ACCOUNT_SELECTED_FOR_SENDING';
export const ADD_RECIPIENT_FOR_SENDING = 'ADD_RECIPIENT_FOR_SENDING';
export const RECIPIENT_SELECTED_FOR_AMOUNT_SETTING = 'RECIPIENT_SELECTED_FOR_AMOUNT_SETTING';
export const SET_BALANCE_FOR_SENDING_RECIPIENT = 'SET_BALANCE_FOR_SENDING_RECIPIENT';
export const EXECUTE_SENDING = 'EXECUTE_SENDING';
export const SENDING_FAILED = 'SENDING_FAILED';
export const SENDING_SUCCEEDED = 'SENDING_SUCCEEDED';
export const SENDING_COMPLETED = 'SENDING_COMPLETED';


export interface SourceAccountSelectedForSendingAction extends Action {
  type: typeof SOURCE_ACCOUNT_SELECTED_FOR_SENDING;
  payload: SubAccountDescribing;
};

export const sourceAccountSelectedForSending = (
  payload: SubAccountDescribing
): SourceAccountSelectedForSendingAction => {
  return {
    type: SOURCE_ACCOUNT_SELECTED_FOR_SENDING,
    payload,
  };
};


export interface AddRecipientForSendingAction extends Action {
  type: typeof ADD_RECIPIENT_FOR_SENDING;
  payload: RecipientDescribing;
};

export const addRecipientForSending = (
  payload: RecipientDescribing
): AddRecipientForSendingAction => {
  return {
    type: ADD_RECIPIENT_FOR_SENDING,
    payload,
  };
};

export interface RecipientSelectedForAmountSettingAction extends Action {
  type: typeof RECIPIENT_SELECTED_FOR_AMOUNT_SETTING;
  payload: RecipientDescribing;
};

export const recipientSelectedForAmountSetting = (
  payload: RecipientDescribing
): RecipientSelectedForAmountSettingAction => {
  return {
    type: RECIPIENT_SELECTED_FOR_AMOUNT_SETTING,
    payload,
  };
};

export interface ExecuteSendingAction extends Action {
  type: typeof EXECUTE_SENDING;
};

export const executeSending = (): ExecuteSendingAction => {
  return {
    type: EXECUTE_SENDING,
  };
};


export interface SendingFailureAction extends Action {
  type: typeof SENDING_FAILED;
};

export const sendingFailed = (): SendingFailureAction => {
  return {
    type: SENDING_FAILED,
  };
};


export interface SendingSuccessAction extends Action {
  type: typeof SENDING_SUCCEEDED;
};

export const sendingSucceeded = (): SendingSuccessAction => {
  return {
    type: SENDING_SUCCEEDED,
  };
};

export interface SendingCompletionAction extends Action {
  type: typeof SENDING_COMPLETED;
};

export const sendingCompleted = (): SendingCompletionAction => {
  return {
    type: SENDING_COMPLETED,
  };
};
