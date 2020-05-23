import axios, { AxiosInstance } from 'axios';
import config from '../bitcoin/Config';
const { RELAY, SIGNING_SERVER, REQUEST_TIMEOUT } = config;
const URL = '';

const api = axios.create({
    baseURL: URL,
});


export const BH_AXIOS = axios.create({
    baseURL: RELAY,
    timeout: REQUEST_TIMEOUT,
})



export const SIGNING_AXIOS: AxiosInstance = axios.create({
    baseURL: SIGNING_SERVER,
    timeout: REQUEST_TIMEOUT,
});

export const createService = (data) =>
    api.post('/customer', data);

export const sendEmailService = (data) =>
    api.post('/verify/email', data);

export const smsService = (data) =>
    api.post('/verify/sms', data);


export function setApiHeaders({ appVersion, appBuildNumber }) {
    axios.defaults.headers.common.appVersion = appVersion;
    axios.defaults.headers.common.appBuildNumber = appBuildNumber;
    BH_AXIOS.defaults.headers.common.appVersion = appVersion;
    BH_AXIOS.defaults.headers.common.appBuildNumber = appBuildNumber;
}


