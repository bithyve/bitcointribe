import { SAVE_SEND_STORAGE, REMOVE_FROM_SEND_STORAGE, CLEAR_SEND_STORAGE } from "../actions/send-action";

const INITIAL_STATE = {
  sendStorage: []
};

export default function reducer(state = INITIAL_STATE, action) {
  const { payload } = action;

  switch (action.type) {
    case SAVE_SEND_STORAGE:
      return {
        ...state,
        sendStorage: [...state.sendStorage, payload.data],
      };
    case REMOVE_FROM_SEND_STORAGE:
      return {
        ...state,
        sendStorage: [...state.sendStorage].filter(item => item !== payload.data),
      };
    case CLEAR_SEND_STORAGE:
      return {
        ...state,
        sendStorage: [],
      };
    default:
      return state;
  }
}