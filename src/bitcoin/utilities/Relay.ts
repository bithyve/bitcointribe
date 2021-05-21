import { AxiosResponse } from 'axios'
import config from '../HexaConfig'
import { INotification, EncryptedImage } from './Interface'
import { BH_AXIOS } from '../../services/api'
import idx from 'idx'

const { HEXA_ID } = config
export default class Relay {
  public static checkCompatibility = async (
    method: string,
    version: string
  ): Promise<{
    compatible: boolean;
    alternatives: {
      update: boolean;
      message: string;
    };
  }> => {
    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'checkCompatibility', {
        HEXA_ID,
        method,
        version,
      } )
    } catch ( err ) {
      if ( err.response ) console.log( err.response.data.err )
      if ( err.code ) console.log( err.code )
    }
    const { compatible, alternatives } = res.data
    return {
      compatible, alternatives
    }
  };

  public static fetchReleases = async (
    build: string
  ): Promise<{
    releases: any[];
  }> => {
    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'fetchReleases', {
        HEXA_ID,
        build,
      } )
    } catch ( err ) {
      if ( err.response ) console.log( err.response.data.err )
      if ( err.code ) console.log( err.code )
    }
    const { releases = [] } = idx( res, ( _ ) => _.data ) || {
    }
    return {
      releases
    }
  };

  public static updateFCMTokens = async (
    walletID: string,
    FCMs: string[]
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      let res: AxiosResponse
      try {
        res = await BH_AXIOS.post( 'updateFCMTokens', {
          HEXA_ID,
          walletID,
          FCMs,
        } )
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { updated } = res.data
      return {
        updated
      }
    } catch ( err ) {
      throw new Error( 'Failed to fetch GetBittr Details' )
    }
  };

  public static fetchNotifications = async (
    walletID: string
  ): Promise<{
    notifications: INotification[];
    DHInfos: [{ address: string; publicKey: string }];
  }> => {
    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'fetchNotifications', {
        HEXA_ID,
        walletID,
      } )
    } catch ( err ) {
      console.log( {
        err
      } )
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { notifications, DHInfos } = res.data
    return {
      notifications, DHInfos
    }
  };

  public static sendNotifications = async (
    receivers: { walletId: string; FCMs?: string[] }[],
    notification: INotification
  ): Promise<{
    sent: boolean;
  }> => {
    try {
      let res: AxiosResponse

      if ( !receivers.length )
        throw new Error( 'Failed to deliver notification: receivers missing' )

      try {
        res = await BH_AXIOS.post( 'sendNotifications', {
          HEXA_ID,
          receivers,
          notification,
        } )
        // console.log({ res });
      } catch ( err ) {
        // console.log({ err });
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { sent } = res.data
      if ( !sent ) throw new Error()

      return {
        sent
      }
    } catch ( err ) {
      throw new Error( 'Failed to deliver notification' )
    }
  };

  public static fetchFeeAndExchangeRates = async ( currencyCode ): Promise<{
    exchangeRates: any;
    averageTxFees: any;
  }> => {
    try {
      let res: AxiosResponse
      try {
        res = await BH_AXIOS.post( 'fetchFeeAndExchangeRates', {
          HEXA_ID,
          currencyCode
        } )
      } catch ( err ) {
        // console.log({ err });
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { exchangeRates, averageTxFees } = res.data

      return {
        exchangeRates, averageTxFees
      }
    } catch ( err ) {
      throw new Error( 'Failed fetch fee and exchange rates' )
    }
  };

  public static sendKeeperNotifications = async (
    receivers: string[],
    notification: INotification,
  ) => {
    try {
      let res: AxiosResponse
      const obj = {
        HEXA_ID,
        receivers,
        notification,
      }
      try {
        res = await BH_AXIOS.post( 'sendKeeperNotifications', {
          HEXA_ID,
          receivers,
          notification,
        } )
        const { sent } = res.data
        if ( !sent ) throw new Error()
        return {
          sent
        }
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
    } catch ( err ) {
      throw new Error( 'Failed to deliver notification' )
    }
  };
}
