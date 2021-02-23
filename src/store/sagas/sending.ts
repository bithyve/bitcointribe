import { put, call, select } from 'redux-saga/effects'
import { createWatcher, requestTimedout } from '../utils/utilities'
import { CALCULATE_SEND_MAX_FEE, EXECUTE_SEND_STAGE1, sendMaxFeeCalculated, sendStage1Executed } from '../actions/sending'
import BaseAccount from '../../bitcoin/utilities/accounts/BaseAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import AccountShell from '../../common/data/models/AccountShell'
import { AccountsState } from '../reducers/accounts'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces'
import { DerivativeAccountTypes } from '../../bitcoin/utilities/Interface'
import config from '../../bitcoin/HexaConfig'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'

const getBitcoinNetwork  = ( sourceKind: SourceAccountKind ) => {
  const network =
  config.APP_STAGE !== 'dev' &&
  [ SourceAccountKind.REGULAR_ACCOUNT, SourceAccountKind.SECURE_ACCOUNT ].includes( sourceKind )
    ? 'MAINNET'
    : 'TESTNET'

  return network
}

const getDerivativeAccountDetails = ( accountShell: AccountShell ) => {
  let derivativeAccountDetails: {
    type: string;
    number: number;
  }

  switch( accountShell.primarySubAccount.kind ){
      case SubAccountKind.REGULAR_ACCOUNT:
      case SubAccountKind.SECURE_ACCOUNT:
        if( accountShell.primarySubAccount.instanceNumber ){
          derivativeAccountDetails = {
            type: DerivativeAccountTypes.SUB_PRIMARY_ACCOUNT, number: accountShell.primarySubAccount.instanceNumber
          }
        }
        break

      case SubAccountKind.DONATION_ACCOUNT:
        derivativeAccountDetails = {
          type: accountShell.primarySubAccount.kind, number: accountShell.primarySubAccount.instanceNumber
        }
        break

      case SubAccountKind.SERVICE:
        derivativeAccountDetails = {
          type: ( accountShell.primarySubAccount as ExternalServiceSubAccountDescribing ).serviceAccountKind, number: accountShell.primarySubAccount.instanceNumber
        }
        break
  }

  return derivativeAccountDetails
}


function* executeSendStage1( { payload }: {payload: {
  accountShellID: string;
}} ) {
  const { accountShellID } = payload
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const accountShell: AccountShell = accountsState.accountShells
    .find( accountShell => accountShell.id === accountShellID )

  const service: BaseAccount | SecureAccount = accountsState[
    accountShell.primarySubAccount.sourceKind
  ].service

  const averageTxFeeByNetwork = accountsState.averageTxFees[ yield call( getBitcoinNetwork, accountShell.primarySubAccount.sourceKind ) ]
  const derivativeAccountDetails = yield call( getDerivativeAccountDetails, accountShell )

  const res = yield call(
    service.transferST1,
    recipients,
    averageTxFeeByNetwork,
    derivativeAccountDetails
  )
  if ( res.status === 200 )
    yield put( sendStage1Executed( true ) )
  else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    yield put( sendStage1Executed( false ) )
  }
}

export const executeSendStage1Watcher = createWatcher(
  executeSendStage1,
  EXECUTE_SEND_STAGE1
)

function* calculateSendMaxFee( { payload }: {payload: {
  numberOfRecipients: number;
  accountShellID: string;
}} ) {

  const { numberOfRecipients, accountShellID } = payload
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const accountShell: AccountShell = accountsState.accountShells
    .find( accountShell => accountShell.id === accountShellID )

  const service: BaseAccount | SecureAccount = accountsState[
    accountShell.primarySubAccount.sourceKind
  ].service

  const feePerByte = accountsState.averageTxFees[ yield call( getBitcoinNetwork, accountShell.primarySubAccount.sourceKind ) ][ 'low' ].feePerByte
  const derivativeAccountDetails = yield call( getDerivativeAccountDetails, accountShell )

  const { fee } = service.calculateSendMaxFee(
    numberOfRecipients,
    feePerByte,
    derivativeAccountDetails,
  )

  yield put( sendMaxFeeCalculated( fee ) )
}

export const calculateSendMaxFeeWatcher = createWatcher(
  calculateSendMaxFee,
  CALCULATE_SEND_MAX_FEE
)
