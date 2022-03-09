import { put, call, select } from 'redux-saga/effects'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createWatcher } from '../utils/utilities'
import {  CALCULATE_CUSTOM_FEE, CALCULATE_SEND_MAX_FEE, customFeeCalculated, customSendMaxUpdated, EXECUTE_SEND_STAGE1, EXECUTE_SEND_STAGE2, feeIntelMissing, sendMaxFeeCalculated, sendStage1Executed, sendStage2Executed, SEND_TX_NOTIFICATION } from '../actions/sending'
import AccountShell from '../../common/data/models/AccountShell'
import { AccountsState } from '../reducers/accounts'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { Account, AccountType, ActiveAddressAssignee, INotification, notificationTag, notificationType, Trusted_Contacts, TxPriority } from '../../bitcoin/utilities/Interface'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import { ContactRecipientDescribing, RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import RecipientKind from '../../common/data/enums/RecipientKind'
import { SendingState } from '../reducers/sending'
import idx from 'idx'
import { createRandomString } from '../../common/CommonFunctions/timeFormatter'
import moment from 'moment'
import AccountOperations from '../../bitcoin/utilities/accounts/AccountOperations'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import { updateAccountShells } from '../actions/accounts'
import dbManager from '../../storage/realm/dbManager'
import Relay from '../../bitcoin/utilities/Relay'
import { getNextFreeAddressWorker } from './accounts'

function* processRecipients( accountShell: AccountShell ){
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const accountShells = accountsState.accountShells
  const selectedRecipients: RecipientDescribing[] = yield select(
    ( state ) => state.sending.selectedRecipients
  )

  const trustedContacts: Trusted_Contacts = yield select(
    ( state ) => state.trustedContacts.contacts,
  )

  const recipients:
    {
      id?: string,
      address: string;
      amount: number;
      name?: string
    }[]  = []

  for( const recipient of selectedRecipients ){
    switch( recipient.kind ){
        case RecipientKind.ADDRESS:
          recipients.push( {
            address: recipient.id,
            amount: recipient.amount,
          } )
          break

        case RecipientKind.ACCOUNT_SHELL:
          const recipientShell = accountShells.find( ( shell ) => shell.id === recipient.id )
          const recipientAccount: Account = accountsState.accounts[ recipientShell.primarySubAccount.id  ]
          const assigneeInfo: ActiveAddressAssignee = {
            type: accountShell.primarySubAccount.type,
            id: accountShell.primarySubAccount.id,
            senderInfo: {
              name: accountShell.primarySubAccount.customDisplayName
            },
          }
          const recipientAddress = yield call( getNextFreeAddressWorker, recipientAccount, assigneeInfo )
          recipients.push( {
            address: recipientAddress,
            amount: recipient.amount,
            name: recipientShell.primarySubAccount.customDisplayName
          } )

          break

        case RecipientKind.CONTACT:
          const contact = trustedContacts[ ( recipient as ContactRecipientDescribing ).channelKey ]
          const paymentAddresses = idx( contact, ( _ ) => _.unencryptedPermanentChannel[ contact.streamId ].primaryData.paymentAddresses )

          if( !paymentAddresses ) throw new Error( `Payment addresses missing for: ${recipient.displayedName}` )

          let paymentAddress
          switch( accountShell.primarySubAccount.sourceKind ){
              case SourceAccountKind.TEST_ACCOUNT:
                paymentAddress = paymentAddresses[ AccountType.TEST_ACCOUNT ]
                break

              default:
                paymentAddress = paymentAddresses[ AccountType.CHECKING_ACCOUNT ]
          }
          if( !paymentAddress ) throw new Error( `Payment address missing for: ${recipient.displayedName}` )

          recipients.push( {
            id: contact.channelKey,
            address: paymentAddress,
            amount: recipient.amount,
            name: contact.contactDetails.contactName || idx( contact, ( _ ) => _.unencryptedPermanentChannel[ contact.streamId ].primaryData.walletName ),
          } )
          break
    }
  }

  if( !recipients.length ) throw new Error( 'Recipients missing' )
  return recipients
}


function* executeSendStage1( { payload }: {payload: {
  accountShell: AccountShell;
}} ) {
  const { accountShell } = payload
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts )
  const account: Account = accountsState.accounts[ accountShell.primarySubAccount.id ]

  if( !accountsState.averageTxFees ){
    yield put( feeIntelMissing( {
      intelMissing: true
    } ) )
    return
  }

  const averageTxFeeByNetwork = accountsState.averageTxFees[ account.networkType ]

  try {
    const recipients = yield call( processRecipients, accountShell )
    const { txPrerequisites } = yield call( AccountOperations.transferST1, account, recipients, averageTxFeeByNetwork )

    if ( txPrerequisites )
      yield put( sendStage1Executed( {
        successful: true, carryOver: {
          txPrerequisites,
          recipients
        }
      } ) )
    else
      yield put( sendStage1Executed( {
        successful: false,
        err: 'Send failed: unable to generate tx pre-requisite'
      } ) )
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
  accountShell: AccountShell;
  txnPriority: TxPriority,
  token?: number,
  note?: string,
}} ) {
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const sending: SendingState = yield select(
    ( state ) => state.sending
  )

  const { accountShell, txnPriority, token, note } = payload
  const account: Account = accountsState.accounts[ accountShell.primarySubAccount.id ]

  const txPrerequisites = idx( sending, ( _ ) => _.sendST1.carryOver.txPrerequisites )
  const recipients = idx( sending, ( _ ) => _.sendST1.carryOver.recipients )

  const customTxPrerequisites = idx( sending, ( _ ) => _.customPriorityST1.carryOver.customTxPrerequisites )
  const network = AccountUtilities.getNetworkByType( account.networkType )

  try {
    const { txid } = yield call( AccountOperations.transferST2, account, txPrerequisites, txnPriority, network, recipients, token, customTxPrerequisites )

    if ( txid ){
      yield put( sendStage2Executed( {
        successful: true,
        txid,
      } ) )

      if( note ){
        account.transactionsNote[ txid ] = note
        if( account.type === AccountType.DONATION_ACCOUNT ) Relay.sendDonationNote( account.id.slice( 0, 15 ), {
          txId: txid, note
        } )
      }

      const accounts = {
        [ account.id ]: account
      }
      yield put( updateAccountShells( {
        accounts
      } ) )
      // const tempDB = JSON.parse( yield call ( AsyncStorage.getItem, 'tempDB' ) )
      // tempDB.accounts[ account.id ] = account
      // yield call ( AsyncStorage.setItem, 'tempDB', JSON.stringify( tempDB ) )
      yield call( dbManager.updateAccount, account.id, account )
    } else
      yield put( sendStage2Executed( {
        successful: false,
        err: 'Send failed: unable to generate txid'
      } ) )
  } catch( err ){
    yield put( sendStage2Executed( {
      successful: false,
      err: 'Send failed: ' + err.message
    } ) )
  }
}

export const executeSendStage2Watcher = createWatcher(
  executeSendStage2,
  EXECUTE_SEND_STAGE2
)

function* calculateSendMaxFee( { payload }: {payload: {
  numberOfRecipients: number;
  accountShell: AccountShell;
}} ) {
  const { numberOfRecipients, accountShell } = payload
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const account: Account = accountsState.accounts[ accountShell.primarySubAccount.id ]
  const averageTxFeeByNetwork = accountsState.averageTxFees[ account.networkType ]
  const feePerByte = averageTxFeeByNetwork[ TxPriority.LOW ].feePerByte
  const network = AccountUtilities.getNetworkByType( account.networkType )

  const { fee } = AccountOperations.calculateSendMaxFee(
    account,
    numberOfRecipients,
    feePerByte,
    network
  )

  yield put( sendMaxFeeCalculated( fee ) )
}

export const calculateSendMaxFeeWatcher = createWatcher(
  calculateSendMaxFee,
  CALCULATE_SEND_MAX_FEE
)


function* calculateCustomFee( { payload }: {payload: {
  accountShell: AccountShell,
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

  const { accountShell, feePerByte, customEstimatedBlocks }  = payload
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const account: Account = accountsState.accounts[ accountShell.primarySubAccount.id ]
  const network = AccountUtilities.getNetworkByType( account.networkType )

  const sendingState: SendingState = yield select(
    ( state ) => state.sending
  )
  const selectedRecipients: RecipientDescribing[] = [ ...sendingState.selectedRecipients ]
  const numberOfRecipients = selectedRecipients.length
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
    outputs = txPrerequisites[ TxPriority.LOW ].outputs.filter(
      ( output ) => output.address,
    )
  }

  if( !sendingState.feeIntelMissing && sendingState.sendMaxFee ){
    // custom fee w/ send max
    const { fee } = AccountOperations.calculateSendMaxFee(
      account,
      numberOfRecipients,
      parseInt( feePerByte ),
      network
    )

    // upper bound: default low
    if( fee > txPrerequisites[ TxPriority.LOW ].fee ){
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
        address: string;
        amount: number;
      }
    ] = yield call( processRecipients, accountShell )
    const recipientToBeModified = recipients[ recipients.length - 1 ]

    // deduct the previous(default low) fee and add the custom fee
    const customFee = idx( sendingState, ( _ ) => _.customPriorityST1.carryOver.customTxPrerequisites.fee )
    if( customFee ) recipientToBeModified.amount += customFee // reusing custom-fee feature
    else recipientToBeModified.amount += txPrerequisites[ TxPriority.LOW ].fee
    recipientToBeModified.amount -= fee
    recipients[ recipients.length - 1 ] = recipientToBeModified

    outputs.forEach( ( output )=>{
      if( output.address === recipientToBeModified.address )
        output.value = recipientToBeModified.amount
    } )

    selectedRecipients[ selectedRecipients.length - 1 ].amount = recipientToBeModified.amount
    yield put ( customSendMaxUpdated( {
      recipients: selectedRecipients
    } ) )
  }

  const customTxPrerequisites = AccountOperations.prepareCustomTransactionPrerequisites(
    account,
    outputs,
    parseInt( feePerByte ),
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

function* sendTxNotificationWorker( { payload } ) {
  const { txid } = payload
  const sendingState: SendingState = yield select( ( state ) => state.sending )
  const trustedContacts: Trusted_Contacts = yield select(
    ( state ) => state.trustedContacts.contacts,
  )
  const { walletName } = yield select(
    ( state ) => state.storage.wallet,
  )

  const { selectedRecipients } = sendingState

  const notifReceivers = []
  const selectedContacts = []
  selectedRecipients.forEach( ( recipient ) => {
    if ( recipient.kind === RecipientKind.CONTACT ) { // send notification to TC
      const channelKey = ( recipient as ContactRecipientDescribing ).channelKey
      const contact = trustedContacts[ channelKey ]
      if ( contact && contact.walletID ){
        selectedContacts.push( contact )
        notifReceivers.push( {
          walletId: contact.walletID,
          FCMs: [ idx( contact, ( _ ) => _.unencryptedPermanentChannel[ contact.streamId ].primaryData.FCM ) ],
        } )
      }
    }
  } )

  const notification: INotification = {
    notificationType: notificationType.contact,
    title: 'Friends & Family notification',
    body: `You have a new transaction from ${walletName}`,
    data: {
      txid
    },
    tag: notificationTag.IMP,
  }

  if( notifReceivers.length )
    yield call(
      Relay.sendNotifications,
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
