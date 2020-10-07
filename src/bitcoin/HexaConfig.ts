import Client from 'bitcoin-core';
import * as bitcoinJS from 'bitcoinjs-lib';
import {
  DerivativeAccount,
  DerivativeAccounts,
  TrustedContactDerivativeAccount,
  DonationDerivativeAccount,
} from './utilities/Interface';
import Config from 'react-native-config';
import {
  DONATION_ACCOUNT,
  SUB_PRIMARY_ACCOUNT,
} from '../common/constants/serviceTypes';

class HexaConfig {
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
  public GAP_LIMIT: number = parseInt(Config.BIT_GAP_LIMIT.trim(), 10);
  public CIPHER_SPEC: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = {
    algorithm: Config.BIT_CIPHER_ALGORITHM.trim(),
    salt: Config.BIT_CIPHER_SALT.trim(),
    keyLength: parseInt(Config.BIT_CIPHER_KEYLENGTH.trim(), 10),
    iv: Buffer.alloc(16, 0),
  };
  public KEY_STRETCH_ITERATIONS = parseInt(
    Config.BIT_KEY_STRETCH_ITERATIONS.trim(),
    10,
  );
  public BH_SERVERS = {
    RELAY: Config.BIT_API_URLS_RELAY.trim(),
    SIGNING_SERVER: Config.BIT_API_URLS_SIGNING_SERVER.trim(),
  };
  public BSI = {
    INIT_INDEX: parseInt(Config.BIT_BSI_INIT_INDEX.trim(), 10),
    MAXUSEDINDEX: parseInt(Config.BIT_BSI_MAXUSEDINDEX.trim(), 10),
    MINUNUSEDINDEX: parseInt(Config.BIT_BSI_MINUNUSEDINDEX.trim(), 10),
    DEPTH: {
      INIT: parseInt(Config.BIT_BSI_DEPTH_INIT.trim(), 10),
      LIMIT: parseInt(Config.BIT_BSI_DEPTH_LIMIT.trim(), 10),
    },
  };
  public SSS_TOTAL: number = parseInt(Config.BIT_SSS_TOTAL.trim(), 10);
  public SSS_THRESHOLD: number = parseInt(Config.BIT_SSS_THRESHOLD.trim(), 10);
  public SSS_LEVEL1_TOTAL: number = parseInt(Config.BIT_SSS_LEVEL1_TOTAL.trim(), 10);
  public SSS_LEVEL1_THRESHOLD: number = parseInt(Config.BIT_SSS_LEVEL1_THRESHOLD.trim(), 10);
  public SSS_LEVEL2_TOTAL: number = parseInt(Config.BIT_SSS_LEVEL2_TOTAL.trim(), 10);
  public SSS_LEVEL2_THRESHOLD: number = parseInt(Config.BIT_SSS_LEVEL2_THRESHOLD.trim(), 10);
  public MSG_ID_LENGTH: number = parseInt(Config.BIT_MSG_ID_LENGTH.trim(), 10);
  public CHUNK_SIZE: number = parseInt(Config.BIT_CHUNK_SIZE.trim(), 10);
  public CHECKSUM_ITR: number = parseInt(Config.BIT_CHECKSUM_ITR.trim(), 10);
  public HEXA_ID: string = Config.BIT_HEXA_ID.trim();
  public DPATH_PURPOSE: number = parseInt(Config.BIT_DPATH_PURPOSE.trim(), 10);
  public SSS_METASHARE_SPLITS: number = parseInt(
    Config.BIT_SSS_METASHARE_SPLITS.trim(),
    10,
  );
  public STATUS = {
    SUCCESS: parseInt(Config.BIT_SUCCESS_STATUS_CODE.trim(), 10),
    ERROR: parseInt(Config.BIT_ERROR_STATUS_CODE.trim(), 10),
  };
  public STANDARD = {
    BIP44: parseInt(Config.BIT_STANDARD_BIP44.trim(), 10),
    BIP49: parseInt(Config.BIT_STANDARD_BIP49.trim(), 10),
    BIP84: parseInt(Config.BIT_STANDARD_BIP84.trim(), 10),
  };

  public HEALTH_STATUS = {
    HEXA_HEALTH: {
      STAGE1: Config.BIT_HEXA_HEALTH_STAGE1.trim(),
      STAGE2: Config.BIT_HEXA_HEALTH_STAGE2.trim(),
      STAGE3: Config.BIT_HEXA_HEALTH_STAGE3.trim(),
      STAGE4: Config.BIT_HEXA_HEALTH_STAGE4.trim(),
      STAGE5: Config.BIT_HEXA_HEALTH_STAGE5.trim(),
    },

    ENTITY_HEALTH: {
      STAGE1: Config.BIT_ENTITY_HEALTH_STAGE1.trim(),
      STAGE2: Config.BIT_ENTITY_HEALTH_STAGE2.trim(),
      STAGE3: Config.BIT_ENTITY_HEALTH_STAGE3.trim(),
    },

    TIME_SLOTS: {
      SHARE_SLOT1: parseInt(Config.BIT_SHARE_HEALTH_TIME_SLOT1.trim(), 10),
      SHARE_SLOT2: parseInt(Config.BIT_SHARE_HEALTH_TIME_SLOT2.trim(), 10),
    },
  };

  public LEGACY_TC_REQUEST_EXPIRY = parseInt(
    Config.BIT_LEGACY_TC_REQUEST_EXPIRY.trim(),
    10,
  );
  public TC_REQUEST_EXPIRY = parseInt(Config.BIT_TC_REQUEST_EXPIRY.trim(), 10);
  
  public KP_REQUEST_EXPIRY = parseInt(Config.KP_REQUEST_EXPIRY.trim(), 10);


  public ESPLORA_API_ENDPOINTS = {
    TESTNET: {
      MULTIBALANCE: Config.BIT_ESPLORA_TESTNET_MULTIBALANCE.trim(),
      MULTIUTXO: Config.BIT_ESPLORA_TESTNET_MULTIUTXO.trim(),
      MULTITXN: Config.BIT_ESPLORA_TESTNET_MULTITXN.trim(),
      MULTIBALANCETXN: Config.BIT_ESPLORA_TESTNET_MULTIBALANCETXN.trim(),
      MULTIUTXOTXN: Config.BIT_ESPLORA_TESTNET_MULTIUTXOTXN.trim(),
      TXN_FEE: Config.BIT_ESPLORA_TESTNET_TXNFEE.trim(),
      TXNDETAILS: Config.BIT_ESPLORA_TESTNET_TXNDETAILS.trim(),
      BROADCAST_TX: Config.BIT_ESPLORA_TESTNET_BROADCAST_TX.trim(),
    },
    MAINNET: {
      MULTIBALANCE: Config.BIT_ESPLORA_MAINNET_MULTIBALANCE.trim(),
      MULTIUTXO: Config.BIT_ESPLORA_MAINNET_MULTIUTXO.trim(),
      MULTITXN: Config.BIT_ESPLORA_MAINNET_MULTITXN.trim(),
      MULTIBALANCETXN: Config.BIT_ESPLORA_MAINNET_MULTIBALANCETXN.trim(),
      MULTIUTXOTXN: Config.BIT_ESPLORA_MAINNET_MULTIUTXOTXN.trim(),
      TXN_FEE: Config.BIT_ESPLORA_MAINNET_TXNFEE.trim(),
      TXNDETAILS: Config.BIT_ESPLORA_MAINNET_TXNDETAILS.trim(),
      BROADCAST_TX: Config.BIT_ESPLORA_MAINNET_BROADCAST_TX.trim(),
    },
  };

  public RELAY: string;
  public SIGNING_SERVER: string;
  public APP_STAGE: string;

  public API_URLS = {
    TESTNET: {
      BASE: Config.BIT_API_URLS_TESTNET_BASE.trim(),
      BLOCKCHAIN_INFO_BASE: Config.BIT_API_URLS_BLOCKCHAIN_INFO_TESTNET_BASE.trim(),
      BALANCE_CHECK: Config.BIT_API_URLS_TESTNET_BALANCE_CHECK.trim(),
      UNSPENT_OUTPUTS: Config.BIT_API_URLS_TESTNET_UNSPENT_OUTPUTS.trim(),
      BROADCAST: Config.BIT_API_URLS_TESTNET_BROADCAST.trim(),
      TX_DECODE: Config.BIT_API_URLS_TESTNET_TX_DECODE.trim(),
      TX_FETCH: {
        URL: Config.BIT_API_URLS_TESTNET_TX_FETCH_URL.trim(),
        LIMIT: Config.BIT_API_URLS_TESTNET_TX_LIMIT.trim(),
      },
      FUND: {
        URL: Config.BIT_API_URLS_TESTNET_FUND_URL.trim(),
      },
    },
    MAINNET: {
      BASE: Config.BIT_API_URLS_MAINNET_BASE.trim(),
      BLOCKCHAIN_INFO_BASE: Config.BIT_API_URLS_BLOCKCHAIN_INFO_MAINNET_BASE.trim(),
      BALANCE_CHECK: Config.BIT_API_URLS_MAINNET_BALANCE_CHECK.trim(),
      UNSPENT_OUTPUTS: Config.BIT_API_URLS_MAINNET_UNSPENT_OUTPUTS.trim(),
      BROADCAST: Config.BIT_API_URLS_MAINNET_BROADCAST.trim(),
      TX_DECODE: Config.BIT_API_URLS_MAINNET_TX_DECODE.trim(),
      TX_FETCH: {
        URL: Config.BIT_API_URLS_MAINNET_TX_FETCH_URL.trim(),
        LIMIT: Config.BIT_API_URLS_MAINNET_TX_LIMIT.trim(),
      },
    },
  };

  public SUB_PRIMARY_ACCOUNT: DerivativeAccount = {
    series: parseInt(Config.BIT_SUB_PRIMARY_ACCOUNT_SERIES.trim(), 10),
    instance: {
      max: parseInt(Config.BIT_SUB_PRIMARY_ACCOUNT_INSTANCE_COUNT.trim(), 10),
      using: 0,
    },
  };

  public FAST_BITCOINS: DerivativeAccount = {
    series: parseInt(Config.BIT_FAST_BITCOINS_SERIES.trim(), 10),
    instance: {
      max: parseInt(Config.BIT_FAST_BITCOINS_INSTANCE_COUNT.trim(), 10),
      using: 0,
    },
  };

  public TRUSTED_CONTACTS: TrustedContactDerivativeAccount = {
    // corresponds to trusted channels
    series: parseInt(Config.BIT_TRUSTED_CONTACTS_SERIES.trim(), 10),
    instance: {
      max: parseInt(Config.BIT_TRUSTED_CONTACTS_INSTANCE_COUNT.trim(), 10),
      using: 0,
    },
  };

  public DONATION_ACCOUNT: DonationDerivativeAccount = {
    series: parseInt(Config.BIT_DONATION_ACCOUNT_SERIES.trim(), 10),
    instance: {
      max: parseInt(Config.BIT_DONATION_ACCOUNT_INSTANCE_COUNT.trim(), 10),
      using: 0,
    },
  };

  public DERIVATIVE_ACC: DerivativeAccounts = {
    SUB_PRIMARY_ACCOUNT: this.SUB_PRIMARY_ACCOUNT,
    FAST_BITCOINS: this.FAST_BITCOINS,
    TRUSTED_CONTACTS: this.TRUSTED_CONTACTS,
    DONATION_ACCOUNT: this.DONATION_ACCOUNT,
  };

  public EJECTED_ACCOUNTS = [SUB_PRIMARY_ACCOUNT, DONATION_ACCOUNT];

  public DERIVATIVE_ACC_TO_SYNC = Object.keys(this.DERIVATIVE_ACC).filter(
    (account) => !this.EJECTED_ACCOUNTS.includes(account),
  );

  constructor(env: string) {
    this.ENVIRONMENT = env;
    console.log({ env });

    console.log({ BIT_SERVER_MODE: Config.BIT_SERVER_MODE.trim() });

    this.RELAY = this.BH_SERVERS.RELAY;
    this.SIGNING_SERVER = this.BH_SERVERS.SIGNING_SERVER;
    this.HEALTH_STATUS.TIME_SLOTS.SHARE_SLOT1 = parseInt(
      Config.BIT_SHARE_HEALTH_TIME_SLOT1.trim(),
      10,
    );
    this.HEALTH_STATUS.TIME_SLOTS.SHARE_SLOT2 = parseInt(
      Config.BIT_SHARE_HEALTH_TIME_SLOT2.trim(),
      10,
    );

    console.log(this.HEALTH_STATUS.TIME_SLOTS);
    console.log({ tcExpiry: this.TC_REQUEST_EXPIRY });

    console.log(Config.BIT_SERVER_MODE.trim(), this.RELAY, this.SIGNING_SERVER);
    this.setNetwork();

    this.BITCOIN_NODE = new Client({
      network:
        this.NETWORK === bitcoinJS.networks.bitcoin ? 'mainnet' : 'testnet',
      timeout: 10000,
      username: Config.BIT_RPC_USERNAME.trim(),
      password: Config.BIT_RPC_PASSWORD.trim(),
      host: Config.BIT_HOST_IP.trim(),
    });

    if (
      Config.BIT_SERVER_MODE.trim() === 'LOCAL' ||
      Config.BIT_SERVER_MODE.trim() === 'DEV'
    ) {
      this.APP_STAGE = 'dev';
    } else if (Config.BIT_SERVER_MODE.trim() === 'STA') {
      this.APP_STAGE = 'sta';
    } else {
      this.APP_STAGE = 'app';
    }
  }

  public setNetwork = (): void => {
    if (this.ENVIRONMENT === 'MAIN') {
      this.NETWORK = bitcoinJS.networks.bitcoin;
    } else {
      this.NETWORK = bitcoinJS.networks.testnet;
    }
  };
}

export default new HexaConfig(Config.BIT_ENVIRONMENT.trim());
