export const SAVE_SEND_DETAILS = 'SAVE_SEND_DETAILS';
export const REMOVE_FROM_SEND_DETAILS = 'REMOVE_FROM_SEND_DETAILS';
export const CLEAR_SEND_DETAILS = 'CLEAR_SEND_DETAILS';

export const saveSendDetails = (data) => {
  return { type: SAVE_SEND_DETAILS, payload: { data } };
};

export const removeFromSendDetails = (data) => {
  return { type: REMOVE_FROM_SEND_DETAILS, payload: { data } };
};

export const clearSendDetails = () => {
  return { type: CLEAR_SEND_DETAILS };
};
