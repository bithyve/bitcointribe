import { call, put, delay, select } from 'redux-saga/effects'
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
  RESTORE_CONTACTS,
  RESTORE_TRUSTED_CONTACTS,
  UPDATE_WALLET_NAME_TO_CHANNEL,
  UPDATE_WALLET_NAME,
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
  ActiveAddressAssignee,
  NetworkType,
  Account,
} from '../../bitcoin/utilities/Interface'
import Toast from '../../components/Toast'
import DeviceInfo from 'react-native-device-info'
import {  exchangeRatesCalculated, setAverageTxFee, updateAccountShells } from '../actions/accounts'
import { AccountsState } from '../reducers/accounts'
import config from '../../bitcoin/HexaConfig'
import idx from 'idx'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import dbManager from '../../storage/realm/dbManager'
import { ImageSourcePropType } from 'react-native'
import Relay from '../../bitcoin/utilities/Relay'
import { updateWalletImageHealth } from '../actions/BHR'
import { getNextFreeAddressWorker, setup2FADetails } from './accounts'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import { updateWalletNameToChannel } from '../actions/trustedContacts'
import { updateWallet } from '../actions/storage'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import { APP_STAGE } from '../../common/interfaces/Interfaces'
import * as bip39 from 'bip39'
import * as bitcoinJS from 'bitcoinjs-lib'
import secrets from 'secrets.js-grempe'
import { upgradeAccountToMultiSig } from '../../bitcoin/utilities/accounts/AccountFactory'

function* generateSecondaryAssets(){
  const secondaryMnemonic = bip39.generateMnemonic( 256 )
  const rootDerivationPath = yield call( AccountUtilities.getDerivationPath, NetworkType.MAINNET, AccountType.CHECKING_ACCOUNT, 0 )
  const network = config.APP_STAGE === APP_STAGE.DEVELOPMENT? bitcoinJS.networks.testnet: bitcoinJS.networks.bitcoin
  const secondaryXpub = AccountUtilities.generateExtendedKey( secondaryMnemonic, false, network, rootDerivationPath )
  const secondaryShards = secrets.share(
    BHROperations.stringToHex( secondaryMnemonic ),
    config.SSS_LEVEL1_TOTAL,
    config.SSS_LEVEL1_THRESHOLD,
  )
  return {
    secondaryXpub, secondaryShards
  }
}

function* updateWalletWorker( { payload } ) {
  const { walletName }: { walletName: string } = payload
  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )

  yield put( updateWallet( {
    ...wallet, walletName: walletName
  } ) )
  yield call( dbManager.updateWallet, {
    walletName,
  } )
  yield call( dbManager.getWallet )
  yield put( updateWalletImageHealth( {
  } ) )
  yield put ( updateWalletNameToChannel() )
}

export const updateWalletWatcher = createWatcher( updateWalletWorker, UPDATE_WALLET_NAME )

export function* syncPermanentChannelsWorker( { payload }: {payload: { permanentChannelsSyncKind: PermanentChannelsSyncKind, channelUpdates?: { contactInfo: ContactInfo, streamUpdates?: UnecryptedStreamData }[], metaSync?: boolean, hardSync?: boolean, updateWI?: boolean, }} ) {
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
  let synchingPrimaryKeeperChannelKey: string

  const { permanentChannelsSyncKind, channelUpdates, metaSync, hardSync, updateWI } = payload
  switch( permanentChannelsSyncKind ){
      case PermanentChannelsSyncKind.SUPPLIED_CONTACTS:
        if( !channelUpdates.length ) throw new Error( 'Sync permanent channels failed: supplied channel updates missing' )
        for( const { contactInfo, streamUpdates } of channelUpdates ){
          const contact = trustedContacts[ contactInfo.channelKey ]
          if( contact ) {
            if( !contact.isActive || ( !streamUpdates && !contact.hasNewData && !hardSync ) )
              continue
            if( contact.relationType === TrustedContactRelationTypes.PRIMARY_KEEPER ) synchingPrimaryKeeperChannelKey = contactInfo.channelKey
          }

          channelSyncUpdates.push( {
            contactDetails: contactInfo.contactDetails,
            channelKey: contactInfo.channelKey,
            contact,
            streamId: streamUpdates? streamUpdates.streamId: streamId,
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

            let fullySyncContact = false
            if( !contact.contactDetails.contactName ){
            // sync skipped contact if the request has been approved and the wallet name has not been fetched yet
              const instreamId = contact.streamId
              if( instreamId ) {
                const instream = idx( contact, ( _ ) => _.unencryptedPermanentChannel[ instreamId ] )
                const walletName = idx( instream, ( _ ) => _.primaryData.walletName )
                if( !walletName ) fullySyncContact = true
              } else fullySyncContact = true
            } else if( contact.relationType === TrustedContactRelationTypes.PRIMARY_KEEPER ) {
            // sync primary keeper if the contact has been approved
              const instreamId = contact.streamId
              if( instreamId ) {
                const instream = idx( contact, ( _ ) => _.unencryptedPermanentChannel[ instreamId ] )
                const primaryData = idx( instream, ( _ ) => _.primaryData )
                if( !primaryData ) {
                  fullySyncContact = true
                  synchingPrimaryKeeperChannelKey = channelKey
                }
              } else {
                fullySyncContact = true
                synchingPrimaryKeeperChannelKey = channelKey
              }
            }

            if( metaSync || contact.hasNewData || hardSync )
              channelSyncUpdates.push( {
                channelKey: channelKey,
                streamId,
                contact,
                metaSync: fullySyncContact? false: metaSync
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
      if( flowKind === InitTrustedContactFlowKind.REJECT_TRUSTED_CONTACT ){
        const temporaryContact = updatedContacts[ contactIdentifier ] // temporary trusted contact object
        const instream = useStreamFromContact( temporaryContact, walletId, true )
        const fcmToken: string = idx( instream, ( _ ) => _.primaryData.FCM )
        const nameAssociatedByContact: string = idx( instream, ( _ ) => _.primaryData.contactDetails.contactName )

        if( fcmToken ){
          let notifType, notifBody
          switch( temporaryContact.relationType ){
              case TrustedContactRelationTypes.KEEPER:
                notifType = notificationType.FNF_KEEPER_REQUEST_REJECTED
                notifBody = `F&F keeper request rejected by ${nameAssociatedByContact || wallet.walletName}`
                break

              default:
                notifType = notificationType.FNF_REQUEST_REJECTED
                notifBody = `F&F request rejected by ${nameAssociatedByContact || wallet.walletName}`
          }

          const notification: INotification = {
            notificationType: notifType,
            title: 'Friends & Family notification',
            body: notifBody,
            data: {
            },
            tag: notificationTag.IMP,
          }
          const notifReceivers = []
          notifReceivers.push( {
            walletId: walletId, //instream.primaryData.walletID,
            FCMs: [ fcmToken ],
          } )
          if( notifReceivers.length )
            yield call(
              Relay.sendNotifications,
              notifReceivers,
              notification,
            )
        }
        return
      }

      yield put( updateTrustedContacts( updatedContacts ) )
      for ( const [ key, value ] of Object.entries( updatedContacts ) ) {
        yield call( dbManager.updateContact, value )
      }

      let shouldUpdateSmShare = false
      // update secondary setup data on inital primary keeper sync
      if( synchingPrimaryKeeperChannelKey && !wallet.secondaryXpub ){
        const primaryKeeper =  updatedContacts[ synchingPrimaryKeeperChannelKey ]
        const instream = useStreamFromContact( primaryKeeper, walletId, true )
        const secondarySetupData = idx( instream, ( _ ) => _.primaryData.secondarySetupData )
        if( secondarySetupData ){
          const secondaryXpub = secondarySetupData.secondaryXpub
          yield put( updateWallet(
            {
              ...wallet,
              secondaryXpub,
            }
          ) )
          const smShare = secondarySetupData.secondaryShardWI ? secondarySetupData.secondaryShardWI : ''
          shouldUpdateSmShare = secondarySetupData.secondaryShardWI !== ''
          yield call( dbManager.updateWallet, {
            secondaryXpub,
            smShare,
          } )
        }
      }
      if( updateWI ||  shouldUpdateSmShare ) yield put( updateWalletImageHealth( {
        updateContacts: true,
        updateSmShare : shouldUpdateSmShare,
        update2fa: shouldUpdateSmShare
      } ) )

      if( flowKind === InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT && permanentChannelsSyncKind === PermanentChannelsSyncKind.SUPPLIED_CONTACTS ){
        const contact: TrustedContact = updatedContacts[ contactIdentifier ]
        const instream: UnecryptedStreamData = useStreamFromContact( contact, walletId, true )
        const contactsFCM: string = idx( instream, ( _ ) => _.primaryData.FCM )
        const contactsWalletId: string = idx( instream, ( _ ) => _.primaryData.walletID )
        const nameAssociatedByContact: string = idx( instream, ( _ ) => _.primaryData.contactDetails.contactName )

        const relationType: TrustedContactRelationTypes = idx( instream, ( _ ) => _.primaryData.relationType )

        if( contactsFCM && contactsWalletId ){
          let notifType, notifBody
          switch( contact.relationType ){
              case TrustedContactRelationTypes.KEEPER:
                notifType = notificationType.FNF_KEEPER_REQUEST_ACCEPTED
                notifBody = `F&F keeper request accepted by ${nameAssociatedByContact || wallet.walletName}`
                break

              default:
                notifType = notificationType.FNF_REQUEST_ACCEPTED
                notifBody = `F&F request accepted by ${nameAssociatedByContact || wallet.walletName}`
          }
          const notification: INotification = {
            notificationType: notifType,
            title: 'Friends & Family notification',
            body: notifBody,
            data: {
            },
            tag: notificationTag.IMP,
          }
          const notifReceivers = []
          notifReceivers.push( {
            walletId: contactsWalletId,
            FCMs: [ contactsFCM ],
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
          Toast( 'Contact successfully added to Friends & Family' )
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

function* updateWalletNameToAllChannel() {
  const channelUpdates = []
  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
  const walletId = wallet.walletId
  const { walletName } = yield select( ( state ) => state.storage.wallet )
  const contacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contacts )
  Object.keys( contacts ).forEach( channelKey => {
    const contact: TrustedContact = contacts[ channelKey ]
    if( contact.isActive ){
      const contactInfo = {
        channelKey,
      }
      const primaryData: PrimaryStreamData = {
        walletName,
      }
      const streamUpdates: UnecryptedStreamData = {
        streamId: TrustedContactsOperations.getStreamId( walletId ),
        primaryData,
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
      channelUpdates.push( channelUpdate )
    }
  } )

  yield put( syncPermanentChannels( {
    permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
    channelUpdates: channelUpdates,
  } ) )
}

export const updateWalletNameToChannelWatcher = createWatcher(
  updateWalletNameToAllChannel,
  UPDATE_WALLET_NAME_TO_CHANNEL,
)

function* initializeTrustedContactWorker( { payload } : {payload: {contact: any, flowKind: InitTrustedContactFlowKind, isKeeper?: boolean, isPrimaryKeeper?: boolean, channelKey?: string, contactsSecondaryChannelKey?: string, shareId?: string}} ) {
  const { contact, flowKind, isKeeper, isPrimaryKeeper, channelKey, contactsSecondaryChannelKey, shareId } = payload

  const accountsState: AccountsState = yield select( state => state.accounts )
  const accounts: Accounts = accountsState.accounts
  const FCM = yield select ( state => state.preferences.fcmTokenValue )
  let wallet: Wallet = yield select( ( state ) => state.storage.wallet )
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
  contactInfo.channelKey = contactInfo.channelKey?  contactInfo.channelKey : BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) // channel-key is available during init at approvers end

  if( flowKind === InitTrustedContactFlowKind.SETUP_TRUSTED_CONTACT && isKeeper ) {
    const channelAssets: ChannelAssets = yield select(
      ( state ) => state.bhr.channelAssets,
    )
    if( channelAssets.shareId == shareId ) delete channelAssets[ 'shareId' ]
    contactInfo.isKeeper = isKeeper
    contactInfo.channelAssets = channelAssets
  }

  let testReceivingAddress, checkingReceivingAddress
  const assigneeInfo: ActiveAddressAssignee = {
    type: AccountType.FNF_ACCOUNT,
    id: contactInfo.channelKey,
    senderInfo: {
      name: contactInfo.contactDetails.contactName
    },
  }
  for( const shell of accountsState.accountShells ){
    const { primarySubAccount } = shell
    if( primarySubAccount.instanceNumber === 0 ){
      const account = accounts[ primarySubAccount.id ]
      switch( primarySubAccount.type ){
          case AccountType.TEST_ACCOUNT:
            testReceivingAddress = yield call( getNextFreeAddressWorker, account, assigneeInfo )
            break

          case AccountType.CHECKING_ACCOUNT:
            checkingReceivingAddress = yield call( getNextFreeAddressWorker, account, assigneeInfo )
            break
      }
    }
  }

  const paymentAddresses = {
    [ AccountType.TEST_ACCOUNT ]: testReceivingAddress,
    [ AccountType.CHECKING_ACCOUNT ]: checkingReceivingAddress,
  }

  let relationType = TrustedContactRelationTypes.CONTACT
  if( flowKind === InitTrustedContactFlowKind.SETUP_TRUSTED_CONTACT ) {
    if( isPrimaryKeeper ) relationType = TrustedContactRelationTypes.PRIMARY_KEEPER
    else if( isKeeper ) relationType = TrustedContactRelationTypes.KEEPER
  } else if( flowKind === InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT ) {
    if( isPrimaryKeeper || isKeeper ) relationType = TrustedContactRelationTypes.WARD
  }

  // prepare primary data
  const primaryData: PrimaryStreamData = {
    walletID: walletId,
    walletName: wallet.walletName,
    relationType,
    FCM,
    paymentAddresses,
    contactDetails: contactInfo.contactDetails
  }

  let wardsSecondaryShards: string[]
  if( flowKind === InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT && isPrimaryKeeper ){
    // generate secondary assets(mnemonic & shards) for the primary ward
    const { secondaryXpub, secondaryShards } = yield call( generateSecondaryAssets )
    primaryData.secondarySetupData = {
      secondaryXpub,
      secondaryShardWI: secondaryShards[ 0 ]
    }
    wardsSecondaryShards = secondaryShards
  }

  // prepare secondary and backup data
  let secondaryData: SecondaryStreamData
  let backupData: BackupStreamData
  const channelAssets = idx( contactInfo, ( _ ) => _.channelAssets )
  if( flowKind === InitTrustedContactFlowKind.SETUP_TRUSTED_CONTACT && contactInfo.isKeeper && channelAssets ){
    const { primaryMnemonicShard, keeperInfo, secondaryMnemonicShard } = channelAssets
    backupData = {
      primaryMnemonicShard,
      keeperInfo,
    }

    if( isPrimaryKeeper && !idx( wallet, ( _ ) => _.details2FA.bithyveXpub ) ) {
      // setup 2FA during primary keeper setup(1st keeper)
      // secondaryData is uploaded by the primary keeper device
      wallet = yield call( setup2FADetails, wallet )
      primaryData.bhXpub = wallet.details2FA.bithyveXpub
    }
    else
      secondaryData = {
        secondaryMnemonicShard,
        bhXpub: wallet.details2FA.bithyveXpub,
      }
    const secondaryChannelKey = BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
    contactInfo.secondaryChannelKey = secondaryChannelKey
  }

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
  yield call( syncPermanentChannelsWorker, {
    payload: {
      permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
      channelUpdates: [ channelUpdate ],
      updateWI: true
    }
  } )

  if( flowKind === InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT && isPrimaryKeeper && contactsSecondaryChannelKey ){
    // re-upload secondary shard & bhxpub to primary ward's secondaryStream(instream update)
    yield delay( 1000 ) // delaying to make sure the primary ward's instream is updated in the reducer
    const contacts: Trusted_Contacts = yield select(
      ( state ) => state.trustedContacts.contacts,
    )
    const primaryWard = contacts[ channelKey ]
    const instreamId = primaryWard.streamId
    const instream: UnecryptedStreamData = idx( primaryWard, ( _ ) => _.unencryptedPermanentChannel[ instreamId ] )
    const bhXpub = idx( instream, ( _ ) => _.primaryData.bhXpub )

    const instreamSecondaryData: SecondaryStreamData = {
      secondaryMnemonicShard: wardsSecondaryShards[ 1 ],
      bhXpub
    }
    const instreamUpdates = {
      streamId: instreamId,
      secondaryEncryptedData: TrustedContactsOperations.encryptData(
        primaryWard.contactsSecondaryChannelKey,
        instreamSecondaryData
      ).encryptedData
    }

    yield call( TrustedContactsOperations.updateStream, {
      channelKey, streamUpdates: instreamUpdates
    } )
  }
}

export const initializeTrustedContactWatcher = createWatcher(
  initializeTrustedContactWorker,
  INITIALIZE_TRUSTED_CONTACT,
)

function* rejectTrustedContactWorker( { payload }: { payload: { channelKey: string }} ) {
  const { walletId } = yield select( state => state.storage.wallet )
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
  yield call ( dbManager.updateContact, contactToUpdate )

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
    title: 'Friends & Family notification',
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


export function* restoreTrustedContactsWorker( { payload }: { payload: { walletId: string, channelKeys: string[] }} ) {
  const { walletId, channelKeys } = payload
  // const { }
  const restoredTrustedContacts: Trusted_Contacts = yield call( TrustedContactsOperations.restoreTrustedContacts, {
    walletId, channelKeys
  } )
  // Reducer update
  yield put( updateTrustedContacts( restoredTrustedContacts ) )
  // DB update
  for ( const [ key, value ] of Object.entries( restoredTrustedContacts ) ) {
    yield call( dbManager.updateContact, value )
  }

  // TODO: => get MetaShares and Add to DB
  // const res = yield call( TrustedContactsOperations.retrieveFromStream, {
  //   walletId, channelKey, options: {
  //     retrieveBackupData: true,
  //   }
  // } )
  // if( res.backupData && res.backupData.primaryMnemonicShard ) {
  //   console.log( 'res.backupData.primaryMnemonicShard', res.backupData.primaryMnemonicShard )
  // }
}

export const restoreTrustedContactsWatcher = createWatcher(
  restoreTrustedContactsWorker,
  RESTORE_TRUSTED_CONTACTS,
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
