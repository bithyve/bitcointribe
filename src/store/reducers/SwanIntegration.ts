import {
  FETCH_SWAN_TOKEN_FAILED,
  FETCH_SWAN_TOKEN_SUCCEEDED,
  FETCH_SWAN_TOKEN_COMPLETED,

  LINK_SWAN_WALLET_FAILED,
  LINK_SWAN_WALLET_SUCCEEDED,
  LINK_SWAN_WALLET_COMPLETED,
  FETCH_SWAN_TOKEN,
  LINK_SWAN_WALLET,
} from '../actions/SwanIntegration';


export type SwanIntegrationState = {
  swanTokenDetails: unknown | null;
  swanWalletDetails: unknown | null;
  swanMetadataDetails: unknown | null;

  isFetchingSwanToken: boolean;
  fetchSwanTokenFailed: boolean;
  fetchSwanTokenFailedMessage: null;

  isLinkingSwanWallet: boolean;
  linkSwanWalletFailed: boolean;
  linkSwanWalletFailedMessage: null;

  isSyncingSwanWallet: boolean;
  syncSwanWalletFailed: boolean;
  syncSwanWalletFailedMessage: null;

  isAddingSwanMetadata: boolean;
  addSwanMetadataFailed: boolean;
  addSwanMetadataFailedMessage: null;
}

const INITIAL_STATE: SwanIntegrationState = {
  swanTokenDetails: null,
  swanWalletDetails: null,
  swanMetadataDetails: null,

  isFetchingSwanToken: false,
  fetchSwanTokenFailed: false,
  fetchSwanTokenFailedMessage: null,

  isLinkingSwanWallet: false,
  linkSwanWalletFailed: false,
  linkSwanWalletFailedMessage: null,

  isSyncingSwanWallet: false,
  syncSwanWalletFailed: false,
  syncSwanWalletFailedMessage: null,

  isAddingSwanMetadata: false,
  addSwanMetadataFailed: false,
  addSwanMetadataFailedMessage: null,
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_SWAN_TOKEN:
      return {
        ...state,
        isFetchingSwanToken: true,
      };

    case FETCH_SWAN_TOKEN_FAILED:
      console.log(
        'action.payload.fetchSwanTokenFailedMessage',
        action.payload.fetchSwanTokenFailed,
        action.payload.fetchSwanTokenFailedMessage,
      );
      return {
        ...state,
        isFetchingSwanToken: false,
        fetchSwanTokenFailed: action.payload.data.fetchSwanTokenFailed,
        fetchSwanTokenFailedMessage: action.payload.data.fetchSwanTokenFailedMessage,
      };

    case FETCH_SWAN_TOKEN_SUCCEEDED:
      console.log(
        'payload.swanTokenDetails',
        action.payload.swanTokenDetails,
      );
      return {
        ...state,
        isFetchingSwanToken: false,
        fetchSwanTokenFailed: false,
        swanTokenDetails: action.payload.swanTokenDetails,
      };

    case FETCH_SWAN_TOKEN_COMPLETED:
      return {
        ...state,
        isFetchingSwanToken: false,
        fetchSwanTokenFailedMessage: null,
      };

    case LINK_SWAN_WALLET:
      return {
        ...state,
        isLinkingSwanWallet: true,
      };

    case LINK_SWAN_WALLET_FAILED:
      console.log(
        'action.payload.linkSwanWalletFailedMessage',
        action.payload.linkSwanWalletFailed,
        action.payload.linkSwanWalletFailedMessage,
      );
      return {
        ...state,
        isLinkingSwanWallet: false,
        linkSwanWalletFailed: true,
        linkSwanWalletFailedMessage: action.payload.linkSwanWalletFailedMessage,
      };

    case LINK_SWAN_WALLET_SUCCEEDED:
      console.log(
        'payload.swanWalletDetails',
        action.payload.swanWalletDetails,
      );
      return {
        ...state,
        isLinkingSwanWallet: false,
        linkSwanWalletFailed: false,
        swanWalletDetails: action.payload.swanWalletDetails,
      };

    case LINK_SWAN_WALLET_COMPLETED:
      return {
        ...state,
        isLinkingSwanWallet: false,
        linkSwanWalletFailedMessage: null,
      };
  }

  return state;
};

export default reducer;
