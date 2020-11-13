import SubAccountDescribing from "../../common/data/models/SubAccountInfo/Interfaces"
import { RecipientDescribing } from "../../common/data/models/interfaces/RecipientDescribing"
import { Satoshis } from "../../common/data/typealiases/UnitAliases"
import { SOURCE_ACCOUNT_SELECTED_FOR_SENDING, ADD_RECIPIENT_FOR_SENDING, EXECUTE_SENDING, SENDING_FAILED, SENDING_SUCCEEDED, SENDING_COMPLETED, RECIPIENT_SELECTED_FOR_AMOUNT_SETTING } from "../actions/sending";

export type AmountDesignations = Record<string, Satoshis>;

export type SendingState = {
  sourceAccount: SubAccountDescribing | null;

  selectedRecipients: RecipientDescribing[];
  amountDesignations: AmountDesignations;

  recipientSelectedForSettingAmount: RecipientDescribing | null;

  isSendingInProgress: boolean;
  hasSendingFailed: boolean;
  sendingFailedErrorMessage: string | null;
};

const INITIAL_STATE: SendingState = {
  sourceAccount: null,
  selectedRecipients: [],
  amountDesignations: {},
  recipientSelectedForSettingAmount: null,
  isSendingInProgress: false,
  hasSendingFailed: false,
  sendingFailedErrorMessage: null,
};


const sendingReducer = (state: SendingState = INITIAL_STATE, action) => {
  let recipient: RecipientDescribing;

  switch (action.type) {
    case SOURCE_ACCOUNT_SELECTED_FOR_SENDING:
      return {
        ...state,
        sourceAccount: action.payload,
      };

    case ADD_RECIPIENT_FOR_SENDING:
      recipient = action.payload;

      return {
        ...state,
        selectedRecipients: [...state.selectedRecipients, recipient],
        amountDesignations: {
          ...state.amountDesignations,
          [recipient.id]: 0,
        },
      };

    case RECIPIENT_SELECTED_FOR_AMOUNT_SETTING:
      return {
        ...state,
        recipientSelectedForSettingAmount: action.payload,
      };

    case EXECUTE_SENDING:
      return {
        ...state,
        isSendingInProgress: true,
      };

    case SENDING_FAILED:
      return {
        ...state,
        isSendingInProgress: false,
        hasSendingFailed: true,
        sendingFailedErrorMessage: action.payload,
      };

    case SENDING_SUCCEEDED:
      return {
        ...state,
        hasSendingFailed: false,
        sendingFailedErrorMessage: null,
      };

    case SENDING_COMPLETED:
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default sendingReducer;
