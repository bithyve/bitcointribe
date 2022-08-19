// types and action creators: dispatched by components and sagas
import { ImageSourcePropType } from 'react-native'
import AccountShell from '../../common/data/models/AccountShell'
import { AccountsState } from '../reducers/accounts'

export const SAT_CARD_ACCOUNT = 'SAT_CARD_ACCOUNT'

export const updateSatCardAccount = ( accountState: AccountsState, privKey: string, address: string, selectedAccount: AccountShell ) => {
  return {
    type: SAT_CARD_ACCOUNT,
    payload: {
      accountState,
      privKey,
      address,
      selectedAccount
    },
  }
}
