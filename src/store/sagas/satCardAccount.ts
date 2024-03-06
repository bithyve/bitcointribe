import { call, put, select } from 'redux-saga/effects'
import { Account, Accounts, AccountType } from '../../bitcoin/utilities/Interface'

import AccountOperations from '../../bitcoin/utilities/accounts/AccountOperations'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import AccountShell from '../../common/data/models/AccountShell'
import Toast from '../../components/Toast'
import dbManager from '../../storage/realm/dbManager'
import { updateAccountShells } from '../actions/accounts'
import { updateWalletImageHealth } from '../actions/BHR'
import {
  SAT_CARD_ACCOUNT
} from '../actions/satCardAccount'
import { AccountsState } from '../reducers/accounts'
import { createWatcher } from '../utils/utilities'
import { getNextFreeAddressWorker } from './accounts'

function* satCardAccountWorker( { payload }: { payload: { accountId: string, privKey: string, address: string, selectedAccount: AccountShell } } ) {
  try {
    const accountsState: AccountsState = yield select( state => state.accounts )
    const accounts: Accounts = accountsState.accounts

    let associateAccount: Account

    if ( payload.accountId ) {
      associateAccount = accounts[ payload.accountId ]
    } else {
      for ( const accountId in accounts ) {
        const account = accounts[ accountId ]
        if ( account.type === AccountType.CHECKING_ACCOUNT && account.instanceNum === 0 ) {
          associateAccount = account
          break
        }
      }
    }

    const receivingAddress = yield call( getNextFreeAddressWorker, associateAccount )
    const network = AccountUtilities.getNetworkByType( associateAccount.networkType )
    // const defaultTxPriority = TxPriority.LOW
    // const defaultFeePerByte = accountsState.averageTxFees[ defaultTxPriority ]
    const averageTxFeeByNetwork = accountsState.averageTxFees[ associateAccount.networkType ]
    const { txid } = yield call(
      AccountOperations.sweepPrivateKey,
      payload.privKey,
      payload.address,
      receivingAddress,
      averageTxFeeByNetwork,
      network,
    )
    // AccountOperations.importAddress( associateAccount, payload.privKey, payload.address, {
    //   type: ActiveAddressAssigneeType.GIFT,
    //   senderInfo: {
    //     name: 'Satscard'
    //   }
    // } )

    if ( txid ) {
      yield put( updateAccountShells( {
        accounts: {
          [ associateAccount.id ]: associateAccount
        }
      } ) )
      yield call( dbManager.updateAccount, associateAccount.id, associateAccount )
      yield put( updateWalletImageHealth( {
        updateAccounts: true,
        accountIds: [ payload.selectedAccount.id ],
      } ) )
    }
  } catch ( err ) {
    Toast( 'Claim not Completed try again' )
    return
  }
}

export const satCardAcountWatcher = createWatcher(
  satCardAccountWorker,
  SAT_CARD_ACCOUNT,
)
