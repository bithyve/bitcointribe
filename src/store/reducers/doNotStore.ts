import { CLIPBOARD_READ_STATE, LINKING_URL } from '../actions/doNotStore'

const initalState: {
  didAccess: boolean;
  linkingURL: string;
} = {
  didAccess: false,
  linkingURL: ''
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
      default:
        return state
  }
}

export default doNotStoreReducer
