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
      res = await BH_AXIOS({
        method: 'post',
        url: 'checkCompatibility',
        data: {
          HEXA_ID,
          method,
          version,
        },
      })
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
      res = await BH_AXIOS({
        method: 'post',
        url: 'fetchReleases',
        data: {
          HEXA_ID,
          build,
        },
      })
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
        res = await BH_AXIOS({
          method: 'post',
          url: 'updateFCMTokens',
          data: {
            HEXA_ID,
            walletID,
            FCMs,
          },
        })
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
      res = await BH_AXIOS({
        method: 'post',
        url: 'fetchNotifications',
        data: {
          HEXA_ID,
          walletID,
        },
      })
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
        res = await BH_AXIOS({
          method: 'post',
          url: 'sendNotifications',
          data: {
            HEXA_ID,
            receivers,
            notification,
          },
        })
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

  public static sendDonationNote = async (
    donationId: string,
    txNote: { txId: string; note: string }
  ): Promise<{
    added: boolean;
  }> => {
    try {
      let res: AxiosResponse

      if ( !txNote || !txNote.txId || !txNote.note )
        throw new Error( 'Failed to send donation note: txid|note missing' )

      try {
        res = await BH_AXIOS({
          method: 'post',
          url: 'addDonationTxNote',
          data: {
            HEXA_ID,
            donationId,
            txNote,
          },
        })
        // console.log({ res });
      } catch ( err ) {
        // console.log({ err });
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { added } = res.data
      if ( !added ) throw new Error()

      return {
        added
      }
    } catch ( err ) {
      throw new Error( 'Failed to deliver donation note' )
    }
  };

  public static fetchFeeAndExchangeRates = async (): Promise<{
    exchangeRates: any;
    averageTxFees: any;
  }> => {
    try {
      let res: AxiosResponse
      try {
        res = await BH_AXIOS({
          method: 'post',
          url: 'fetchFeeAndExchangeRates',
          data: {
            HEXA_ID,
          },
        })
        // console.log({ res });
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
}
