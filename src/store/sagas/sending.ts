import { put, select } from 'redux-saga/effects'
import { createWatcher } from '../utils/utilities'
import { CALCULATE_SEND_MAX_FEE, sendMaxFeeCalculated } from '../actions/sending'
import BaseAccount from '../../bitcoin/utilities/accounts/BaseAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import AccountShell from '../../common/data/models/AccountShell'
import { AccountsState } from '../reducers/accounts'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces'
import { DerivativeAccountTypes } from '../../bitcoin/utilities/Interface'
import config from '../../bitcoin/HexaConfig'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'

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

  const network =
  config.APP_STAGE !== 'dev' &&
  [ SourceAccountKind.REGULAR_ACCOUNT, SourceAccountKind.SECURE_ACCOUNT ].includes( accountShell.primarySubAccount.sourceKind )
    ? 'MAINNET'
    : 'TESTNET'

  const feePerByte = accountsState.averageTxFees[ network ][ 'low' ].feePerByte

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
