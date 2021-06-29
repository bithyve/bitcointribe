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
} from '../actions/trustedContacts'
import { createWatcher } from '../utils/utilities'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
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
import RecipientKind from '../../common/data/enums/RecipientKind'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
//import { calculateOverallHealth, downloadMShare } from '../actions/sss'
import {
  REGULAR_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import { insertDBWorker } from './storage'
import { SendingState } from '../reducers/sending'
import SSS from '../../bitcoin/utilities/sss/SSS'
import Toast from '../../components/Toast'
import DeviceInfo from 'react-native-device-info'
import {  exchangeRatesCalculated, setAverageTxFee } from '../actions/accounts'
import { AccountsState } from '../reducers/accounts'
import config from '../../bitcoin/HexaConfig'
import TrustedContacts from '../../bitcoin/utilities/TrustedContacts'
import idx from 'idx'
import { ServicesJSON } from '../../common/interfaces/Interfaces'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'
import RelayServices from '../../bitcoin/services/RelayService'

function* syncPermanentChannelsWorker( { payload }: {payload: { permanentChannelsSyncKind: PermanentChannelsSyncKind, channelUpdates?: { contactInfo: ContactInfo, streamUpdates?: UnecryptedStreamData }[], metaSync?: boolean, hardSync?: boolean, shouldNotUpdateSERVICES?: boolean }} ) {
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const wallet: Wallet = yield select(
    ( state ) => state.storage.wallet,
  )

  const existingContacts = trustedContacts.tc.trustedContacts
  const { walletId } = wallet
  const streamId = TrustedContacts.getStreamId( walletId )

  const channelSyncUpdates: {
    channelKey: string,
    streamId: string,
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
          const contact = trustedContacts.tc.trustedContacts[ contactInfo.channelKey ]
          if( contact )
            if( !contact.isActive || ( !streamUpdates && !contact.hasNewData && !hardSync ) )
              continue

          channelSyncUpdates.push( {
            contactDetails: contactInfo.contactDetails,
            channelKey: contactInfo.channelKey,
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
        if( !Object.keys( existingContacts ).length ) {
          yield put ( existingPermanentChannelsSynched( {
            successful: true
          } ) )
          return
        }

        Object.keys( existingContacts ).forEach( channelKey => {
          const contact: TrustedContact = existingContacts[ channelKey ]
          if( contact.isActive ){
            if( metaSync || contact.hasNewData || hardSync )
              channelSyncUpdates.push( {
                channelKey: channelKey,
                streamId,
                metaSync
              } )
          }
        } )
        break

      case PermanentChannelsSyncKind.NON_FINALIZED_CONTACTS:
        if( !Object.keys( existingContacts ).length ) {
          yield put ( existingPermanentChannelsSynched( {
            successful: true
          } ) )
          return
        }

        Object.keys( existingContacts ).forEach( channelKey => {
          const contact: TrustedContact = existingContacts[ channelKey ]
          const instream = useStreamFromContact( contact, walletId, true )
          if( contact.isActive && !instream )
            channelSyncUpdates.push( {
              channelKey: channelKey,
              streamId,
            } )
        } )
        break
  }

  if( !channelSyncUpdates.length ) {
    console.log( 'Exiting sync: no channels to update' )
    return
  }

  const res = yield call(
    trustedContacts.syncPermanentChannels,
    channelSyncUpdates
  )
  if ( res.status === 200 ) {
    const { shouldNotUpdateSERVICES }  = payload
    if( shouldNotUpdateSERVICES ){
      if( flowKind === InitTrustedContactFlowKind.REJECT_TRUSTED_CONTACT ){
        const temporaryContact = trustedContacts.tc.trustedContacts[ contactIdentifier ] // temporary trusted contact object
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
              RelayServices.sendNotifications,
              notifReceivers,
              notification,
            )
        }
      }
      return
    }

    const SERVICES = yield select( ( state ) => state.storage.database.SERVICES )
    const updatedSERVICES: ServicesJSON = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
    }

    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )

    if( permanentChannelsSyncKind === PermanentChannelsSyncKind.SUPPLIED_CONTACTS && flowKind === InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT ){
      const contact: TrustedContact = trustedContacts.tc.trustedContacts[ contactIdentifier ]
      const instream: UnecryptedStreamData = useStreamFromContact( contact, walletId, true )
      const fcmToken: string = idx( instream, ( _ ) => _.primaryData.FCM )
      const relationType: TrustedContactRelationTypes = idx( instream, ( _ ) => _.primaryData.relationType )
      const temporaryContact = trustedContacts.tc.trustedContacts[ contactIdentifier ] // temporary trusted contact object

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
            RelayServices.sendNotifications,
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
  } else {
    console.log( {
      err: res.err
    } )

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
  const { walletName } = yield select( ( state ) => state.storage.database.WALLET_SETUP )
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
    walletName,
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
    streamId: TrustedContacts.getStreamId( walletId ),
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
    streamId: TrustedContacts.getStreamId( walletId ),
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
    shouldNotUpdateSERVICES: true
  } ) )
}

export const rejectTrustedContactWatcher = createWatcher(
  rejectTrustedContactWorker,
  REJECT_TRUSTED_CONTACT,
)

function* removeTrustedContactWorker( { payload }: { payload: { channelKey: string }} ) {
  const trustedContactsService: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const accountsState: AccountsState = yield select( state => state.accounts )
  const regularAccount: RegularAccount = accountsState[ REGULAR_ACCOUNT ].service
  const { walletId } = regularAccount.hdWallet.getWalletId()

  const { channelKey } = payload
  const contact: TrustedContact = trustedContactsService.tc.trustedContacts[ channelKey ]
  if( !contact.isActive ) return // already removed

  const streamUpdates: UnecryptedStreamData = {
    streamId: TrustedContacts.getStreamId( walletId ),
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

  const sendingState: SendingState = yield select( ( state ) => state.sending )
  const { walletName } = yield select( ( state ) => state.storage.database.WALLET_SETUP )
  const { selectedRecipients } = sendingState
  const contacts: Trusted_Contacts = trustedContactsService.tc.trustedContacts
  const notifReceivers = []
  const selectedContacts = []
  selectedRecipients.forEach( ( recipient ) => {
    if ( recipient.kind === RecipientKind.CONTACT ) {
      const channelKey = ( recipient as ContactRecipientDescribing ).channelKey
      const contact = contacts[ channelKey ]
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
    title: 'Friends and Family notification',
    body: `F&F removed by ${walletName}`,
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
    const res = yield call(
      RelayServices.walletCheckIn,
      currencyCode
    )

    if ( res.status === 200 ) {
      const { exchangeRates, averageTxFees } = res.data
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
    } else {
      console.log( 'Check-In failed', res.err )
    }
  } catch( err ){
    console.log( 'Wallet Check-In failed w/ the following err: ', err )
  }
}

export const walletCheckInWatcher = createWatcher(
  walletCheckInWorker,
  WALLET_CHECK_IN,
)
