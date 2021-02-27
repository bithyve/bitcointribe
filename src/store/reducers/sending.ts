import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import { SOURCE_ACCOUNT_SELECTED_FOR_SENDING, ADD_RECIPIENT_FOR_SENDING, SENDING_FAILED, SENDING_SUCCEEDED, SENDING_COMPLETED, RECIPIENT_SELECTED_FOR_AMOUNT_SETTING, SEND_MAX_FEE_CALCULATED, AMOUNT_FOR_RECIPIENT_UPDATED, RECIPIENT_REMOVED_FROM_SENDING } from '../actions/sending'
import AccountShell from '../../common/data/models/AccountShell'
import TransactionPriority from '../../common/data/enums/TransactionPriority'
import TransactionFeeSnapshot from '../../common/data/models/TransactionFeeSnapshot'

type RecipientID = string;

export type AmountDesignations = Record<RecipientID, Satoshis>;
export type TransactionFeeInfo = Record<TransactionPriority, TransactionFeeSnapshot>;

export type SendingState = {
  sourceAccountShell: AccountShell | null;

  selectedRecipients: RecipientDescribing[];

  recipientSelectedForSettingAmount: RecipientDescribing | null;

  isSendingInProgress: boolean;
  hasSendingFailed: boolean;
  sendingFailedErrorMessage: string | null;

  sendMaxFee: Satoshis;

  transactionFeeInfo: TransactionFeeInfo;
};

const INITIAL_STATE: SendingState = {
  sourceAccountShell: null,
  selectedRecipients: [],
  recipientSelectedForSettingAmount: null,

  /*
  This should change to a new type with 4 stages
  to start with please call them ST1, ST2, ST3 and ST4
  Each one can be executed or failed
  */
  isSendingInProgress: false,

  hasSendingFailed: false,
  sendingFailedErrorMessage: null,

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
          selectedRecipients: state
            .selectedRecipients
            .filter( r => r.id != recipient.id )
            .concat( recipient )
        }

      case RECIPIENT_REMOVED_FROM_SENDING:
        recipient = action.payload

        return {
          ...state,
          selectedRecipients: state
            .selectedRecipients
            .filter( r => r.id != recipient.id )
        }

      case RECIPIENT_SELECTED_FOR_AMOUNT_SETTING:
        return {
          ...state,
          recipientSelectedForSettingAmount: action.payload,
        }

      case AMOUNT_FOR_RECIPIENT_UPDATED: {
        recipient = action.payload.recipient
        recipient.amount = action.payload.amount

        return {
          ...state,
          selectedRecipients: state
            .selectedRecipients
            .filter( r => r.id != recipient.id )
            .concat( recipient )
        }
      }

      case SENDING_FAILED:
        return {
          ...state,
          isSendingInProgress: false,
          hasSendingFailed: true,
          sendingFailedErrorMessage: action.payload,
        }

      case SENDING_SUCCEEDED:
        return {
          ...state,
          hasSendingFailed: false,
          sendingFailedErrorMessage: null,
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
