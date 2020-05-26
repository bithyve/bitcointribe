import Client from 'bitcoin-core';
import * as bitcoinJS from 'bitcoinjs-lib';
import { DerivativeAccount, DerivativeAccounts, TrustedContactDerivativeAccount } from './utilities/Interface';
import Config from "react-native-config";

class HexaConfig {
  public ENVIRONMENT: string;
  public NETWORK: bitcoinJS.Network;
  public BITCOIN_NODE: Client;
  public SECURE_WALLET_XPUB_PATH: string = Config.BIT_SECURE_WALLET_XPUB_PATH;
  public SECURE_DERIVATION_BRANCH: string = Config.BIT_SECURE_DERIVATION_BRANCH;
  public TOKEN: string = Config.BIT_BLOCKCYPHER_API_URLS_TOKEN;
  public SSS_OTP_LENGTH: string = Config.BIT_SSS_OTP_LENGTH;
  public REQUEST_TIMEOUT: number = parseInt(Config.BIT_REQUEST_TIMEOUT, 10);
  public GAP_LIMIT: number = parseInt(Config.BIT_GAP_LIMIT, 10);
  public CIPHER_SPEC: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = {
    algorithm: Config.BIT_CIPHER_ALGORITHM,
    salt: Config.BIT_CIPHER_SALT,
    keyLength: parseInt(Config.BIT_CIPHER_KEYLENGTH, 10),
    iv: Buffer.alloc(16, 0),
  };
  public BH_SERVERS = {
    LOCAL: {
      RELAY: Config.BIT_API_URLS_RELAY_LOCAL,
      SIGNING_SERVER: Config.BIT_API_URLS_SIGNING_SERVER_LOCAL,
    },
    DEV: {
      RELAY: Config.BIT_API_URLS_RELAY_DEV,
      SIGNING_SERVER: Config.BIT_API_URLS_SIGNING_SERVER_DEV,
    },
    STAGING: {
      RELAY: Config.BIT_API_URLS_RELAY_STAGING,
      SIGNING_SERVER: Config.BIT_API_URLS_SIGNING_SERVER_STAGING,
    },
    PROD: {
      RELAY: Config.BIT_API_URLS_RELAY_PROD,
      SIGNING_SERVER: Config.BIT_API_URLS_SIGNING_SERVER_PROD,
    },
  };
  public BSI = {
    INIT_INDEX: parseInt(Config.BIT_BSI_INIT_INDEX, 10),
    MAXUSEDINDEX: parseInt(Config.BIT_BSI_MAXUSEDINDEX, 10),
    MINUNUSEDINDEX: parseInt(Config.BIT_BSI_MINUNUSEDINDEX, 10),
    DEPTH: {
      INIT: parseInt(Config.BIT_BSI_DEPTH_INIT, 10),
      LIMIT: parseInt(Config.BIT_BSI_DEPTH_LIMIT, 10),
    },
  };
  public SSS_TOTAL: number = parseInt(Config.BIT_SSS_TOTAL, 10);
  public SSS_THRESHOLD: number = parseInt(Config.BIT_SSS_THRESHOLD, 10);
  public MSG_ID_LENGTH: number = parseInt(Config.BIT_MSG_ID_LENGTH, 10);
  public SCHUNK_SIZE: number = parseInt(Config.BIT_SCHUNK_SIZE, 10);
  public CHECKSUM_ITR: number = parseInt(Config.BIT_CHECKSUM_ITR, 10);
  public HEXA_ID: string = Config.BIT_HEXA_ID;
  public DPATH_PURPOSE: number = parseInt(Config.BIT_DPATH_PURPOSE, 10);
  public SSS_METASHARE_SPLITS: number = parseInt(Config.BIT_SSS_METASHARE_SPLITS, 10);
  public STATUS = {
    SUCCESS: parseInt(Config.BIT_SUCCESS_STATUS_CODE, 10),
    ERROR: parseInt(Config.BIT_ERROR_STATUS_CODE, 10),
  };
  public STANDARD = {
    BIP44: parseInt(Config.BIT_STANDARD_BIP44, 10),
    BIP49: parseInt(Config.BIT_STANDARD_BIP49, 10),
    BIP84: parseInt(Config.BIT_STANDARD_BIP84, 10),
  };

  public HEALTH_STATUS = {
    HEXA_HEALTH: {
      STAGE1: Config.BIT_HEXA_HEALTH_STAGE1,
      STAGE2: Config.BIT_HEXA_HEALTH_STAGE2,
      STAGE3: Config.BIT_HEXA_HEALTH_STAGE3,
      STAGE4: Config.BIT_HEXA_HEALTH_STAGE4,
      STAGE5: Config.BIT_HEXA_HEALTH_STAGE5,
    },

    ENTITY_HEALTH: {
      STAGE1: Config.BIT_ENTITY_HEALTH_STAGE1,
      STAGE2: Config.BIT_ENTITY_HEALTH_STAGE2,
      STAGE3: Config.BIT_ENTITY_HEALTH_STAGE3,
    },

    TIME_SLOTS: {
      SHARE_SLOT1: parseInt(Config.BIT_SHARE_HEALTH_TIME_SLOT1_DEV, 10),
      SHARE_SLOT2: parseInt(Config.BIT_SHARE_HEALTH_TIME_SLOT2_DEV, 10),
    },
  };

  public ESPLORA_API_ENDPOINTS = {
    TESTNET: {
      MULTIBALANCE: Config.BIT_ESPLORA_TESTNET_MULTIBALANCE,
      MULTIUTXO: Config.BIT_ESPLORA_TESTNET_MULTIUTXO,
      MULTITXN: Config.BIT_ESPLORA_TESTNET_MULTITXN,
      MULTIBALANCETXN: Config.BIT_ESPLORA_TESTNET_MULTIBALANCETXN,
      TXN_FEE: Config.BIT_ESPLORA_TESTNET_TXNFEE,
      TXNDETAILS: Config.BIT_ESPLORA_TESTNET_TXNDETAILS,
      BROADCAST_TX: Config.BIT_ESPLORA_TESTNET_BROADCAST_TX,
    },
    MAINNET: {
      MULTIBALANCE: Config.BIT_ESPLORA_MAINNET_MULTIBALANCE,
      MULTIUTXO: Config.BIT_ESPLORA_MAINNET_MULTIUTXO,
      MULTITXN: Config.BIT_ESPLORA_MAINNET_MULTITXN,
      MULTIBALANCETXN: Config.BIT_ESPLORA_MAINNET_MULTIBALANCETXN,
      TXN_FEE: Config.BIT_ESPLORA_MAINNET_TXNFEE,
      TXNDETAILS: Config.BIT_ESPLORA_MAINNET_TXNDETAILS,
      BROADCAST_TX: Config.BIT_ESPLORA_MAINNET_BROADCAST_TX,
    },
  };

  public RELAY: string;
  public SIGNING_SERVER: string;
  public APP_STAGE: string;

  public API_URLS = {
    TESTNET: {
      BASE: Config.BIT_API_URLS_TESTNET_BASE,
      BLOCKCHAIN_INFO_BASE: Config.BIT_API_URLS_BLOCKCHAIN_INFO_TESTNET_BASE,
      BALANCE_CHECK: Config.BIT_API_URLS_TESTNET_BALANCE_CHECK,
      UNSPENT_OUTPUTS: Config.BIT_API_URLS_TESTNET_UNSPENT_OUTPUTS,
      BROADCAST: Config.BIT_API_URLS_TESTNET_BROADCAST,
      TX_DECODE: Config.BIT_API_URLS_TESTNET_TX_DECODE,
      TX_FETCH: {
        URL: Config.BIT_API_URLS_TESTNET_TX_FETCH_URL,
        LIMIT: Config.BIT_API_URLS_TESTNET_TX_LIMIT,
      },
      FUND: {
        URL: Config.BIT_API_URLS_TESTNET_FUND_URL,
      },
    },
    MAINNET: {
      BASE: Config.BIT_API_URLS_MAINNET_BASE,
      BLOCKCHAIN_INFO_BASE: Config.BIT_API_URLS_BLOCKCHAIN_INFO_MAINNET_BASE,
      BALANCE_CHECK: Config.BIT_API_URLS_MAINNET_BALANCE_CHECK,
      UNSPENT_OUTPUTS: Config.BIT_API_URLS_MAINNET_UNSPENT_OUTPUTS,
      BROADCAST: Config.BIT_API_URLS_MAINNET_BROADCAST,
      TX_DECODE: Config.BIT_API_URLS_MAINNET_TX_DECODE,
      TX_FETCH: {
        URL: Config.BIT_API_URLS_MAINNET_TX_FETCH_URL,
        LIMIT: Config.BIT_API_URLS_MAINNET_TX_LIMIT,
      },
    },
  };

  FAST_BITCOINS: DerivativeAccount = {
    series: parseInt(Config.BIT_FAST_BITCOINS_SERIES, 10),
    instance: {
      max: parseInt(Config.BIT_FAST_BITCOINS_INSTANCE_COUNT, 10),
      using: 0,
    },
  };

  TRUSTED_CONTACTS: TrustedContactDerivativeAccount = {
    // corresponds to trusted channels
    series: parseInt(Config.BIT_TRUSTED_CONTACTS_SERIES, 10),
    instance: {
      max: parseInt(Config.BIT_TRUSTED_CONTACTS_INSTANCE_COUNT, 10),
      using: 0,
    },
  };

  public DERIVATIVE_ACC: DerivativeAccounts = {
    FAST_BITCOINS: this.FAST_BITCOINS,
    TRUSTED_CONTACTS: this.TRUSTED_CONTACTS,
  };

  constructor(env: string) {
    this.ENVIRONMENT = env;
    console.log({ env });
    console.log(Config.BIT_SERVER_MODE);

    if (Config.BIT_SERVER_MODE.trim() === 'PROD') {
      this.RELAY = this.BH_SERVERS.PROD.RELAY;
      this.SIGNING_SERVER = this.BH_SERVERS.PROD.SIGNING_SERVER;
      this.HEALTH_STATUS.TIME_SLOTS.SHARE_SLOT1 = parseInt(
        Config.BIT_SHARE_HEALTH_TIME_SLOT1_PROD,
        10,
      );
      this.HEALTH_STATUS.TIME_SLOTS.SHARE_SLOT2 = parseInt(
        Config.BIT_SHARE_HEALTH_TIME_SLOT2_PROD,
        10,
      );
    } else if (Config.BIT_SERVER_MODE.trim() === 'STA') {
      this.RELAY = this.BH_SERVERS.STAGING.RELAY;
      this.SIGNING_SERVER = this.BH_SERVERS.STAGING.SIGNING_SERVER;
    } else if (Config.BIT_SERVER_MODE.trim() === 'DEV') {
      this.RELAY = this.BH_SERVERS.DEV.RELAY;
      this.SIGNING_SERVER = this.BH_SERVERS.DEV.SIGNING_SERVER;
    } else if (Config.BIT_SERVER_MODE.trim() === 'LOCAL') {
      this.RELAY = this.BH_SERVERS.LOCAL.RELAY;
      this.SIGNING_SERVER = this.BH_SERVERS.LOCAL.SIGNING_SERVER;
    }
    console.log(this.HEALTH_STATUS.TIME_SLOTS);
    console.log(Config.BIT_SERVER_MODE,this.RELAY, this.SIGNING_SERVER);
    this.setNetwork();

    this.BITCOIN_NODE = new Client({
      network:
        this.NETWORK === bitcoinJS.networks.bitcoin ? 'mainnet' : 'testnet',
      timeout: 10000,
      username: Config.BIT_RPC_USERNAME,
      password: Config.BIT_RPC_PASSWORD,
      host: Config.BIT_HOST_IP,
    });

    if (Config.BIT_SERVER_MODE === 'LOCAL' || Config.BIT_SERVER_MODE === 'DEV') {
      this.APP_STAGE = 'dev';
    } else if (Config.BIT_SERVER_MODE === 'STA') {
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

export default new HexaConfig(Config.BIT_ENVIRONMENT);
