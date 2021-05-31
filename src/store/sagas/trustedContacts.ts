import { call, put, select } from 'redux-saga/effects'
import {
  APPROVE_TRUSTED_CONTACT,
  trustedContactApproved,
  UPDATE_EPHEMERAL_CHANNEL,
  ephemeralChannelFetched,
  ephemeralChannelUpdated,
  UPDATE_TRUSTED_CHANNEL,
  FETCH_TRUSTED_CHANNEL,
  trustedChannelUpdated,
  trustedChannelFetched,
  FETCH_EPHEMERAL_CHANNEL,
  updateEphemeralChannel,
  TRUSTED_CHANNELS_SETUP_SYNC,
  switchTCLoading,
  REMOVE_TRUSTED_CONTACT,
  SYNC_TRUSTED_CHANNELS,
  syncTrustedChannels,
  WALLET_CHECK_IN,
  POST_RECOVERY_CHANNEL_SYNC,
  MULTI_UPDATE_TRUSTED_CHANNELS,
  SEND_VERSION_UPDATE_NOTIFICATION,
  multiUpdateTrustedChannels,
  SYNC_PERMANENT_CHANNELS,
  syncPermanentChannels,
  INITIALIZE_TRUSTED_CONTACT,
  SYNC_EXISTING_PERMANENT_CHANNELS,
  existingPermanentChannelsSynched,
  InitTrustedContactFlowKind,
} from '../actions/trustedContacts'
import { createWatcher } from '../utils/utilities'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import {
  EphemeralDataElements,
  Contacts,
  TrustedDataElements,
  TrustedContactDerivativeAccountElements,
  INotification,
  notificationType,
  notificationTag,
  trustedChannelActions,
  UnecryptedStreamData,
  PrimaryStreamData,
  TrustedContactRelationTypes,
  SecondaryStreamData,
  BackupStreamData,
  ContactInfo,
  ContactDetails,
  KeeperInfoInterface,
  MetaShare,
  UnecryptedStreams,
  TrustedContact
} from '../../bitcoin/utilities/Interface'
import {
  calculateOverallHealth,
  downloadMShare as downloadMShareSSS,
} from '../actions/sss'
import { downloadMShare as downloadMShareHealth, updateMSharesHealth, uploadEncMShareKeeper } from '../actions/health'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
//import { calculateOverallHealth, downloadMShare } from '../actions/sss'
import {
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import { insertDBWorker } from './storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchNotificationsWorker } from './notifications'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import RelayServices from '../../bitcoin/services/RelayService'
import SSS from '../../bitcoin/utilities/sss/SSS'
import Toast from '../../components/Toast'
import { downloadMetaShareWorker } from './sss'
import { downloadMetaShareWorker as downloadMetaShareWorkerKeeper } from './health'
import S3Service from '../../bitcoin/services/sss/S3Service'
import DeviceInfo from 'react-native-device-info'
import { addNewSecondarySubAccount, exchangeRatesCalculated, setAverageTxFee } from '../actions/accounts'
import { AccountsState } from '../reducers/accounts'
import TrustedContactsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TrustedContactsSubAccountInfo'
import AccountShell from '../../common/data/models/AccountShell'
import config from '../../bitcoin/HexaConfig'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import moment from 'moment'
import semver from 'semver'
import TrustedContacts from '../../bitcoin/utilities/TrustedContacts'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import idx from 'idx'
import { ServicesJSON } from '../../common/interfaces/Interfaces'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'

const sendNotification = ( recipient, notification ) => {
  const receivers = []
  if ( recipient.walletID && recipient.FCMs.length )
    receivers.push( {
      walletId: recipient.walletID,
      FCMs: recipient.FCMs,
    } )

  if ( receivers.length )
    RelayServices.sendNotifications( receivers, notification ).then( console.log )
}

export function* createTrustedContactSubAccount ( secondarySubAccount: TrustedContactsSubAccountInfo, parentShell: AccountShell, contactInfo: ContactInfo ) {
  const accountsState: AccountsState = yield select( state => state.accounts )
  const regularAccount: RegularAccount = accountsState[ REGULAR_ACCOUNT ].service
  const testAccount: TestAccount = accountsState[ TEST_ACCOUNT ].service
  const { walletName } = yield select( ( state ) => state.storage.database.WALLET_SETUP )
  const FCM = yield select ( state => state.preferences.fcmTokenValue )
  const { contactDetails } = contactInfo
  const { walletId } = regularAccount.hdWallet.getWalletId()

  // initialize a trusted derivative account against the following contact
  const res = regularAccount.setupDerivativeAccount(
    TRUSTED_CONTACTS,
    null,
    contactDetails,
    contactInfo.channelKey,
  )
  if ( res.status !== 200 ) throw new Error( `${res.err}` )

  const { SERVICES } = yield select( ( state ) => state.storage.database )
  const updatedSERVICES = {
    ...SERVICES,
    REGULAR_ACCOUNT: JSON.stringify( regularAccount ),
  }

  // refresh the account number
  const accountNumber = res.data.accountNumber
  const secondarySubAccountId = res.data.accountId
  secondarySubAccount.id = secondarySubAccountId
  secondarySubAccount.instanceNumber = accountNumber
  secondarySubAccount.balances = {
    confirmed: 0,
    unconfirmed: 0,
  }
  secondarySubAccount.transactions = []

  AccountShell.addSecondarySubAccount(
    parentShell,
    secondarySubAccountId,
    secondarySubAccount,
  )

  const trustedDerivativeAccount = ( regularAccount.hdWallet
    .derivativeAccounts[ TRUSTED_CONTACTS ][
      accountNumber
    ] as TrustedContactDerivativeAccountElements )
  const paymentAddress = trustedDerivativeAccount.receivingAddress
  const paymentAddresses = {
    [ SubAccountKind.TRUSTED_CONTACTS ]: paymentAddress,
    [ SubAccountKind.TEST_ACCOUNT ]: testAccount.hdWallet.receivingAddress
  }
  const primaryData: PrimaryStreamData = {
    walletID: walletId,
    walletName,
    relationType: contactInfo.isGuardian ? TrustedContactRelationTypes.KEEPER : TrustedContactRelationTypes.CONTACT,
    FCM,
    paymentAddresses
  }

  let secondaryData: SecondaryStreamData = null
  let backupData: BackupStreamData = null
  const channelAssets = idx( contactInfo, ( _ ) => _.channelAssets )
  if( contactInfo.isGuardian && channelAssets ){
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
  contactInfo.channelKey = trustedDerivativeAccount.channelKey

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

  // initiate permanent channel
  const channelUpdate =  {
    contactInfo, streamUpdates
  }
  yield put( syncPermanentChannels( {
    channelUpdates: [ channelUpdate ], updatedSERVICES
  } ) )
}

function* approveTrustedContactWorker( { payload } ) {
  try {
    const trustedContacts: TrustedContactsService = yield select(
      ( state ) => state.trustedContacts.service,
    )

    const {
      contactInfo,
      contactsPublicKey,
      contactsWalletName,
      isGuardian,
      isFromKeeper
    } = payload

    let encKey
    if ( contactInfo.info ) encKey = SSS.strechKey( contactInfo.info )
    const res = yield call(
      trustedContacts.finalizeContact,
      contactInfo.contactName,
      contactsPublicKey,
      encKey,
      contactsWalletName,
      isGuardian,
    )
    if ( res.status === 200 ) {
      if ( payload.updateEphemeralChannel ) {
        const uploadXpub = true
        const data = {
          DHInfo: {
            publicKey: res.data.publicKey,
          },
        }
        yield put(
          updateEphemeralChannel(
            {
              ...contactInfo, walletName: contactsWalletName
            },
            data,
            true,
            trustedContacts,
            uploadXpub,
            null,
            null,
            isFromKeeper,
          ),
        )
      } else {
        const { SERVICES } = yield select( ( state ) => state.storage.database )
        const updatedSERVICES = {
          ...SERVICES,
          TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
        }
        yield call( insertDBWorker, {
          payload: {
            SERVICES: updatedSERVICES
          }
        } )
      }
    } else {
      console.log( res.err )
    }
  } catch ( error ) {
    console.log( 'error', error )
  }
}

export const approveTrustedContactWatcher = createWatcher(
  approveTrustedContactWorker,
  APPROVE_TRUSTED_CONTACT,
)


function* initializeTrustedContactWorker( { payload } : {payload: {contact: any, flowKind: InitTrustedContactFlowKind, isGuardian?: boolean, channelKey?: string, contactsSecondaryChannelKey?: string, shareId?: string}} ) {
  const accountShells: AccountShell[] = yield select(
    ( state ) => state.accounts.accountShells,
  )
  const keeperInfo: KeeperInfoInterface[] = yield select(
    ( state ) => state.health.keeperInfo,
  )
  const MetaShares: MetaShare[] = yield select(
    ( state ) => state.health.service.levelhealth.metaSharesKeeper,
  )
  const secureAccount: SecureAccount = yield select(
    ( state ) => state.accounts[ SECURE_ACCOUNT ].service,
  )
  const { contact, flowKind, isGuardian, channelKey, contactsSecondaryChannelKey, shareId } = payload
  let info = ''
  if ( contact && contact.phoneNumbers && contact.phoneNumbers.length ) {
    const phoneNumber = contact.phoneNumbers[ 0 ].number
    let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
    number = number.slice( number.length - 10 ) // last 10 digits only
    info = number
  } else if ( contact && contact.emails && contact.emails.length ) {
    info = contact.emails[ 0 ].email
  }

  const contactDetails: ContactDetails = {
    id: contact.id,
    contactName: contact.name,
    info: info? info.trim(): null,
    image: contact.imageAvailable? contact.image: null
  }

  const contactInfo: ContactInfo = {
    contactDetails,
    flowKind,
    channelKey,
    contactsSecondaryChannelKey
  }

  if( isGuardian ) {
    // TODO: prepare channel assets and plug into contactInfo obj
    contactInfo.isGuardian = isGuardian
    contactInfo.channelAssets = {
      primaryMnemonicShard:
      {
        ...MetaShares.find( value=>value.shareId==shareId ),
        encryptedShare: {
          pmShare: MetaShares.find( value=>value.shareId==shareId ).encryptedShare.pmShare,
          smShare: '',
          bhXpub: '',
        }
      },
      secondaryMnemonicShard: MetaShares.find( value=>value.shareId==shareId ).encryptedShare.smShare,
      keeperInfo: keeperInfo,
      bhXpub: secureAccount.secureHDWallet.xpubs.bh,
    }
  }

  let parentShell: AccountShell
  accountShells.forEach( ( shell: AccountShell ) => {
    if( !shell.primarySubAccount.instanceNumber ){
      if( shell.primarySubAccount.sourceKind === REGULAR_ACCOUNT ) parentShell = shell
    }
  } )
  const newSecondarySubAccount = new TrustedContactsSubAccountInfo( {
    accountShellID: parentShell.id,
    isTFAEnabled: parentShell.primarySubAccount.sourceKind === SourceAccountKind.SECURE_ACCOUNT? true: false,
  } )

  yield put(
    addNewSecondarySubAccount( newSecondarySubAccount, parentShell, contactInfo ),
  )
}

export const initializeTrustedContactWatcher = createWatcher(
  initializeTrustedContactWorker,
  INITIALIZE_TRUSTED_CONTACT,
)

function* removeTrustedContactWorker( { payload } ) {
  const trustedContactsService: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const trustedContactsInfo = yield select(
    ( state ) => state.trustedContacts.trustedContactsInfo,
  )
  const regularAccount: RegularAccount = yield select(
    ( state ) => state.accounts[ REGULAR_ACCOUNT ].service,
  )
  const { DECENTRALIZED_BACKUP } = yield select(
    ( state ) => state.storage.database,
  )
  const shareTransferDetails = {
    ...DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
  }

  let { contactName, shareIndex } = payload // shareIndex is passed in case of Guardian
  contactName = contactName.toLowerCase().trim()

  const {
    walletID,
    FCMs,
    isGuardian,
    trustedChannel,
  } = trustedContactsService.tc.trustedContacts[ contactName ]

  const dataElements: TrustedDataElements = {
    remove: true,
  }
  // if (isGuardian) dataElements = { removeGuardian: true }; // deprecates guardian to trusted contact
  // else
  //   dataElements = {
  //     remove: true,
  //   };

  if ( trustedChannel ) {
    // removing established trusted contacts
    yield call(
      trustedContactsService.updateTrustedChannel,
      contactName,
      dataElements,
    )
  }

  if ( isGuardian && !trustedChannel ) {
    // Guardians gets removed post request expiry
    trustedContactsService.tc.trustedContacts[ contactName ].isGuardian = false
    // if (shareIndex !== null && shareIndex <= 2)
    //   s3Service.resetSharesHealth(shareIndex);
    delete shareTransferDetails[ shareIndex ] // enables createGuardian on manage backup

    // resets the highlight flag for manage backup
    let autoHighlightFlags = yield call(
      AsyncStorage.getItem,
      'AutoHighlightFlags',
    )
    if ( autoHighlightFlags ) {
      autoHighlightFlags = JSON.parse( autoHighlightFlags )
      if ( shareIndex === 0 )
        autoHighlightFlags = {
          ...autoHighlightFlags, secondaryDevice: false
        }
      else if ( shareIndex === 1 )
        autoHighlightFlags = {
          ...autoHighlightFlags, trustedContact1: false
        }
      else if ( shareIndex === 2 )
        autoHighlightFlags = {
          ...autoHighlightFlags, trustedContact2: false
        }

      AsyncStorage.setItem(
        'AutoHighlightFlags',
        JSON.stringify( autoHighlightFlags ),
      )
    }
  }
  delete trustedContactsService.tc.trustedContacts[ contactName ]

  // remove contact details from trusted derivative account
  const { trustedContactToDA, derivativeAccounts } = regularAccount.hdWallet
  const accountNumber = trustedContactToDA[ contactName ]
  if ( accountNumber ) {
    delete derivativeAccounts[ TRUSTED_CONTACTS ][ accountNumber ].contactDetails
  }

  const tcInfo = trustedContactsInfo
  if ( tcInfo.length ) {
    for ( let itr = 0; itr < tcInfo.length; itr++ ) {
      const trustedContact = tcInfo[ itr ]
      if ( trustedContact ) {
        const presentContactName = `${trustedContact.firstName} ${
          trustedContact.lastName ? trustedContact.lastName : ''
        }`
          .toLowerCase()
          .trim()

        if ( presentContactName === contactName ) {
          if ( itr < 3 ) {
            // let found = false;
            // for (let i = 3; i < tcInfo.length; i++) {
            //   if (tcInfo[i] && tcInfo[i].name == tcInfo[itr].name) {
            //     found = true;
            //     break;
            //   }
            // }
            // push if not already present in TC list
            // if (!found) tcInfo.push(tcInfo[itr]);
            tcInfo[ itr ] = null // Guardian position nullified
          } else tcInfo.splice( itr, 1 )
          // yield call(
          //   AsyncStorage.setItem,
          //   'TrustedContactsInfo',
          //   JSON.stringify(tcInfo),
          // );
          // yield put( updateTrustedContactsInfoLocally( tcInfo ) )
          break
        }
      }
    }
  }

  let dbPayload = {
  }
  const { SERVICES } = yield select( ( state ) => state.storage.database )
  const updatedSERVICES = {
    ...SERVICES,
    REGULAR_ACCOUNT: JSON.stringify( regularAccount ),
    TRUSTED_CONTACTS: JSON.stringify( trustedContactsService ),
  }
  dbPayload = {
    SERVICES: updatedSERVICES
  }

  if ( isGuardian ) {
    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      SHARES_TRANSFER_DETAILS: shareTransferDetails,
    }
    dbPayload = {
      ...dbPayload, DECENTRALIZED_BACKUP: updatedBackup
    }
  }

  yield call( insertDBWorker, {
    payload: dbPayload,
  } )

  if ( walletID && FCMs ) {
    const recipient = {
      walletID,
      FCMs,
    }
    const { walletName } = yield select(
      ( state ) => state.storage.database.WALLET_SETUP,
    )

    const notification: INotification = {
      notificationType: notificationType.contact,
      title: 'Friends and Family notification',
      body: `F&F removed by ${walletName}`,
      data: {
      },
      tag: notificationTag.IMP,
    }
    sendNotification( recipient, notification )
  }
}

export const removeTrustedContactWatcher = createWatcher(
  removeTrustedContactWorker,
  REMOVE_TRUSTED_CONTACT,
)

function* updateEphemeralChannelWorker( { payload } ) {
  try{
    yield put( switchTCLoading( 'updateEphemeralChannel' ) )

    let trustedContacts: TrustedContactsService = payload.trustedContacts

    if ( !trustedContacts )
      trustedContacts = yield select( ( state ) => state.trustedContacts.service )
    const regularService: RegularAccount = yield select(
      ( state ) => state.accounts[ REGULAR_ACCOUNT ].service,
    )
    const testService: TestAccount = yield select(
      ( state ) => state.accounts[ TEST_ACCOUNT ].service,
    )

    const { contactInfo, data, fetch, isFromKeeper } = payload

    let generatedKey = false
    if (
      !contactInfo.info &&
   ( contactInfo.contactName == 'Personal Device'.toLowerCase() || contactInfo.contactName == 'Personal Device1'.toLowerCase() ||  contactInfo.contactName == 'Personal Device2'.toLowerCase() ||  contactInfo.contactName == 'Personal Device3'.toLowerCase() )
    ) {
    // contact info = null, for secondary device (initially)
      contactInfo.info = SSS.generateKey( SSS.cipherSpec.keyLength )
      generatedKey = true
    }
    let encKey
    if ( contactInfo.info ) encKey = SSS.strechKey( contactInfo.info )

    const res = yield call(
      trustedContacts.updateEphemeralChannel,
      contactInfo.contactName,
      data,
      encKey,
      fetch,
      payload.shareUploadables,
    )


    if ( generatedKey ) {
      trustedContacts.tc.trustedContacts[
        contactInfo.contactName.toLowerCase().trim()
      ].secondaryKey = contactInfo.info
    }

    console.log( {
      res
    } )
    if ( res.status === 200 ) {
      // const ephData: EphemeralDataElements = res.data.data
      // if ( ephData && ephData.paymentDetails ) {
      // // using trusted details on TC approval
      //   const { trusted } = ephData.paymentDetails
      //   yield put( paymentDetailsFetched( {
      //     ...trusted
      //   } ) )
      // }

      yield put(
        ephemeralChannelUpdated(
          contactInfo.contactName,
          res.data.updated,
          res.data.data,
        ),
      )

      if ( payload.uploadXpub ) {
        console.log( 'Uploading xpub for: ', contactInfo.contactName )

        let accountNumber =
      regularService.hdWallet.trustedContactToDA[ contactInfo.contactName ]
        if ( !accountNumber ) {
        // initialize a trusted derivative account against the following contact (will get triggered during approval flow)
          const res = regularService.setupDerivativeAccount(
            TRUSTED_CONTACTS,
            null,
            contactInfo.contactName,
          )
          if ( res.status !== 200 ) {
            throw new Error( `${res.err}` )
          } else {
          // refresh the account number and add trusted contact sub acc to acc-shell
            accountNumber =
          regularService.hdWallet.trustedContactToDA[ contactInfo.contactName ]
            const secondarySubAccountId = res.data.accountId

            const accountShells: AccountShell[] = yield select(
              ( state ) => state.accounts.accountShells,
            )
            let parentShell: AccountShell
            accountShells.forEach( ( shell: AccountShell ) => {
              if( !shell.primarySubAccount.instanceNumber ){
                if( shell.primarySubAccount.sourceKind === REGULAR_ACCOUNT ) parentShell = shell
              }
            } )
            const secondarySubAccount = new TrustedContactsSubAccountInfo( {
              accountShellID: parentShell.id,
              isTFAEnabled: parentShell.primarySubAccount.sourceKind === SourceAccountKind.SECURE_ACCOUNT? true: false,
            } )

            secondarySubAccount.id = secondarySubAccountId
            secondarySubAccount.instanceNumber = accountNumber
            secondarySubAccount.balances = {
              confirmed: 0,
              unconfirmed: 0,
            }
            secondarySubAccount.transactions = []

            AccountShell.addSecondarySubAccount(
              parentShell,
              secondarySubAccountId,
              secondarySubAccount,
            )
          }
        }

        const xpub = ( regularService.hdWallet
          .derivativeAccounts[ TRUSTED_CONTACTS ][
            accountNumber
          ] as TrustedContactDerivativeAccountElements ).xpub

        if ( xpub ) {
        // send acceptance notification
          const { walletName } = yield select(
            ( state ) => state.storage.database.WALLET_SETUP,
          )

          const tpub = testService.getTestXpub()
          const { walletId } = regularService.hdWallet.getWalletId()
          const FCM = yield select ( state => state.preferences.fcmTokenValue )

          const data: TrustedDataElements = {
            xpub,
            tpub,
            walletID: walletId,
            FCM,
            walletName,
            version: DeviceInfo.getVersion(),
          }
          const updateRes = yield call(
            trustedContacts.updateTrustedChannel,
            contactInfo.contactName,
            data,
            true,
          )
          if ( updateRes.status === 200 ) {
            console.log( 'Xpub updated to TC for: ', contactInfo.contactName )

            const notification: INotification = {
              notificationType: notificationType.contact,
              title: 'Friends and Family notification',
              body: `F&F request accepted by ${walletName}`,
              data: {
              },
              tag: notificationTag.IMP,
            }

            const { walletID, FCMs } = trustedContacts.tc.trustedContacts[
              contactInfo.contactName.toLowerCase().trim()
            ]
            const recipient = {
              walletID,
              FCMs,
            }
            sendNotification( recipient, notification )
          } else
            console.log(
              'Xpub updation to TC failed for: ',
              contactInfo.contactName,
            )
        } else {
          console.log(
            'Derivative xpub generation failed for: ',
            contactInfo.contactName,
          )
        }
      }

      const { SERVICES } = yield select( ( state ) => state.storage.database )
      const updatedSERVICES = {
        ...SERVICES,
        REGULAR_ACCOUNT: JSON.stringify( regularService ),
        TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
      }

      if ( payload.updatedDB ) {
        yield call( insertDBWorker, {
          payload: {
            ...payload.updatedDB,
            SERVICES: {
              ...payload.updatedDB.SERVICES,
              REGULAR_ACCOUNT: updatedSERVICES.REGULAR_ACCOUNT,
              TRUSTED_CONTACTS: updatedSERVICES.TRUSTED_CONTACTS,
            },
          },
        } )
      } else {
        yield call( insertDBWorker, {
          payload: {
            SERVICES: updatedSERVICES
          }
        } )
      }

      const data: EphemeralDataElements = res.data.data
      if ( data && data.shareTransferDetails ) {
        const { otp, encryptedKey } = data.shareTransferDetails
        // yield delay(1000); // introducing delay in order to evade database insertion collision
        if( isFromKeeper ){
          yield call( downloadMetaShareWorkerKeeper, {
            payload: {
              encryptedKey, otp, walletID: data.walletID, walletName: contactInfo.walletName ? contactInfo.walletName : ''
            }
          } )
        } else {
          yield call( downloadMetaShareWorker, {
            payload: {
              encryptedKey, otp, walletID: data.walletID, walletName: contactInfo.walletName ? contactInfo.walletName : ''
            }
          } )
        }
        Toast( 'You have been successfully added as a Keeper' )
        yield put( trustedContactApproved( contactInfo.contactName, true ) )
      } else if ( payload.uploadXpub ) {
        Toast( 'Contact successfully added to Friends and Family' )
        yield put( trustedContactApproved( contactInfo.contactName, true ) )
      }
    } else {
      console.log( res.err )
    }
    yield put( switchTCLoading( 'updateEphemeralChannel' ) )
  }
  catch( err ){
    console.log( 'updateEphemeralChannelWorker error', err )
    yield put( switchTCLoading( 'updateEphemeralChannel' ) )
  }
}

export const updateEphemeralChannelWatcher = createWatcher(
  updateEphemeralChannelWorker,
  UPDATE_EPHEMERAL_CHANNEL,
)

function* fetchEphemeralChannelWorker( { payload } ) {
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const newBHRFlowStarted = yield select( ( state ) => state.health.newBHRFlowStarted )

  const { contactInfo, approveTC, publicKey } = payload // if publicKey: fetching just the payment details
  const encKey = SSS.strechKey( contactInfo.info )
  const res = yield call(
    trustedContacts.fetchEphemeralChannel,
    contactInfo.contactName,
    encKey,
    approveTC,
    publicKey,
  )
  if ( res.status === 200 ) {
    const data: EphemeralDataElements = res.data.data
    if ( publicKey ) {
      // if ( data && data.paymentDetails ) {
      //   // using alternate details on TC rejection
      //   const { alternate } = data.paymentDetails
      //   yield put( paymentDetailsFetched( {
      //     ...alternate
      //   } ) )
      // }

      return
    }

    if ( data && data.shareTransferDetails ) {
      const { otp, encryptedKey } = data.shareTransferDetails
      if( newBHRFlowStarted ) downloadMShareHealth( {
        encryptedKey, otp
      } )
      else downloadMShareSSS( {
        encryptedKey, otp
      } )
    }

    yield put( ephemeralChannelFetched( contactInfo.contactName, data ) )
    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
    }
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )
  } else {
    console.log( res.err )
  }
}

export const fetchEphemeralChannelWatcher = createWatcher(
  fetchEphemeralChannelWorker,
  FETCH_EPHEMERAL_CHANNEL,
)

function* updateTrustedChannelWorker( { payload } ) {
  yield put( switchTCLoading( 'updateTrustedChannel' ) )

  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const { contactInfo, data, fetch } = payload
  const res = yield call(
    trustedContacts.updateTrustedChannel,
    contactInfo.contactName,
    data,
    fetch,
    payload.shareUploadables,
  )
  if ( res.status === 200 ) {
    const { updated, data } = res.data
    yield put( trustedChannelUpdated( contactInfo.contactName, updated, data ) )
    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
    }

    if ( payload.updatedDB ) {
      yield call( insertDBWorker, {
        payload: {
          ...payload.updatedDB,
          SERVICES: {
            ...payload.updatedDB.SERVICES, ...updatedSERVICES
          },
        },
      } )
    } else {
      yield call( insertDBWorker, {
        payload: {
          SERVICES: updatedSERVICES
        }
      } )
    }
  } else {
    console.log( res.err )
  }
  yield put( switchTCLoading( 'updateTrustedChannel' ) )
}

export const updateTrustedChannelWatcher = createWatcher(
  updateTrustedChannelWorker,
  UPDATE_TRUSTED_CHANNEL,
)


function* fetchTrustedChannelWorker( { payload } ) {
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )

  const { contactInfo, action, contactsWalletName } = payload

  const res = yield call(
    trustedContacts.fetchTrustedChannel,
    contactInfo.contactName,
    contactsWalletName,
  )

  console.log( {
    res
  } )
  if ( res.status === 200 ) {
    const data: TrustedDataElements = res.data.data
    yield put( trustedChannelFetched( contactInfo.contactName, data ) )
    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const newBHRFlowStarted = yield select( ( state ) => state.health.newBHRFlowStarted )
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
    }
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )

    if ( action === trustedChannelActions.downloadShare ) {
      if ( data && data.shareTransferDetails ) {
        Toast( 'You have been successfully added as a Keeper' )
        const { otp, encryptedKey } = data.shareTransferDetails
        // yield delay(1000); // introducing delay in order to evade database insertion collision
        if( newBHRFlowStarted ) yield put( downloadMShareHealth( {
          encryptedKey, otp, walletName: contactsWalletName
        } ) )
        else yield put( downloadMShareSSS( {
          encryptedKey, otp, walletName: contactsWalletName
        } ) )
      }
    }
  } else {
    console.log( res.err )
  }
}

export const fetchTrustedChannelWatcher = createWatcher(
  fetchTrustedChannelWorker,
  FETCH_TRUSTED_CHANNEL,
)

function* syncPermanentChannelsWorker( { payload }: {payload: { channelUpdates: { contactInfo: ContactInfo, streamUpdates: UnecryptedStreamData }[], updatedSERVICES?: ServicesJSON }} ) {
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )

  const { channelUpdates } = payload
  const channelSyncUpdates: {
    contactDetails: ContactDetails,
    channelKey: string,
    streamId: string,
    secondaryChannelKey?: string,
    unEncryptedOutstreamUpdates?: UnecryptedStreamData,
    contactsSecondaryChannelKey?: string
  }[] = []
  let flowKind: InitTrustedContactFlowKind
  let contactIdentifier: string
  for( const { contactInfo, streamUpdates } of channelUpdates ){
    channelSyncUpdates.push( {
      contactDetails: contactInfo.contactDetails,
      channelKey: contactInfo.channelKey,
      streamId: streamUpdates.streamId,
      secondaryChannelKey: contactInfo.secondaryChannelKey,
      unEncryptedOutstreamUpdates: streamUpdates,
      contactsSecondaryChannelKey: contactInfo.contactsSecondaryChannelKey
    } )
    flowKind = contactInfo.flowKind
    contactIdentifier = contactInfo.channelKey
  }

  if( !channelSyncUpdates.length ) throw new Error( 'Sync permanent channels failed: channel sync updates missing' )
  const res = yield call(
    trustedContacts.syncPermanentChannels,
    channelSyncUpdates
  )
  if ( res.status === 200 ) {
    const SERVICES  = payload.updatedSERVICES? payload.updatedSERVICES: yield select( ( state ) => state.storage.database.SERVICES )
    const updatedSERVICES: ServicesJSON = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
    }

    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )

    if( flowKind === InitTrustedContactFlowKind.APPROVAL ){
      const accountsState: AccountsState = yield select( state => state.accounts )
      const regularAccount: RegularAccount = accountsState[ REGULAR_ACCOUNT ].service
      const { walletId } = regularAccount.hdWallet.getWalletId()

      const contact: TrustedContact = trustedContacts.tc.trustedContactsV2[ contactIdentifier ]
      const instream: UnecryptedStreamData = useStreamFromContact( contact, walletId, true )
      const fcmToken: string = idx( instream, ( _ ) => _.primaryData.FCM )
      const relationType: TrustedContactRelationTypes = idx( instream, ( _ ) => _.primaryData.relationType )

      if( fcmToken ){
        //TODO: send approval notification
      }
      if( relationType === TrustedContactRelationTypes.KEEPER )
        Toast( 'You have been successfully added as a Keeper' )
      else if ( relationType === TrustedContactRelationTypes.CONTACT )
        Toast( 'Contact successfully added to Friends and Family' )
    }
  } else {
    console.log( res.err )
    if( flowKind === InitTrustedContactFlowKind.APPROVAL ){
      Toast( 'Failed to add Keeper/Contact' )
    }
  }
}

export const syncPermanentChannelsWatcher = createWatcher(
  syncPermanentChannelsWorker,
  SYNC_PERMANENT_CHANNELS,
)

function* syncExistingPermanentChannelsWorker( { payload }: {payload: { inProgressChannelsOnly: boolean}} ) {
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const accountsState: AccountsState = yield select( state => state.accounts )
  const regularAccount: RegularAccount = accountsState[ REGULAR_ACCOUNT ].service

  const existingContacts = trustedContacts.tc.trustedContactsV2
  if( !Object.keys( existingContacts ).length ) {
    yield put ( existingPermanentChannelsSynched( {
      successful: true
    } ) )
    return
  }

  const { walletId } = regularAccount.hdWallet.getWalletId()
  const streamId = TrustedContacts.getStreamId( walletId )
  const { inProgressChannelsOnly } = payload

  const channelSyncUpdates: {
    contactDetails: ContactDetails,
    channelKey: string,
    streamId: string,
    secondaryChannelKey?: string,
    unEncryptedOutstreamUpdates?: UnecryptedStreamData,
    contactsSecondaryChannelKey?: string
  }[] = []

  Object.keys( existingContacts ).forEach( channelKey => {
    const contact = existingContacts[ channelKey ]
    const instream = useStreamFromContact( contact, walletId, true )
    if( inProgressChannelsOnly ){
      if( !instream )
        channelSyncUpdates.push( {
          contactDetails: contact.contactDetails,
          channelKey: channelKey,
          streamId
        } )
    } else
      channelSyncUpdates.push( {
        contactDetails: contact.contactDetails,
        channelKey: channelKey,
        streamId
      } )
  } )

  let res
  if( channelSyncUpdates.length )
    res = yield call(
      trustedContacts.syncPermanentChannels,
      channelSyncUpdates
    )
  else {
    yield put ( existingPermanentChannelsSynched( {
      successful: true
    } ) )
    return
  }

  if ( res.status === 200 ) {
    const SERVICES  = yield select( ( state ) => state.storage.database.SERVICES )
    const updatedSERVICES: ServicesJSON = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
    }

    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )

    yield put ( existingPermanentChannelsSynched( {
      successful: true
    } ) )
  } else {
    console.log( {
      err: res.err
    } )
    yield put ( existingPermanentChannelsSynched( {
      successful: false
    } ) )
  }
}

export const syncExistingPermanentChannelsWatcher = createWatcher(
  syncExistingPermanentChannelsWorker,
  SYNC_EXISTING_PERMANENT_CHANNELS,
)

// export function* trustedChannelsSetupSyncWorker() {
//   // TODO: simplify and optimise the saga
//   yield put( switchTCLoading( 'trustedChannelsSetupSync' ) )

//   const trustedContacts: TrustedContactsService = yield select(
//     ( state ) => state.trustedContacts.service,
//   )
//   const regularService: RegularAccount = yield select(
//     ( state ) => state.accounts[ REGULAR_ACCOUNT ].service,
//   )
//   const preSyncReg = JSON.stringify( regularService )
//   const testService: TestAccount = yield select(
//     ( state ) => state.accounts[ TEST_ACCOUNT ].service,
//   )

//   const contacts: Contacts = trustedContacts.tc.trustedContacts
//   let DHInfos
//   for ( const contactName of Object.keys( contacts ) ) {
//     let { trustedChannel, ephemeralChannel, encKey } = contacts[ contactName ]

//     if ( !trustedChannel ) {
//       // trusted channel not setup; probably need to still get the counter party's pubKey

//       // update DHInfos(once) only if there's a contact w/ trusted channel pending
//       if ( !DHInfos ) {
//         yield call( fetchNotificationsWorker ) // refreshes DHInfos
//         DHInfos = yield call( AsyncStorage.getItem, 'DHInfos' )
//         if ( DHInfos ) {
//           DHInfos = JSON.parse( DHInfos )
//         } else {
//           DHInfos = []
//         }
//       }

//       let contactsPublicKey
//       DHInfos.forEach( ( dhInfo: { address: string; publicKey: string } ) => {
//         if ( dhInfo.address === ephemeralChannel.address ) {
//           contactsPublicKey = dhInfo.publicKey
//         }
//       } )

//       if ( contactsPublicKey ) {
//         const res = yield call(
//           trustedContacts.finalizeContact,
//           contactName,
//           contactsPublicKey,
//           encKey,
//         )

//         if ( res.status !== 200 ) {
//           console.log(
//             `Failed to setup trusted channel with contact ${contactName}`,
//           )
//           continue
//         } else {
//           // refresh the trustedChannel object
//           trustedChannel =
//             trustedContacts.tc.trustedContacts[ contactName.trim() ]
//               .trustedChannel
//         }
//       } else {
//         // ECDH pub not available for this contact
//         continue
//       }
//     }

//     if ( trustedChannel.data && trustedChannel.data.length ) {
//       if ( trustedChannel.data.length !== 2 ) {
//         // implies missing trusted data from the counter party
//         const res = yield call(
//           trustedContacts.fetchTrustedChannel,
//           contactName,
//         )
//         console.log( {
//           res
//         } )
//         if ( res.status === 200 ) {
//           console.log( 'Attempted a fetch from TC with: ', contactName )
//           const { data } = res.data
//           if ( data )
//             console.log( 'Received data from TC with: ', contactName, data )

//           // update the xpub to the trusted contact derivative acc if contact's xpub is received
//           trustedChannel =
//             trustedContacts.tc.trustedContacts[ contactName.trim() ]
//               .trustedChannel // refresh trusted channel
//           if ( trustedChannel.data.length === 2 ) {
//             const contactsData = trustedChannel.data[ 1 ].data
//             if ( contactsData && contactsData.xpub ) {
//               const accountNumber =
//                 regularService.hdWallet.trustedContactToDA[ contactName ]
//               if ( accountNumber ) {
//                 ( regularService.hdWallet.derivativeAccounts[ TRUSTED_CONTACTS ][
//                   accountNumber
//                 ] as TrustedContactDerivativeAccountElements ).xpubDetails = {
//                   xpub: contactsData.xpub,
//                   tpub: contactsData.tpub,
//                 }

//                 console.log(
//                   `Updated ${contactName}'s xpub to TrustedContact Derivative Account`,
//                 )
//               } else {
//                 console.log(
//                   'Failed to find account number corersponding to contact: ',
//                   contactName,
//                 )
//               }
//             } else {
//               console.log(
//                 'Missing xpub corresponding to contact: ',
//                 contactName,
//               )
//             }
//           }
//         }
//       } else {
//         // updating trusted derivative acc(from trusted-channel) in case of non-updation(handles recovery failures)
//         const accountNumber =
//           regularService.hdWallet.trustedContactToDA[ contactName ]
//         if ( accountNumber ) {
//           const { xpubDetails } = regularService.hdWallet.derivativeAccounts[
//             TRUSTED_CONTACTS
//           ][ accountNumber ] as TrustedContactDerivativeAccountElements
//           if ( !xpubDetails || !xpubDetails.xpub ) {
//             const contactsData = trustedChannel.data[ 1 ].data
//             if ( contactsData && contactsData.xpub ) {
//               ( regularService.hdWallet.derivativeAccounts[ TRUSTED_CONTACTS ][
//                 accountNumber
//               ] as TrustedContactDerivativeAccountElements ).xpubDetails = {
//                 xpub: xpubDetails.xpub,
//                 tpub: xpubDetails.tpub,
//               }

//               console.log(
//                 `Updated ${contactName}'s xpub to TrustedContact Derivative Account`,
//               )
//             } else {
//               console.log(
//                 'Missing xpub corresponding to contact: ',
//                 contactName,
//               )
//             }
//           }
//         }
//       }
//     } else {
//       // generate a corresponding derivative acc and assign xpub(uploading info to trusted channel)
//       let accountNumber =
//       regularService.hdWallet.trustedContactToDA[ contactName ]
//       if ( !accountNumber ) {
//         // initialize a trusted derivative account against the following contact
//         const res = regularService.setupDerivativeAccount(
//           TRUSTED_CONTACTS,
//           null,
//           contactName,
//         )
//         if ( res.status !== 200 ) {
//           throw new Error( `${res.err}` )
//         } else {
//           // refresh the account number and add trusted contact sub acc to acc-shell
//           accountNumber =
//           regularService.hdWallet.trustedContactToDA[ contactName ]
//           const secondarySubAccountId = res.data.accountId

//           const accountShells: AccountShell[] = yield select(
//             ( state ) => state.accounts.accountShells,
//           )
//           let parentShell: AccountShell
//           accountShells.forEach( ( shell: AccountShell ) => {
//             if( !shell.primarySubAccount.instanceNumber ){
//               if( shell.primarySubAccount.sourceKind === REGULAR_ACCOUNT ) parentShell = shell
//             }
//           } )
//           const secondarySubAccount = new TrustedContactsSubAccountInfo( {
//             accountShellID: parentShell.id,
//             isTFAEnabled: parentShell.primarySubAccount.sourceKind === SourceAccountKind.SECURE_ACCOUNT? true: false,
//           } )

//           secondarySubAccount.id = secondarySubAccountId
//           secondarySubAccount.instanceNumber = accountNumber
//           secondarySubAccount.balances = {
//             confirmed: 0,
//             unconfirmed: 0,
//           }
//           secondarySubAccount.transactions = []
//           AccountShell.addSecondarySubAccount(
//             parentShell,
//             secondarySubAccountId,
//             secondarySubAccount,
//           )
//         }
//       }

//       const xpub = ( regularService.hdWallet
//         .derivativeAccounts[ TRUSTED_CONTACTS ][
//           accountNumber
//         ] as TrustedContactDerivativeAccountElements ).xpub

//       if ( xpub ) {
//         const tpub = testService.getTestXpub()
//         const data: TrustedDataElements = {
//           xpub,
//           tpub,
//         }
//         const updateRes = yield call(
//           trustedContacts.updateTrustedChannel,
//           contactName,
//           data,
//           true,
//         )

//         if ( updateRes.status === 200 ) {
//           console.log( 'Xpub updated to TC for: ', contactName )
//           if ( updateRes.data.data ) {
//             // received some data back from the channel; probably contact's xpub
//             console.log( 'Received data from TC with: ', contactName )

//             // update the xpub to the trusted contact derivative acc if contact's xpub is received
//             const trustedChannel =
//               trustedContacts.tc.trustedContacts[ contactName.trim() ]
//                 .trustedChannel // refresh trusted channel
//             if ( trustedChannel.data.length === 2 ) {
//               const contactsData = trustedChannel.data[ 1 ].data
//               if ( contactsData && contactsData.xpub ) {
//                 const accountNumber =
//                   regularService.hdWallet.trustedContactToDA[ contactName ]
//                 if ( accountNumber ) {
//                   ( regularService.hdWallet.derivativeAccounts[ TRUSTED_CONTACTS ][
//                     accountNumber
//                   ] as TrustedContactDerivativeAccountElements ).contactDetails = {
//                     xpub: contactsData.xpub,
//                     tpub: contactsData.tpub,
//                   }

//                   console.log(
//                     `Updated ${contactName}'s xpub to TrustedContact Derivative Account`,
//                   )
//                 } else {
//                   console.log(
//                     'Failed to find account number corersponding to contact: ',
//                     contactName,
//                   )
//                 }
//               } else {
//                 console.log(
//                   'Missing xpub corresponding to contact: ',
//                   contactName,
//                 )
//               }
//             }
//           }
//         }
//       } else {
//         console.log( `Failed to generate xpub for ${contactName}` )
//       }
//     }
//   }

//   const preSyncTC = yield call( AsyncStorage.getItem, 'preSyncTC' )
//   const postSyncTC = JSON.stringify( trustedContacts.tc.trustedContacts )
//   const postSyncReg = JSON.stringify( regularService )

//   if (
//     Object.keys( trustedContacts.tc.trustedContacts ).length &&
//     ( !preSyncTC || preSyncTC !== postSyncTC || preSyncReg !== postSyncReg )
//   ) {
//     const { SERVICES } = yield select( ( state ) => state.storage.database )
//     const updatedSERVICES = {
//       ...SERVICES,
//       REGULAR_ACCOUNT: JSON.stringify( regularService ),
//       TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
//     }
//     yield call( insertDBWorker, {
//       payload: {
//         SERVICES: updatedSERVICES
//       },
//     } )

//     // console.log('Updating WI...');
//     // yield put(updateWalletImage()); // TODO: re-enable once the WI updation is refactored and optimised

//     yield call( AsyncStorage.setItem, 'preSyncTC', postSyncTC )
//   }

//   yield put( switchTCLoading( 'trustedChannelsSetupSync' ) )

//   // synching trusted channel data
//   yield put( syncTrustedChannels() )
// }

// export const trustedChannelsSetupSyncWatcher = createWatcher(
//   trustedChannelsSetupSyncWorker,
//   TRUSTED_CHANNELS_SETUP_SYNC,
// )

function* walletCheckInWorker( { payload } ) {
  // syncs last seen, health & exchange rates
  const newBHRFlowStarted = yield select( ( state ) => state.health.newBHRFlowStarted )
  let s3Service: S3Service
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const walletCheckInLoading: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.loading.walletCheckIn,
  )
  if( newBHRFlowStarted === true ){
    s3Service = yield select( ( state ) => state.health.service )
  } else {
    s3Service = yield select( ( state ) => state.sss.service )
  }

  const storedExchangeRates = yield select(
    ( state ) => state.accounts.exchangeRates,
  )
  const storedAverageTxFees = yield select(
    ( state ) => state.accounts.averageTxFees,
  )

  const DECENTRALIZED_BACKUP = yield select(
    ( state ) => state.storage.database.DECENTRALIZED_BACKUP,
  )
  const underCustody = {
    ...DECENTRALIZED_BACKUP.UNDER_CUSTODY
  }
  const metaSharesUnderCustody = Object.keys( underCustody ).map(
    ( tag ) => underCustody[ tag ].META_SHARE,
  )

  try{
    if( !walletCheckInLoading ) yield put( switchTCLoading( 'walletCheckIn' ) )
    console.log( 'Wallet Check-In in progress...' )

    const { synchingContacts, currencyCode } = payload
    if (
      synchingContacts &&
      !Object.keys( trustedContacts.tc.trustedContacts ).length
    ) {
      yield put( calculateOverallHealth( s3Service ) )
      yield put( switchTCLoading( 'walletCheckIn' ) )
      return // aborting checkIn if walletSync is specifically done in context of trusted-contacts
    }

    const preSyncTC = JSON.stringify( trustedContacts.tc.trustedContacts )

    const { metaShares, healthCheckStatus } = s3Service.sss
    const preSyncHCStatus = JSON.stringify( {
      healthCheckStatus
    } )
    const shareArray = [] // healths to update(shares under custody)
    for ( const share of metaSharesUnderCustody ) {
      if( semver.gte( share.meta.version, '1.5.0' ) ) {
        shareArray.push( {
          walletId: share.meta.walletId,
          shareId: share.shareId,
          reshareVersion: share.meta.reshareVersion,
          updatedAt: moment( new Date() ).valueOf(),
          status: 'accessible',
        } )
      }
    }
    yield put( updateMSharesHealth( shareArray, true )  )
    const res = yield call(
      trustedContacts.walletCheckIn,
      metaShares.length ? metaShares.slice( 0, 3 ) : null, // metaShares is null during wallet-setup
      metaShares.length ? healthCheckStatus : {
      },
      metaSharesUnderCustody,
      currencyCode
    )

    if ( res.status === 200 ) {
      const { updationInfo, exchangeRates, averageTxFees } = res.data
      console.log( {
        exchangeRates
      } )
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

      let shareRemoved = false
      if ( updationInfo ) {
        // removing shares under-custody based on reshare-version@HealthSchema
        Object.keys( underCustody ).forEach( ( tag ) => {
          for ( const info of updationInfo ) {
            if ( info.updated ) {
              // if (info.walletId === UNDER_CUSTODY[tag].META_SHARE.meta.walletId) {
              //   // UNDER_CUSTODY[tag].LAST_HEALTH_UPDATE = info.updatedAt;
              //   if (info.encryptedDynamicNonPMDD)
              //     UNDER_CUSTODY[tag].ENC_DYNAMIC_NONPMDD =
              //       info.encryptedDynamicNonPMDD;
              // }
            } else {
              if ( info.removeShare ) {
                if (
                  info.walletId === underCustody[ tag ].META_SHARE.meta.walletId
                ) {
                  delete underCustody[ tag ]
                  shareRemoved = true
                  for ( const contactName of Object.keys(
                    trustedContacts.tc.trustedContacts,
                  ) ) {
                    const contact =
                      trustedContacts.tc.trustedContacts[ contactName ]
                    if ( contact.walletID === info.walletId ) {
                      contact.isWard = false
                    }
                  }
                }
              }
            }
          }
        } )
      }

      const postSyncTC = JSON.stringify( trustedContacts.tc.trustedContacts )
      const { healthCheckStatus } = res.data
      const postSyncHCStatus = JSON.stringify( {
        healthCheckStatus
      } )

      if (
        preSyncTC !== postSyncTC ||
        preSyncHCStatus !== postSyncHCStatus ||
        shareRemoved
      ) {
        let dbPayload = {
        }
        const { SERVICES } = yield select( ( state ) => state.storage.database )
        let updatedSERVICES = {
          ...SERVICES,
          TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
        }

        if ( preSyncHCStatus !== postSyncHCStatus ) {
          s3Service.sss.healthCheckStatus = healthCheckStatus
          updatedSERVICES = {
            ...updatedSERVICES,
            S3_SERVICE: JSON.stringify( s3Service ),
          }
        }
        dbPayload = {
          SERVICES: updatedSERVICES,
        }

        if ( shareRemoved ) {
          const updatedBackup = {
            ...DECENTRALIZED_BACKUP,
            UNDER_CUSTODY: underCustody,
          }
          dbPayload = {
            ...dbPayload, DECENTRALIZED_BACKUP: updatedBackup
          }
        }

        yield call( insertDBWorker, {
          payload: dbPayload,
        } )
      }
    } else {
      console.log( 'Check-In failed', res.err )
    }

    if ( metaShares.length ) yield put( calculateOverallHealth( s3Service ) )
    yield put( switchTCLoading( 'walletCheckIn' ) )
  } catch( err ){
    console.log( 'Wallet Check-In failed w/ the following err: ', err )
    yield put( switchTCLoading( 'walletCheckIn' ) )
  }
}

export const walletCheckInWatcher = createWatcher(
  walletCheckInWorker,
  WALLET_CHECK_IN,
)

function* syncTrustedChannelsWorker( { payload } ) {
  // syncs trusted channels
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const { SERVICES, DECENTRALIZED_BACKUP } = yield select(
    ( state ) => state.storage.database,
  )
  const regularAccount: RegularAccount = yield select(
    ( state ) => state.accounts[ REGULAR_ACCOUNT ].service,
  )

  const sharesUnderCustody = {
    ...DECENTRALIZED_BACKUP.UNDER_CUSTODY
  }

  const { contacts } = payload

  if ( Object.keys( trustedContacts.tc.trustedContacts ).length ) {
    const preSyncTC = JSON.stringify( trustedContacts.tc.trustedContacts )

    const res = yield call( trustedContacts.syncTrustedChannels, contacts )
    console.log( {
      res
    } )

    if ( res.status === 200 && res.data && res.data.synched ) {
      const { contactsToRemove, guardiansToRemove } = res.data

      if ( contactsToRemove.length || guardiansToRemove.length ) {
        const trustedContactsInfo = yield select(
          ( state ) => state.trustedContacts.trustedContactsInfo,
        )
        const tcInfo = trustedContactsInfo ? [ ...trustedContactsInfo ] : null

        // downgrade guardians and remove share
        for ( const guardianName of guardiansToRemove ) {
          trustedContacts.tc.trustedContacts[ guardianName ].isWard = false
          delete sharesUnderCustody[
            trustedContacts.tc.trustedContacts[ guardianName ].contactsWalletName
          ]
        }

        // remove trusted contacts
        for ( const contactName of contactsToRemove ) {
          delete trustedContacts.tc.trustedContacts[ contactName ]

          // remove contact details from trusted derivative account
          const {
            trustedContactToDA,
            derivativeAccounts,
          } = regularAccount.hdWallet
          const accountNumber = trustedContactToDA[ contactName ]
          if ( accountNumber ) {
            delete derivativeAccounts[ TRUSTED_CONTACTS ][ accountNumber ]
              .contactDetails
          }

          if ( tcInfo ) {
            for ( let itr = 0; itr < tcInfo.length; itr++ ) {
              const trustedContact = tcInfo[ itr ]
              if ( trustedContact ) {
                const presentContactName = `${trustedContact.firstName} ${
                  trustedContact.lastName ? trustedContact.lastName : ''
                }`
                  .toLowerCase()
                  .trim()

                if ( presentContactName === contactName ) {
                  if ( itr < 3 ) tcInfo[ itr ] = null
                  // Guardian nullified
                  else tcInfo.splice( itr, 1 )
                  // yield call(
                  //   AsyncStorage.setItem,
                  //   'TrustedContactsInfo',
                  //   JSON.stringify(tcInfo),
                  // );
                  break
                }
              }
            }
          }
        }
        // yield put( updateTrustedContactsInfoLocally( tcInfo ) )
      }

      const postSyncTC = JSON.stringify( trustedContacts.tc.trustedContacts )

      if ( preSyncTC !== postSyncTC || guardiansToRemove.length ) {
        let payload = {
        }
        let updatedSERVICES = {
          ...SERVICES,
          TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
        }

        if ( contactsToRemove.length ) {
          updatedSERVICES = {
            ...updatedSERVICES,
            REGULAR_ACCOUNT: JSON.stringify( regularAccount ),
          }
        }
        payload = {
          SERVICES: updatedSERVICES
        }

        if ( guardiansToRemove.length ) {
          const updatedBackup = {
            ...DECENTRALIZED_BACKUP,
            UNDER_CUSTODY: sharesUnderCustody,
          }
          payload = {
            ...payload, DECENTRALIZED_BACKUP: updatedBackup
          }
        }

        yield call( insertDBWorker, {
          payload,
        } )
        console.log( 'Trusted channels synched' )
      }
    } else {
      console.log( 'Failed to sync trusted channels', res.err )
    }
  }
}

export const syncTrustedChannelsWatcher = createWatcher(
  syncTrustedChannelsWorker,
  SYNC_TRUSTED_CHANNELS,
)

function* postRecoveryChannelSyncWorker( {} ) {
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )

  const trustedData: TrustedDataElements = {
    FCM: yield select ( state => state.preferences.fcmTokenValue ),
    version: DeviceInfo.getVersion(),
  }
  for ( const contactName of Object.keys( trustedContacts.tc.trustedContacts ) ) {
    yield call( trustedContacts.updateTrustedChannel, contactName, trustedData )
  }

  const { SERVICES } = yield select( ( state ) => state.storage.database )
  const updatedSERVICES = {
    ...SERVICES,
    TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
  }

  yield call( insertDBWorker, {
    payload: {
      SERVICES: updatedSERVICES
    }
  } )
}

export const postRecoveryChannelSyncWatcher = createWatcher(
  postRecoveryChannelSyncWorker,
  POST_RECOVERY_CHANNEL_SYNC,
)

function* sendVersionUpdateNotificationWorker( { payload }: {payload: {version: string}} ) {
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const { walletName } = yield select(
    ( state ) => state.storage.database.WALLET_SETUP,
  )

  const contacts: Contacts = trustedContacts.tc.trustedContacts
  const notifReceivers = []
  Object.keys( contacts ).forEach( ( contactName ) => {
    const contact = contacts[ contactName ]
    if ( contact.walletID && contact.FCMs ){
      notifReceivers.push( {
        walletId: contact.walletID,
        FCMs: contact.FCMs,
      } )
    }
  } )

  if( notifReceivers.length ){
    const notification: INotification = {
      notificationType: notificationType.contact,
      title: 'Backup Secured',
      body: `Your backup (Recovery Key) has been secured with ${walletName} as they are on the latest version now`,
      data: {
      },
      tag: notificationTag.IMP,
    }

    yield call(
      RelayServices.sendNotifications,
      notifReceivers,
      notification,
    )

    const trustedData = {
      version: payload.version
    }
    yield put( multiUpdateTrustedChannels( trustedData ) )
  }
}

export const sendVersionUpdateNotificationWatcher = createWatcher(
  sendVersionUpdateNotificationWorker,
  SEND_VERSION_UPDATE_NOTIFICATION,
)

function* multiUpdateTrustedChannelsWorker( { payload }: {payload: {data: TrustedDataElements, contacts?: Contacts}} ) {
  const trustedContacts: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
  )
  const contacts: Contacts = payload.contacts? payload.contacts: trustedContacts.tc.trustedContacts
  const data: TrustedDataElements = {
    ...payload.data
  }

  let channelUpdated = false
  for( const contactName of Object.keys( contacts ) ){
    if( contacts[ contactName ].symmetricKey ){
      yield call( trustedContacts.updateTrustedChannel, contactName, data )
      channelUpdated = true
    }
  }

  if( channelUpdated ){
    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
    }
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )
  }
}

export const multiUpdateTrustedChannelsWatcher = createWatcher(
  multiUpdateTrustedChannelsWorker,
  MULTI_UPDATE_TRUSTED_CHANNELS,
)
