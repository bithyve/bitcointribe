import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import { SOURCE_ACCOUNT_SELECTED_FOR_SENDING, ADD_RECIPIENT_FOR_SENDING, EXECUTE_SENDING, SENDING_FAILED, SENDING_SUCCEEDED, SENDING_COMPLETED, RECIPIENT_SELECTED_FOR_AMOUNT_SETTING, SEND_MAX_FEE_CALCULATED, SEND_STAGE1_EXECUTED, EXECUTE_SEND_STAGE1 } from '../actions/sending'
import AccountShell from '../../common/data/models/AccountShell'
import TransactionPriority from '../../common/data/enums/TransactionPriority'
import TransactionFeeSnapshot from '../../common/data/models/TransactionFeeSnapshot'
import {  TransactionPrerequisite } from '../../bitcoin/utilities/Interface'

type RecipientID = string;

export type AmountDesignations = Record<RecipientID, Satoshis>;
export type TransactionFeeInfo = Record<TransactionPriority, TransactionFeeSnapshot>;

export type SendingState = {
  sourceAccountShell: AccountShell | null;

  selectedRecipients: RecipientDescribing[];
  amountDesignations: AmountDesignations;

  recipientSelectedForSettingAmount: RecipientDescribing | null;

  sendST1: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
  };
  sendST2: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
  };
  sendST3: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
  }

  sendMaxFee: Satoshis;
  transactionFeeInfo: TransactionFeeInfo;
};

const INITIAL_STATE: SendingState = {
  sourceAccountShell: null,
  selectedRecipients: [],
  amountDesignations: {
  },
  recipientSelectedForSettingAmount: null,

  sendST1: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
  },
  sendST2: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
  },
  sendST3: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
  },

  sendMaxFee: 0,

  /*
  the UI needs to keep track of fees to display on screen
  Three level of fees priority with time estimate for each
  fees: {}, // 3 levels of fees and priority
  */
  transactionFeeInfo: {
    [ TransactionPriority.LOW ]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 50,
    },
    [ TransactionPriority.MEDIUM ]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 20,
    },
    [ TransactionPriority.HIGH ]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 4,
    },
    [ TransactionPriority.CUSTOM ]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 0,
    },
  },
}


const sendingReducer = ( state: SendingState = INITIAL_STATE, action ): SendingState => {
  let recipient: RecipientDescribing

  switch ( action.type ) {
      case SOURCE_ACCOUNT_SELECTED_FOR_SENDING:
        return {
          ...state,
          sourceAccountShell: action.payload,
        }

      case ADD_RECIPIENT_FOR_SENDING:
        recipient = action.payload

        return {
          ...state,
          selectedRecipients: [ ...state.selectedRecipients, recipient ],
          amountDesignations: {
            ...state.amountDesignations,
            [ recipient.id ]: 0,
          },
        }

      case RECIPIENT_SELECTED_FOR_AMOUNT_SETTING:
        return {
          ...state,
          recipientSelectedForSettingAmount: action.payload,
        }

      case EXECUTE_SEND_STAGE1:
        return {
          ...state,
          sendST1:{
            inProgress: true,
            hasFailed: false,
            failedErrorMessage: null
          }
        }

      case SEND_STAGE1_EXECUTED:
        const transactionFeeInfo: TransactionFeeInfo = state.transactionFeeInfo
        if( action.payload.successful ){
          const txPrerequisites: TransactionPrerequisite = action.payload.data
          Object.keys( txPrerequisites ).forEach( ( priority ) =>{
            transactionFeeInfo[ priority.toUpperCase() ].amount = txPrerequisites[ priority ].fee
            transactionFeeInfo[ priority.toUpperCase() ].estimatedBlocksBeforeConfirmation = txPrerequisites[ priority ].estimatedBlocks
          } )
        }
        return {
          ...state,
          sendST1: {
            inProgress: false,
            hasFailed: !action.payload.successful,
            failedErrorMessage: !action.payload.successful? action.payload.data : null
          },
          transactionFeeInfo
        }

      case SENDING_COMPLETED:
        return {
          ...INITIAL_STATE
        }

      case SEND_MAX_FEE_CALCULATED:
        return {
          ...state,
          sendMaxFee: action.payload,
        }

      default:
        return state
  }
}

export default sendingReducer
