import { VersionHistory } from '../../bitcoin/utilities/Interface'
import {
  RESTORED_VERSIONS_HISTORY,
  SET_VERSIONS_HISTORY,
} from '../actions/versionHistory'

const initialState: {
    versions: VersionHistory[];
  } = {
    versions: [],
  }


export default ( state = initialState, { type, payload } ) => {
  switch ( type ) {
      case SET_VERSIONS_HISTORY:
        return {
          ...state,
          versions: payload.versions,
        }

      case RESTORED_VERSIONS_HISTORY:
        return {
          ...state,
          versions: payload.versions,
        }

      default:
        return state
  }
}

