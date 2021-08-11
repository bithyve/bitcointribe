import { chain } from 'icepick'
import {
  KEY_FETCHED,
  UPDATE_WALLET,
} from '../actions/storage'
import { Wallet } from '../../bitcoin/utilities/Interface'

const initialState: {
  wallet: Wallet;
  key: String;
} = {
  wallet: null,
  key: '',
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case UPDATE_WALLET:
        return chain( state )
          .setIn( [ 'wallet' ], action.payload.wallet )
          .value()

      case KEY_FETCHED:
        return chain( state ).setIn( [ 'key' ], action.payload.key ).value()

  }
  return state
}
