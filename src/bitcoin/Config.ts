import Client from "bitcoin-core";
import bitcoinJS, { Network } from "bitcoinjs-lib";
import config from "react-native-config";

class Config {
  public ENVIRONMENT: string;
  public NETWORK: Network;
  public BITCOIN_NODE: Client;
  public WALLET_XPUB_PATH: string = config.BIT_WALLET_XPUB_PATH;
  public DERIVATION_BRANCH: string = config.BIT_DERIVATION_BRANCH;
  public TOKEN: string = config.BIT_BLOCKCYPHER_API_URLS_TOKEN;
  public BH_SERVER = {
    DEV: config.BIT_API_URLS_BH_SERVER_DEV,
    PROD: config.BIT_API_URLS_BH_SERVER_PROD
  };

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
        LIMIT: config.BIT_API_URLS_TESTNET_TX_LIMIT
      },
      FUND: {
        URL: config.BIT_API_URLS_TESTNET_FUND_URL,
        TOKEN: config.BIT_API_URLS_TESTNET_TOKEN
      }
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
        LIMIT: config.BIT_API_URLS_MAINNET_TX_LIMIT
      }
    }
  };

  constructor(env: string) {
    this.ENVIRONMENT = env;
    this.setNetwork();
    this.BITCOIN_NODE = new Client({
      network:
        this.NETWORK === bitcoinJS.networks.bitcoin ? "mainnet" : "testnet",
      username: config.BIT_RPC_USERNAME,
      password: config.BIT_RPC_PASSWORD,
      host: config.BIT_HOST_IP
    });
  }

  public setNetwork = (): void => {
    if (this.ENVIRONMENT === "PROD") {
      this.NETWORK = bitcoinJS.networks.bitcoin;
    } else if (this.ENVIRONMENT === "DEV") {
      this.NETWORK = bitcoinJS.networks.testnet;
    } else {
      throw new Error("Please specify an apt environment(PROD||DEV)");
    }
  };
}

export default new Config(config.BIT_ENVIRONMENT);
