import bitcoinJS, { Network } from "bitcoinjs-lib";

class Config {
  public ENVIRONMENT: string;
  public NETWORK: Network;
  public WALLET_XPUB_PATH: string = "2147483651/2147483649/";
  public DERIVATION_BRANCH: string = "1";
  //public TOKEN: string; //please enter your blockcypher token here;
  public BREADTH: number = 5;
  public BH_SERVER = {
    DEV: "http://localhost:3000",
    PROD: "https://prime-sign-230407.appspot.com"
  };
  public API_URLS = {
    TESTNET: {
      BASE: "https://api.blockcypher.com/v1/btc/test3",
      BALANCE_CHECK: "https://testnet.blockchain.info/balance?active=",
      UNSPENT_OUTPUTS: "https://testnet.blockchain.info/unspent?active=",
      BROADCAST: "https://testnet-api.smartbit.com.au/v1/blockchain/pushtx",
      TX_DECODE: "https://testnet-api.smartbit.com.au/v1/blockchain/decodetx",
      TX_FETCH: {
        URL: "https://testnet.blockchain.info/rawaddr/",
        LIMIT: "?limit="
      },
      FUND: {
        URL: "https://api.blockcypher.com/v1/btc/test3/faucet?token=",
        TOKEN: "0d55b026eb934aa8b4de8a11bdcc16f1"
      }
    },
    MAINNET: {
      BASE: "https://api.blockcypher.com/v1/btc/main",
      BALANCE_CHECK: "https://blockchain.info/balance?active=",
      UNSPENT_OUTPUTS: "https://blockchain.info/unspent?active=",
      BROADCAST: "https://api.smartbit.com.au/v1/blockchain/pushtx",
      TX_DECODE: "https://api.smartbit.com.au/v1/blockchain/decodetx",
      TX_FETCH: {
        URL: "https://blockchain.info/rawaddr/",
        LIMIT: "?limit="
      }
    }
  };

  constructor(env: string) {
    this.ENVIRONMENT = env;
    this.setNetwork();
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

export default new Config("DEV");
