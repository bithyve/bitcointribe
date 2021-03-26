import { call, put, select } from 'redux-saga/effects'
import { createWatcher } from '../utils/utilities'
import { AsyncStorage } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import * as Cipher from '../../common/encryption'
import * as SecureStore from '../../storage/secure-store'
import {
  SETUP_WALLET,
  CREDS_AUTH,
  STORE_CREDS,
  credsStored,
  credsAuthenticated,
  switchSetupLoader,
  switchReLogin,
  INIT_RECOVERY,
  CHANGE_AUTH_CRED,
  credsChanged,
  pinChangedFailed,
  setIsNewHealthSystemSet,
  initializeRecoveryCompleted,
  completedWalletSetup,
  walletSetupFailed,
} from '../actions/setupAndAuth'
import { keyFetched, fetchFromDB } from '../actions/storage'
import { Database } from '../../common/interfaces/Interfaces'
import { insertDBWorker } from './storage'
import config from '../../bitcoin/HexaConfig'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import S3Service from '../../bitcoin/services/sss/S3Service'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import KeeperService from '../../bitcoin/services/KeeperService'
import { getTestcoins } from '../actions/accounts'
import { initializeHealthSetup } from '../actions/health'
// import { timer } from '../../utils'

function* setupWalletWorker( { payload } ) {
  const { walletName, security } = payload
  yield put( setIsNewHealthSystemSet( true ) )

  const services: {
    regularAcc: RegularAccount;
    testAcc: TestAccount;
    secureAcc: SecureAccount;
    s3Service: S3Service;
    trustedContacts: TrustedContactsService;
    keepersInfo: KeeperService;
  } = yield select( ( state ) => state.storage.initialServiceInstances )

  if( !services || !Object.keys( services ).length ) yield put( walletSetupFailed( ) )

  const initialDatabase: Database = {
    WALLET_SETUP: {
      walletName, security
    },
    DECENTRALIZED_BACKUP: {
      RECOVERY_SHARES: {
      },
      SHARES_TRANSFER_DETAILS: {
      },
      UNDER_CUSTODY: {
      },
      DYNAMIC_NONPMDD: {
      },
    },
    SERVICES: {
      REGULAR_ACCOUNT: JSON.stringify( services.regularAcc ),
      TEST_ACCOUNT: JSON.stringify( services.testAcc ),
      SECURE_ACCOUNT: JSON.stringify( services.secureAcc ),
      S3_SERVICE: JSON.stringify( services.s3Service ),
      TRUSTED_CONTACTS: JSON.stringify( services.trustedContacts ),
      KEEPERS_INFO: JSON.stringify( services.keepersInfo ),
    },
    VERSION: DeviceInfo.getVersion(),
  }
  yield call( insertDBWorker, {
    payload: initialDatabase
  } )

  yield call( AsyncStorage.setItem, 'walletExists', 'true' )
  yield put( completedWalletSetup( ) )

  // Post Hydration activities
  // saturate the test account w/ 10K sats
  yield put( getTestcoins() )

  // initialize health-check schema on relay
  yield put( initializeHealthSetup() )
}

export const setupWalletWatcher = createWatcher( setupWalletWorker, SETUP_WALLET )

function* initRecoveryWorker( { payload } ) {
  const { walletName, security } = payload

  const initialDatabase: Database = {
    WALLET_SETUP: {
      walletName, security
    },
    DECENTRALIZED_BACKUP: {
      RECOVERY_SHARES: {
      },
      SHARES_TRANSFER_DETAILS: {
      },
      UNDER_CUSTODY: {
      },
      DYNAMIC_NONPMDD: {
      },
    },
    VERSION: DeviceInfo.getVersion(),
  }

  yield call( insertDBWorker, {
    payload: initialDatabase
  } )
  yield put( initializeRecoveryCompleted( true ) )
  // yield call(AsyncStorage.setItem, "walletExists", "true");
  // yield put(setupInitialized());
}

export const initRecoveryWatcher = createWatcher(
  initRecoveryWorker,
  INIT_RECOVERY,
)

function* credentialsStorageWorker( { payload } ) {
  yield put( switchSetupLoader( 'storingCreds' ) )

  //hash the pin
  const hash = yield call( Cipher.hash, payload.passcode )

  //generate an AES key and ecnrypt it with
  const AES_KEY = yield call( Cipher.generateKey )
  const encryptedKey = yield call( Cipher.encrypt, AES_KEY, hash )

  //store the AES key against the hash
  if ( !( yield call( SecureStore.store, hash, encryptedKey ) ) ) {
    yield call( AsyncStorage.setItem, 'hasCreds', 'false' )
    return
  }

  yield put( keyFetched( AES_KEY ) )
  yield call( AsyncStorage.setItem, 'hasCreds', 'true' )
  yield put( credsStored() )
}

export const credentialStorageWatcher = createWatcher(
  credentialsStorageWorker,
  STORE_CREDS,
)

function* credentialsAuthWorker( { payload } ) {
  console.clear()
  // let t = timer('credentialsAuthWorker')
  yield put( switchSetupLoader( 'authenticating' ) )
  let key
  try {
    const hash = yield call( Cipher.hash, payload.passcode )
    const encryptedKey = yield call( SecureStore.fetch, hash )
    key = yield call( Cipher.decrypt, encryptedKey, hash )
  } catch ( err ) {
    console.log( {
      err
    } )
    if ( payload.reLogin ) yield put( switchReLogin( false ) )
    else yield put( credsAuthenticated( false ) )
    return
  }
  if ( !key ) throw new Error( 'Key missing' )

  if ( payload.reLogin ) {
    yield put( switchReLogin( true ) )
  } else {
    yield put( credsAuthenticated( true ) )
    // t.stop()
    yield put( keyFetched( key ) )

    // initialize configuration file
    const { activePersonalNode } = yield select( state => state.nodeSettings )
    if( activePersonalNode ) config.connectToPersonalNode( activePersonalNode )

    // TODO -- this need to be done on
    yield put( fetchFromDB() )
  }
}

export const credentialsAuthWatcher = createWatcher(
  credentialsAuthWorker,
  CREDS_AUTH,
)

function* changeAuthCredWorker( { payload } ) {
  const { oldPasscode, newPasscode } = payload

  try {
    // verify old pin
    const oldHash = yield call( Cipher.hash, oldPasscode )
    const oldEncryptedKey = yield call( SecureStore.fetch, oldHash )
    const oldKey = yield call( Cipher.decrypt, oldEncryptedKey, oldHash )
    const key = yield select( ( state ) => state.storage.key )
    if ( oldKey !== key ) {
      throw new Error( 'Incorrect Pin' )
    }

    // setup new pin
    const newHash = yield call( Cipher.hash, newPasscode )
    const encryptedKey = yield call( Cipher.encrypt, key, newHash )

    //store the AES key against the hash
    if ( !( yield call( SecureStore.store, newHash, encryptedKey ) ) ) {
      throw new Error( 'Unable to access secure store' )
    }
    yield put( credsChanged( 'changed' ) )
  } catch ( err ) {
    console.log( {
      err
    } )
    yield put( pinChangedFailed( true ) )
    // Alert.alert('Pin change failed!', err.message);
    yield put( credsChanged( 'not-changed' ) )
  }
}

export const changeAuthCredWatcher = createWatcher(
  changeAuthCredWorker,
  CHANGE_AUTH_CRED,
)
