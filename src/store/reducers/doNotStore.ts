import { CLIPBOARD_READ_STATE, LINKING_URL, TEMP_ACCSHEEL_ID } from '../actions/doNotStore'

const initalState: {
  didAccess: boolean;
  linkingURL: string;
  tempAccShellID: string;
} = {
  didAccess: false,
  linkingURL: '',
  tempAccShellID:''
}

const doNotStoreReducer = ( state = initalState, action ) => {
  switch ( action.type ) {
      case CLIPBOARD_READ_STATE:
        return {
          ...state, didAccess: true
        }
      case LINKING_URL:
        return {
          ...state,
          linkingURL: action.payload.url,
        }
      case TEMP_ACCSHEEL_ID:
        return {
          ...state,
          tempAccShellID: action.payload.id,
        }
      default:
        return state
  }
}

export default doNotStoreReducer
