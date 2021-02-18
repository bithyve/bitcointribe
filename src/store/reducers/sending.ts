import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import { SOURCE_ACCOUNT_SELECTED_FOR_SENDING, ADD_RECIPIENT_FOR_SENDING, EXECUTE_SENDING, SENDING_FAILED, SENDING_SUCCEEDED, SENDING_COMPLETED, RECIPIENT_SELECTED_FOR_AMOUNT_SETTING, SEND_MAX_FEE_CALCULATED } from '../actions/sending'
import AccountShell from '../../common/data/models/AccountShell'

type RecipientID = string;

export type AmountDesignations = Record<RecipientID, Satoshis>;

export type SendingState = {
  sourceAccountShell: AccountShell | null;

  selectedRecipients: RecipientDescribing[];
  amountDesignations: AmountDesignations;

  recipientSelectedForSettingAmount: RecipientDescribing | null;

  isSendingInProgress: boolean;
  hasSendingFailed: boolean;
  sendingFailedErrorMessage: string | null;

  sendMaxFee: Satoshis;
};

const INITIAL_STATE: SendingState = {
  sourceAccountShell: null,
  selectedRecipients: [],
  amountDesignations: {
  },
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

      case EXECUTE_SENDING:
        return {
          ...state,
          isSendingInProgress: true,
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
