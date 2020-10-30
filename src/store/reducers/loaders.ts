import { chain } from 'icepick'
import { STARTUP_SYNC_LOADED } from "../actions/loaders";

const INITIAL_STATE = {
    startupSyncLoaded: false,
};


const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case STARTUP_SYNC_LOADED:
          return chain(state).setIn(['startupSyncLoaded'], action.payload.loaded).value()

        default:
            return state
    }

}



export default reducer
