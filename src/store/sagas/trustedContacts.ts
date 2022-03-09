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
  FETCH_GIFT_FROM_CHANNEL,
  SYNC_GIFTS_STATUS,
  REJECT_GIFT,
  ASSOCIATE_GIFT,
  fetchGiftFromTemporaryChannel,
  RECLAIM_GIFT,
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
  Gift,
  GiftStatus,
  GiftType,
  ActiveAddressAssigneeType,
  DeepLinkKind,
  DeepLinkEncryptionType,
  GiftMetaData,
  GiftThemeId,
} from '../../bitcoin/utilities/Interface'
import Toast from '../../components/Toast'
import DeviceInfo from 'react-native-device-info'
import { exchangeRatesCalculated, giftAccepted, giftAddedToAccount, setAverageTxFee, updateAccountShells, updateGift } from '../actions/accounts'
import { AccountsState } from '../reducers/accounts'
import config from '../../bitcoin/HexaConfig'
import idx from 'idx'
import crypto from 'crypto'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import dbManager from '../../storage/realm/dbManager'
import { ImageSourcePropType } from 'react-native'
import Relay from '../../bitcoin/utilities/Relay'
import { updateWalletImageHealth, getApprovalFromKeepers } from '../actions/BHR'
import { generateGiftLink, getNextFreeAddressWorker, setup2FADetails } from './accounts'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import { updateWalletNameToChannel } from '../actions/trustedContacts'
import { updateWallet } from '../actions/storage'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import { APP_STAGE } from '../../common/interfaces/Interfaces'
import * as bip39 from 'bip39'
import * as bitcoinJS from 'bitcoinjs-lib'
import secrets from 'secrets.js-grempe'
import AccountOperations from '../../bitcoin/utilities/accounts/AccountOperations'
import { processDeepLink } from '../../common/CommonFunctions'
import { generateTrustedContact } from '../../bitcoin/utilities/TrustedContactFactory'

function* generateSecondaryAssets(){
  const secondaryMnemonic = bip39.generateMnemonic( 256 )
  const derivationPath = yield call( AccountUtilities.getDerivationPath, NetworkType.MAINNET, AccountType.SAVINGS_ACCOUNT, 0 )
  const network = config.APP_STAGE === APP_STAGE.DEVELOPMENT? bitcoinJS.networks.testnet: bitcoinJS.networks.bitcoin
  const secondaryXpub = AccountUtilities.generateExtendedKey( secondaryMnemonic, false, network, derivationPath )
  const secondaryShards = secrets.share(
    BHROperations.stringToHex( secondaryMnemonic ),
    config.SSS_LEVEL1_TOTAL,
    config.SSS_LEVEL1_THRESHOLD,
  )
  return {
    secondaryXpub, secondaryShards
  }
}

function* updateWalletNameWorker( { payload } ) {
  const { walletName }: { walletName: string } = payload
  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )

  // if username defaults to walletname(no manually change to username) then update the username as well
  const updatedUserName = wallet.userName === wallet.walletName ? walletName: wallet.userName

  yield put( updateWallet( {
    ...wallet, walletName: walletName, userName: updatedUserName
  } ) )
  yield call( dbManager.updateWallet, {
    walletName,
  } )
  yield put( updateWalletImageHealth( {
  } ) )
  yield put ( updateWalletNameToChannel() )
}

export const updateWalletNameWatcher = createWatcher( updateWalletNameWorker, UPDATE_WALLET_NAME )

function* associateGiftWorker( { payload }: { payload: { giftId: string, accountId?: string } } ) {
  const storedGifts: {[id: string]: Gift} = yield select( ( state ) => state.accounts.gifts ) || {
  }
  const gift: Gift = storedGifts[ payload.giftId ]

  if( gift.status === GiftStatus.ASSOCIATED ){
    Toast( 'Gift already added to the account' )
    return
  }

  const accountsState: AccountsState = yield select( state => state.accounts )
  const accounts: Accounts = accountsState.accounts

  let associationAccount: Account

  if( payload.accountId ){
    associationAccount = accounts[ payload.accountId ]
  } else {
    for( const accountId in accounts ){
      const account = accounts[ accountId ]
      if( account.type === AccountType.CHECKING_ACCOUNT && account.instanceNum === 0 ){
        associationAccount = account
        break
      }
    }
  }

  AccountOperations.importAddress( associationAccount, gift.privateKey, gift.address, {
    type: ActiveAddressAssigneeType.GIFT,
    id: gift.id,
    senderInfo: {
      name: gift.sender.walletName
    }
  } )
  gift.receiver.accountId = associationAccount.id
  gift.status = GiftStatus.ASSOCIATED
  gift.timestamps.associated = Date.now()
  yield put( updateGift( gift ) )
  yield call( dbManager.createGift, gift )
  yield put( updateAccountShells( {
    accounts: {
      [ associationAccount.id ]: associationAccount
    }
  } ) )
  yield call( dbManager.updateAccount, associationAccount.id, associationAccount )
  yield put( updateWalletImageHealth( {
    updateAccounts: true,
    accountIds: [ associationAccount.id ],
    updateGifts: true,
    giftIds: [ gift.id ]
  } ) )
  yield put( giftAddedToAccount( payload.giftId ) )
}

export const associateGiftWatcher = createWatcher(
  associateGiftWorker,
  ASSOCIATE_GIFT,
)

function* fetchGiftFromChannelWorker( { payload }: { payload: { channelAddress: string, decryptionKey: string } } ) {
  const accountsState: AccountsState = yield select( ( state ) => state.accounts )
  const storedGifts: {[id: string]: Gift} = accountsState.gifts || {
  }
  const exclusiveGiftCodes: {[exclusiveGiftCode: string]: boolean} = accountsState.exclusiveGiftCodes

  const { channelAddress } = payload
  const wallet: Wallet = yield select( state => state.storage.wallet )
  for( const giftId in storedGifts ){
    if( channelAddress === storedGifts[ giftId ].channelAddress ) {
      if( storedGifts[ giftId ].sender.walletId == wallet.walletId ) Toast( 'You are the owner of this gift' )
      else Toast( 'Gift already exists' )
      return
    }
  }

  let gift: Gift, giftMetaData :GiftMetaData
  try{
    const res = yield call( Relay.fetchGiftChannel, channelAddress, payload.decryptionKey )
    gift = res.gift
    giftMetaData = res.metaData

    if( !gift ){
      if( !giftMetaData ) throw new Error( 'Gift data unavailable' )
      else {
        switch( giftMetaData.status ){
            case GiftStatus.ACCEPTED:
              Toast( 'Gift already claimed' )
              break

            case GiftStatus.RECLAIMED:
              Toast( 'Gift already reclaimed' )
              break

            case GiftStatus.EXPIRED:
              Toast( 'Gift already expired' )
              break
        }
        return
      }
    }
  } catch( err ){
    Toast( 'Gift expired/unavailable' )
    return
  }

  if( exclusiveGiftCodes && exclusiveGiftCodes[ giftMetaData.exclusiveGiftCode ] ){
    Toast( 'This gift is part of an exclusive giveaway. Cannot be claimed more than once' )
    return
  }

  if( storedGifts[ gift.id ] ){
    // returning gift; remove stored gift
    delete storedGifts[ gift.id ]
  }

  gift.type = GiftType.RECEIVED
  gift.status = GiftStatus.ACCEPTED
  gift.timestamps.accepted = Date.now()
  yield put( updateGift( gift ) )
  yield put( giftAccepted( gift.channelAddress ) )
  yield call( dbManager.createGift, gift )
  yield put( updateWalletImageHealth( {
    updateGifts: true,
    giftIds: [ gift.id ]
  } ) )
  if( giftMetaData ){
    giftMetaData.status = GiftStatus.ACCEPTED

    const giftChannelsToSync = {
      [ gift.channelAddress ]: {
        metaDataUpdates: giftMetaData
      }
    }
    yield call( Relay.syncGiftChannelsMetaData, giftChannelsToSync )

    if( giftMetaData.notificationInfo.FCM ){
      const wallet: Wallet = yield select( state => state.storage.wallet )
      const notification: INotification = {
        notificationType: notificationType.GIFT_ACCEPTED,
        title: 'Gift notification',
        body: `Gift accepted by ${wallet.walletName}`,
        data: {
        },
        tag: notificationTag.IMP,
      }

      Relay.sendNotifications( [ {
        walletId: giftMetaData.notificationInfo.walletId,
        FCMs: [ giftMetaData.notificationInfo.FCM ],
      } ], notification )
    }
  } else {
    console.log( 'Meta data update failed for gift:', gift.id )
  }
}

export const fetchGiftFromChannelWatcher = createWatcher(
  fetchGiftFromChannelWorker,
  FETCH_GIFT_FROM_CHANNEL,
)

function* rejectGiftWorker( { payload }: {payload: { channelAddress: string}} ) {
  const { channelAddress } = payload
  const giftChannelsToSync = {
    [ channelAddress ]: {
      metaDataUpdates: {
        status: GiftStatus.REJECTED
      },
    }
  }

  const { synchedGiftChannels }: { synchedGiftChannels: {
    [channelAddress: string]: {
        metaData: GiftMetaData;
    };
  };
  } = yield call( Relay.syncGiftChannelsMetaData, giftChannelsToSync )

  const wallet: Wallet = yield select( state => state.storage.wallet )
  for( const channelAddress in synchedGiftChannels ){
    const { metaData: giftMetaData } = synchedGiftChannels[ channelAddress ]
    if( giftMetaData ){
      if( giftMetaData.notificationInfo.FCM ){
        const notification: INotification = {
          notificationType: notificationType.GIFT_REJECTED,
          title: 'Gift notification',
          body: `Gift rejected by ${wallet.walletName}`,
          data: {
          },
          tag: notificationTag.IMP,
        }

        Relay.sendNotifications( [ {
          walletId: giftMetaData.notificationInfo.walletId,
          FCMs: [ giftMetaData.notificationInfo.FCM ],
        } ], notification )
      }
    }
  }
}

export const rejectGiftWatcher = createWatcher(
  rejectGiftWorker,
  REJECT_GIFT
)

function* reclaimGiftWorker( { payload }: {payload: { giftId: string}} ) {
  const storedGifts: {[id: string]: Gift} = yield select( ( state ) => state.accounts.gifts ) || {
  }
  const gift: Gift = storedGifts[ payload.giftId ]

  if( gift.status === GiftStatus.ACCEPTED || gift.status === GiftStatus.RECLAIMED ) throw new Error( 'Cannot reclaim gift' )

  const giftChannelsToSync = {
    [ gift.channelAddress ]: {
      creator: true,
      metaDataUpdates: {
        status: GiftStatus.RECLAIMED
      },
    }
  }

  const { synchedGiftChannels }: { synchedGiftChannels: {
    [channelAddress: string]: {
        metaData: GiftMetaData;
    };
  };
  } = yield call( Relay.syncGiftChannelsMetaData, giftChannelsToSync )
  const { metaData: giftMetaData } = synchedGiftChannels[ gift.channelAddress ]

  if( giftMetaData.status !== gift.status ){
    gift.status = giftMetaData.status

    if( giftMetaData.status === GiftStatus.RECLAIMED ) {
      gift.timestamps.reclaimed = Date.now()
      gift.channelAddress = null
    }
    else if ( giftMetaData.status === GiftStatus.ACCEPTED ) gift.timestamps.accepted = Date.now()

    yield put( updateGift( gift ) )
    yield call( dbManager.createGift, gift )
    yield put( updateWalletImageHealth( {
      updateGifts: true,
      giftIds: [ gift.id ]
    } ) )

    if( giftMetaData.status === GiftStatus.RECLAIMED ) Toast( 'Gift reclaimed' )
    if( giftMetaData.status === GiftStatus.ACCEPTED ) Toast( 'Gift already accepted' )
  }
}

export const reclaimGiftWatcher = createWatcher(
  reclaimGiftWorker,
  RECLAIM_GIFT
)

function* syncGiftsStatusWorker() {
  const storedGifts: {[id: string]: Gift} = yield select( ( state ) => state.accounts.gifts ) || {
  }

  const giftChannelsToSync: {
      [channelAddress: string]: {
          creator?: boolean;
          metaDataUpdates?: GiftMetaData;
      };
  } = {
  }
  const giftChannelToGiftIdMap = {
  }
  for( const giftId in storedGifts ){
    const gift = storedGifts[ giftId ]
    if( gift.status === GiftStatus.ASSOCIATED ) continue

    if( gift.type === GiftType.SENT &&  gift.channelAddress ) {
      if( gift.status !== GiftStatus.ACCEPTED ){
        giftChannelToGiftIdMap[ gift.channelAddress ] = giftId
        giftChannelsToSync[ gift.channelAddress ] = {
          creator: true
        }
      }
    }
  }

  if( Object.keys( giftChannelsToSync ).length === 0 ) {
    console.log( 'No gifts to sync' )
    return
  }

  const { synchedGiftChannels }: { synchedGiftChannels: {
    [channelAddress: string]: {
        metaData: GiftMetaData;
    };
  };
  } = yield call( Relay.syncGiftChannelsMetaData, giftChannelsToSync )

  for( const channelAddress in synchedGiftChannels ){
    const { metaData: giftMetaData } = synchedGiftChannels[ channelAddress ]
    if( giftMetaData ){
      const giftToUpdate = storedGifts[ giftChannelToGiftIdMap[ channelAddress ] ]
      if( giftToUpdate.status !== giftMetaData.status ){
        giftToUpdate.status = giftMetaData.status
        if ( giftMetaData.status === GiftStatus.ACCEPTED ) giftToUpdate.timestamps.accepted = Date.now()
        if ( giftMetaData.status === GiftStatus.REJECTED ) giftToUpdate.timestamps.rejected = Date.now()
        if ( giftMetaData.status === GiftStatus.RECLAIMED ) giftToUpdate.timestamps.reclaimed = Date.now()

        yield put( updateGift( giftToUpdate ) )
        yield call( dbManager.createGift, giftToUpdate )
        yield put( updateWalletImageHealth( {
          updateGifts: true,
          giftIds: [ giftToUpdate.id ]
        } ) )
      }
    }
  }
}

export const syncGiftsStatusWatcher = createWatcher(
  syncGiftsStatusWorker,
  SYNC_GIFTS_STATUS,
)

export function* syncPermanentChannelsWorker( { payload }: {payload: { permanentChannelsSyncKind: PermanentChannelsSyncKind, channelUpdates?: { contactInfo: ContactInfo, streamUpdates?: UnecryptedStreamData }[], metaSync?: boolean, hardSync?: boolean, updateWI?: boolean, isCurrentLevel0?: boolean, updateWI_2FA?: boolean }} ) {
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

  const { permanentChannelsSyncKind, channelUpdates, metaSync, hardSync, updateWI, isCurrentLevel0, updateWI_2FA } = payload
  switch( permanentChannelsSyncKind ){
      case PermanentChannelsSyncKind.SUPPLIED_CONTACTS:
        if( !channelUpdates.length ) throw new Error( 'Sync permanent channels failed: supplied channel updates missing' )
        for( const { contactInfo, streamUpdates } of channelUpdates ){
          let fullySyncContact = false

          const contact = trustedContacts[ contactInfo.channelKey ]
          if( contact ) {
            if( !contact.isActive || ( !streamUpdates && !contact.hasNewData && !hardSync ) )
              continue
            if( [ TrustedContactRelationTypes.PRIMARY_KEEPER, TrustedContactRelationTypes.KEEPER ].includes( contact.relationType ) ) {
              // full-sync keepers if the contact has been just approved
              const instreamId = contact.streamId
              if( instreamId ) {
                const instream = idx( contact, ( _ ) => _.unencryptedPermanentChannel[ instreamId ] )
                const primaryData = idx( instream, ( _ ) => _.primaryData )
                if( !primaryData ) {
                  fullySyncContact = true
                  if( contact.relationType === TrustedContactRelationTypes.PRIMARY_KEEPER ) synchingPrimaryKeeperChannelKey = contactInfo.channelKey
                }
              } else {
                fullySyncContact = true
                if( contact.relationType === TrustedContactRelationTypes.PRIMARY_KEEPER ) synchingPrimaryKeeperChannelKey = contactInfo.channelKey
              }
            }
          }

          channelSyncUpdates.push( {
            contactDetails: contactInfo.contactDetails,
            channelKey: contactInfo.channelKey,
            contact,
            streamId: streamUpdates? streamUpdates.streamId: streamId,
            secondaryChannelKey: contactInfo.secondaryChannelKey,
            unEncryptedOutstreamUpdates: streamUpdates,
            contactsSecondaryChannelKey: contactInfo.contactsSecondaryChannelKey,
            metaSync: fullySyncContact? false: metaSync
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
            } else if( [ TrustedContactRelationTypes.PRIMARY_KEEPER, TrustedContactRelationTypes.KEEPER ].includes( contact.relationType ) ) {
            // sync primary keeper if the contact has been approved
              const instreamId = contact.streamId
              if( instreamId ) {
                const instream = idx( contact, ( _ ) => _.unencryptedPermanentChannel[ instreamId ] )
                const primaryData = idx( instream, ( _ ) => _.primaryData )
                if( !primaryData ) {
                  fullySyncContact = true
                  if( contact.relationType === TrustedContactRelationTypes.PRIMARY_KEEPER ) synchingPrimaryKeeperChannelKey = channelKey
                }
              } else {
                fullySyncContact = true
                if( contact.relationType === TrustedContactRelationTypes.PRIMARY_KEEPER ) synchingPrimaryKeeperChannelKey = channelKey
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

  // initialize new contact(if required)
  for( const channelSyncUpdate of channelSyncUpdates ){
    const {
      channelKey,
      contact,
      contactDetails,
      secondaryChannelKey,
      unEncryptedOutstreamUpdates,
      contactsSecondaryChannelKey,
    } = channelSyncUpdate
    if ( !contact ) {
      if ( !contactDetails ) throw new Error( 'Init failed: contact details missing' )
      const newTrustedContact = generateTrustedContact( {
        contactDetails,
        channelKey,
        secondaryChannelKey,
        contactsSecondaryChannelKey,
        unEncryptedOutstreamUpdates,
      } )
      channelSyncUpdate.contact = newTrustedContact
    }
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
        const walletID: string = idx( instream, ( _ ) => _.primaryData.walletID )
        const nameAssociatedByContact: string = idx( instream, ( _ ) => _.primaryData.contactDetails.contactName )

        if( fcmToken && walletID ){
          let notifType, notifBody, notifTitle
          switch( temporaryContact.relationType ){
              case TrustedContactRelationTypes.KEEPER:
                notifType = notificationType.FNF_KEEPER_REQUEST_REJECTED
                notifTitle = 'Friends & Family notification'
                notifBody = `Keeper request rejected by ${nameAssociatedByContact || wallet.walletName}`
                break

              default:
                notifType = notificationType.FNF_REQUEST_REJECTED
                notifTitle = 'Friends & Family notification'
                notifBody = `F&F request rejected by ${nameAssociatedByContact || wallet.walletName}`
          }

          const notification: INotification = {
            notificationType: notifType,
            title: notifTitle,
            body: notifBody,
            data: {
            },
            tag: notificationTag.IMP,
          }
          const notifReceivers = []
          notifReceivers.push( {
            walletId: walletID, //instream.primaryData.walletID,
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
          const smShare = secondarySetupData.secondaryShardWI ? secondarySetupData.secondaryShardWI : ''
          shouldUpdateSmShare = secondarySetupData.secondaryShardWI !== ''

          yield put( updateWallet(
            {
              ...wallet,
              secondaryXpub,
              smShare
            }
          ) )
          yield call( dbManager.updateWallet, {
            secondaryXpub,
            smShare,
          } )
        }
      }
      if( updateWI ||  shouldUpdateSmShare ) yield put( updateWalletImageHealth( {
        updateContacts: true,
        updateSmShare : shouldUpdateSmShare,
        update2fa: updateWI_2FA || shouldUpdateSmShare
      } ) )

      if( flowKind === InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT && permanentChannelsSyncKind === PermanentChannelsSyncKind.SUPPLIED_CONTACTS ){
        const contact: TrustedContact = updatedContacts[ contactIdentifier ]
        const instream: UnecryptedStreamData = useStreamFromContact( contact, walletId, true )
        const contactsFCM: string = idx( instream, ( _ ) => _.primaryData.FCM )
        const contactsWalletId: string = idx( instream, ( _ ) => _.primaryData.walletID )
        const nameAssociatedByContact: string = idx( instream, ( _ ) => _.primaryData.contactDetails.contactName )

        const relationType: TrustedContactRelationTypes = idx( instream, ( _ ) => _.primaryData.relationType )

        if( contactsFCM && contactsWalletId ){
          let notifType, notifBody, notifTitle
          switch( contact.relationType ){
              case TrustedContactRelationTypes.WARD:
                notifType = notificationType.FNF_KEEPER_REQUEST_ACCEPTED
                notifTitle = 'Friends & Family notification'
                notifBody = `Keeper request accepted by ${nameAssociatedByContact || wallet.walletName}`
                break

              default:
                notifType = notificationType.FNF_REQUEST_ACCEPTED
                notifTitle = 'Friends & Family notification'
                notifBody = `F&F request accepted by ${nameAssociatedByContact || wallet.walletName}`
          }
          const notification: INotification = {
            notificationType: notifType,
            title: notifTitle,
            body: notifBody,
            data: {
              channelKey: contact.channelKey
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
        if( relationType === TrustedContactRelationTypes.PRIMARY_KEEPER || isCurrentLevel0 )
          Toast( 'You have been successfully added as a Keeper' )
        else if( relationType === TrustedContactRelationTypes.KEEPER ){
          yield put( getApprovalFromKeepers( true, contact ) )
          Toast( 'You have been successfully added as a Keeper. Now Please Approve keeper by scanning QR from Primary Keeper' )
        } else if ( relationType === TrustedContactRelationTypes.CONTACT )
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

export function* initializeTrustedContactWorker( { payload } : {payload: {contact: any, flowKind: InitTrustedContactFlowKind, isKeeper?: boolean, isPrimaryKeeper?: boolean, channelKey?: string, contactsSecondaryChannelKey?: string, shareId?: string, giftId?: string, giftNote?: string, isCurrentLevel0?: boolean }} ) {
  const { contact, flowKind, isKeeper, isPrimaryKeeper, channelKey, contactsSecondaryChannelKey, shareId, giftId, giftNote, isCurrentLevel0 } = payload

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
      id: contactInfo.channelKey,
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

  // prepare gift data
  let giftDeepLink
  if( giftId && flowKind === InitTrustedContactFlowKind.SETUP_TRUSTED_CONTACT ){
    const gifts: {[id: string]: Gift} = yield select( ( state ) => state.accounts.gifts ) || {
    }
    const giftToSend = gifts[ giftId ]
    const senderName = wallet.userName? wallet.userName: wallet.walletName

    const permanentChannelAddress = crypto
      .createHash( 'sha256' )
      .update( contactInfo.channelKey )
      .digest( 'hex' )
    giftToSend.sender.contactId = permanentChannelAddress
    giftToSend.receiver.contactId = permanentChannelAddress
    const { updatedGift, deepLink } = yield call( generateGiftLink, giftToSend, senderName, FCM, GiftThemeId.ONE, giftNote )
    yield put( updateGift( updatedGift ) )
    yield call( dbManager.createGift, updatedGift )
    yield put( updateWalletImageHealth( {
      updateGifts: true,
      giftIds: [ updatedGift.id ]
    } ) )
    giftDeepLink = deepLink
  }

  // prepare primary data
  const primaryData: PrimaryStreamData = {
    walletID: walletId,
    walletName: wallet.walletName,
    relationType,
    FCM,
    paymentAddresses,
    giftDeepLink,
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
  let updateWI_2FA: boolean
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
      updateWI_2FA = true
    }
    else if( secondaryMnemonicShard ){
      secondaryData = {
        secondaryMnemonicShard,
        bhXpub: wallet.details2FA.bithyveXpub,
      }
    }
    const secondaryChannelKey = BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
    contactInfo.secondaryChannelKey = secondaryChannelKey
  }

  const streamUpdates: UnecryptedStreamData = {
    streamId: TrustedContactsOperations.getStreamId( walletId ),
    primaryData,
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

  if( secondaryData ) streamUpdates.secondaryData = secondaryData

  const channelUpdate =  {
    contactInfo, streamUpdates
  }
  yield call( syncPermanentChannelsWorker, {
    payload: {
      permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
      channelUpdates: [ channelUpdate ],
      updateWI: true,
      isCurrentLevel0,
      updateWI_2FA
    }
  } )

  if( flowKind === InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT ){
    yield delay( 1000 ) // delaying to make sure the primary ward's instream is updated in the reducer
    const contacts: Trusted_Contacts = yield select(
      ( state ) => state.trustedContacts.contacts,
    )
    const approvedContact = contacts[ channelKey ]
    const instreamId = approvedContact.streamId
    const instream: UnecryptedStreamData = idx( approvedContact, ( _ ) => _.unencryptedPermanentChannel[ instreamId ] )

    if( instream.primaryData?.giftDeepLink ){
      // process incoming gift
      console.log( 'link', instream.primaryData.giftDeepLink )
      const { giftRequest } = yield call( processDeepLink, instream.primaryData.giftDeepLink )
      let decryptionKey
      try{
        switch( giftRequest.encryptionType ){
            case DeepLinkEncryptionType.DEFAULT:
              decryptionKey = giftRequest.encryptedChannelKeys
              break
        }
      } catch( err ){
        Toast( 'Unable to process gift' )
        return
      }

      yield put( fetchGiftFromTemporaryChannel( giftRequest.channelAddress, decryptionKey ) )
    }

    if( isPrimaryKeeper && contactsSecondaryChannelKey ){
      // re-upload secondary shard & bhxpub to primary ward's secondaryStream(instream update)
      const bhXpub = idx( instream, ( _ ) => _.primaryData.bhXpub )

      const instreamSecondaryData: SecondaryStreamData = {
        secondaryMnemonicShard: wardsSecondaryShards[ 1 ],
        bhXpub
      }
      const instreamUpdates = {
        streamId: instreamId,
        secondaryEncryptedData: TrustedContactsOperations.encryptData(
          approvedContact.contactsSecondaryChannelKey,
          instreamSecondaryData
        ).encryptedData
      }

      yield call( TrustedContactsOperations.updateStream, {
        channelKey, streamUpdates: instreamUpdates
      } )
    }

  }
}

export const initializeTrustedContactWatcher = createWatcher(
  initializeTrustedContactWorker,
  INITIALIZE_TRUSTED_CONTACT,
)

function* rejectTrustedContactWorker( { payload }: { payload: { channelKey: string, isExistingContact?: boolean }} ) {
  const { channelKey, isExistingContact } = payload
  const { walletId, walletName }: Wallet = yield select( state => state.storage.wallet )
  const FCM = yield select ( state => state.preferences.fcmTokenValue )

  const trustedContacts: Trusted_Contacts = yield select(
    ( state ) => state.trustedContacts.contacts,
  )
  const contactToUpdate: TrustedContact = trustedContacts[ channelKey ]
  if( contactToUpdate && isExistingContact ){
    const instream = useStreamFromContact( contactToUpdate, walletId, true )
    const fcmToken: string = idx( instream, ( _ ) => _.primaryData.FCM )
    const walletID: string = idx( instream, ( _ ) => _.primaryData.walletID )
    const nameAssociatedByContact: string = idx( instream, ( _ ) => _.primaryData.contactDetails.contactName )

    if( fcmToken && walletID ){
      const notification: INotification = {
        notificationType: notificationType.FNF_KEEPER_REQUEST_REJECTED,
        title: 'Friends & Family notification',
        body: `Keeper request rejected by ${nameAssociatedByContact || walletName}`,
        data: {
          channelKey: channelKey,
          wasExistingContactRequest: true
        },
        tag: notificationTag.IMP,
      }
      const notifReceivers = []
      notifReceivers.push( {
        walletId: walletID, //instream.primaryData.walletID,
        FCMs: [ fcmToken ],
      } )
      if( notifReceivers.length )
        yield call(
          Relay.sendNotifications,
          notifReceivers,
          notification,
        )
    }
  } else {
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
