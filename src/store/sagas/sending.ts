import { put, call, select } from 'redux-saga/effects'
import { createWatcher, requestTimedout } from '../utils/utilities'
import { CALCULATE_SEND_MAX_FEE, EXECUTE_SEND_STAGE1, sendMaxFeeCalculated, sendStage1Executed } from '../actions/sending'
import BaseAccount from '../../bitcoin/utilities/accounts/BaseAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import AccountShell from '../../common/data/models/AccountShell'
import { AccountsState } from '../reducers/accounts'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces'
import { DerivativeAccountTypes, TrustedContactDerivativeAccountElements } from '../../bitcoin/utilities/Interface'
import config from '../../bitcoin/HexaConfig'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import { REGULAR_ACCOUNT, SECURE_ACCOUNT, TEST_ACCOUNT, TRUSTED_CONTACTS } from '../../common/constants/wallet-service-types'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'

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


function* processRecipients( accountShell: AccountShell ){

  // TODO: fetch and pre-process recipients
  const recipients: [
    {
      id: string;
      address: string;
      amount: number;
      type?: string;
      accountNumber?: number;
    }?
  ]  = []

  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const trustedContactsServices: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service
  )
  const testAccount: TestAccount = accountsState[ TEST_ACCOUNT ].service
  const regularAccount: RegularAccount = accountsState[ REGULAR_ACCOUNT ].service
  const secureAccount: SecureAccount = accountsState[ SECURE_ACCOUNT ].service

  const addressedRecipients = []
  for ( const recipient of recipients ) {
    if ( recipient.address ) addressedRecipients.push( recipient )
    // recipient kind: External address
    else {
      if ( !recipient.id ) throw new Error( 'Invalid recipient' )
      if (
        recipient.id === REGULAR_ACCOUNT ||
        recipient.id === SECURE_ACCOUNT ||
        config.EJECTED_ACCOUNTS.includes( recipient.id )
      ) {
        // recipient kind: Hexa Account
        const subInstance =
          recipient.type === REGULAR_ACCOUNT
            ? regularAccount.hdWallet
            : secureAccount.secureHDWallet

        let receivingAddress
        if ( config.EJECTED_ACCOUNTS.includes( recipient.id ) )
          receivingAddress = yield call( subInstance.getReceivingAddress,
            recipient.id,
            recipient.accountNumber
          )
        else receivingAddress = yield call( subInstance.getReceivingAddress )

        if ( !receivingAddress )
          throw new Error(
            `Failed to generate receiving address for recipient: ${recipient.id}`
          )

        recipient.address = receivingAddress
        addressedRecipients.push( recipient )
      } else {
        // recipient kind: Trusted Contact
        const contactName = recipient.id
        let res
        const accountNumber =
          regularAccount.hdWallet.trustedContactToDA[
            contactName.toLowerCase().trim()
          ]
        if ( accountNumber ) {
          const { contactDetails } = regularAccount.hdWallet.derivativeAccounts[
            TRUSTED_CONTACTS
          ][ accountNumber ] as TrustedContactDerivativeAccountElements

          if ( accountShell.primarySubAccount.sourceKind !== TEST_ACCOUNT ) {
            if ( contactDetails && contactDetails.xpub ) res = yield call( regularAccount.getDerivativeAccAddress, TRUSTED_CONTACTS, null, contactName )
            else {
              const { trustedAddress, } = trustedContactsServices.tc.trustedContacts[
                contactName.toLowerCase().trim()
              ]
              if ( trustedAddress )
                res = {
                  status: 200, data: {
                    address: trustedAddress
                  }
                }
              else
                throw new Error( 'Failed fetch contact address, xpub missing' )
            }
          } else {
            if ( contactDetails && contactDetails.tpub ) res = yield call( testAccount.deriveReceivingAddress, contactDetails.tpub )
            else {
              const { trustedTestAddress } = trustedContactsServices.tc.trustedContacts[
                contactName.toLowerCase().trim()
              ]
              if ( trustedTestAddress )
                res = {
                  status: 200, data: {
                    address: trustedTestAddress
                  }
                }
              else
                throw new Error(
                  'Failed fetch contact testnet address, tpub missing'
                )
            }
          }
        } else {
          throw new Error(
            'Failed fetch testnet address, accountNumber missing'
          )
        }

        // console.log( { res } )
        if ( res.status === 200 ) {
          const receivingAddress = res.data.address
          recipient.address = receivingAddress
          addressedRecipients.push( recipient )
        } else {
          throw new Error(
            `Failed to generate receiving address for recipient: ${recipient.id}`
          )
        }
      }
    }
  }

  return addressedRecipients
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

  try {
    const recipients = yield call( processRecipients, accountShell )

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
  } catch ( err ) {
    yield put( sendStage1Executed( false ) )
    return
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
