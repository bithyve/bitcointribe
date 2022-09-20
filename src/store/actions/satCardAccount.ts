// types and action creators: dispatched by components and sagas
import { ImageSourcePropType } from 'react-native'
import { Account } from '../../bitcoin/utilities/Interface'
import AccountShell from '../../common/data/models/AccountShell'
import { AccountsState } from '../reducers/accounts'

export const SAT_CARD_ACCOUNT = 'SAT_CARD_ACCOUNT'

export const updateSatCardAccount = ( accountId: string, privKey: string, address: string, selectedAccount: AccountShell ) => {
  return {
    type: SAT_CARD_ACCOUNT,
    payload: {
      accountId,
      privKey,
      address,
      selectedAccount
    },
  }
}
