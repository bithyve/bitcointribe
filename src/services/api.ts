import axios, { AxiosInstance } from 'axios'
import config from '../bitcoin/HexaConfig'
import { put, call, select } from 'redux-saga/effects'
import { doTorRequest } from '../utils/TorUtils'

const { RELAY, SIGNING_SERVER, REQUEST_TIMEOUT, SWAN_BASE_URL } = config
const URL = ''

interface callReq {
  method: string;
  url: string;
  data?: any;
}

const api = axios.create( {
  baseURL: URL,
} )

let headers = {
}

// export const BH_AXIOS = axios.create( {
//   baseURL: RELAY,
//   timeout: REQUEST_TIMEOUT * 3,
// } )

export const BH_AXIOS = ( request: callReq ) => {
  const activeTor = true
  const { method, data } = request
  const url = `${RELAY}${request.url}`

  if ( activeTor ) {
    return doTorRequest( url, method, data, headers )
  }

  return axios( {
    url,
    method,
    data,
    timeout: REQUEST_TIMEOUT,
  } )
}

export const SIGNING_AXIOS: AxiosInstance = axios.create( {
  baseURL: SIGNING_SERVER,
  timeout: REQUEST_TIMEOUT,
} )

export function setApiHeaders( { appVersion, appBuildNumber } ) {
  axios.defaults.headers.common.appVersion = appVersion
  axios.defaults.headers.common.appBuildNumber = appBuildNumber
  headers = {
    appVersion, appBuildNumber
  }
  // BH_AXIOS.defaults.headers.common.appVersion = appVersion
  // BH_AXIOS.defaults.headers.common.appBuildNumber = appBuildNumber
}

export const SWAN_AXIOS = axios.create( {
  baseURL: SWAN_BASE_URL,
  timeout: REQUEST_TIMEOUT
} )
