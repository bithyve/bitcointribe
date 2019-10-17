import axios, { AxiosInstance } from 'axios';
import Client from 'bitcoin-core';
import bitcoinJS, { Network } from 'bitcoinjs-lib';
import config from 'react-native-config';

class Config {
  public ENVIRONMENT: string;
  public NETWORK: Network;
  public BITCOIN_NODE: Client;
  public BH_AXIOS: AxiosInstance;
  public SECURE_WALLET_XPUB_PATH: string = config.BIT_SECURE_WALLET_XPUB_PATH;
  public SECURE_DERIVATION_BRANCH: string = config.BIT_SECURE_DERIVATION_BRANCH;
  public TOKEN: string = config.BIT_BLOCKCYPHER_API_URLS_TOKEN;
  public SSS_OTP_LENGTH: string = config.BIT_SSS_OTP_LENGTH;
  public GAP_LIMIT: number = parseInt(config.BIT_GAP_LIMIT, 10);
  public BH_SERVER = {
    DEV: config.BIT_API_URLS_BH_SERVER_DEV,
    PROD: config.BIT_API_URLS_BH_SERVER_PROD,
  };
  public BSI = {
    INIT_INDEX: parseInt(config.BIT_BSI_INIT_INDEX, 10),
    MAXUSEDINDEX: parseInt(config.BIT_BSI_MAXUSEDINDEX, 10),
    MINUNUSEDINDEX: parseInt(config.BIT_BSI_MINUNUSEDINDEX, 10),
    DEPTH: {
      INIT: parseInt(config.BIT_BSI_DEPTH_INIT, 10),
      LIMIT: parseInt(config.BIT_BSI_DEPTH_LIMIT, 10),
    },
  };
  public SSS_TOTAL: number = parseInt(config.BIT_SSS_TOTAL, 10);
  public SSS_THRESHOLD: number = parseInt(config.BIT_SSS_THRESHOLD, 10);
  public MSG_ID_LENGTH: number = parseInt(config.BIT_MSG_ID_LENGTH, 10);
  public SCHUNK_SIZE: number = parseInt(config.BIT_SCHUNK_SIZE, 10);
  public CHECKSUM_ITR: number = parseInt(config.BIT_CHECKSUM_ITR, 10);
  public HEXA_ID: string = config.BIT_HEXA_ID;

  public DPATH_PURPOSE: number = parseInt(config.BIT_DPATH_PURPOSE, 10);
  public SSS_METASHARE_SPLITS: number = parseInt(
    config.BIT_SSS_METASHARE_SPLITS,
    10,
  );
  public STATUS = {
    SUCCESS: parseInt(config.BIT_SUCCESS_STATUS_CODE, 10),
    ERROR: parseInt(config.BIT_ERROR_STATUS_CODE, 10),
  };
  public STANDARD = {
    BIP44: parseInt(config.BIT_STANDARD_BIP44, 10),
    BIP49: parseInt(config.BIT_STANDARD_BIP49, 10),
    BIP84: parseInt(config.BIT_STANDARD_BIP84, 10),
  };

  public HEALTH_STATUS = {
    HEXA_HEALTH: {
      STAGE1: config.BIT_HEXA_HEALTH_STAGE1,
      STAGE2: config.BIT_HEXA_HEALTH_STAGE2,
      STAGE3: config.BIT_HEXA_HEALTH_STAGE3,
      STAGE4: config.BIT_HEXA_HEALTH_STAGE4,
      STAGE5: config.BIT_HEXA_HEALTH_STAGE5,
    },

    ENTITY_HEALTH: {
      STAGE1: config.BIT_ENTITY_HEALTH_STAGE1,
      STAGE2: config.BIT_ENTITY_HEALTH_STAGE2,
      STAGE3: config.BIT_ENTITY_HEALTH_STAGE3,
    },

    TIME_SLOTS: {
      DIVIDE_BY: parseInt(config.BIT_UNIX_TIME_DIVIDE_BY, 10),
      SHARE_SLOT1: parseInt(config.BIT_SHARE_HEALTH_TIME_SLOT1, 10),
      SHARE_SLOT2: parseInt(config.BIT_SHARE_HEALTH_TIME_SLOT2, 10),
      MNEMONIC_SLOT: parseInt(config.BIT_MNEMONIC_HEALTH_TIME_SLOT, 10),
    },
  };

  public ESPLORA_API_ENDPOINTS = {
    TESTNET: {
      MULTIBALANCE: config.BIT_ESPLORA_TESTNET_MULTIBALANCE,
      MULTIUTXO: config.BIT_ESPLORA_TESTNET_MULTIUTXO,
      MULTITXN: config.BIT_ESPLORA_TESTNET_MULTITXN,
      TXN_FEE: config.BIT_ESPLORA_TESTNET_TXNFEE,
      TXNDETAILS: config.BIT_ESPLORA_TESTNET_TXNDETAILS,
      BROADCAST_TX: config.BIT_ESPLORA_TESTNET_BROADCAST_TX,
    },
    MAINNET: {
      MULTIBALANCE: config.BIT_ESPLORA_MAINNET_MULTIBALANCE,
      MULTIUTXO: config.BIT_ESPLORA_MAINNET_MULTIUTXO,
      MULTITXN: config.BIT_ESPLORA_MAINNET_MULTITXN,
      TXN_FEE: config.BIT_ESPLORA_MAINNET_TXNFEE,
      TXNDETAILS: config.BIT_ESPLORA_MAINNET_TXNDETAILS,
      BROADCAST_TX: config.BIT_ESPLORA_MAINNET_BROADCAST_TX,
    },
  };

  public SERVER: string = this.BH_SERVER.PROD;

  public API_URLS = {
    TESTNET: {
      BASE: config.BIT_API_URLS_TESTNET_BASE,
      BLOCKCHAIN_INFO_BASE: config.BIT_API_URLS_BLOCKCHAIN_INFO_TESTNET_BASE,
      BALANCE_CHECK: config.BIT_API_URLS_TESTNET_BALANCE_CHECK,
      UNSPENT_OUTPUTS: config.BIT_API_URLS_TESTNET_UNSPENT_OUTPUTS,
      BROADCAST: config.BIT_API_URLS_TESTNET_BROADCAST,
      TX_DECODE: config.BIT_API_URLS_TESTNET_TX_DECODE,
      TX_FETCH: {
        URL: config.BIT_API_URLS_TESTNET_TX_FETCH_URL,
        LIMIT: config.BIT_API_URLS_TESTNET_TX_LIMIT,
      },
      FUND: {
        URL: config.BIT_API_URLS_TESTNET_FUND_URL,
        TOKEN: config.BIT_API_URLS_TESTNET_TOKEN,
      },
    },
    MAINNET: {
      BASE: config.BIT_API_URLS_MAINNET_BASE,
      BLOCKCHAIN_INFO_BASE: config.BIT_API_URLS_BLOCKCHAIN_INFO_MAINNET_BASE,
      BALANCE_CHECK: config.BIT_API_URLS_MAINNET_BALANCE_CHECK,
      UNSPENT_OUTPUTS: config.BIT_API_URLS_MAINNET_UNSPENT_OUTPUTS,
      BROADCAST: config.BIT_API_URLS_MAINNET_BROADCAST,
      TX_DECODE: config.BIT_API_URLS_MAINNET_TX_DECODE,
      TX_FETCH: {
        URL: config.BIT_API_URLS_MAINNET_TX_FETCH_URL,
        LIMIT: config.BIT_API_URLS_MAINNET_TX_LIMIT,
      },
    },
  };

  constructor(env: string) {
    this.ENVIRONMENT = env;
    this.setNetwork();
    console.log({ id: this.HEXA_ID });

    this.BITCOIN_NODE = new Client({
      network:
        this.NETWORK === bitcoinJS.networks.bitcoin ? 'mainnet' : 'testnet',
      timeout: 10000,
      username: config.BIT_RPC_USERNAME,
      password: config.BIT_RPC_PASSWORD,
      host: config.BIT_HOST_IP,
    });
    this.BH_AXIOS = axios.create({
      baseURL: this.SERVER,
      data: { hexa_id: this.HEXA_ID },
    });
  }

  public setNetwork = (): void => {
    if (this.ENVIRONMENT === 'MAIN') {
      this.NETWORK = bitcoinJS.networks.bitcoin;
    } else if (this.ENVIRONMENT === 'TEST') {
      this.NETWORK = bitcoinJS.networks.testnet;
    } else {
      throw new Error('Please specify an apt environment(MAIN||TEST)');
    }
  };
}

export default new Config(config.BIT_ENVIRONMENT);
