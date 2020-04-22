import axios, { AxiosInstance, AxiosResponse } from 'axios';
import config from '../Config';

const { RELAY, HEXA_ID, REQUEST_TIMEOUT } = config;
const BH_AXIOS: AxiosInstance = axios.create({
  baseURL: RELAY,
  timeout: REQUEST_TIMEOUT,
});

export default class Relay {
  constructor() {}

  public static fetchReleaseNotes = async (
    build: string,
  ): Promise<{
    releaseNotes: { ios: String; android: String };
    mandatory: String;
  }> => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post('fetchReleaseNotes', {
        HEXA_ID,
        build,
      });
    } catch (err) {
      if (err.response) console.log(err.response.data.err);
      if (err.code) console.log(err.code);
    }
    console.log({ res });
    const { releaseNotes, mandatory } = res.data;
    return { releaseNotes, mandatory };
  };
}
