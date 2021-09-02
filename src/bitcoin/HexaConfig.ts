/* eslint-disable @typescript-eslint/no-explicit-any */
import * as bitcoinJS from 'bitcoinjs-lib'
import {
  DerivativeAccount,
  DerivativeAccounts,
  TrustedContactDerivativeAccount,
  DonationDerivativeAccount,
  SwanDerivativeAccount,
  RampDerivativeAccount,
  WyreDerivativeAccount,
  AccountType,
} from './utilities/Interface'
import Config from 'react-native-config'
import {
  DONATION_ACCOUNT,
  SUB_PRIMARY_ACCOUNT,
  WYRE,
  RAMP,
  SWAN
} from '../common/constants/wallet-service-types'
import PersonalNode from '../common/data/models/PersonalNode'
import _ from 'lodash'
import { APP_STAGE } from '../common/interfaces/Interfaces'

class HexaConfig {
  //RAMP details
  public RAMP_BASE_URL: string = Config.RAMP_BASE_URL ? Config.RAMP_BASE_URL.trim() : 'https://buy.ramp.network/'
  public RAMP_REFERRAL_CODE: string = Config.RAMP_REFERRAL_CODE ? Config.RAMP_REFERRAL_CODE.trim() : 'ku67r7oh5juc27bmb3h5pek8y5heyb5bdtfa66pr'
  //SWAN details
  public SWAN_CLIENT_ID:string = Config.SWAN_CLIENT_ID || 'hexa-dev'
  public SWAN_BASE_URL:string = Config.SWAN_BASE_URL || 'https://api.swanbitcoin.com/apps/v20180818/'
  public SWAN_REDIRECT_URL: string = Config.SWAN_REDIRECT_URL || 'https%3A%2F%2Fhexa.bithyve.com%2FdeepLink%2Fdev%2Fswan%2F'
  public WALLET_SLUG: string = Config.WALLET_SLUG ? Config.WALLET_SLUG.trim() : 'WALLET_SLUG'
  public FBTC_REGISTRATION_URL: string = Config.FBTC_REGISTRATION_URL ? Config.FBTC_REGISTRATION_URL.trim() : 'https://fastbitcoins.com/create-account/hexa'
  public FBTC_URL: string = Config.FBTC_URL ? Config.FBTC_URL.trim() : 'https://wallet-api.fastbitcoins.com/v2/'
  public TESTNET_BASE_URL: string = Config.BIT_TESTNET_BASE_URL ? Config.BIT_TESTNET_BASE_URL.trim() : 'https://test-wrapper.bithyve.com'
  public MAINNET_BASE_URL: string = Config.BIT_MAINNET_BASE_URL ? Config.BIT_MAINNET_BASE_URL.trim() : 'https://api.bithyve.com'
  public VERSION: string = Config.VERSION ? Config.VERSION.trim() : '';
  public ENVIRONMENT: string;
  public NETWORK: bitcoinJS.Network;
  public SECURE_WALLET_XPUB_PATH: string = Config.BIT_SECURE_WALLET_XPUB_PATH ? Config.BIT_SECURE_WALLET_XPUB_PATH.trim() : '2147483651/2147483649/';
  public SECURE_DERIVATION_BRANCH: string = Config.BIT_SECURE_DERIVATION_BRANCH ? Config.BIT_SECURE_DERIVATION_BRANCH.trim() : '1';
  public SSS_OTP_LENGTH: string = Config.BIT_SSS_OTP_LENGTH ? Config.BIT_SSS_OTP_LENGTH.trim() : '6';
  public REQUEST_TIMEOUT: number = Config.BIT_REQUEST_TIMEOUT ? parseInt( Config.BIT_REQUEST_TIMEOUT.trim(), 10 ) : 15000;
  public GAP_LIMIT: number = Config.BIT_GAP_LIMIT ? parseInt( Config.BIT_GAP_LIMIT.trim(), 10 ) : 5;
  public DONATION_GAP_LIMIT = Config.BIT_DONATION_GAP_LIMIT? parseInt( Config.BIT_DONATION_GAP_LIMIT.trim(), 10 ) : 50;
  public DONATION_GAP_LIMIT_INTERNAL = Config.DONATION_GAP_LIMIT_INTERNAL? parseInt( Config.DONATION_GAP_LIMIT_INTERNAL.trim(), 10 ) : 20;

  public DERIVATIVE_GAP_LIMIT = 5;
  public CIPHER_SPEC: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = {
    algorithm: Config.BIT_CIPHER_ALGORITHM ? Config.BIT_CIPHER_ALGORITHM.trim() : 'aes-192-cbc',
    salt: Config.BIT_CIPHER_SALT ? Config.BIT_CIPHER_SALT.trim() : 'bithyeSalt',
    keyLength: Config.BIT_CIPHER_KEYLENGTH ? parseInt( Config.BIT_CIPHER_KEYLENGTH.trim(), 10 ) : 24,
    iv: Buffer.alloc( 16, 0 ),
  };
  public KEY_STRETCH_ITERATIONS = Config.BIT_KEY_STRETCH_ITERATIONS ? parseInt( Config.BIT_KEY_STRETCH_ITERATIONS.trim(), 10 ) : 10000;

  public LAST_SEEN_ACTIVE_DURATION: number = Config.BIT_LAST_SEEN_ACTIVE_DURATION ? parseInt( Config.BIT_LAST_SEEN_ACTIVE_DURATION.trim(), 10 ) : 21600;
  public LAST_SEEN_AWAY_DURATION: number = Config.BIT_LAST_SEEN_AWAY_DURATION ? parseInt( Config.BIT_LAST_SEEN_AWAY_DURATION.trim(), 10 ) : 64800;
  public BH_SERVERS = {
    RELAY: Config.BIT_API_URLS_RELAY ? Config.BIT_API_URLS_RELAY.trim() : 'https://relay.bithyve.com/',
    SIGNING_SERVER: Config.BIT_API_URLS_SIGNING_SERVER ? Config.BIT_API_URLS_SIGNING_SERVER.trim() : 'http://sign.bithyve.com/',
  };
  public BSI = {
    INIT_INDEX: Config.BIT_BSI_INIT_INDEX ? parseInt( Config.BIT_BSI_INIT_INDEX.trim(), 10 ) : 100,
    MAXUSEDINDEX: Config.BIT_BSI_MAXUSEDINDEX ? parseInt( Config.BIT_BSI_MAXUSEDINDEX.trim(), 10 ) : 0,
    MINUNUSEDINDEX: Config.BIT_BSI_MINUNUSEDINDEX ? parseInt( Config.BIT_BSI_MINUNUSEDINDEX.trim(), 10 ) : 1000000,
    DEPTH: {
      INIT: Config.BIT_BSI_DEPTH_INIT ? parseInt( Config.BIT_BSI_DEPTH_INIT.trim(), 10 ) : 0,
      LIMIT: Config.BIT_BSI_DEPTH_LIMIT ? parseInt( Config.BIT_BSI_DEPTH_LIMIT.trim(), 10 ) : 20,
    },
  };
  public SSS_TOTAL: number = Config.BIT_SSS_TOTAL ? parseInt( Config.BIT_SSS_TOTAL.trim(), 10 ) : 5;
  public SSS_THRESHOLD: number = Config.BIT_SSS_THRESHOLD ? parseInt( Config.BIT_SSS_THRESHOLD.trim(), 10 ) : 3;
  public SSS_LEVEL1_TOTAL: number = Config.BIT_SSS_LEVEL1_TOTAL ? parseInt( Config.BIT_SSS_LEVEL1_TOTAL.trim(), 10 ) : 3;
  public SSS_LEVEL1_THRESHOLD: number = Config.BIT_SSS_LEVEL1_THRESHOLD ? parseInt( Config.BIT_SSS_LEVEL1_THRESHOLD.trim(), 10 ) : 2;
  public SSS_LEVEL2_TOTAL: number = Config.BIT_SSS_LEVEL2_TOTAL ? parseInt( Config.BIT_SSS_LEVEL2_TOTAL.trim(), 10 ) : 5;
  public SSS_LEVEL2_THRESHOLD: number = Config.BIT_SSS_LEVEL2_THRESHOLD ? parseInt( Config.BIT_SSS_LEVEL2_THRESHOLD.trim(), 10 ) : 3;
  public MSG_ID_LENGTH: number = Config.BIT_MSG_ID_LENGTH ? parseInt( Config.BIT_MSG_ID_LENGTH.trim(), 10 ) : 12;
  public CHUNK_SIZE: number = Config.BIT_CHUNK_SIZE ? parseInt( Config.BIT_CHUNK_SIZE.trim(), 10 ) : 3;
  public CHECKSUM_ITR: number = Config.BIT_CHECKSUM_ITR ? parseInt( Config.BIT_CHECKSUM_ITR.trim(), 10 ) : 2;
  public HEXA_ID: string = Config.BIT_HEXA_ID ? Config.BIT_HEXA_ID.trim() : 'dfe56bf7922efec670a5a860995561da8d82c801ca14be4f194b440c5d741259';
  public ENC_KEY_STORAGE_IDENTIFIER: string = Config.ENC_KEY_STORAGE_IDENTIFIER ? Config.ENC_KEY_STORAGE_IDENTIFIER.trim() : 'HEXA-KEY';
  public DPATH_PURPOSE: number = Config.BIT_DPATH_PURPOSE ? parseInt( Config.BIT_DPATH_PURPOSE.trim(), 10 ) : 49;
  public SSS_METASHARE_SPLITS: number = Config.BIT_SSS_METASHARE_SPLITS ? parseInt( Config.BIT_SSS_METASHARE_SPLITS.trim(), 10 ) : 8;
  public STATUS = {
    SUCCESS: Config.BIT_SUCCESS_STATUS_CODE ? parseInt( Config.BIT_SUCCESS_STATUS_CODE.trim(), 10 ) : 200,
    ERROR: Config.BIT_ERROR_STATUS_CODE ? parseInt( Config.BIT_ERROR_STATUS_CODE.trim(), 10 ) : 400,
  };
  public STANDARD = {
    BIP44: Config.BIT_STANDARD_BIP44 ? parseInt( Config.BIT_STANDARD_BIP44.trim(), 10 ) : 44,
    BIP49: Config.BIT_STANDARD_BIP49 ? parseInt( Config.BIT_STANDARD_BIP49.trim(), 10 ) : 49,
    BIP84: Config.BIT_STANDARD_BIP84 ? parseInt( Config.BIT_STANDARD_BIP84.trim(), 10 ) : 84,
  };

  public HEALTH_STATUS = {
    HEXA_HEALTH: {
      STAGE1: Config.BIT_HEXA_HEALTH_STAGE1 ? Config.BIT_HEXA_HEALTH_STAGE1.trim() : 0,
      STAGE2: Config.BIT_HEXA_HEALTH_STAGE2 ? Config.BIT_HEXA_HEALTH_STAGE2.trim() : 20,
      STAGE3: Config.BIT_HEXA_HEALTH_STAGE3 ? Config.BIT_HEXA_HEALTH_STAGE3.trim() : 50,
      STAGE4: Config.BIT_HEXA_HEALTH_STAGE4 ? Config.BIT_HEXA_HEALTH_STAGE4.trim() : 75,
      STAGE5: Config.BIT_HEXA_HEALTH_STAGE5 ? Config.BIT_HEXA_HEALTH_STAGE5.trim() : 100,
    },

    ENTITY_HEALTH: {
      STAGE1: Config.BIT_ENTITY_HEALTH_STAGE1 ? Config.BIT_ENTITY_HEALTH_STAGE1.trim() : 'Ugly',
      STAGE2: Config.BIT_ENTITY_HEALTH_STAGE2 ? Config.BIT_ENTITY_HEALTH_STAGE2.trim() : 'Bad',
      STAGE3: Config.BIT_ENTITY_HEALTH_STAGE3 ? Config.BIT_ENTITY_HEALTH_STAGE3.trim() : 'Good',
    },

    TIME_SLOTS: {
      // 2 weeks in minutes: 20160
      SHARE_SLOT1: Config.BIT_SHARE_HEALTH_TIME_SLOT1 ? parseInt( Config.BIT_SHARE_HEALTH_TIME_SLOT1.trim(), 10 ) : 20160,

      //4 weeks in minutes: 40320
      SHARE_SLOT2: Config.BIT_SHARE_HEALTH_TIME_SLOT2 ? parseInt( Config.BIT_SHARE_HEALTH_TIME_SLOT2.trim(), 10 ) : 40320,
    },
  };
  public NOTIFICATION_HOUR = Config.NOTIFICATION_HOUR ? parseInt( Config.NOTIFICATION_HOUR.trim(), 10 ) : 336
  public LEGACY_TC_REQUEST_EXPIRY = Config.BIT_LEGACY_TC_REQUEST_EXPIRY ? parseInt( Config.BIT_LEGACY_TC_REQUEST_EXPIRY.trim(), 10 ) : 1200000;
  public TC_REQUEST_EXPIRY = Config.BIT_TC_REQUEST_EXPIRY ? parseInt( Config.BIT_TC_REQUEST_EXPIRY.trim(), 10 ) : 86400000;
  public KP_REQUEST_EXPIRY = Config.KP_REQUEST_EXPIRY ? parseInt( Config.KP_REQUEST_EXPIRY.trim(), 10 ) : 86400000;

  public ACCOUNT_INSTANCES = {
    [ AccountType.TEST_ACCOUNT ]: {
      series: 0,
      upperBound: 1,
    },
    [ AccountType.CHECKING_ACCOUNT ]: {
      series: 0,
      upperBound: 10,
    },
    [ AccountType.SAVINGS_ACCOUNT ]: {
      series: 10,
      upperBound: 10,
    },
    [ AccountType.DONATION_ACCOUNT ]: {
      series: 20,
      upperBound: 10,
    },
    [ AccountType.SWAN_ACCOUNT ]: {
      series: 30,
      upperBound: 10,
    },
    [ AccountType.DEPOSIT_ACCOUNT ]: {
      series: 40,
      upperBound: 10,
    },
  }

  public BITHYVE_ESPLORA_API_ENDPOINTS = {
    TESTNET: {
      MULTIBALANCE: this.TESTNET_BASE_URL + '/balances',
      MULTIUTXO: this.TESTNET_BASE_URL + '/utxos',
      MULTITXN: this.TESTNET_BASE_URL + '/data',
      MULTIBALANCETXN: this.TESTNET_BASE_URL + '/baltxs',
      NEWMULTIUTXOTXN: this.TESTNET_BASE_URL + '/nutxotxs',
      TXN_FEE: this.TESTNET_BASE_URL + '/fee-estimates',
      TXNDETAILS: this.TESTNET_BASE_URL + '/tx',
      BROADCAST_TX: this.TESTNET_BASE_URL + '/tx',
    },
    MAINNET: {
      MULTIBALANCE: this.MAINNET_BASE_URL + '/balances',
      MULTIUTXO: this.MAINNET_BASE_URL + '/utxos',
      MULTITXN: this.MAINNET_BASE_URL + '/data',
      MULTIBALANCETXN: this.MAINNET_BASE_URL + '/baltxs',
      NEWMULTIUTXOTXN: this.MAINNET_BASE_URL + '/nutxotxs',
      TXN_FEE: this.MAINNET_BASE_URL + '/fee-estimates',
      TXNDETAILS: this.MAINNET_BASE_URL + '/tx',
      BROADCAST_TX: this.MAINNET_BASE_URL + '/tx',
    },
  }
  public ESPLORA_API_ENDPOINTS = _.cloneDeep( this.BITHYVE_ESPLORA_API_ENDPOINTS ) // current API-endpoints being used
  public USE_ESPLORA_FALLBACK = false; // BITHYVE_ESPLORA_API_ENDPOINT acts as the fallback(when true)

  public RELAY: string;
  public SIGNING_SERVER: string;
  public APP_STAGE: string;

  public SUB_PRIMARY_ACCOUNT: DerivativeAccount = {
    series: Config.BIT_SUB_PRIMARY_ACCOUNT_SERIES ? parseInt( Config.BIT_SUB_PRIMARY_ACCOUNT_SERIES.trim(), 10 ) : 1,
    instance: {
      max: Config.BIT_SUB_PRIMARY_ACCOUNT_INSTANCE_COUNT ? parseInt( Config.BIT_SUB_PRIMARY_ACCOUNT_INSTANCE_COUNT.trim(), 10 ) : 5,
      using: 0,
    },
  };

  public FAST_BITCOINS: DerivativeAccount = {
    series: Config.BIT_FAST_BITCOINS_SERIES ? parseInt( Config.BIT_FAST_BITCOINS_SERIES.trim(), 10 ) : 11,
    instance: {
      max: Config.BIT_FAST_BITCOINS_INSTANCE_COUNT ? parseInt( Config.BIT_FAST_BITCOINS_INSTANCE_COUNT.trim(), 10 ) : 5,
      using: 0,
    },
  };

  public WYRE: WyreDerivativeAccount = {
    series: Config.BIT_WYRE_SERIES ? parseInt( Config.BIT_WYRE_SERIES.trim(), 10 ) : 21,
    instance: {
      max: Config.BIT_WYRE_INSTANCE_COUNT ? parseInt( Config.BIT_WYRE_INSTANCE_COUNT.trim(), 10 ) : 5,
      using: 0,
    },
  };

  public RAMP: RampDerivativeAccount = {
    series: Config.BIT_RAMP_SERIES ? parseInt( Config.BIT_RAMP_SERIES.trim(), 10 ) : 31,
    instance: {
      max: Config.BIT_RAMP_INSTANCE_COUNT ? parseInt( Config.BIT_RAMP_INSTANCE_COUNT.trim(), 10 ) : 5,
      using: 0,
    },
  };

  public SWAN: SwanDerivativeAccount = {
    series: Config.BIT_SWAN_SERIES ? parseInt( Config.BIT_SWAN_SERIES.trim(), 10 ) : 41,
    instance: {
      max: Config.BIT_SWAN_INSTANCE_COUNT ? parseInt( Config.BIT_SWAN_INSTANCE_COUNT.trim(), 10 ) : 5,
      using: 0,
    },
  };

  public TRUSTED_CONTACTS: TrustedContactDerivativeAccount = {
    // corresponds to trusted channels
    series: Config.BIT_TRUSTED_CONTACTS_SERIES ? parseInt( Config.BIT_TRUSTED_CONTACTS_SERIES.trim(), 10 ) : 1001,
    instance: {
      max: Config.BIT_TRUSTED_CONTACTS_INSTANCE_COUNT ? parseInt( Config.BIT_TRUSTED_CONTACTS_INSTANCE_COUNT.trim(), 10 ) : 20,
      using: 0,
    },
  };

  public DONATION_ACCOUNT: DonationDerivativeAccount = {
    series: Config.BIT_DONATION_ACCOUNT_SERIES ? parseInt( Config.BIT_DONATION_ACCOUNT_SERIES.trim(), 10 ) : 101,
    instance: {
      max: Config.BIT_DONATION_ACCOUNT_INSTANCE_COUNT ? parseInt( Config.BIT_DONATION_ACCOUNT_INSTANCE_COUNT.trim(), 10 ) : 5,
      using: 0,
    },
  };


  public DERIVATIVE_ACC: DerivativeAccounts = {
    SUB_PRIMARY_ACCOUNT: this.SUB_PRIMARY_ACCOUNT,
    FAST_BITCOINS: this.FAST_BITCOINS,
    WYRE: this.WYRE,
    RAMP: this.RAMP,
    SWAN: this.SWAN,
    TRUSTED_CONTACTS: this.TRUSTED_CONTACTS,
    DONATION_ACCOUNT: this.DONATION_ACCOUNT,
  };

  public EJECTED_ACCOUNTS = [ SUB_PRIMARY_ACCOUNT, DONATION_ACCOUNT, WYRE, RAMP, SWAN ];

  public DERIVATIVE_ACC_TO_SYNC = Object.keys( this.DERIVATIVE_ACC ).filter(
    ( account ) => !this.EJECTED_ACCOUNTS.includes( account ),
  );

  constructor( env: string ) {
    this.ENVIRONMENT = env.trim() || 'MAIN'
    this.RELAY = this.BH_SERVERS.RELAY
    this.SIGNING_SERVER = this.BH_SERVERS.SIGNING_SERVER
    this.HEALTH_STATUS.TIME_SLOTS.SHARE_SLOT1 = Config.BIT_SHARE_HEALTH_TIME_SLOT1 ? parseInt( Config.BIT_SHARE_HEALTH_TIME_SLOT1.trim(), 10 ) : 20160
    this.HEALTH_STATUS.TIME_SLOTS.SHARE_SLOT2 = Config.BIT_SHARE_HEALTH_TIME_SLOT2 ? parseInt( Config.BIT_SHARE_HEALTH_TIME_SLOT2.trim(), 10 ) : 40320

    this.setNetwork()

    const BIT_SERVER_MODE = Config.BIT_SERVER_MODE ? Config.BIT_SERVER_MODE.trim() : 'PROD'
    if ( BIT_SERVER_MODE === 'LOCAL' || BIT_SERVER_MODE === 'DEV' ) {
      this.APP_STAGE = APP_STAGE.DEVELOPMENT
    } else if ( BIT_SERVER_MODE === 'STA' ) {
      this.APP_STAGE = APP_STAGE.STAGING
    } else {
      this.APP_STAGE = APP_STAGE.PRODUCTION
    }
  }

  public setNetwork = (): void => {
    if ( this.ENVIRONMENT === 'MAIN' ) {
      this.NETWORK = bitcoinJS.networks.bitcoin
    } else {
      this.NETWORK = bitcoinJS.networks.testnet
    }
  };

  public connectToPersonalNode = async ( personalNode: PersonalNode ) => {
    const personalNodeURL = personalNode.urlPath
    if ( personalNodeURL && personalNode.isConnectionActive ) {
      const personalNodeEPs = {
        MULTIBALANCE: personalNodeURL + '/balances',
        MULTIUTXO: personalNodeURL + '/utxos',
        MULTITXN: personalNodeURL + '/data',
        MULTIBALANCETXN: personalNodeURL + '/baltxs',
        MULTIUTXOTXN: personalNodeURL + '/utxotxs',
        NEWMULTIUTXOTXN: personalNodeURL + '/nutxotxs',
        TXN_FEE: personalNodeURL + 'fee-estimates',
        TXNDETAILS: personalNodeURL + '/tx',
        BROADCAST_TX: personalNodeURL + '/tx',
      }

      if ( this.ENVIRONMENT === 'MAIN' )
        this.ESPLORA_API_ENDPOINTS = {
          ...this.ESPLORA_API_ENDPOINTS,
          MAINNET: personalNodeEPs
        }
      else
        this.ESPLORA_API_ENDPOINTS = {
          ...this.ESPLORA_API_ENDPOINTS,
          TESTNET: personalNodeEPs,
        }

      this.USE_ESPLORA_FALLBACK = personalNode.useFallback
    }
  }

  public connectToBitHyveNode = async () => {
    this.ESPLORA_API_ENDPOINTS = _.cloneDeep( this.BITHYVE_ESPLORA_API_ENDPOINTS )
    this.USE_ESPLORA_FALLBACK = false
  }
}

export default new HexaConfig( Config.BIT_ENVIRONMENT || 'MAIN' )
