import Client from 'bitcoin-core'
import * as bitcoinJS from 'bitcoinjs-lib'
import {
  DerivativeAccount,
  DerivativeAccounts,
  TrustedContactDerivativeAccount,
  DonationDerivativeAccount,
} from './utilities/Interface'
import Config from 'react-native-config'
import {
  DONATION_ACCOUNT,
  SUB_PRIMARY_ACCOUNT,
} from '../common/constants/wallet-service-types'

class HexaConfig {
  //SWAN details
  public SWAN_CLIENT_ID:string = Config.SWAN_CLIENT_ID || 'demo-web-client'
  public SWAN_BASE_URL:string = Config.SWAN_AUTH_URL || 'https://dev-api.swanbitcoin.com'
  public TESTNET_BASE_URL: string = Config.BIT_TESTNET_BASE_URL ? Config.BIT_TESTNET_BASE_URL.trim() : 'https://testapi.bithyve.com'
  public MAINNET_BASE_URL: string = Config.BIT_MAINNET_BASE_URL ? Config.BIT_MAINNET_BASE_URL.trim() : 'https://api.bithyve.com'
  public VERSION: string = Config.VERSION ? Config.VERSION.trim() : '';
  public ENVIRONMENT: string;
  public NETWORK: bitcoinJS.Network;
  public BITCOIN_NODE: Client;
  public SECURE_WALLET_XPUB_PATH: string = Config.BIT_SECURE_WALLET_XPUB_PATH.trim();
  public SECURE_DERIVATION_BRANCH: string = Config.BIT_SECURE_DERIVATION_BRANCH.trim();
  public TOKEN: string = Config.BIT_BLOCKCYPHER_API_URLS_TOKEN.trim();
  public SSS_OTP_LENGTH: string = Config.BIT_SSS_OTP_LENGTH.trim();
  public REQUEST_TIMEOUT: number = parseInt(
    Config.BIT_REQUEST_TIMEOUT.trim(),
    10,
  );
  public GAP_LIMIT: number = parseInt( Config.BIT_GAP_LIMIT.trim(), 10 );
  public DERIVATIVE_GAP_LIMIT = 5;
  public CIPHER_SPEC: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = {
    algorithm: Config.BIT_CIPHER_ALGORITHM.trim(),
    salt: Config.BIT_CIPHER_SALT.trim(),
    keyLength: parseInt( Config.BIT_CIPHER_KEYLENGTH.trim(), 10 ),
    iv: Buffer.alloc( 16, 0 ),
  };
  public KEY_STRETCH_ITERATIONS = Config.BIT_KEY_STRETCH_ITERATIONS ? parseInt( Config.BIT_KEY_STRETCH_ITERATIONS.trim(), 10 ) : 10000;

  public LAST_SEEN_ACTIVE_DURATION: number = Config.BIT_LAST_SEEN_ACTIVE_DURATION ? parseInt( Config.BIT_LAST_SEEN_ACTIVE_DURATION.trim(), 10 ) : 21600;
  public LAST_SEEN_AWAY_DURATION: number = Config.BIT_LAST_SEEN_AWAY_DURATION ? parseInt( Config.BIT_LAST_SEEN_AWAY_DURATION.trim(), 10 ) : 64800;
  public BH_SERVERS = {
    RELAY: Config.BIT_API_URLS_RELAY ? Config.BIT_API_URLS_RELAY.trim() : '',
    SIGNING_SERVER: Config.BIT_API_URLS_SIGNING_SERVER ? Config.BIT_API_URLS_SIGNING_SERVER.trim() : '',
  };
  public BSI = {
    INIT_INDEX: parseInt( Config.BIT_BSI_INIT_INDEX.trim(), 10 ),
    MAXUSEDINDEX: parseInt( Config.BIT_BSI_MAXUSEDINDEX.trim(), 10 ),
    MINUNUSEDINDEX: parseInt( Config.BIT_BSI_MINUNUSEDINDEX.trim(), 10 ),
    DEPTH: {
      INIT: parseInt( Config.BIT_BSI_DEPTH_INIT.trim(), 10 ),
      LIMIT: parseInt( Config.BIT_BSI_DEPTH_LIMIT.trim(), 10 ),
    },
  };
  public SSS_TOTAL: number = parseInt( Config.BIT_SSS_TOTAL.trim(), 10 );
  public SSS_THRESHOLD: number = parseInt( Config.BIT_SSS_THRESHOLD.trim(), 10 );
  public MSG_ID_LENGTH: number = parseInt( Config.BIT_MSG_ID_LENGTH.trim(), 10 );
  public CHUNK_SIZE: number = parseInt( Config.BIT_CHUNK_SIZE.trim(), 10 );
  public CHECKSUM_ITR: number = parseInt( Config.BIT_CHECKSUM_ITR.trim(), 10 );
  public HEXA_ID: string = Config.BIT_HEXA_ID.trim();
  public DPATH_PURPOSE: number = parseInt( Config.BIT_DPATH_PURPOSE.trim(), 10 );
  public SSS_METASHARE_SPLITS: number = parseInt(
    Config.BIT_SSS_METASHARE_SPLITS.trim(),
    10,
  );
  public STATUS = {
    SUCCESS: parseInt( Config.BIT_SUCCESS_STATUS_CODE.trim(), 10 ),
    ERROR: parseInt( Config.BIT_ERROR_STATUS_CODE.trim(), 10 ),
  };
  public STANDARD = {
    BIP44: parseInt( Config.BIT_STANDARD_BIP44.trim(), 10 ),
    BIP49: parseInt( Config.BIT_STANDARD_BIP49.trim(), 10 ),
    BIP84: parseInt( Config.BIT_STANDARD_BIP84.trim(), 10 ),
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
      SHARE_SLOT1: parseInt( Config.BIT_SHARE_HEALTH_TIME_SLOT1.trim(), 10 ),
      SHARE_SLOT2: parseInt( Config.BIT_SHARE_HEALTH_TIME_SLOT2.trim(), 10 ),
    },
  };

  public LEGACY_TC_REQUEST_EXPIRY = parseInt(
    Config.BIT_LEGACY_TC_REQUEST_EXPIRY.trim(),
    10,
  );
  public TC_REQUEST_EXPIRY = parseInt( Config.BIT_TC_REQUEST_EXPIRY.trim(), 10 );

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

  public API_URLS = {
    TESTNET: {
      BASE: 'notUsed',
      UNSPENT_OUTPUTS: 'notUsed'
    },
    MAINNET: {
      BASE: 'notUsed',
      UNSPENT_OUTPUTS: 'notUsed'
    }
  };

  public SUB_PRIMARY_ACCOUNT: DerivativeAccount = {
    series: parseInt( Config.BIT_SUB_PRIMARY_ACCOUNT_SERIES.trim(), 10 ),
    instance: {
      max: parseInt( Config.BIT_SUB_PRIMARY_ACCOUNT_INSTANCE_COUNT.trim(), 10 ),
      using: 0,
    },
  };

  public FAST_BITCOINS: DerivativeAccount = {
    series: parseInt( Config.BIT_FAST_BITCOINS_SERIES.trim(), 10 ),
    instance: {
      max: parseInt( Config.BIT_FAST_BITCOINS_INSTANCE_COUNT.trim(), 10 ),
      using: 0,
    },
  };

  public TRUSTED_CONTACTS: TrustedContactDerivativeAccount = {
    // corresponds to trusted channels
    series: parseInt( Config.BIT_TRUSTED_CONTACTS_SERIES.trim(), 10 ),
    instance: {
      max: parseInt( Config.BIT_TRUSTED_CONTACTS_INSTANCE_COUNT.trim(), 10 ),
      using: 0,
    },
  };

  public DONATION_ACCOUNT: DonationDerivativeAccount = {
    series: parseInt( Config.BIT_DONATION_ACCOUNT_SERIES.trim(), 10 ),
    instance: {
      max: parseInt( Config.BIT_DONATION_ACCOUNT_INSTANCE_COUNT.trim(), 10 ),
      using: 0,
    },
  };


  public DERIVATIVE_ACC: DerivativeAccounts = {
    SUB_PRIMARY_ACCOUNT: this.SUB_PRIMARY_ACCOUNT,
    FAST_BITCOINS: this.FAST_BITCOINS,
    WYRE: this.WYRE,
    TRUSTED_CONTACTS: this.TRUSTED_CONTACTS,
    DONATION_ACCOUNT: this.DONATION_ACCOUNT,
  };

  public EJECTED_ACCOUNTS = [ SUB_PRIMARY_ACCOUNT, DONATION_ACCOUNT ];

  public DERIVATIVE_ACC_TO_SYNC = Object.keys( this.DERIVATIVE_ACC ).filter(
    ( account ) => !this.EJECTED_ACCOUNTS.includes( account ),
  );

  constructor( env: string ) {
    this.ENVIRONMENT = env
    // console.log({ env });

    // console.log({ BIT_SERVER_MODE: Config.BIT_SERVER_MODE.trim() });

    this.RELAY = this.BH_SERVERS.RELAY
    this.SIGNING_SERVER = this.BH_SERVERS.SIGNING_SERVER
    this.HEALTH_STATUS.TIME_SLOTS.SHARE_SLOT1 = parseInt(
      Config.BIT_SHARE_HEALTH_TIME_SLOT1.trim(),
      10,
    )
    this.HEALTH_STATUS.TIME_SLOTS.SHARE_SLOT2 = parseInt(
      Config.BIT_SHARE_HEALTH_TIME_SLOT2.trim(),
      10,
    )

    // console.log(this.HEALTH_STATUS.TIME_SLOTS);
    // console.log({ tcExpiry: this.TC_REQUEST_EXPIRY });

    // console.log(Config.BIT_SERVER_MODE.trim(), this.RELAY, this.SIGNING_SERVER);
    this.setNetwork()

    this.BITCOIN_NODE = new Client( {
      network:
        this.NETWORK === bitcoinJS.networks.bitcoin ? 'mainnet' : 'testnet',
      timeout: 10000,
      username: Config.BIT_RPC_USERNAME.trim(),
      password: Config.BIT_RPC_PASSWORD.trim(),
      host: Config.BIT_HOST_IP.trim(),
    } )

    if (
      Config.BIT_SERVER_MODE.trim() === 'LOCAL' ||
      Config.BIT_SERVER_MODE.trim() === 'DEV'
    ) {
      this.APP_STAGE = 'dev'
    } else if ( Config.BIT_SERVER_MODE.trim() === 'STA' ) {
      this.APP_STAGE = 'sta'
    } else {
      this.APP_STAGE = 'app'
    }
  }

  public setNetwork = (): void => {
    if ( this.ENVIRONMENT === 'MAIN' ) {
      this.NETWORK = bitcoinJS.networks.bitcoin
    } else {
      this.NETWORK = bitcoinJS.networks.testnet
    }
  };

  public connectToPersonalNode =  async ( personalNode: PersonalNode ) => {
    const personalNodeURL = personalNode.urlPath
    if( personalNodeURL && personalNode.isConnectionActive ){
      const personalNodeEPs = {
        MULTIBALANCE: personalNodeURL + '/balances',
        MULTIUTXO:  personalNodeURL + '/utxos',
        MULTITXN: personalNodeURL + '/data',
        MULTIBALANCETXN: personalNodeURL + '/baltxs',
        MULTIUTXOTXN: personalNodeURL + '/utxotxs',
        NEWMULTIUTXOTXN: personalNodeURL + '/nutxotxs',
        TXN_FEE: personalNodeURL  + 'fee-estimates',
        TXNDETAILS: personalNodeURL + '/tx',
        BROADCAST_TX: personalNodeURL + '/tx',
      }

      if( this.ENVIRONMENT === 'MAIN' )
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

  public connectToBitHyveNode =  async () => {
    this.ESPLORA_API_ENDPOINTS = _.cloneDeep( this.BITHYVE_ESPLORA_API_ENDPOINTS )
    this.USE_ESPLORA_FALLBACK = false
  }
}

export default new HexaConfig( Config.BIT_ENVIRONMENT.trim() )
