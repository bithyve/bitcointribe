import { chain } from 'icepick'
import { Accounts } from '../../bitcoin/utilities/Interface'
import { UPDATE_SYNCHED_MISSING_ACCOUNTS } from '../actions/upgrades'

const initialState: {
  synchedMissingAccounts: Accounts,
} = {
  synchedMissingAccounts: {
  }
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case UPDATE_SYNCHED_MISSING_ACCOUNTS:
        return chain( state )
          .setIn( [ 'synchedMissingAccounts' ], action.payload.synchedMissingAccounts )
          .value()
  }
  return state
}
