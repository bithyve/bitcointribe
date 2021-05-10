import ip, { chain } from 'icepick'
import LevelStatus from '../../common/data/enums/LevelStatus'
import { IS_LEVEL_ONE_COMPLETE, LEVEL_COMPLETION_ERROR, IS_PERSONAL_DEVICE_COMPLETE, NAVIGATING_HISTORY_PAGE, TYPE_BOTTOMSHEET_OPEN } from '../actions/newBHR'

const initialState = ip.freeze( {

  navigationObj: {
  },
  errorTitle: null,
  errorInfo: null,
  status: LevelStatus.PENDING,
  isTypeBottomSheetOpen: false,
} )

export default ( state = initialState, { type, payload } ) => {
  switch ( type ) {
      case LEVEL_COMPLETION_ERROR:
        return {
          ...state,
          errorTitle: payload.errorTitle,
          errorInfo: payload.errorInfo,
          status: payload.status,
        }

      case NAVIGATING_HISTORY_PAGE:
        return {
          ...state,
          navigationObj: payload.navigationObj,
        }

      case TYPE_BOTTOMSHEET_OPEN:
        return {
          ...state,
          isTypeBottomSheetOpen: payload.isTypeBottomSheetOpen,
        }
      default:
        return state
  }
}

