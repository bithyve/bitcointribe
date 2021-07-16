import { call, put, select } from 'redux-saga/effects'
import {
  REMOVE_TRUSTED_CONTACT,
  WALLET_CHECK_IN,
  SYNC_PERMANENT_CHANNELS,
  syncPermanentChannels,
  INITIALIZE_TRUSTED_CONTACT,
  existingPermanentChannelsSynched,
  InitTrustedContactFlowKind,
  PermanentChannelsSyncKind,
  REJECT_TRUSTED_CONTACT,
  updateTrustedContacts,
  EDIT_TRUSTED_CONTACT,
} from '../actions/trustedContacts'
import { createWatcher } from '../utils/utilities'
import {
  UnecryptedStreamData,
  PrimaryStreamData,
  TrustedContactRelationTypes,
  SecondaryStreamData,
  BackupStreamData,
  ContactInfo,
  ContactDetails,
  TrustedContact,
  ChannelAssets,
  INotification,
  notificationType,
  Trusted_Contacts,
  notificationTag,
  Wallet,
  Accounts,
  AccountType,
} from '../../bitcoin/utilities/Interface'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
//import { calculateOverallHealth, downloadMShare } from '../actions/sss'
import {
  REGULAR_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import SSS from '../../bitcoin/utilities/sss/SSS'
import Toast from '../../components/Toast'
import DeviceInfo from 'react-native-device-info'
import {  exchangeRatesCalculated, setAverageTxFee } from '../actions/accounts'
import { AccountsState } from '../reducers/accounts'
import config from '../../bitcoin/HexaConfig'
import idx from 'idx'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import dbManager from '../../storage/realm/dbManager'
import { ImageSourcePropType } from 'react-native'
import Relay from '../../bitcoin/utilities/Relay'

function* syncPermanentChannelsWorker( { payload }: {payload: { permanentChannelsSyncKind: PermanentChannelsSyncKind, channelUpdates?: { contactInfo: ContactInfo, streamUpdates?: UnecryptedStreamData }[], metaSync?: boolean, hardSync?: boolean, skipDatabaseUpdate?: boolean }} ) {
  const trustedContacts: Trusted_Contacts = yield select(
    ( state ) => state.trustedContacts.contacts,
  )
  const wallet: Wallet = yield select(
    ( state ) => state.storage.wallet,
  )

  const { walletId } = wallet
  const streamId = TrustedContactsOperations.getStreamId( walletId )

  const channelSyncUpdates: {
    channelKey: string,
    streamId: string,
    contact?: TrustedContact,
    contactDetails?: ContactDetails,
    secondaryChannelKey?: string,
    unEncryptedOutstreamUpdates?: UnecryptedStreamData,
    contactsSecondaryChannelKey?: string,
    metaSync?: boolean,
  }[] = []
  let flowKind: InitTrustedContactFlowKind // todo
  let contactIdentifier: string

  const { permanentChannelsSyncKind, channelUpdates, metaSync, hardSync } = payload

  switch( permanentChannelsSyncKind ){
      case PermanentChannelsSyncKind.SUPPLIED_CONTACTS:
        if( !channelUpdates.length ) throw new Error( 'Sync permanent channels failed: supplied channel updates missing' )
        for( const { contactInfo, streamUpdates } of channelUpdates ){
          const contact = trustedContacts[ contactInfo.channelKey ]
          if( contact )
            if( !contact.isActive || ( !streamUpdates && !contact.hasNewData && !hardSync ) )
              continue

          channelSyncUpdates.push( {
            contactDetails: contactInfo.contactDetails,
            channelKey: contactInfo.channelKey,
            contact,
            streamId: streamId,
            secondaryChannelKey: contactInfo.secondaryChannelKey,
            unEncryptedOutstreamUpdates: streamUpdates,
            contactsSecondaryChannelKey: contactInfo.contactsSecondaryChannelKey,
            metaSync
          } )
          flowKind = contactInfo.flowKind
          contactIdentifier = contactInfo.channelKey
        }
        break

      case PermanentChannelsSyncKind.EXISTING_CONTACTS:
        if( !Object.keys( trustedContacts ).length ) {
          yield put ( existingPermanentChannelsSynched( {
            successful: true
          } ) )
          return
        }

        Object.keys( trustedContacts ).forEach( channelKey => {
          const contact: TrustedContact = trustedContacts[ channelKey ]
          if( contact.isActive ){
            if( metaSync || contact.hasNewData || hardSync )
              channelSyncUpdates.push( {
                channelKey: channelKey,
                streamId,
                contact,
                metaSync
              } )
          }
        } )
        break

      case PermanentChannelsSyncKind.NON_FINALIZED_CONTACTS:
        if( !Object.keys( trustedContacts ).length ) {
          yield put ( existingPermanentChannelsSynched( {
            successful: true
          } ) )
          return
        }

        Object.keys( trustedContacts ).forEach( channelKey => {
          const contact: TrustedContact = trustedContacts[ channelKey ]
          const instream = useStreamFromContact( contact, walletId, true )
          if( contact.isActive && !instream )
            channelSyncUpdates.push( {
              channelKey: channelKey,
              streamId,
              contact,
            } )
        } )
        break
  }

  if( !channelSyncUpdates.length ) {
    console.log( 'Exiting sync: no channels to update' )
    return
  }

  try {
    const { updated, updatedContacts }: {
      updated: boolean;
      updatedContacts: Trusted_Contacts
    } = yield call(
      TrustedContactsOperations.syncPermanentChannels,
      channelSyncUpdates
    )

    if ( updated ) {
      const { skipDatabaseUpdate }  = payload
      if( skipDatabaseUpdate ){
        if( flowKind === InitTrustedContactFlowKind.REJECT_TRUSTED_CONTACT ){
          const temporaryContact = updatedContacts[ contactIdentifier ] // temporary trusted contact object
          const instream = useStreamFromContact( temporaryContact, walletId, true )
          const fcmToken: string = idx( instream, ( _ ) => _.primaryData.FCM )
          if( fcmToken ){
            const notification: INotification = {
              notificationType: notificationType.FNF_KEEPER_REQUEST_REJECTED,
              title: 'Friends and Family notification',
              body: `F&F keeper request rejected by ${temporaryContact.contactDetails.contactName}`,
              data: {
              },
              tag: notificationTag.IMP,
            }
            const notifReceivers = []
            notifReceivers.push( {
              walletId: walletId,
              FCMs: [ fcmToken ],
            } )
            if( notifReceivers.length )
              yield call(
                Relay.sendNotifications,
                notifReceivers,
                notification,
              )
          }
        }
        return
      }

      yield put( updateTrustedContacts( updatedContacts ) )
      for ( const [ key, value ] of Object.entries( updatedContacts ) ) {
        dbManager.addContact( value )
      }

      if( permanentChannelsSyncKind === PermanentChannelsSyncKind.SUPPLIED_CONTACTS && flowKind === InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT ){
        const contact: TrustedContact = updatedContacts[ contactIdentifier ]
        const instream: UnecryptedStreamData = useStreamFromContact( contact, walletId, true )
        const fcmToken: string = idx( instream, ( _ ) => _.primaryData.FCM )
        const relationType: TrustedContactRelationTypes = idx( instream, ( _ ) => _.primaryData.relationType )
        const temporaryContact = updatedContacts[ contactIdentifier ] // temporary trusted contact object

        if( fcmToken ){
          const notification: INotification = {
            notificationType: notificationType.FNF_KEEPER_REQUEST_ACCEPTED,
            title: 'Friends and Family notification',
            body: `F&F keeper request approved by ${temporaryContact.contactDetails.contactName}`,
            data: {
            },
            tag: notificationTag.IMP,
          }
          const notifReceivers = []
          notifReceivers.push( {
            walletId: walletId,
            FCMs: [ fcmToken ],
          } )
          if( notifReceivers.length )
            yield call(
              Relay.sendNotifications,
              notifReceivers,
              notification,
            )
        }
        if( relationType === TrustedContactRelationTypes.KEEPER )
          Toast( 'You have been successfully added as a Keeper' )
        else if ( relationType === TrustedContactRelationTypes.CONTACT )
          Toast( 'Contact successfully added to Friends and Family' )
      }

      if( [ PermanentChannelsSyncKind.EXISTING_CONTACTS,  PermanentChannelsSyncKind.NON_FINALIZED_CONTACTS ].includes( permanentChannelsSyncKind ) )
        yield put ( existingPermanentChannelsSynched( {
          successful: true
        } ) )
    } else throw new Error( 'Failed to sync permanent channel' )
  } catch ( err ) {
    console.log( err )

    if( permanentChannelsSyncKind === PermanentChannelsSyncKind.SUPPLIED_CONTACTS && flowKind === InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT )
      Toast( 'Failed to add Keeper/Contact' )

    if( [ PermanentChannelsSyncKind.EXISTING_CONTACTS,  PermanentChannelsSyncKind.NON_FINALIZED_CONTACTS ].includes( permanentChannelsSyncKind ) )
      yield put ( existingPermanentChannelsSynched( {
        successful: false
      } ) )
  }
}

export const syncPermanentChannelsWatcher = createWatcher(
  syncPermanentChannelsWorker,
  SYNC_PERMANENT_CHANNELS,
)

function* initializeTrustedContactWorker( { payload } : {payload: {contact: any, flowKind: InitTrustedContactFlowKind, isKeeper?: boolean, channelKey?: string, contactsSecondaryChannelKey?: string, shareId?: string}} ) {
  const { contact, flowKind, isKeeper, channelKey, contactsSecondaryChannelKey, shareId } = payload

  const accountsState: AccountsState = yield select( state => state.accounts )
  const accounts: Accounts = accountsState.accounts
  const FCM = yield select ( state => state.preferences.fcmTokenValue )
  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
  const { walletId } = wallet

  const contactInfo: ContactInfo = {
    contactDetails: {
      id: contact.id,
      contactName: contact.name,
      image: contact.image
    },
    flowKind,
    channelKey,
    contactsSecondaryChannelKey
  }

  if( isKeeper ) {
    const channelAssets: ChannelAssets = yield select(
      ( state ) => state.health.channelAssets,
    )
    if( channelAssets.shareId == shareId ) delete channelAssets[ 'shareId' ]
    contactInfo.isKeeper = isKeeper
    contactInfo.channelAssets = channelAssets
  }

  let testReceivingAddress, checkingReceivingAddress
  accountsState.accountShells.forEach( ( shell ) => {
    const { primarySubAccount } = shell

    if( primarySubAccount.instanceNumber === 0 ){
      switch( primarySubAccount.type ){
          case AccountType.TEST_ACCOUNT:
            testReceivingAddress = accounts[ primarySubAccount.id ].receivingAddress
            break

          case AccountType.CHECKING_ACCOUNT:
            checkingReceivingAddress = accounts[ primarySubAccount.id ].receivingAddress
            break
      }
    }
  } )

  // TODO: might want to use different range of addresses for contacts?
  const paymentAddresses = {
    [ AccountType.TEST_ACCOUNT ]: testReceivingAddress,
    [ AccountType.CHECKING_ACCOUNT ]: checkingReceivingAddress,
  }

  const primaryData: PrimaryStreamData = {
    walletID: walletId,
    walletName: wallet.walletName,
    relationType: contactInfo.isKeeper ? TrustedContactRelationTypes.KEEPER : contactInfo.contactsSecondaryChannelKey ? TrustedContactRelationTypes.WARD : TrustedContactRelationTypes.CONTACT,
    FCM,
    paymentAddresses,
    contactDetails: contactInfo.contactDetails
  }

  let secondaryData: SecondaryStreamData
  let backupData: BackupStreamData
  const channelAssets = idx( contactInfo, ( _ ) => _.channelAssets )
  if( contactInfo.isKeeper && channelAssets ){
    const { primaryMnemonicShard, keeperInfo, secondaryMnemonicShard, bhXpub } = channelAssets
    backupData = {
      primaryMnemonicShard,
      keeperInfo,
    }
    secondaryData = {
      secondaryMnemonicShard,
      bhXpub,
    }
    const secondaryChannelKey = SSS.generateKey( config.CIPHER_SPEC.keyLength )
    contactInfo.secondaryChannelKey = secondaryChannelKey
  }
  contactInfo.channelKey = contactInfo.channelKey?  contactInfo.channelKey : SSS.generateKey( config.CIPHER_SPEC.keyLength )

  const streamUpdates: UnecryptedStreamData = {
    streamId: TrustedContactsOperations.getStreamId( walletId ),
    primaryData,
    secondaryData,
    backupData,
    metaData: {
      flags:{
        active: true,
        newData: true,
        lastSeen: Date.now(),
      },
      version: DeviceInfo.getVersion()
    }
  }

  const channelUpdate =  {
    contactInfo, streamUpdates
  }
  yield put( syncPermanentChannels( {
    permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
    channelUpdates: [ channelUpdate ],
  } ) )
}

export const initializeTrustedContactWatcher = createWatcher(
  initializeTrustedContactWorker,
  INITIALIZE_TRUSTED_CONTACT,
)

function* rejectTrustedContactWorker( { payload }: { payload: { channelKey: string }} ) {
  const accountsState: AccountsState = yield select( state => state.accounts )
  const regularAccount: RegularAccount = accountsState[ REGULAR_ACCOUNT ].service
  const { walletId } = regularAccount.hdWallet.getWalletId()

  const { channelKey } = payload

  const streamUpdates: UnecryptedStreamData = {
    streamId: TrustedContactsOperations.getStreamId( walletId ),
    metaData: {
      flags:{
        active: false,
        newData: false,
        lastSeen: Date.now(),
      },
    }
  }

  const contactDetails: ContactDetails = { // temp contact details
    id: ''
  }

  const contactInfo: ContactInfo = {
    contactDetails,
    channelKey: channelKey,
    flowKind: InitTrustedContactFlowKind.REJECT_TRUSTED_CONTACT
  }

  const channelUpdate =  {
    contactInfo, streamUpdates
  }

  yield put( syncPermanentChannels( {
    permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
    channelUpdates: [ channelUpdate ],
    skipDatabaseUpdate: true
  } ) )
}

export const rejectTrustedContactWatcher = createWatcher(
  rejectTrustedContactWorker,
  REJECT_TRUSTED_CONTACT,
)

function* editTrustedContactWorker( { payload }: { payload: { channelKey: string, contactName?: string, image?: ImageSourcePropType }} ) {
  const trustedContacts: Trusted_Contacts = yield select(
    ( state ) => state.trustedContacts.contacts,
  )

  const { channelKey, contactName, image } = payload
  const contactToUpdate: TrustedContact = trustedContacts[ channelKey ]

  if( contactName ) contactToUpdate.contactDetails.contactName = contactName
  if( image ) contactToUpdate.contactDetails.image = image

  const updatedContacts = {
    [ contactToUpdate.channelKey ]: contactToUpdate
  }
  yield put( updateTrustedContacts( updatedContacts ) )
  dbManager.addContact( contactToUpdate )
}

export const editTrustedContactWatcher = createWatcher(
  editTrustedContactWorker,
  EDIT_TRUSTED_CONTACT,
)

function* removeTrustedContactWorker( { payload }: { payload: { channelKey: string }} ) {
  const { walletName, walletId } = yield select( ( state ) => state.storage.wallet )
  const trustedContacts: Trusted_Contacts = yield select(
    ( state ) => state.trustedContacts.contacts,
  )

  const { channelKey } = payload
  const contact: TrustedContact = trustedContacts[ channelKey ]
  if( !contact.isActive ) return // already removed

  const streamUpdates: UnecryptedStreamData = {
    streamId: TrustedContactsOperations.getStreamId( walletId ),
    secondaryData: null,
    backupData: null,
    metaData: {
      flags:{
        active: false,
        newData: false,
        lastSeen: Date.now(),
      },
    }
  }

  const contactInfo: ContactInfo = {
    channelKey: channelKey,
  }

  const channelUpdate =  {
    contactInfo, streamUpdates
  }

  yield put( syncPermanentChannels( {
    permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
    channelUpdates: [ channelUpdate ]
  } ) )

  const notifReceivers = [
    {
      walletId: contact.walletID,
      FCMs: [ idx( contact, ( _ ) => _.unencryptedPermanentChannel[ contact.streamId ].primaryData.FCM ) ],
    }
  ]
  const notification: INotification = {
    notificationType: notificationType.contact,
    title: 'Friends and Family notification',
    body: `F&F removed by ${walletName}`,
    data: {
    },
    tag: notificationTag.IMP,
  }
  yield call(
    Relay.sendNotifications,
    notifReceivers,
    notification,
  )
}

export const removeTrustedContactWatcher = createWatcher(
  removeTrustedContactWorker,
  REMOVE_TRUSTED_CONTACT,
)

function* walletCheckInWorker( { payload } ) {
  const storedExchangeRates = yield select(
    ( state ) => state.accounts.exchangeRates,
  )
  const storedAverageTxFees = yield select(
    ( state ) => state.accounts.averageTxFees,
  )

  try{
    const { currencyCode } = payload
    const { exchangeRates, averageTxFees }  = yield call(
      Relay.walletCheckIn,
      currencyCode
    )
    if ( !exchangeRates ) yield put( exchangeRatesCalculated( {
    } ) )
    else {
      if ( JSON.stringify( exchangeRates ) !== JSON.stringify( storedExchangeRates ) )
        yield put( exchangeRatesCalculated( exchangeRates ) )
    }

    if ( !averageTxFees ) console.log( 'Failed to fetch fee rates' )
    else {
      if ( JSON.stringify( averageTxFees ) !== JSON.stringify( storedAverageTxFees ) )
        yield put( setAverageTxFee( averageTxFees ) )
    }
  } catch( err ){
    console.log( 'Wallet Check-In failed w/ the following err: ', err )
  }
}

export const walletCheckInWatcher = createWatcher(
  walletCheckInWorker,
  WALLET_CHECK_IN,
)
