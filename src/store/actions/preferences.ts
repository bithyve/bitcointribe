import { createAction } from 'redux-actions';
import { UPDATE_APP_PREFERENCE } from '../constants'

const updatePereferenceRequest = createAction(UPDATE_APP_PREFERENCE);
export const updatePreference = (payload) => dispatch => dispatch(updatePereferenceRequest(payload))