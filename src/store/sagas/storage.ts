import { call, put, select } from 'redux-saga/effects'
import { createWatcher, serviceGeneratorForNewBHR } from '../utils/utilities'
import {
  INIT_DB,
  dbInitialized,
  FETCH_FROM_DB,
  dbFetched,
  INSERT_INTO_DB,
  dbInserted,
  ENRICH_SERVICES,
  servicesEnriched,
} from '../actions/storage'
import dataManager from '../../storage/database-manager'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import S3Service from '../../bitcoin/services/sss/S3Service'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { AsyncStorage } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import semver from 'semver'
import { upgradeReducer, walletCheckIn } from '../actions/trustedContacts'
import KeeperService from '../../bitcoin/services/KeeperService'
import { updateWalletImageHealth } from '../actions/health'
import config from '../../bitcoin/HexaConfig'
import { servicesInitialized, INITIALIZE_SERVICES } from '../actions/storage'
import { updateWalletImage } from '../actions/sss'
import { TrustedContactsState } from '../reducers/trustedContacts'
// import { timer } from '../../utils'

function* initDBWorker() {
  try {
    yield call( dataManager.initialize )
    yield put( dbInitialized( true ) )
  } catch ( err ) {
    console.log( err )
    yield put( dbInitialized( false ) )
  }
}

export const initDBWatcher = createWatcher( initDBWorker, INIT_DB )

function* initServicesWorker() {
  const { regularAcc, testAcc, secureAcc, s3Service, trustedContacts, keepersInfo } = yield call( serviceGeneratorForNewBHR )
  yield put( servicesInitialized( {
    regularAcc, testAcc, secureAcc, s3Service, trustedContacts, keepersInfo
  } ) )
}

export const initServicesWatcher = createWatcher( initServicesWorker, INITIALIZE_SERVICES )


function* fetchDBWorker() {
  try {
    // let t = timer('fetchDBWorker')
    const key = yield select( ( state ) => state.storage.key )
    const newBHRFlowStarted = yield select( ( state ) => state.health.newBHRFlowStarted )

    const database = yield call( dataManager.fetch, key )
    if ( key && database ) {
      yield call( servicesEnricherWorker, {
        payload: {
          database,
        },
      } )
      yield put( dbFetched( database ) )

      if ( yield call( AsyncStorage.getItem, 'walletExists' ) ) {
        // actions post DB fetch
        yield put( walletCheckIn() )
        if( newBHRFlowStarted === true ){
          yield put( updateWalletImageHealth() )
        }else{
          yield put( updateWalletImage() )
        }


      }
    } else {
      // DB would be absent during wallet setup
    }
  } catch ( err ) {
    console.log( err )
  }
}

export const fetchDBWatcher = createWatcher( fetchDBWorker, FETCH_FROM_DB )

export function* insertDBWorker( { payload } ) {
  try {
    const storage = yield select( ( state ) => state.storage )
    const { database, insertedIntoDB, key } = storage
    if ( !key ) {
      // dispatch failure
      console.log( 'Key missing' )
      return
    }

    const updatedDB = {
      ...database,
      ...payload,
    }

    const inserted = yield call(
      dataManager.insert,
      updatedDB,
      key,
      insertedIntoDB
    )
    if ( !inserted ) {
      // dispatch failure
      console.log( 'Failed to insert into DB' )
      return
    }
    yield put( dbInserted( payload ) )
    // !insertedIntoDB ? yield put( enrichServices( updatedDB ) ) : null; // enriching services post initial insertion
    yield call( servicesEnricherWorker, {
      payload: {
        database: updatedDB,
      },
    } )
  } catch ( err ) {
    console.log( err )
  }
}
export const insertDBWatcher = createWatcher( insertDBWorker, INSERT_INTO_DB )

function* servicesEnricherWorker( { payload } ) {
  try {
    const database = payload.database
      ? payload.database
      : yield select( ( state ) => state.storage.database )
    if ( !database ) {
      throw new Error( 'Database missing; services encrichment failed' )
    }

    let dbVersion = database.VERSION
    let appVersion = DeviceInfo.getVersion()
    if ( appVersion === '0.7' ) {
      appVersion = '0.7.0'
    }
    if ( appVersion === '0.8' ) {
      appVersion = '0.8.0'
    }
    if ( appVersion === '0.9' ) {
      appVersion = '0.9.0'
    }
    let services
    let migrated = false
    const {
      REGULAR_ACCOUNT,
      TEST_ACCOUNT,
      SECURE_ACCOUNT,
      S3_SERVICE,
      TRUSTED_CONTACTS,
      KEEPERS_INFO,
    } = database.SERVICES

    if ( !database.VERSION ) {
      dbVersion = '0.7.0'
    } else if ( database.VERSION === '0.8' ) {
      dbVersion = '0.8.0'
    } else if ( database.VERSION === '0.9' ) {
      dbVersion = '0.9.0'
    } else if ( database.VERSION === '1.0' ) {
      dbVersion = '1.0.0'
    }
    if ( semver.gt( appVersion, dbVersion ) ) {
      if ( dbVersion === '0.7.0' && semver.gte( appVersion, '0.9.0' ) ) {
        // version 0.7.0 support
        console.log( 'Migration running for 0.7.0' )
        services = {
          REGULAR_ACCOUNT: RegularAccount.fromJSON( REGULAR_ACCOUNT ),
          TEST_ACCOUNT: TestAccount.fromJSON( TEST_ACCOUNT ),
          SECURE_ACCOUNT: SecureAccount.fromJSON( SECURE_ACCOUNT ),
          S3_SERVICE: S3Service.fromJSON( S3_SERVICE ),
          TRUSTED_CONTACTS: new TrustedContactsService(),
          KEEPERS_INFO: new KeeperService(),
        }
        // hydrating new/missing async storage variables
        yield call(
          AsyncStorage.setItem,
          'walletID',
          services.S3_SERVICE.sss.walletId
        )

        migrated = true
      } else {
        // default enrichment (when database versions are different but migration is not available)
        services = {
          REGULAR_ACCOUNT: RegularAccount.fromJSON( REGULAR_ACCOUNT ),
          TEST_ACCOUNT: TestAccount.fromJSON( TEST_ACCOUNT ),
          SECURE_ACCOUNT: SecureAccount.fromJSON( SECURE_ACCOUNT ),
          S3_SERVICE: S3Service.fromJSON( S3_SERVICE ),
          TRUSTED_CONTACTS: TRUSTED_CONTACTS
            ? TrustedContactsService.fromJSON( TRUSTED_CONTACTS )
            : new TrustedContactsService(),
          KEEPERS_INFO: KEEPERS_INFO
            ? KeeperService.fromJSON( KEEPERS_INFO )
            : new KeeperService(),
        }
      }

      if ( semver.eq( appVersion, '1.1.0' ) ) {
        // version 1.0 and lower support

        // re-derive primary extended keys (standardization)
        const secureAccount: SecureAccount = services.SECURE_ACCOUNT
        if ( secureAccount.secureHDWallet.rederivePrimaryXKeys() ) {
          console.log( 'Standardized Primary XKeys for secure a/c' )
          services.SECURE_ACCOUNT = secureAccount
          migrated = true
        }
      }

      if ( semver.lt( dbVersion, '1.4.6' ) ) {
        // update sub-account instances count
        const regularAccount: RegularAccount = services.REGULAR_ACCOUNT
        const secureAccount: SecureAccount = services.SECURE_ACCOUNT

        for ( const accountType of Object.keys( config.DERIVATIVE_ACC ) ) {
          let instanceCount = 5
          if ( accountType == 'TRUSTED_CONTACTS' ) {
            instanceCount = 20
          }
          regularAccount.hdWallet.derivativeAccounts[
            accountType
          ].instance.max = instanceCount
          secureAccount.secureHDWallet.derivativeAccounts[
            accountType
          ].instance.max = instanceCount
        }

        console.log( 'Updated sub-account instances count' )
        services.REGULAR_ACCOUNT = regularAccount
        services.SECURE_ACCOUNT = secureAccount

        const trustedContact = services.TRUSTED_CONTACTS
        yield put( upgradeReducer( trustedContact ) )
        migrated = true
      }
    } else {
      services = {
        REGULAR_ACCOUNT: RegularAccount.fromJSON( REGULAR_ACCOUNT ),
        TEST_ACCOUNT: TestAccount.fromJSON( TEST_ACCOUNT ),
        SECURE_ACCOUNT: SecureAccount.fromJSON( SECURE_ACCOUNT ),
        S3_SERVICE: S3Service.fromJSON( S3_SERVICE ),
        TRUSTED_CONTACTS: TRUSTED_CONTACTS
          ? TrustedContactsService.fromJSON( TRUSTED_CONTACTS )
          : new TrustedContactsService(),
        KEEPERS_INFO: KEEPERS_INFO
          ? KeeperService.fromJSON( KEEPERS_INFO )
          : new KeeperService(),
      }
    }
    yield put( servicesEnriched( services ) )
    if ( migrated ) {
      database.VERSION = DeviceInfo.getVersion()
      database.SERVICES = {
        REGULAR_ACCOUNT: JSON.stringify( services.REGULAR_ACCOUNT ),
        TEST_ACCOUNT: JSON.stringify( services.TEST_ACCOUNT ),
        SECURE_ACCOUNT: JSON.stringify( services.SECURE_ACCOUNT ),
        S3_SERVICE: JSON.stringify( services.S3_SERVICE ),
        TRUSTED_CONTACTS: JSON.stringify( services.TRUSTED_CONTACTS ),
      }
      yield call( insertDBWorker, {
        payload: database,
      } )
    }
  } catch ( err ) {
    console.log( err )
  }
}

export const servicesEnricherWatcher = createWatcher(
  servicesEnricherWorker,
  ENRICH_SERVICES
)
