import {
  FETCH_WYRE_TOKEN_FAILED,
  FETCH_WYRE_TOKEN_SUCCEEDED,
  FETCH_WYRE_TOKEN_COMPLETED,

  LINK_WYRE_WALLET_FAILED,
  LINK_WYRE_WALLET_SUCCEEDED,
  LINK_WYRE_WALLET_COMPLETED,
  FETCH_WYRE_TOKEN,
  LINK_WYRE_WALLET,
} from '../actions/WyreIntegration'


export type WyreIntegrationState = {
  wyreTokenDetails: unknown | null;
  wyreWalletDetails: unknown | null;
  wyreMetadataDetails: unknown | null;

  isFetchingWyreToken: boolean;
  fetchWyreTokenFailed: boolean;
  fetchWyreTokenFailedMessage: null;

  isLinkingWyreWallet: boolean;
  linkWyreWalletFailed: boolean;
  linkWyreWalletFailedMessage: null;

  isSyncingWyreWallet: boolean;
  syncWyreWalletFailed: boolean;
  syncWyreWalletFailedMessage: null;

  isAddingWyreMetadata: boolean;
  addWyreMetadataFailed: boolean;
  addWyreMetadataFailedMessage: null;
}

const INITIAL_STATE: WyreIntegrationState = {
  wyreTokenDetails: null,
  wyreWalletDetails: null,
  wyreMetadataDetails: null,

  isFetchingWyreToken: false,
  fetchWyreTokenFailed: false,
  fetchWyreTokenFailedMessage: null,

  isLinkingWyreWallet: false,
  linkWyreWalletFailed: false,
  linkWyreWalletFailedMessage: null,

  isSyncingWyreWallet: false,
  syncWyreWalletFailed: false,
  syncWyreWalletFailedMessage: null,

  isAddingWyreMetadata: false,
  addWyreMetadataFailed: false,
  addWyreMetadataFailedMessage: null,
}

const reducer = ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
      case FETCH_WYRE_TOKEN:
        return {
          ...state,
          isFetchingWyreToken: true,
        }

      case FETCH_WYRE_TOKEN_FAILED:
        console.log(
          'action.payload.fetchWyreTokenFailedMessage',
          action.payload.fetchWyreTokenFailed,
          action.payload.fetchWyreTokenFailedMessage,
        )
        return {
          ...state,
          isFetchingWyreToken: false,
          fetchWyreTokenFailed: action.payload.data.fetchWyreTokenFailed,
          fetchWyreTokenFailedMessage: action.payload.data.fetchWyreTokenFailedMessage,
        }

      case FETCH_WYRE_TOKEN_SUCCEEDED:
        console.log(
          'payload.wyreTokenDetails',
          action.payload.wyreTokenDetails,
        )
        return {
          ...state,
          isFetchingWyreToken: false,
          fetchWyreTokenFailed: false,
          wyreTokenDetails: action.payload.wyreTokenDetails,
        }

      case FETCH_WYRE_TOKEN_COMPLETED:
        return {
          ...state,
          isFetchingWyreToken: false,
          fetchWyreTokenFailedMessage: null,
        }

      case LINK_WYRE_WALLET:
        return {
          ...state,
          isLinkingWyreWallet: true,
        }

      case LINK_WYRE_WALLET_FAILED:
        console.log(
          'action.payload.linkWyreWalletFailedMessage',
          action.payload.linkWyreWalletFailed,
          action.payload.linkWyreWalletFailedMessage,
        )
        return {
          ...state,
          isLinkingWyreWallet: false,
          linkWyreWalletFailed: true,
          linkWyreWalletFailedMessage: action.payload.linkWyreWalletFailedMessage,
        }

      case LINK_WYRE_WALLET_SUCCEEDED:
        console.log(
          'payload.wyreWalletDetails',
          action.payload.wyreWalletDetails,
        )
        return {
          ...state,
          isLinkingWyreWallet: false,
          linkWyreWalletFailed: false,
          wyreWalletDetails: action.payload.wyreWalletDetails,
        }

      case LINK_WYRE_WALLET_COMPLETED:
        return {
          ...state,
          isLinkingWyreWallet: false,
          linkWyreWalletFailedMessage: null,
        }
  }

  return state
}

export default reducer
