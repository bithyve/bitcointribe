import { CLIPBOARD_READ_STATE, LINKING_URL, TEMP_ACCSHEEL_ID, TOOGLE_LOAINING_GIFT } from '../actions/doNotStore'

const initalState: {
  didAccess: boolean;
  linkingURL: string;
  tempAccShellID: string;
  toogleGiftLoading: boolean;
} = {
  didAccess: false,
  linkingURL: '',
  tempAccShellID:'',
  toogleGiftLoading:false,
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
      case TOOGLE_LOAINING_GIFT:
        return {
          ...state,
          toogleGiftLoading: !state.toogleGiftLoading
        }
      default:
        return state
  }
}

export default doNotStoreReducer
