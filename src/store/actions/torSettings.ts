import { Action } from 'redux'
import Tor from '../../common/data/models/Tor'

export const TOR_PREFERENCE_TOGGLED = 'TOR_PREFERENCE_TOGGLED'

export const SAVE_TOR_CONFIGURATION = 'SAVE_TOR_CONFIGURATION'
export const TOR_CONFIGURATION_SET = 'TOR_CONFIGURATION_SET'
export const RESTORE_TOR_CONFIGURATION = 'RESTORE_TOR_CONFIGURATION'

export const CONNECT_TO_TOR = 'CONNECT_TO_TOR'
export const TOR_CONNECTING_FAILED = 'TOR_CONNECTING_FAILED'
export const TOR_CONNECTING_SUCCEEDED = 'TOR_CONNECTING_SUCCEEDED'
export const TOR_CONNECTING_COMPLETED = 'TOR_CONNECTING_COMPLETED'

export const CONNECT_OVER_PLAINNET = 'CONNECT_OVER_PLAINNET'
export const PLAINNET_CONNECTING_FAILED = 'PLAINNET_CONNECTING_FAILED'
export const PLAINNET_CONNECTING_SUCCEEDED = 'PLAINNET_CONNECTING_SUCCEEDED'
export const PLAINNET_CONNECTING_COMPLETED = 'PLAINNET_CONNECTING_COMPLETED'


export interface TorPreferenceToggledAction extends Action {
  type: typeof TOR_PREFERENCE_TOGGLED;
  payload: boolean;
}

export const torPreferenceToggled = ( prefersTorConnection ): TorPreferenceToggledAction => {
  return {
    type: TOR_PREFERENCE_TOGGLED,
    payload: prefersTorConnection
  }
}


export interface TorConfigurationSaveAction extends Action {
  type: typeof SAVE_TOR_CONFIGURATION;
  payload: Tor;
}

export const saveTorConfiguration = ( payload: Tor ): TorConfigurationSaveAction => {
  return {
    type: SAVE_TOR_CONFIGURATION,
    payload,
  }
}

export const restoreTorConfiguration = ( payload: Tor ) => {
  return {
    type: RESTORE_TOR_CONFIGURATION,
    payload,
  }
}



export interface TorConfigurationSetAction extends Action {
  type: typeof TOR_CONFIGURATION_SET;
  payload: Tor;
}

export const torConfigurationSet = ( payload: Tor ): TorConfigurationSetAction => {
  return {
    type: TOR_CONFIGURATION_SET,
    payload,
  }
}


export interface TorConnectionAction extends Action {
  type: typeof CONNECT_TO_TOR;
  payload: Tor;
}

export const connectToTor = (
  payload: Tor
): TorConnectionAction => {
  return {
    type: CONNECT_TO_TOR,
    payload,
  }
}


export interface TorConnectionSuccessAction extends Action {
  type: typeof TOR_CONNECTING_SUCCEEDED;
  payload: Tor;
}

export const torConnectionSucceeded = (
  payload: Tor
): TorConnectionSuccessAction => {
  return {
    type: TOR_CONNECTING_SUCCEEDED,
    payload,
  }
}


export interface TorConnectionFailureAction extends Action {
  type: typeof TOR_CONNECTING_FAILED;
  payload: string;
}

export const torConnectionFailed = (
  errorMessage: string
): TorConnectionFailureAction => {
  return {
    type: TOR_CONNECTING_FAILED,
    payload: errorMessage,
  }
}

export interface TorConnectionCompletionAction extends Action {
  type: typeof TOR_CONNECTING_COMPLETED;
}

export const torConnectionCompleted = (): TorConnectionCompletionAction => {
  return {
    type: TOR_CONNECTING_COMPLETED
  }
}


export interface PlainnetConnectionAction extends Action {
  type: typeof CONNECT_OVER_PLAINNET;
}

export const connectOverPlainnet = (
): PlainnetConnectionAction => {
  return {
    type: CONNECT_OVER_PLAINNET,
  }
}


export interface PlainnetConnectionSuccessAction extends Action {
  type: typeof PLAINNET_CONNECTING_SUCCEEDED;
}

export const plainnetConnectionSucceeded = (
): PlainnetConnectionSuccessAction => {
  return {
    type: PLAINNET_CONNECTING_SUCCEEDED,
  }
}


export interface PlainnetConnectionFailureAction extends Action {
  type: typeof PLAINNET_CONNECTING_FAILED;
  payload: string;
}

export const plainnetConnectionFailed = (
  errorMessage: string
): PlainnetConnectionFailureAction => {
  return {
    type: PLAINNET_CONNECTING_FAILED,
    payload: errorMessage,
  }
}

export interface PlainnetConnectionCompletionAction extends Action {
  type: typeof PLAINNET_CONNECTING_COMPLETED;
}

export const plainnetConnectionCompleted = (): PlainnetConnectionCompletionAction => {
  return {
    type: PLAINNET_CONNECTING_COMPLETED
  }
}
