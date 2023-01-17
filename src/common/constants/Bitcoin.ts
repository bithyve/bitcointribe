import { NetworkType } from "../../bitcoin/utilities/Interface";
import config from '../../bitcoin/HexaConfig'

export const SATOSHIS_IN_BTC = 1e8

export const isTestnet = () => {
    if (config.NETWORK_TYPE === NetworkType.TESTNET) {
      return true;
    }
    return false;
};