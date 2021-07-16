import { call, put, select } from 'redux-saga/effects'
import { createWatcher } from '../utils/utilities'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
  initializeRecoveryCompleted,
  completedWalletSetup,
  WALLET_SETUP_COMPLETION,
} from '../actions/setupAndAuth'
import { keyFetched, fetchFromDB, updateWallet } from '../actions/storage'
import { Database } from '../../common/interfaces/Interfaces'
import { insertDBWorker } from './storage'
import config from '../../bitcoin/HexaConfig'
import { initializeHealthSetup } from '../actions/health'
import dbManager from '../../storage/realm/dbManager'
import { setWalletId } from '../actions/preferences'
import { AccountType, Wallet } from '../../bitcoin/utilities/Interface'
import S3Service from '../../bitcoin/services/sss/S3Service'
import * as bip39 from 'bip39'
import crypto from 'crypto'
import { addNewAccountShellsWorker, newAccountsInfo } from './accounts'
import { newAccountShellCreationCompleted } from '../actions/accounts'

function* setupWalletWorker( { payload } ) {
  const { walletName, security }: { walletName: string, security: { questionId: string, question: string, answer: string } } = payload
  const primaryMnemonic = bip39.generateMnemonic( 256 )
  const primarySeed = bip39.mnemonicToSeedSync( primaryMnemonic )
  const walletId = crypto.createHash( 'sha256' ).update( primarySeed ).digest( 'hex' )

  const wallet: Wallet = {
    walletId,
    walletName,
    security,
    primaryMnemonic,
    accounts: {
    },
    version: DeviceInfo.getVersion()
  }

  yield put( updateWallet( wallet ) )
  yield put ( setWalletId( ( wallet as Wallet ).walletId ) )

  // prepare default accounts for the wallet
  const accountsInfo: newAccountsInfo[] = [];
  [ AccountType.CHECKING_ACCOUNT, AccountType.SAVINGS_ACCOUNT, AccountType.SWAN_ACCOUNT ].forEach( ( accountType ) => {
    const accountInfo: newAccountsInfo = {
      accountType
    }
    accountsInfo.push( accountInfo )
  } )

  yield call( addNewAccountShellsWorker, {
    payload: accountsInfo
  } )
  yield put( newAccountShellCreationCompleted() )
  yield put( completedWalletSetup( ) )
  yield call( dbManager.createWallet, wallet )
  yield call( AsyncStorage.setItem, 'walletExists', 'true' )

  // TODO: remove legacy DB post S3 service functionalization
  const initialDatabase: Database = {
    SERVICES: {
      S3_SERVICE: JSON.stringify( new S3Service( wallet.primaryMnemonic ) ),
    },
  }

  yield call( insertDBWorker, {
    payload: initialDatabase
  } )
  if( security ) yield put( initializeHealthSetup() )  // initialize health-check schema on relay
}

export const setupWalletWatcher = createWatcher( setupWalletWorker, SETUP_WALLET )

function* initRecoveryWorker( { payload } ) {
  const initialDatabase: Database = {
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
  const uint8array =  yield call( Cipher.stringToArrayBuffer, AES_KEY )
  yield call( dbManager.initDb, uint8array )
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
    const uint8array =  yield call( Cipher.stringToArrayBuffer, key )
    yield call( dbManager.initDb, uint8array )
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
