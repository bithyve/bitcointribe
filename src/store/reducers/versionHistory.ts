import { VersionHistory } from '../../bitcoin/utilities/Interface';
import {
    SET_VERSIONS,
  } from '../actions/versionHistory';
 
  const initialState: {
    versions: VersionHistory[];
  } = {
    versions: [],
  }
  
  
  export default ( state = initialState, { type, payload } ) => {
    switch ( type ) {
        case SET_VERSIONS:
          return {
            ...state,
            versions: payload.versions,
          }
  
        default:
          return state
    }
  }
  