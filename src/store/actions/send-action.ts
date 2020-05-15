export const SAVE_SEND_STORAGE = 'SAVE_SEND_STORAGE';
export const REMOVE_FROM_SEND_STORAGE = 'REMOVE_FROM_SEND_STORAGE';

export const storeContactsAccountToSend = (data) => {
  return { type: SAVE_SEND_STORAGE, payload: { data } };
};

export const removeContactsAccountFromSend = (data) => {
  return { type: REMOVE_FROM_SEND_STORAGE, payload: { data } };
};