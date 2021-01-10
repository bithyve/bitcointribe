import {
  FETCH_WYRE_RESERVATION,
  FETCH_WYRE_RESERVATION_FAILED,
  FETCH_WYRE_RESERVATION_SUCCEEDED,
  WYRE_RESERVATION_SUCCEEDED,

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
  wyreReservationCode: string | null;
  wyreHostedUrl: string | null;
  wyreReservationSucceeded: boolean;
  isProcessingWyreOrder: boolean;

  isFetchingWyreToken: boolean;
  fetchWyreTokenFailed: boolean;
  fetchWyreTokenFailedMessage: null;

  isLinkingWyreWallet: boolean;
  linkWyreWalletFailed: boolean;
  linkWyreWalletFailedMessage: null;

  isSyncingWyreWallet: boolean;
  fetchWyreReservationFailed: boolean;
  fetchWyreReservationFailedMessage: null;

  isAddingWyreMetadata: boolean;
  addWyreMetadataFailed: boolean;
  addWyreMetadataFailedMessage: null;
}

const INITIAL_STATE: WyreIntegrationState = {
  wyreReservationCode: null,
  wyreHostedUrl: null,
  wyreReservationSucceeded: false,
  isProcessingWyreOrder: false,

  isFetchingWyreToken: false,
  fetchWyreTokenFailed: false,
  fetchWyreTokenFailedMessage: null,

  isLinkingWyreWallet: false,
  linkWyreWalletFailed: false,
  linkWyreWalletFailedMessage: null,

  isSyncingWyreWallet: false,
  fetchWyreReservationFailed: false,
  fetchWyreReservationFailedMessage: null,

  isAddingWyreMetadata: false,
  addWyreMetadataFailed: false,
  addWyreMetadataFailedMessage: null,
}

const reducer = ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
      case WYRE_RESERVATION_SUCCEEDED:
        return {
          ...state,
          wyreReservationCode: action.payload.wyreReservationCode,
          wyreHostedUrl: action.payload.wyreHostedUrl,
          wyreReservationSucceeded: true,
          isProcessingWyreOrder: false,
        }
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
          'payload.wyreReservationCode',
          action.payload.wyreReservationCode,
        )
        return {
          ...state,
          isFetchingWyreToken: false,
          fetchWyreTokenFailed: false,
          wyreReservationCode: action.payload.wyreReservationCode,
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
          'payload.wyreHostedUrl',
          action.payload.wyreHostedUrl,
        )
        return {
          ...state,
          isLinkingWyreWallet: false,
          linkWyreWalletFailed: false,
          wyreHostedUrl: action.payload.wyreHostedUrl,
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
