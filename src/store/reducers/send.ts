import {
  SAVE_SEND_DETAILS,
  REMOVE_FROM_SEND_DETAILS,
  CLEAR_SEND_DETAILS,
} from '../actions/send';

const INITIAL_STATE = {
  sendStorage: [],
};

export default function reducer(state = INITIAL_STATE, action) {
  const { payload } = action;

  switch (action.type) {
    case SAVE_SEND_DETAILS:
      return {
        ...state,
        sendStorage: [...state.sendStorage, payload.data],
      };

    case REMOVE_FROM_SEND_DETAILS:
      return {
        ...state,
        sendStorage: [...state.sendStorage].filter(
          (item) => item !== payload.data,
        ),
      };

    case CLEAR_SEND_DETAILS:
      return {
        ...state,
        sendStorage: [],
      };

    default:
      return state;
  }
}
