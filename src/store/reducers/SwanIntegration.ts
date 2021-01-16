import {
  LINK_SWAN_WALLET_FAILED,
  LINK_SWAN_WALLET_SUCCEEDED,
  LINK_SWAN_WALLET_COMPLETED,

  LINK_SWAN_WALLET,
} from '../actions/SwanIntegration'


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
}

const reducer = ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
      case LINK_SWAN_WALLET:
        return {
          ...state,
          isLinkingSwanWallet: true,
        }

      case LINK_SWAN_WALLET_FAILED:
        console.log(
          'action.payload.linkSwanWalletFailedMessage',
          action.payload.linkSwanWalletFailed,
          action.payload.linkSwanWalletFailedMessage,
        )
        return {
          ...state,
          isLinkingSwanWallet: false,
          linkSwanWalletFailed: true,
          linkSwanWalletFailedMessage: action.payload.linkSwanWalletFailedMessage,
        }

      case LINK_SWAN_WALLET_SUCCEEDED:
        console.log(
          'payload.swanWalletDetails',
          action.payload.swanWalletDetails,
        )
        return {
          ...state,
          isLinkingSwanWallet: false,
          linkSwanWalletFailed: false,
          swanWalletDetails: action.payload.swanWalletDetails,
        }

      case LINK_SWAN_WALLET_COMPLETED:
        return {
          ...state,
          isLinkingSwanWallet: false,
          linkSwanWalletFailedMessage: null,
        }
  }

  return state
}

export default reducer
