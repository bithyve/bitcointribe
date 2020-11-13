import { chain } from 'icepick';
import { AUTO_ACCOUNT_SYNC, STARTUP_SYNC_LOADED } from '../actions/loaders';

const INITIAL_STATE = {
  startupSyncLoaded: false,
  autoAccountSync: {},
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case STARTUP_SYNC_LOADED:
      return chain(state)
        .setIn(['startupSyncLoaded'], action.payload.loaded)
        .value();

    case AUTO_ACCOUNT_SYNC:
      return chain(state)
        .setIn(['autoAccountSync'], {
          ...state.autoAccountSync,
          [action.payload.accountType]: true,
        })
        .value();
    default:
      return state;
  }
};

export default reducer;
