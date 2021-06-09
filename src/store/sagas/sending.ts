import { put, call, select } from 'redux-saga/effects'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createWatcher, requestTimedout } from '../utils/utilities'
import { alternateSendStage2Executed, CALCULATE_CUSTOM_FEE, CALCULATE_SEND_MAX_FEE, customFeeCalculated, customSendMaxUpdated, EXECUTE_ALTERNATE_SEND_STAGE2, EXECUTE_SEND_STAGE1, EXECUTE_SEND_STAGE2, EXECUTE_SEND_STAGE3, feeIntelMissing, sendMaxFeeCalculated, sendStage1Executed, sendStage2Executed, sendStage3Executed, SEND_DONATION_NOTE, SEND_TX_NOTIFICATION } from '../actions/sending'
import BaseAccount from '../../bitcoin/utilities/accounts/BaseAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import AccountShell from '../../common/data/models/AccountShell'
import { AccountsState } from '../reducers/accounts'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces'
import { Contacts, DerivativeAccountTypes, INotification, notificationTag, notificationType, TransactionPrerequisite, TrustedContactDerivativeAccountElements } from '../../bitcoin/utilities/Interface'
import config from '../../bitcoin/HexaConfig'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import { REGULAR_ACCOUNT, SECURE_ACCOUNT, SUB_PRIMARY_ACCOUNT } from '../../common/constants/wallet-service-types'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { AccountRecipientDescribing, ContactRecipientDescribing, RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import RecipientKind from '../../common/data/enums/RecipientKind'
import { SendingState } from '../reducers/sending'
import idx from 'idx'
import RelayServices from '../../bitcoin/services/RelayService'
import { createRandomString } from '../../common/CommonFunctions/timeFormatter'
import moment from 'moment'

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
  const regularAccount: RegularAccount = accountsState[ REGULAR_ACCOUNT ].service
  const secureAccount: SecureAccount = accountsState[ SECURE_ACCOUNT ].service
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )

  const recipients: [
    {
      id: string;
      address: string;
      amount: number;
      type?: string;
      accountNumber?: number;
    }?
  ]  = []

  for( const recipient of selectedRecipients ){
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
          let accountKind =  ( ( recipient as AccountRecipientDescribing ).type as string )
          const serviceType = ( ( recipient as AccountRecipientDescribing ).serviceType as string )
          if( serviceType ) accountKind = serviceType

          if( instanceNumber && [ REGULAR_ACCOUNT, SECURE_ACCOUNT ].includes( accountKind ) ){
            accountKind = SUB_PRIMARY_ACCOUNT
          }

          const sourceAccount = ( recipient as AccountRecipientDescribing ).sourceAccount
          const subInstance =
        sourceAccount === REGULAR_ACCOUNT
          ? regularAccount.hdWallet
          : secureAccount.secureHDWallet

          let receivingAddress
          if ( config.EJECTED_ACCOUNTS.includes( accountKind ) )
            receivingAddress = subInstance.getReceivingAddress(
              accountKind,
              instanceNumber
            )
          else receivingAddress = subInstance.getReceivingAddress()


          recipients.push( {
            id: accountKind,
            address: receivingAddress,
            amount: recipient.amount,
            type: sourceAccount,
            accountNumber: instanceNumber,
          } )
          break

        case RecipientKind.CONTACT:
          const contact = trustedContacts.tc.trustedContacts[ ( recipient as ContactRecipientDescribing ).channelKey ]
          const paymentAddresses = idx( contact, ( _ ) => _.unencryptedPermanentChannel[ contact.streamId ].primaryData.paymentAddresses )
          if( !paymentAddresses ) throw new Error( `Payment addresses missing for: ${recipient.displayedName}` )

          let paymentAddress
          switch( accountShell.primarySubAccount.sourceKind ){
              case SourceAccountKind.TEST_ACCOUNT:
                paymentAddress = paymentAddresses[ SubAccountKind.TEST_ACCOUNT ]
                break

              default:
                paymentAddress = paymentAddresses[ SubAccountKind.TRUSTED_CONTACTS ]
          }
          if( !paymentAddress ) throw new Error( `Payment address missing for: ${recipient.displayedName}` )

          SubAccountKind.TRUSTED_CONTACTS
          recipients.push( {
            id: recipient.id,
            address: paymentAddress,
            amount: recipient.amount,
          } )
          break
    }
  }

  if( !recipients.length ) throw new Error( 'Recipients missing' )
  return recipients
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

function* executeSendStage2( { payload }: {payload: {
  accountShellID: string;
  txnPriority: string,
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

  const txPrerequisites = idx( sending, ( _ ) => _.sendST1.carryOver.txPrerequisites )
  const customTxPrerequisites = idx( sending, ( _ ) => _.customPriorityST1.carryOver.customTxPrerequisites )

  const { txnPriority } = payload

  const res = yield call(
    service.transferST2,
    txPrerequisites,
    txnPriority,
    customTxPrerequisites,
    derivativeAccountDetails,
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

function* executeAlternateSendStage2Worker( { payload }: {payload: {
  accountShellID: string;
  txnPriority: string,
  }} ) {

  const {
    accountShellID,
    txnPriority,
  } = payload

  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const sending: SendingState = yield select(
    ( state ) => state.sending
  )
  const accountShell: AccountShell = accountsState.accountShells
    .find( accountShell => accountShell.id === accountShellID )

  const service: SecureAccount = accountsState[
    accountShell.primarySubAccount.sourceKind
  ].service

  if ( accountShell.primarySubAccount.sourceKind !== SECURE_ACCOUNT ) {
    throw new Error( 'ST3 cannot be executed for a non-2FA account' )
  }

  const txPrerequisites = idx( sending, ( _ ) => _.sendST1.carryOver.txPrerequisites )
  const customTxPrerequisites = idx( sending, ( _ ) => _.customPriorityST1.carryOver.customTxPrerequisites )
  const derivativeAccountDetails = yield call( getDerivativeAccountDetails, accountShell )

  const res = yield call(
    service.alternateTransferST2,
    txPrerequisites,
    txnPriority,
    customTxPrerequisites,
    derivativeAccountDetails,
  )
  if ( res.status === 200 ) {
    yield put( alternateSendStage2Executed( {
      successful: true, txid: res.data.txid
    } ) )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    yield put( alternateSendStage2Executed( {
      successful: false, err: res.err
    } ) )
  }
}

export const executeAlternateSendStage2Watcher = createWatcher(
  executeAlternateSendStage2Worker,
  EXECUTE_ALTERNATE_SEND_STAGE2
)

function* executeSendStage3Worker( { payload }: {payload: {accountShellID: string, token: number}} ) {
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

  const carryOver =  idx( sending, ( _ ) => _.sendST2.carryOver )
  const { txHex, childIndexArray, inputs, derivativeAccountDetails } = carryOver

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


function* calculateCustomFee( { payload }: {payload: {
  accountShellID: string,
  feePerByte: string,
  customEstimatedBlocks: string,
}} ) {

  // feerate should be > minimum relay feerate(default: 1000 satoshis per kB or 1 sat/byte).
  if ( parseInt( payload.feePerByte ) < 1 ) {
    yield put ( customFeeCalculated( {
      successful: false,
      carryOver:{
        customTxPrerequisites: null
      },
      err: 'Custom fee minimum: 1 sat/byte',
    } ) )
    return
  }

  const { accountShellID, feePerByte, customEstimatedBlocks } = payload
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const sendingState: SendingState = yield select(
    ( state ) => state.sending
  )

  const accountShell: AccountShell = accountsState.accountShells
    .find( accountShell => accountShell.id === accountShellID )

  const service: BaseAccount | SecureAccount = accountsState[
    accountShell.primarySubAccount.sourceKind
  ].service

  const selectedRecipients: RecipientDescribing[] = [ ...sendingState.selectedRecipients
  ]
  const derivativeAccountDetails = yield call( getDerivativeAccountDetails, accountShell )
  const txPrerequisites = idx( sendingState, ( _ ) => _.sendST1.carryOver.txPrerequisites )

  let outputs
  if( sendingState.feeIntelMissing ){
    // process recipients & generate outputs(normally handled by transfer ST1 saga)
    const recipients = yield call( processRecipients, accountShell )
    const outputsArray = []
    for ( const recipient of recipients ) {
      outputsArray.push( {
        address: recipient.address,
        value: Math.round( recipient.amount ),
      } )
    }
    outputs = outputsArray
  } else {
    if( !txPrerequisites ) throw new Error( 'ST1 carry-over missing' )
    outputs = txPrerequisites[ 'low' ].outputs.filter(
      ( output ) => output.address,
    )
  }

  if( !sendingState.feeIntelMissing && sendingState.sendMaxFee ){
    // custom fee w/ send max
    const { fee } = service.calculateSendMaxFee(
      selectedRecipients.length,
      parseInt( feePerByte ),
      derivativeAccountDetails,
    )

    // upper bound: default low
    if( fee > txPrerequisites[ 'low' ].fee ){
      yield put ( customFeeCalculated( {
        successful: false,
        carryOver:{
          customTxPrerequisites: null
        },
        err: 'Custom fee cannot be greater than the default low priority fee',
      } ) )
      return
    }

    const recipients: [
      {
        id: string;
        address: string;
        amount: number;
        type?: string;
        accountNumber?: number;
      }
    ] = yield call( processRecipients, accountShell )
    const recipientToBeModified = recipients[ recipients.length - 1 ]

    // deduct the previous(default low) fee and add the custom fee
    // TODO: recapture custom fee from sending reducer

    const customFee = idx( sendingState, ( _ ) => _.customPriorityST1.carryOver.customTxPrerequisites.fee )
    if( customFee ) recipientToBeModified.amount += customFee // reusing custom-fee feature
    else recipientToBeModified.amount += txPrerequisites[ 'low' ].fee
    recipientToBeModified.amount -= fee
    recipients[ recipients.length - 1 ] = recipientToBeModified

    outputs.forEach( ( output )=>{
      if( output.address === recipientToBeModified.address )
        output.value = recipientToBeModified.amount
    } )

    selectedRecipients.forEach( ( recipient ) => {
      if( recipient.id === recipientToBeModified.id ) recipient.amount = recipientToBeModified.amount
    } )

    yield put ( customSendMaxUpdated( {
      recipients: selectedRecipients
    } ) )
  }

  const customTxPrerequisites = service.calculateCustomFee(
    outputs,
    parseInt( feePerByte ),
    derivativeAccountDetails,
  )

  if ( customTxPrerequisites.inputs ) {
    customTxPrerequisites.estimatedBlocks = parseInt( customEstimatedBlocks )
    yield put ( customFeeCalculated( {
      successful: true,
      carryOver:{
        customTxPrerequisites
      },
      err: null
    } ) )
  } else {
    let totalAmount  = 0
    outputs.forEach( ( output )=>{
      totalAmount += output.value
    } )
    yield put ( customFeeCalculated( {
      successful: false,
      carryOver:{
        customTxPrerequisites: null
      },
      err: `Insufficient balance to pay: amount ${totalAmount} + fee(${customTxPrerequisites.fee}) at ${feePerByte} sats/byte`,
    } ) )
  }

}

export const calculateCustomFeeWatcher = createWatcher(
  calculateCustomFee,
  CALCULATE_CUSTOM_FEE
)

async function updateTrustedContactTxHistory( selectedContacts ) {
  let IMKeeperOfHistory = JSON.parse(
    await AsyncStorage.getItem( 'IMKeeperOfHistory' ),
  )
  let OtherTrustedContactsHistory = JSON.parse(
    await AsyncStorage.getItem( 'OtherTrustedContactsHistory' ),
  )

  selectedContacts.forEach( async ( contact )=>{
    const txHistory = {
      id: createRandomString( 36 ),
      title: 'Sent Amount',
      date: moment( Date.now() ).valueOf(),
      info: '',
      selectedContactInfo: contact,
    }

    if ( contact.isWard ) {
      if ( !IMKeeperOfHistory ) IMKeeperOfHistory = []
      IMKeeperOfHistory.push( txHistory )
      await AsyncStorage.setItem(
        'IMKeeperOfHistory',
        JSON.stringify( IMKeeperOfHistory ),
      )
    }
    if (
      !contact.isWard &&
      !contact.isGuardian
    ) {
      if ( !OtherTrustedContactsHistory ) OtherTrustedContactsHistory = []
      OtherTrustedContactsHistory.push( txHistory )
      await AsyncStorage.setItem(
        'OtherTrustedContactsHistory',
        JSON.stringify( OtherTrustedContactsHistory ),
      )
    }
  } )
}

function* sendTxNotificationWorker() {
  const sendingState: SendingState = yield select( ( state ) => state.sending )
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const { walletName } = yield select(
    ( state ) => state.storage.database.WALLET_SETUP,
  )

  const { selectedRecipients } = sendingState
  const contacts: Contacts = trustedContacts.tc.trustedContacts

  const notifReceivers = []
  const selectedContacts = []
  selectedRecipients.forEach( ( recipient ) => {
    if ( recipient.displayedName ) { // send notification to TC
      const contactName = recipient.displayedName.toLowerCase().trim()
      const contact = contacts[ contactName ]
      if ( contact && contact.walletID ){
        selectedContacts.push( contact )
        notifReceivers.push( {
          walletId: contact.walletID,
          FCMs: contact.FCMs,
        } )
      }
    }
  } )

  const notification: INotification = {
    notificationType: notificationType.contact,
    title: 'Friends and Family notification',
    body: `You have a new transaction from ${walletName}`,
    data: {
    },
    tag: notificationTag.IMP,
  }

  if( notifReceivers.length )
    yield call(
      RelayServices.sendNotifications,
      notifReceivers,
      notification,
    )

  // update selected contacts' send history
  if( selectedContacts.length )
    yield call ( updateTrustedContactTxHistory, selectedContacts )
}

export const sendTxNotificationWatcher = createWatcher(
  sendTxNotificationWorker,
  SEND_TX_NOTIFICATION,
)
