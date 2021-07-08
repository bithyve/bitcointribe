import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import AccountShell from '../../common/data/models/AccountShell'
import {
  UPDATE_SWAN_STATUS,
  CLEAR_SWAN_CACHE,
  FETCH_SWAN_AUTHENTICATION_URL_STARTED,
  FETCH_SWAN_AUTHENTICATION_URL_SUCCEEDED,
  REDEEM_SWAN_CODE_FOR_TOKEN_STARTED,
  REDEEM_SWAN_CODE_FOR_TOKEN_SUCCEEDED,
  CREATE_WITHDRAWAL_WALLET_ON_SWAN_STARTED,
  CREATE_WITHDRAWAL_WALLET_ON_SWAN_SUCCEEDED,
  LINK_SWAN_WALLET_FAILED,
  LINK_SWAN_WALLET_SUCCEEDED,
  LINK_SWAN_WALLET_COMPLETED,
  LINK_SWAN_WALLET,
  TEMP_SWAN_ACCOUNT_INFO_SAVED
} from '../actions/SwanIntegration'


export type SwanIntegrationState = {
  swanErrorCode: string | null,
  swanAccountCreationStatus: SwanAccountCreationStatus | null,
  isSwanAuthenticationInProgress: boolean | null,
  swanAuthenticationUrl: string | null,
  code_verifier: string | null,
  code_challenge: string | null,
  state: string | null,
  nonce: number | null,

  hasFetchSwanAuthenticationUrlInitiated: boolean | null,
  hasFetchSwanAuthenticationUrlSucceeded: boolean | null,
  hasFetchSwanAuthenticationUrlCompleted: boolean | null,

  hasRedeemSwanCodeForTokenSucceeded: boolean | null,
  hasRedeemSwanCodeForTokenCompleted: boolean | null,
  hasRedeemSwanCodeForTokenInitiated: boolean | null,

  minBtcThreshold: number | 0.0005,

  hasCreateWithdrawalWalletOnSwanSucceeded: boolean | null,
  hasCreateWithdrawalWalletOnSwanCompleted: boolean | null,
  hasCreateWithdrawalWalletOnSwanInitiated: boolean | null,

  // TODO:: Create temperory swan account in hexa
  hasSwanAccountCreationInitiated: boolean | null,
  hasSwanAccountCreationCompleted: boolean | null,
  hasSwanAccountCreationSucceeded: boolean | null,
  swanAccountDetails: AccountShell, // temperory swan account shell object

  // TODO:: Reducers for linking Hexa Wallet with Swan Withdrawal Wallet



  // The below values are currently not being used
  swanAuthenticatedToken: string | null,
  isSwanRedeemCodeInProgress: boolean | null,
  swanToken: string | null


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
  swanErrorCode: '',
  swanAccountCreationStatus: null,
  isSwanAuthenticationInProgress: false,
  swanAuthenticationUrl: null,
  code_challenge: null,
  code_verifier: null,
  state: null,
  nonce: null,
  hasFetchSwanAuthenticationUrlInitiated: false,
  hasFetchSwanAuthenticationUrlSucceeded: false,
  hasFetchSwanAuthenticationUrlCompleted: false,

  hasRedeemSwanCodeForTokenSucceeded: false,
  hasRedeemSwanCodeForTokenCompleted: false,
  hasRedeemSwanCodeForTokenInitiated: false,

  minBtcThreshold: 0.02,
  hasSwanAccountCreationSucceeded: false,
  hasSwanAccountCreationCompleted: false,
  hasSwanAccountCreationInitiated: false,

  swanAccountDetails: null,

  hasCreateWithdrawalWalletOnSwanSucceeded: false,
  hasCreateWithdrawalWalletOnSwanCompleted: false,
  hasCreateWithdrawalWalletOnSwanInitiated: false,
  swanAuthenticatedToken: null,
  isSwanRedeemCodeInProgress: false,
  swanToken: null,

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
      case UPDATE_SWAN_STATUS:
        return {
          ...state,
          swanAccountCreationStatus: action.payload.data
        }

      case CLEAR_SWAN_CACHE:
        return {
          ...INITIAL_STATE
        }

      case FETCH_SWAN_AUTHENTICATION_URL_STARTED:
        return {
          ...state,
          hasFetchSwanAuthenticationUrlInitiated: true
        }

      case FETCH_SWAN_AUTHENTICATION_URL_SUCCEEDED:
        return {
          ...state,
          // swanAccountCreationStatus: SwanAccountCreationStatus.INITIAL_USER_AUTHENTICATION_IN_PROGRESS,
          isSwanAuthenticationInProgress: true,
          hasFetchSwanAuthenticationUrlInitiated: true,
          hasFetchSwanAuthenticationUrlSucceeded: true,
          hasFetchSwanAuthenticationUrlCompleted: true,
          swanAuthenticationUrl: action.payload.data.swanAuthenticationUrl,
          code_challenge: action.payload.data.code_challenge,
          code_verifier: action.payload.data.code_verifier,
          nonce: action.payload.data.nonce,
          state: action.payload.data.state,
          swanAuthenticatedToken: null,
          hasRedeemSwanCodeForTokenSucceeded: false,
          hasRedeemSwanCodeForTokenCompleted: false,
          hasRedeemSwanCodeForTokenInitiated: false,
        }

      case REDEEM_SWAN_CODE_FOR_TOKEN_STARTED:
        return {
          ...state,
          hasRedeemSwanCodeForTokenInitiated: true,
        }

      case REDEEM_SWAN_CODE_FOR_TOKEN_SUCCEEDED:
        return {
          ...state,
          hasRedeemSwanCodeForTokenSucceeded: true,
          hasRedeemSwanCodeForTokenCompleted: true,
          swanAuthenticatedToken: action.payload.data.swanAuthenticatedToken,
          hasCreateWithdrawalWalletOnSwanSucceeded: false,
          hasCreateWithdrawalWalletOnSwanCompleted: false,
          hasCreateWithdrawalWalletOnSwanInitiated: false,
        }

      case CREATE_WITHDRAWAL_WALLET_ON_SWAN_STARTED:
        return {
          ...state,
          minBtcThreshold: action.payload.data || 0.02,
          hasCreateWithdrawalWalletOnSwanInitiated: true,
        }

      case CREATE_WITHDRAWAL_WALLET_ON_SWAN_SUCCEEDED:
        return {
          ...state,
          swanAccountCreationStatus: SwanAccountCreationStatus.WALLET_LINKED_SUCCESSFULLY,
          hasCreateWithdrawalWalletOnSwanSucceeded: true,
          hasCreateWithdrawalWalletOnSwanCompleted: true,
          swanWalletId: action.payload.data.swanWalletId
        }

      case TEMP_SWAN_ACCOUNT_INFO_SAVED:
        return {
          ...state,
          swanAccountDetails: action.payload.data
        }

      case LINK_SWAN_WALLET:
        return {
          ...state,
          isLinkingSwanWallet: true,
        }

      case LINK_SWAN_WALLET_FAILED:
        return {
          ...state,
          isLinkingSwanWallet: false,
          linkSwanWalletFailed: true,
          linkSwanWalletFailedMessage: action.payload.linkSwanWalletFailedMessage,
        }

      case LINK_SWAN_WALLET_SUCCEEDED:
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
