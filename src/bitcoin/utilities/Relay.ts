import config from '../HexaConfig'
import { Gift, GiftMetaData, INotification, NewWalletImage } from './Interface'
import idx from 'idx'
import TrustedContactsOperations from './TrustedContactsOperations'
import RestClient from '../../services/rest/RestClient'

const { HEXA_ID, RELAY } = config
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
    let res: any
    try {
      res = await RestClient.post( `${RELAY}checkCompatibility`, {
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
    let res: any
    try {
      res = await RestClient.post( `${RELAY}fetchReleases`, {
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
      let res: any
      try {
        res = await RestClient.post( `${RELAY}updateFCMTokens`, {
          HEXA_ID,
          walletID,
          FCMs,
        } )
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      return res.data || res.json
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
    let res: any
    try {
      res = await RestClient.post( `${RELAY}fetchNotifications`, {
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

    const { notifications, DHInfos } = res.data || res.json
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
      let res: any

      if ( !receivers.length )
        throw new Error( 'Failed to deliver notification: receivers missing' )

      try {
        res = await RestClient.post( `${RELAY}sendNotifications`, {
          HEXA_ID,
          receivers,
          notification,
        } )
        console.log( 'sendNotifications', {
          res
        } )
      } catch ( err ) {
        // console.log({ err });
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { sent } = res.data || res.json
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

      if ( !txNote || !txNote.txId || !txNote.note )
        throw new Error( 'Failed to send donation note: txid|note missing' )

      const res: any = await RestClient.post( `${RELAY}addDonationTxNote`, {
        HEXA_ID,
        donationId,
        txNote,
      } )

      const { added } = res.data || res.json
      if ( !added ) throw new Error()

      return {
        added
      }
    } catch ( err ) {
      throw new Error( 'Failed to send donation note' )
    }
  };

  public static fetchFeeAndExchangeRates = async ( currencyCode ): Promise<{
    exchangeRates: any;
    averageTxFees: any;
  }> => {
    try {
      let res
      try {
        res = await RestClient.post( `${RELAY}fetchFeeAndExchangeRates`, {
          HEXA_ID,
          currencyCode
        } )
      } catch ( err ) {
        // console.log({ err });
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { exchangeRates, averageTxFees } = res.data || res.json

      return {
        exchangeRates, averageTxFees
      }
    } catch ( err ) {
      console.log( 'exrate', err )
      throw new Error( 'Failed fetch fee and exchange rates' )
    }
  };


  public static getCampaignGift = async (
    campaignId: string,
    walletID: string
  ) => {
    try {
      let res: any
      try {
        res = await RestClient.post( `${RELAY}claimCampaignGift`, {
          HEXA_ID,
          campaignId: campaignId,
          walletID,
        } )
        return res.data || res.json
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
    } catch ( err ) {
      throw new Error( err )
    }
  };

  public static sendKeeperNotifications = async (
    receivers: string[],
    notification: INotification,
  ) => {
    try {
      let res: any
      const obj = {
        HEXA_ID,
        receivers,
        notification,
      }
      try {
        res = await RestClient.post( `${RELAY}sendKeeperNotifications`, {
          HEXA_ID,
          receivers,
          notification,
        } )
        const { sent } = res.data || res.json
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


  public static getMessages = async (
    walletID: string,
    timeStamp: Date
  ): Promise<{
    messages:[];
  }> => {
    let res: any
    try {
      res = await RestClient.post( `${RELAY}getMessages`, {
        HEXA_ID,
        walletID,
        timeStamp
      } )
    } catch ( err ) {
      console.log( {
        err
      } )
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { messages } = res.data || res.json
    return {
      messages
    }
  };

  public static updateMessageStatus = async (
    walletID: string,
    data: []
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      let res: any
      try {
        res = await RestClient.post( `${RELAY}updateMessages`, {
          HEXA_ID,
          walletID,
          data,
        } )
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { updated } = res.data || res.json
      return {
        updated
      }
    } catch ( err ) {
      throw new Error( 'Failed to fetch GetBittr Details' )
    }
  }

  public static walletCheckIn = async (
    currencyCode?: any,
  ): Promise<{
    exchangeRates: { [currency: string]: number };
    averageTxFees: any;
  }> => {
    const res = await RestClient.post( `${RELAY}v2/walletCheckIn`, {
      HEXA_ID,
      ...currencyCode && {
        currencyCode
      },
    } )

    const {
      exchangeRates,
      averageTxFees,
    } = res.data || res.json

    return {
      exchangeRates,
      averageTxFees,
    }
  };

  public static updateWalletImage = async (
    walletImage: NewWalletImage,
  ): Promise<{

      status: number;
      data: {
        updated: boolean;
      };
      err?: undefined;
      message?: undefined;
    }  > => {
    try {
      const res: any = await RestClient.post( `${RELAY}v2/updateWalletImage`, {
        HEXA_ID,
        walletID: walletImage.walletId,
        walletImage,
      } )
      const { updated } = res.data || res.json
      return {
        status: res.status,
        data: updated
      }
    } catch ( err ) {
      throw new Error( 'Failed to update Wallet Image' )
    }
  };

  public static fetchWalletImage = async ( walletId: string ): Promise<{
    walletImage: NewWalletImage;
  }> => {
    try {
      let res: any
      try {
        res = await RestClient.post( `${RELAY}v2/fetchWalletImage`, {
          HEXA_ID,
          walletID: walletId,
        } )
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { walletImage } = res.data || res.Json
      return {
        walletImage
      }
    } catch ( err ) {
      throw new Error( 'Failed to fetch Wallet Image' )
    }
  };

  public static updateGiftChannel = async ( encryptionKey: string, gift: Gift, metaData: GiftMetaData, previousChannelAddress?: string ): Promise<{
    updated: boolean;
  }> => {
    try {
      if( !gift.channelAddress ) throw new Error( 'channel address missing' )
      const encryptedGift = TrustedContactsOperations.encryptViaPsuedoKey( JSON.stringify( gift ), encryptionKey )
      let res: any
      try {
        res = await RestClient.post( `${RELAY}updateGiftChannel`, {
          HEXA_ID,
          channelAddress: gift.channelAddress,
          encryptedGift,
          metaData,
          previousChannelAddress,
        } )
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { updated } = res.data || res.json
      return {
        updated,
      }
    } catch ( err ) {
      throw new Error( 'Failed to update gift channel' )
    }
  };

  public static fetchGiftChannel = async ( channelAddress: string, decryptionKey: string ): Promise<{
    gift: Gift,
    metaData: GiftMetaData;
  }> => {
    try {

      let res: any
      try {
        res = await RestClient.post( `${RELAY}fetchGiftChannel`, {
          HEXA_ID,
          channelAddress,
        } )
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { encryptedGift, metaData } = res.data || res.json

      let gift: Gift
      if( encryptedGift )
        gift = JSON.parse( TrustedContactsOperations.decryptViaPsuedoKey( encryptedGift, decryptionKey ) )

      return {
        gift,
        metaData
      }
    } catch ( err ) {
      throw new Error( 'Failed to fetch gift channel' )
    }
  };

  public static syncGiftChannelsMetaData = async (
    giftChannelsToSync: {
      [channelAddress: string]: {
        creator?: boolean,
        metaDataUpdates?: GiftMetaData,
    }
  } ): Promise<{
    synchedGiftChannels:  {
      [channelAddress: string]: {
        metaData: GiftMetaData
    }
  } }> => {
    try {
      let res: any
      try {
        res = await RestClient.post( `${RELAY}syncGiftChannelsMetaData`, {
          HEXA_ID,
          giftChannelsToSync,
        } )
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      const { synchedGiftChannels }: { synchedGiftChannels: {
        [channelAddress: string]: {
          metaData: GiftMetaData
      } }} = res.data || res.json

      return {
        synchedGiftChannels
      }
    } catch ( err ) {
      throw new Error( 'Failed to sync gift channels meta-data' )
    }
  };
}
