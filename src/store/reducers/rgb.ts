import { RGBConfig } from '../../bitcoin/utilities/Interface'
import {
  RGB_SYNCING,
  SET_NEXT_FREE_ADDRESS,
  SET_RECEIVE_DATA,
  SET_RGB_CONFIG,
  SET_RGB_ONCHAIN_BALANCE,
  SET_RGB_TXNS,
  SET_RGB20_ASSETS,
  SET_RGB121_ASSETS
} from '../actions/rgb'

const initialState: {
  config: RGBConfig;
  syncing: boolean;
  balances: {
    confirmed: number;
    immature: number;
    spendable: number;
    total: number;
    trustedPending: number;
    untrustedPending: number;
  };
  nextFreeAddress: string;
  receiveAssets: {
    message: string;
    loading: boolean;
    isError: boolean;
    data: {
      invoice: string;
      blindedUtxo: string;
      expirationTimestamp: string;
      blindingSecret: string;
    };
  };
  transactions: [];
  rgb20Assets: {
    ticker: string;
    name: string;
    precision: number;
    settledBalance: number;
    futureBalance: number;
    spendableBalance: number;
    assetId: string;
    transactions: [];
  }[];
  rgb121Assets: []
} = {
  config: {
    bdkDir: '',
    mnemonic: '',
    rgbDir: '',
    xpub: '',
    xpubFingerprint: '',
  },
  syncing: false,
  balances: {
    confirmed: 0,
    immature: 0,
    spendable: 0,
    total: 0,
    trustedPending: 0,
    untrustedPending: 0,
  },
  nextFreeAddress: '',
  receiveAssets: {
    loading: false,
    isError: false,
    message: '',
    data: {
      invoice: '',
      blindedUtxo: '',
      expirationTimestamp: '',
      blindingSecret: '',
    },
  },
  transactions: [],
  rgb20Assets: [],
  rgb121Assets: []
}
//

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case SET_RGB_CONFIG:
        return {
          ...state,
          config: action.payload.config,
        }
      case RGB_SYNCING:
        return {
          ...state,
          syncing: action.payload.isSyncing,
        }
      case SET_NEXT_FREE_ADDRESS:
        return {
          ...state,
          nextFreeAddress: action.payload.address,
        }
      case SET_RGB_TXNS:
        return {
          ...state,
          transactions: action.payload.transactions,
        }
      case SET_RECEIVE_DATA:
        return {
          ...state,
          receiveAssets: action.payload.receiveData,
        }
      case SET_RGB_ONCHAIN_BALANCE:
        return {
          ...state,
          balances: action.payload.balances,
        }
      case SET_RGB20_ASSETS:
        return {
          ...state,
          rgb20Assets: action.payload.assets,
        }
      case SET_RGB121_ASSETS:
        return {
          ...state,
          rgb121Assets: action.payload.assets,
        }
      default:
        return state
  }
}
