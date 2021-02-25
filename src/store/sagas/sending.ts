import { put, call, select } from 'redux-saga/effects'
import { createWatcher, requestTimedout } from '../utils/utilities'
import { CALCULATE_SEND_MAX_FEE, EXECUTE_SEND_STAGE1, EXECUTE_SEND_STAGE2, EXECUTE_SEND_STAGE3, feeIntelMissing, sendMaxFeeCalculated, sendStage1Executed, sendStage2Executed, sendStage3Executed } from '../actions/sending'
import BaseAccount from '../../bitcoin/utilities/accounts/BaseAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import AccountShell from '../../common/data/models/AccountShell'
import { AccountsState } from '../reducers/accounts'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces'
import { DerivativeAccountTypes, TransactionPrerequisite, TrustedContactDerivativeAccountElements } from '../../bitcoin/utilities/Interface'
import config from '../../bitcoin/HexaConfig'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import { REGULAR_ACCOUNT, SECURE_ACCOUNT, SUB_PRIMARY_ACCOUNT, TEST_ACCOUNT, TRUSTED_CONTACTS } from '../../common/constants/wallet-service-types'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { AccountRecipientDescribing, RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import RecipientKind from '../../common/data/enums/RecipientKind'
import { SendingState } from '../reducers/sending'
import idx from 'idx'

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
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const selectedRecipients: RecipientDescribing[] = yield select(
    ( state ) => state.sending.selectedRecipients
  )
  const trustedContactsServices: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service
  )
  const testAccount: TestAccount = accountsState[ TEST_ACCOUNT ].service
  const regularAccount: RegularAccount = accountsState[ REGULAR_ACCOUNT ].service
  const secureAccount: SecureAccount = accountsState[ SECURE_ACCOUNT ].service

  const recipients: [
    {
      id: string;
      address: string;
      amount: number;
      type?: string;
      accountNumber?: number;
    }?
  ]  = []

  selectedRecipients.forEach( ( recipient )=>{
    switch( recipient.kind ){
        case RecipientKind.ADDRESS:
          recipients.push( {
            id: recipient.id,
            address: recipient.id,
            amount: recipient.amount,
          } )
          break

        // TODO: RecipientDescribing should have type and instance/acc number properties
        case RecipientKind.ACCOUNT_SHELL:
          const instanceNumber = ( recipient as AccountRecipientDescribing ).instanceNumber
          let accountKind = recipient.id
          if( instanceNumber && [ REGULAR_ACCOUNT, SECURE_ACCOUNT ].includes( accountKind ) ){
            accountKind = SUB_PRIMARY_ACCOUNT
          }

          recipients.push( {
            id: accountKind,
            address: null,
            amount: recipient.amount,
            type: ( recipient as AccountRecipientDescribing ).sourceAccount,
            accountNumber: instanceNumber,
          } )
          break

        case RecipientKind.CONTACT:
          const contactName = `${recipient.displayedName}`
            .toLowerCase()
            .trim()

          recipients.push( {
            id: contactName,
            address: null,
            amount: recipient.amount,
          } )
          break
    }
  } )

  if( !recipients.length ) throw new Error( 'Recipients missing' )

  const addressedRecipients = []
  for ( const recipient of recipients ) {
    if ( recipient.address ) addressedRecipients.push( recipient )
    // recipient kind: External address
    else {
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

  if( !accountsState.averageTxFees ){
    yield put( feeIntelMissing( {
      intelMissing: true
    } ) )
    return
  }

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
    if ( res.status === 200 ){
      const txPrerequisites: TransactionPrerequisite = res.data.txPrerequisites
      yield put( sendStage1Executed( {
        successful: true, carryOver: {
          txPrerequisites
        }
      } ) )
    }
    else {
      if ( res.err === 'ECONNABORTED' ) requestTimedout()
      yield put( sendStage1Executed( {
        successful: false,
        err: res.err
      } ) )
    }
  } catch ( err ) {
    yield put( sendStage1Executed( {
      successful: false,
      err
    } ) )
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

function* executeSendStage2( { payload }: {payload: {
  accountShellID: string;
  txnPriority: string,
  customTxPrerequisites: any,
  nSequence: number
}} ) {
  const { accountShellID } = payload
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const sending: SendingState = yield select(
    ( state ) => state.sending
  )
  const accountShell: AccountShell = accountsState.accountShells
    .find( accountShell => accountShell.id === accountShellID )

  const service: BaseAccount | SecureAccount = accountsState[
    accountShell.primarySubAccount.sourceKind
  ].service

  const derivativeAccountDetails = yield call( getDerivativeAccountDetails, accountShell )

  const { txPrerequisites } = idx( sending, ( _ ) => _.sendST1.carryOver )
  const { txnPriority, customTxPrerequisites, nSequence } = payload
  if ( !txPrerequisites && !customTxPrerequisites ) {
    console.log( 'Transaction prerequisites missing' )
    return
  }

  const res = yield call(
    service.transferST2,
    txPrerequisites,
    txnPriority,
    customTxPrerequisites,
    derivativeAccountDetails,
    nSequence
  )

  if ( res.status === 200 ) {
    if ( accountShell.primarySubAccount.sourceKind === SECURE_ACCOUNT ) {
      const { txHex, childIndexArray, inputs, derivativeAccountDetails } = res.data
      yield put( sendStage2Executed( {
        successful: true,
        carryOver: {
          txHex, childIndexArray, inputs, derivativeAccountDetails
        }
      }
      ) )
    } else yield put( sendStage2Executed( {
      successful: true,
      txid: res.data.txid
    } ) )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    yield put( sendStage2Executed( {
      successful: false,
      err: res.err
    } ) )
  }
}

export const executeSendStage2Watcher = createWatcher(
  executeSendStage2,
  EXECUTE_SEND_STAGE2
)

function* executeSendStage3Worker( { payload } ) {
  const { accountShellID, token } = payload
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const sending: SendingState = yield select(
    ( state ) => state.sending
  )
  const accountShell: AccountShell = accountsState.accountShells
    .find( accountShell => accountShell.id === accountShellID )

  const service: BaseAccount | SecureAccount = accountsState[
    accountShell.primarySubAccount.sourceKind
  ].service

  if ( accountShell.primarySubAccount.sourceKind !== SECURE_ACCOUNT ) {
    throw new Error( 'ST3 cannot be executed for a non-2FA account' )
  }

  const { txHex, childIndexArray, inputs, derivativeAccountDetails } = idx( sending, ( _ ) => _.sendST2.carryOver )
  if ( !txHex || !childIndexArray || !inputs ) {
    console.log( 'TxHex/child-index/inputs missing' )
  }

  const res = yield call( ( service as SecureAccount ).transferST3, token, txHex, childIndexArray, inputs, derivativeAccountDetails )
  if ( res.status === 200 ) {
    yield put( sendStage3Executed( {
      successful: true, txid: res.data.txid
    } ) )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    yield put( sendStage3Executed( {
      successful: false, err: res.err
    } ) )
  }
}

export const executeSendStage3Watcher = createWatcher(
  executeSendStage3Worker,
  EXECUTE_SEND_STAGE3
)
