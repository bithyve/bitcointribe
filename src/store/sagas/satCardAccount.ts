import { Account, AccountType, Accounts, ActiveAddressAssigneeType, AverageTxFees, TxPriority } from '../../bitcoin/utilities/Interface'
import { call, put, select } from 'redux-saga/effects'

import AccountOperations from '../../bitcoin/utilities/accounts/AccountOperations'
import AccountShell from '../../common/data/models/AccountShell'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import { AccountsState } from '../reducers/accounts'
import {
  SAT_CARD_ACCOUNT,
} from '../actions/satCardAccount'
import Toast from '../../components/Toast'
import { createWatcher } from '../utils/utilities'
import dbManager from '../../storage/realm/dbManager'
import { getNextFreeAddressWorker } from './accounts'
import { updateAccountShells } from '../actions/accounts'
import { updateWalletImageHealth } from '../actions/BHR'

function* satCardAccountWorker( { payload }: { payload: { accountId: string, privKey: string, address: string, selectedAccount: AccountShell } } ) {
  try {
    const accountsState: AccountsState = yield select( state => state.accounts )
    const accounts: Accounts = accountsState.accounts
    console.log( 'associateAccount accountsState' + JSON.stringify( accountsState ) )

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
    console.log( 'skk associateAccount', associateAccount )

    const privateKey1 = 'L2JQbktkgwHM9ENH7k785GZz3ib5bUF6TUzc7w3SBkYqCwf6uFYV'
    const privateKey = 'L2JQbktkgwHM9ENH7k785GZz3ib5bUF6TUzc7w3SBkYqCwf6uFYV'

    const receivingAddress = yield call( getNextFreeAddressWorker, associateAccount )
    const network = AccountUtilities.getNetworkByType( associateAccount.networkType )
    // const defaultTxPriority = TxPriority.LOW
    // const defaultFeePerByte = accountsState.averageTxFees[ defaultTxPriority ]
    const averageTxFeeByNetwork = accountsState.averageTxFees[ associateAccount.networkType ]

    console.log( 'skk before txid' )
    const { txid } = yield call(
      AccountOperations.sweepPrivateKey,
      privateKey,
      payload.address,
      receivingAddress,
      averageTxFeeByNetwork,
      network,
    )
    console.log( 'skk txid', JSON.stringify( txid ) )

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
