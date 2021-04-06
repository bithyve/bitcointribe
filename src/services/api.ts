import axios, { AxiosInstance } from 'axios';
import config from '../bitcoin/HexaConfig';
const { RELAY, SIGNING_SERVER, REQUEST_TIMEOUT } = config;
import { put, call, select } from 'redux-saga/effects'
import Tor from '../common/data/models/Tor'
import { doTorRequest } from '../utils/TorUtils'
const URL = '';

interface callReq {
  method: string;
  url: string;
  data?: any;
}

export const BH_AXIOS = (request: callReq) => {
    const activeTor: Tor = select( state => state.torSettings.activeTor )
    const { method, data } = request;
    const url = `${RELAY}/${request.url}`

    if (activeTor) {
      return doTorRequest(url, method, data)
    }

    return axios({
      url,
      method,
      data,
      timeout: REQUEST_TIMEOUT,
    })
};

export const SIGNING_AXIOS: AxiosInstance = axios.create({
    baseURL: SIGNING_SERVER,
    timeout: REQUEST_TIMEOUT,
});

export function setApiHeaders({ appVersion, appBuildNumber }) {
    axios.defaults.headers.common.appVersion = appVersion;
    axios.defaults.headers.common.appBuildNumber = appBuildNumber;
    BH_AXIOS.defaults.headers.common.appVersion = appVersion;
    BH_AXIOS.defaults.headers.common.appBuildNumber = appBuildNumber;
}


