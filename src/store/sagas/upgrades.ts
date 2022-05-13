import { Account, Accounts, AccountType, DonationAccount, MultiSigAccount, TxPriority, Wallet } from '../../bitcoin/utilities/Interface'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import AccountShell from '../../common/data/models/AccountShell'
import { updateAccountSettings, updateAccountShells } from '../actions/accounts'
import { call, delay, put, select } from 'redux-saga/effects'
import { AccountsState } from '../reducers/accounts'
import dbManager from '../../storage/realm/dbManager'
import { updateMetaSharesKeeper, updateOldMetaSharesKeeper } from '../actions/BHR'
import { updateWallet } from '../actions/storage'
import semver from 'semver'


// import { addNewAccountShellsWorker, newAccountsInfo } from './accounts'
import { addNewAccount, addNewAccountShellsWorker, generateShellFromAccount, newAccountsInfo, syncAccountsWorker } from './accounts'
import { createWatcher } from '../utils/utilities'
import { RECREATE_MISSING_ACCOUNTS, SWEEP_MISSING_ACCOUNTS, SYNC_MISSING_ACCOUNTS, updateSynchedMissingAccount } from '../actions/upgrades'
import AccountOperations from '../../bitcoin/utilities/accounts/AccountOperations'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import Toast from '../../components/Toast'

export function* applyUpgradeSequence( { storedVersion, newVersion }: {storedVersion: string, newVersion: string} ) {
  if( semver.lt( storedVersion, '2.0.66' ) ) yield call( testAccountEnabler )
  if( semver.lt( storedVersion, '2.0.68' ) ) yield call( accountVisibilityResetter )
  if( semver.lt( storedVersion, '2.0.71' ) ) {
    yield call( restoreMultiSigTwoFAFlag )
    yield call( recreateMissingAccounts )
  }
  if( semver.lt( storedVersion, '2.0.75' ) ) yield call( restoreManageBackupDataPipeline )
}

export function* testAccountEnabler( ) {
  const accountShells: AccountShell[] = yield select(
    ( state ) => state.accounts.accountShells
  )

  let testAccountShell: AccountShell
  accountShells.forEach( shell => {
    if( shell.primarySubAccount.type === AccountType.TEST_ACCOUNT ) testAccountShell = shell
  } )

  if( testAccountShell.primarySubAccount.visibility === AccountVisibility.HIDDEN ){
    const settings = {
      visibility: AccountVisibility.DEFAULT
    }
    yield put( updateAccountSettings( {
      accountShell: testAccountShell, settings
    } ) )
  }
}

export function* accountVisibilityResetter( ) {
  const accountShells: AccountShell[] = yield select(
    ( state ) => state.accounts.accountShells
  )

  for( const shell of accountShells ){
    if( shell.primarySubAccount.visibility !== AccountVisibility.DEFAULT ){
      const settings = {
        visibility: AccountVisibility.DEFAULT
      }
      yield put( updateAccountSettings( {
        accountShell: shell, settings
      } ) )
    }
  }
}


export function* restoreMultiSigTwoFAFlag( ) {
  // reintroduces the is2FA flag in the multisig accounts for the apps which are restored(<2.0.69) using the faulty backup(missing is2FA flag)
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )

  for( const account of Object.values( accountsState.accounts ) ){
    if( [ AccountType.SAVINGS_ACCOUNT, AccountType.DONATION_ACCOUNT ].includes( account.type ) ){
      if( ( account as MultiSigAccount ).xpubs && ( account as MultiSigAccount ).xpubs.secondary ){ // level-2 activated multisig account found
        if( !( account as MultiSigAccount ).is2FA ){ // faulty multisig account: missing is2FA flag
          ( account as MultiSigAccount ).is2FA = true
          yield put( updateAccountShells( {
            accounts: {
              [ account.id ]: account
            }
          } ) )
          yield call( dbManager.updateAccount, account.id, account )
        }
      }
    }
  }
}

export function* recreateMissingAccounts( ) {
  try{
    // recreates the missing account(s) struct and account-shell(s)
    const wallet: Wallet = yield select(
      ( state ) => state.storage.wallet
    )
    const accountsState: AccountsState = yield select(
      ( state ) => state.accounts
    )

    const accountsToRecreateInfo: newAccountsInfo[] = []
    for( const accountType of Object.keys( wallet.accounts ) ) {
      const createdAccountIds = wallet.accounts[ accountType ]
      const availableAccountIds = []
      for( const account of Object.values( accountsState.accounts ) ){
        if( account.type === accountType ){
          if( createdAccountIds.includes( account.id ) ) availableAccountIds.push( account.id )
        }
      }

      for( const accountId of createdAccountIds ){
        if( !availableAccountIds.includes( accountId ) ){
          // recreate missing account
          const instanceNumber = createdAccountIds.indexOf( accountId )
          accountsToRecreateInfo.push( {
            accountType: ( accountType as AccountType ),
            recreationInstanceNumber: instanceNumber
          } )
        }
      }
    }

    Toast( `re-creating accounts: ${[ ...accountsToRecreateInfo.map( ( { accountType, recreationInstanceNumber } ) => accountType + ':' + recreationInstanceNumber ) ]}` )

    if( accountsToRecreateInfo.length ){
      yield call( addNewAccountShellsWorker, {
        payload: accountsToRecreateInfo
      } )
    }
  } catch( err ){
    Toast( `Failed to recreate accounts: ${err}` )
  }
}

export const recreateMissingAccountsWatcher = createWatcher(
  recreateMissingAccounts,
  RECREATE_MISSING_ACCOUNTS,
)

export function* restoreManageBackupDataPipeline( ) {
  // restores critical variables from realm database to appropriate reducers
  yield delay( 2000 ) // delaying so that realm initializes properly
  const s3 = yield call( dbManager.getMetaShares )   // legacy access(directly from realm)
  if( s3 ){
    if( s3.metaSharesKeeper ){
      const MetaShares =  [ ...s3.metaSharesKeeper ]
      yield put( updateMetaSharesKeeper( MetaShares ) )
    }
    if( s3.oldMetaSharesKeeper ){
      const OldMetaShares = [ ...s3.oldMetaSharesKeeper ]
      yield put( updateOldMetaSharesKeeper( OldMetaShares ) )
    }
  }

  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
  if( !wallet.smShare ){
    const smShare = yield call( dbManager.getSecondaryMnemonicShare )
    if( smShare ){
      const updatedWallet =  {
        ...wallet,
        smShare,
      }
      yield put( updateWallet( updatedWallet ) )
      yield call( dbManager.updateWallet, updatedWallet )
    }
  }
}

function* syncMissingAccounts( ) {
  Toast( 'Syncing Missing Accounts' )
  try{
    const wallet: Wallet = yield select(
      ( state ) => state.storage.wallet
    )
    const accountsState: AccountsState = yield select(
      ( state ) => state.accounts
    )

    const accountsToSweepInfo: newAccountsInfo[] = []
    for( const accountType of Object.keys( wallet.accounts ) ) {
      const createdAccountIds = wallet.accounts[ accountType ]
      const availableAccountIds = []
      for( const account of Object.values( accountsState.accounts ) ){
        if( account.type === accountType ){
          if( createdAccountIds.includes( account.id ) ) availableAccountIds.push( account.id )
        }
      }
      for( const accountId of createdAccountIds ){
        if( !availableAccountIds.includes( accountId ) ){
          // recreate missing account
          const instanceNumber = createdAccountIds.indexOf( accountId )
          accountsToSweepInfo.push( {
            accountType: ( accountType as AccountType ),
            recreationInstanceNumber: instanceNumber
          } )
        }
      }
    }

    Toast( `synching accounts: ${[ ...accountsToSweepInfo.map( ( { accountType, recreationInstanceNumber } ) => accountType + ':' + recreationInstanceNumber ) ]}` )

    if( accountsToSweepInfo.length ){
      // const accountShellsToRecreate: AccountShell[] = []
      const accountsToSweep: Accounts = {
      }

      for ( const { accountType, accountDetails, recreationInstanceNumber } of accountsToSweepInfo ){
        const account: Account | MultiSigAccount | DonationAccount = yield call(
          addNewAccount,
          accountType,
          accountDetails || {
          },
          recreationInstanceNumber
        )

        if( account.type !== AccountType.TEST_ACCOUNT )
        {
          if( ( account as MultiSigAccount ).is2FA ){
            if( ( account as MultiSigAccount ).xpubs.secondary ) accountsToSweep[ account.id ] = account
          } else accountsToSweep[ account.id ] = account
          // const accountShell = yield call( generateShellFromAccount, account )
          // accountShellsToRecreate.push( accountShell )
        }
      }

      const options: { hardRefresh?: boolean, syncDonationAccount?: boolean } = {
        hardRefresh: true
      }
      const { synchedAccounts }: { synchedAccounts: Accounts } = yield call( syncAccountsWorker, {
        payload: {
          accounts: accountsToSweep,
          options,
        }
      } )
      yield put( updateSynchedMissingAccount( synchedAccounts ) )
    }

  } catch( err ){
    Toast( `Failed to sync accounts: ${err}` )
  }
}

export const syncMissingAccountsWatcher = createWatcher(
  syncMissingAccounts,
  SYNC_MISSING_ACCOUNTS,
)

function* sweepMissingAccounts( { payload }: {payload: {address: string, token?: number}} ) {
  Toast( 'Sweeping missing accounts' )
  try{
    const synchedAccounts: Accounts = yield select(
      ( state ) => state.upgrades.synchedMissingAccounts
    )
    for( const account of Object.values( synchedAccounts ) ){
      if( account.balances.confirmed ) {
        const accountsState: AccountsState = yield select(
          ( state ) => state.accounts )
        const averageTxFeeByNetwork = accountsState.averageTxFees[ account.networkType ]
        const txPriority = TxPriority.MEDIUM
        const network = AccountUtilities.getNetworkByType( account.networkType )
        const feePerByte = averageTxFeeByNetwork[ txPriority ].feePerByte

        const { fee } = AccountOperations.calculateSendMaxFee(
          account,
          1,
          feePerByte,
          network
        )

        const recipients: {
            address: string;
            amount: number;
           }[] = [ {
             address: payload.address,
             amount: account.balances.confirmed - fee,
           } ]

        AccountOperations.transferST1( account, recipients, averageTxFeeByNetwork ).then( ( { txPrerequisites } ) => {
          AccountOperations.transferST2( account, txPrerequisites, txPriority, network, recipients, payload.token ).then( ( { txid } )=> {
            Toast( `Sent: ${txid} from ${account.type + ' ' + account.instanceNum}` )
          } )
        } )
      }
    }
  } catch( err ){
    Toast( `Failed to sweep accounts: ${err}` )
  }
}

export const sweepMissingAccountsWatcher = createWatcher(
  sweepMissingAccounts,
  SWEEP_MISSING_ACCOUNTS,
)
