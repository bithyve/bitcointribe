import { chain } from 'icepick'
import {
  KEY_FETCHED,
  UPDATE_WALLET,
} from '../actions/storage'
import { Wallet } from '../../bitcoin/utilities/Interface'
import { COMPLETED_WALLET_SETUP } from '../actions/setupAndAuth'

const initialState: {
  wallet: Wallet;
  key: String;
  walletExists: boolean,
} = {
  wallet: null,
  key: '',
  walletExists: false
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case UPDATE_WALLET:
        return chain( state )
          .setIn( [ 'wallet' ], action.payload.wallet )
          .value()

      case KEY_FETCHED:
        return chain( state ).setIn( [ 'key' ], action.payload.key ).value()

      case COMPLETED_WALLET_SETUP:
        return chain( state )
          .setIn( [ 'walletExists' ], true )
          .value()

  }
  return state
}
