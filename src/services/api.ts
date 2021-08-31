import axios, { AxiosInstance } from 'axios'
import config from '../bitcoin/HexaConfig'
const { RELAY, SIGNING_SERVER, REQUEST_TIMEOUT, SWAN_BASE_URL } = config
const URL = ''

const api = axios.create( {
  baseURL: URL,
} )

export const BH_AXIOS = axios.create( {
  baseURL: RELAY,
  timeout: REQUEST_TIMEOUT * 3,
} )

export const SIGNING_AXIOS: AxiosInstance = axios.create( {
  baseURL: SIGNING_SERVER,
  timeout: REQUEST_TIMEOUT,
} )

export function setApiHeaders( { appVersion, appBuildNumber } ) {
  axios.defaults.headers.common.appVersion = appVersion
  axios.defaults.headers.common.appBuildNumber = appBuildNumber
  BH_AXIOS.defaults.headers.common.appVersion = appVersion
  BH_AXIOS.defaults.headers.common.appBuildNumber = appBuildNumber
}

export const SWAN_AXIOS = axios.create( {
  baseURL: SWAN_BASE_URL,
  timeout: REQUEST_TIMEOUT
} )
