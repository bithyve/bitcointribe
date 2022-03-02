import AsyncStorage from '@react-native-async-storage/async-storage'
import { DeepLinkEncryptionType, ShortLinkDomain, DeepLinkKind, LevelHealthInterface, LevelInfo, NewWalletImage, QRCodeTypes, ShortLinkImage, ShortLinkTitle, ShortLinkDescription, Trusted_Contacts, Accounts, TrustedContactRelationTypes } from '../../bitcoin/utilities/Interface'
import { encrypt } from '../encryption'
import DeviceInfo from 'react-native-device-info'
import config from '../../bitcoin/HexaConfig'
import { Alert, Linking } from 'react-native'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import Toast from '../../components/Toast'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import crypto from 'crypto'
import { getVersions } from '../utilities'
import dynamicLinks from '@react-native-firebase/dynamic-links'

export const nameToInitials = fullName => {
  if( !fullName ) return
  const namesArray = fullName.split( ' ' )
  if ( namesArray.length === 1 ) return `${namesArray[ 0 ].charAt( 0 )}`
  else
    return `${namesArray[ 0 ].charAt( 0 )}${namesArray[ namesArray.length - 1 ].charAt( 0 )}`
}

export const getCurrencyImageName = ( currencyCodeValue ) => {
  switch ( currencyCodeValue ) {
      case 'BRL':
        return 'currency-brl'
      case 'CNY':
      case 'JPY':
        return 'currency-cny'
      case 'GBP':
        return 'currency-gbp'
      case 'KRW':
        return 'currency-krw'
      case 'RUB':
        return 'currency-rub'
      case 'TRY':
        return 'currency-try'
      case 'INR':
        return 'currency-inr'
      case 'EUR':
        return 'currency-eur'
      default:
        break
  }
}

export const isEmpty = ( obj ) => {
  return Object.keys( obj ).every( ( k ) => !Object.keys( obj[ k ] ).length )
}
export const  buildVersionExists = ( versionData ) =>{
  return (
    ( versionData.filter( version => version.buildNumber == DeviceInfo.getBuildNumber() ).length > 0 )
    &&
    ( versionData.filter( version => version.version == DeviceInfo.getVersion() ).length > 0 )
  )
}

export const APP_LIST = {
  'WhatsApp': {
    pkgName: 'com.whatsapp', urlScheme: 'whatsapp', urlParams: 'app'
  }, // fa
  'Telegram': {
    pkgName: 'org.telegram.messenger', urlScheme: 't.me', urlParams: 'share/url?url='
  }, // fa
  'Messenger': {
    pkgName: 'com.facebook.orca', urlScheme: 'fb-messenger', urlParams: 'user-thread/{user-id}'
  }, // fa: facebook
}
export const getFormattedString = ( qrString: string ) => {
  qrString = qrString.split( '"' ).join( 'Dquote' )
  qrString = qrString.split( ':' ).join( 'Qutation' )
  qrString = qrString.split( '{' ).join( 'Lbrace' )
  qrString = qrString.split( '}' ).join( 'Rbrace' )
  qrString = qrString.split( '/' ).join( 'Slash' )
  qrString = qrString.split( ',' ).join( 'Comma' )
  qrString = qrString.split( '\'' ).join( 'Squote' )
  qrString = qrString.split( ' ' ).join( 'Space' )
  return qrString
}

export const generateRandomString = ( length: number ): string => {
  let randomString = ''
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for ( let itr = 0; itr < length; itr++ ) {
    randomString += possibleChars.charAt(
      Math.floor( Math.random() * possibleChars.length ),
    )
  }
  return randomString
}

const asyncDataToBackup = async () => {
  const [
    [ , personalCopyDetails ],
    [ , FBTCAccount ],
    [ , PersonalNode ]
  ] = await AsyncStorage.multiGet( [
    'personalCopyDetails',
    'FBTCAccount',
    'PersonalNode'
  ] )
  const ASYNC_DATA = {
  }

  if ( personalCopyDetails )
    ASYNC_DATA[ 'personalCopyDetails' ] = personalCopyDetails
  if ( FBTCAccount ) ASYNC_DATA[ 'FBTCAccount' ] = FBTCAccount
  if ( PersonalNode ) ASYNC_DATA[ 'PersonalNode' ] = PersonalNode

  return ASYNC_DATA
}

export const stateDataToBackup = ( accountShells, activePersonalNode, versionHistory, restoreVersions ) => {
  const versions = getVersions( versionHistory, restoreVersions )

  const STATE_DATA = {
  }

  if ( accountShells && accountShells.length )
    STATE_DATA[ 'accountShells' ] = JSON.stringify( accountShells )

  // if ( trustedContactsInfo && trustedContactsInfo.length )
  //   STATE_DATA[ 'trustedContactsInfo' ] = JSON.stringify( trustedContactsInfo )

  if ( activePersonalNode )
    STATE_DATA[ 'activePersonalNode' ] = JSON.stringify( activePersonalNode )

  if ( versions && versions.length )
    STATE_DATA[ 'versionHistory' ] = JSON.stringify( versions )

  return STATE_DATA
}

export const CloudData = async ( database, accountShells, activePersonalNode, versionHistory, trustedContactsInfo ) => {
  let encryptedCloudDataJson
  const walletImage = {
    SERVICES: {
    },
    DECENTRALIZED_BACKUP: {
    },
    ASYNC_DATA: {
    },
    WALLET_SETUP: {
    },
    STATE_DATA: {
    },
  }
  // console.log("DATABASE", database);
  let CloudDataJson = {
  }
  if ( database && database.SERVICES ) {
    if ( database.SERVICES )
      walletImage.SERVICES = database.SERVICES
    if ( database.DECENTRALIZED_BACKUP )
      walletImage.DECENTRALIZED_BACKUP = database.DECENTRALIZED_BACKUP
    if ( database.WALLET_SETUP )
      walletImage.WALLET_SETUP = database.WALLET_SETUP
    walletImage.ASYNC_DATA = await asyncDataToBackup()
    walletImage.STATE_DATA = stateDataToBackup( accountShells, activePersonalNode, versionHistory, trustedContactsInfo )
    // this has to be updated to keep the correct answer
    const key = 'answer'
    CloudDataJson = {
      walletImage,
      keeperInfo: [],
    }
    // console.log("walletImage", walletImage);
    encryptedCloudDataJson = await encrypt( CloudDataJson, key )
    // console.log('encryptedDatabase', encryptedCloudDataJson);
    return encryptedCloudDataJson
  }
}

export const WIEncryption = async ( accounts: Accounts, encKey, contacts: Trusted_Contacts, walletDB, answer, accountShells,
  activePersonalNode,
  versionHistory,
  restoreVersions, ) => {
  const acc = {
  }

  Object.values( accounts ).forEach( account => {
    const cipher = crypto.createCipheriv(
      BHROperations.cipherSpec.algorithm,
      encKey,
      BHROperations.cipherSpec.iv,
    )
    let encrypted = cipher.update(
      JSON.stringify( account ),
      'utf8',
      'hex',
    )
    encrypted += cipher.final( 'hex' )
    acc[ account.id ] = {
      encryptedData: encrypted
    }
  } )
  const STATE_DATA = stateDataToBackup( accountShells, activePersonalNode, versionHistory, restoreVersions )
  const image : NewWalletImage = {
    name: walletDB.walletName,
    walletId : walletDB.walletId,
    accounts : acc,
    versionHistory: STATE_DATA.versionHistory,
    SM_share: walletDB.smShare,
    details2FA: walletDB.details2FA,
  }
  const channelIds = []
  Object.values( contacts ).forEach( contact => {
    channelIds.push( contact.channelKey )
  } )
  if( channelIds.length > 0 ) {
    const cipher = crypto.createCipheriv(
      BHROperations.cipherSpec.algorithm,
      encKey,
      BHROperations.cipherSpec.iv,
    )
    let encrypted = cipher.update(
      JSON.stringify( channelIds ),
      'utf8',
      'hex',
    )
    encrypted += cipher.final( 'hex' )
    image.contacts = encrypted
  }
  const key = BHROperations.strechKey( answer )
  return await encrypt( image, key )
}

export const getCurrencyImageByRegion = (
  currencyCode: string,
  type: 'light' | 'dark' | 'gray' | 'light_blue',
) => {
  const dollarCurrency = [ 'USD', 'AUD', 'BBD', 'BSD', 'BZD', 'BMD', 'BND', 'KHR', 'CAD', 'KYD', 'XCD', 'FJD', 'GYD', 'HKD', 'JMD', 'LRD', 'NAD', 'NZD', 'SGD', 'SBD', 'SRD', 'TWD', 'USH', 'TTD', 'TVD', 'ZWD', 'MXN', 'COP', 'CLP', 'UYU', 'DOP', 'ARS' ]
  // These currencies also use the $ symbol although the currency is Peso 'MXN', 'COP', 'CLP', 'UYU', 'DOP', 'ARS'

  const poundCurrency = [ 'EGP', 'FKP', 'GIP', 'GGP', 'IMP', 'JEP', 'SHP', 'SYP', 'GBP' ]

  if ( dollarCurrency.includes( currencyCode ) ) {
    if ( type == 'light' ) {
      return require( '../../assets/images/currencySymbols/icon_dollar_white.png' )
    } else if ( type == 'dark' ) {
      return require( '../../assets/images/currencySymbols/icon_dollar_dark.png' )
    } else if ( type == 'gray' ) {
      return require( '../../assets/images/currencySymbols/dollar_grey.png' )
    } else if ( type == 'light_blue' ) {
      return require( '../../assets/images/currencySymbols/icon_dollar_lightblue.png' )
    }
    return require( '../../assets/images/currencySymbols/icon_dollar_light.png' )
  }

  if ( poundCurrency.includes( currencyCode ) ) {
    if ( type == 'light' ) {
      return require( '../../assets/images/currencySymbols/icon_pound_white.png' )
    } else if ( type == 'dark' ) {
      return require( '../../assets/images/currencySymbols/icon_pound_dark.png' )
    } else if ( type == 'gray' ) {
      return require( '../../assets/images/currencySymbols/icon_pound_gray.png' )
    } else if ( type == 'light_blue' ) {
      return require( '../../assets/images/currencySymbols/icon_pound_lightblue.png' )
    }
    return require( '../../assets/images/currencySymbols/icon_pound_white.png' )
  }

  if ( currencyCode == 'DKK' || currencyCode == 'ISK' || currencyCode == 'SEK' ) {
    if ( type == 'light' ) {
      return require( '../../assets/images/currencySymbols/icon_kr_white.png' )
    } else if ( type == 'dark' ) {
      return require( '../../assets/images/currencySymbols/icon_kr_dark.png' )
    } else if ( type == 'gray' ) {
      return require( '../../assets/images/currencySymbols/icon_kr_gray.png' )
    } else if ( type == 'light_blue' ) {
      return require( '../../assets/images/currencySymbols/icon_kr_lightblue.png' )
    }
    return require( '../../assets/images/currencySymbols/icon_kr_gray.png' )
  }

  if ( currencyCode == 'PLN' ) {
    if ( type == 'light' ) {
      return require( '../../assets/images/currencySymbols/icon_pln_white.png' )
    } else if ( type == 'dark' ) {
      return require( '../../assets/images/currencySymbols/icon_pln_dark.png' )
    } else if ( type == 'gray' ) {
      return require( '../../assets/images/currencySymbols/icon_pln_gray.png' )
    } else if ( type == 'light_blue' ) {
      return require( '../../assets/images/currencySymbols/icon_pln_lightblue.png' )
    }
    return require( '../../assets/images/currencySymbols/icon_pln_gray.png' )
  }

  if ( currencyCode == 'THB' ) {
    if ( type == 'light' ) {
      return require( '../../assets/images/currencySymbols/icon_thb_white.png' )
    } else if ( type == 'dark' ) {
      return require( '../../assets/images/currencySymbols/icon_thb_dark.png' )
    } else if ( type == 'gray' ) {
      return require( '../../assets/images/currencySymbols/icon_thb_gray.png' )
    } else if ( type == 'light_blue' ) {
      return require( '../../assets/images/currencySymbols/icon_thb_lightblue.png' )
    }
    return require( '../../assets/images/currencySymbols/icon_thb_gray.png' )
  }

  if ( currencyCode == 'CHF' ) {
    if ( type == 'light' ) {
      return require( '../../assets/images/currencySymbols/icon_chf_white.png' )
    } else if ( type == 'dark' ) {
      return require( '../../assets/images/currencySymbols/icon_chf_dark.png' )
    } else if ( type == 'gray' ) {
      return require( '../../assets/images/currencySymbols/icon_chf_gray.png' )
    } else if ( type == 'light_blue' ) {
      return require( '../../assets/images/currencySymbols/icon_chf_lightblue.png' )
    }
    return require( '../../assets/images/currencySymbols/icon_chf_gray.png' )
  }
}

export const getLevelInfo = ( levelHealthVar: LevelHealthInterface[], currentLevel: number ) : LevelInfo[] =>{
  if ( levelHealthVar[ currentLevel ] ) {
    if( levelHealthVar[ 1 ] ){
      for ( let i = 0; i < levelHealthVar[ currentLevel ].levelInfo.length; i++ ) {
        if ( levelHealthVar[ currentLevel ].levelInfo[ i ].updatedAt !== 0 && levelHealthVar[ currentLevel ].levelInfo[ i ].shareType !== 'securityQuestion' ) {
          return levelHealthVar[ currentLevel ].levelInfo
        }
      }
    }
    else return levelHealthVar[ 0 ].levelInfo
  }
  return levelHealthVar[ currentLevel - 1 ].levelInfo
}

export const getDeepLinkKindFromContactsRelationType = ( contactRelationType: TrustedContactRelationTypes ) => {
  let deepLinkKind: DeepLinkKind
  switch( contactRelationType ){
      case TrustedContactRelationTypes.CONTACT:
        deepLinkKind = DeepLinkKind.CONTACT
        break

      case TrustedContactRelationTypes.KEEPER:
        deepLinkKind = DeepLinkKind.KEEPER
        break

      case TrustedContactRelationTypes.PRIMARY_KEEPER:
        deepLinkKind = DeepLinkKind.PRIMARY_KEEPER
        break

      case TrustedContactRelationTypes.KEEPER_WARD:
        deepLinkKind = DeepLinkKind.RECIPROCAL_KEEPER
        break

      case TrustedContactRelationTypes.EXISTING_CONTACT:
        deepLinkKind = DeepLinkKind.EXISTING_CONTACT
  }

  return deepLinkKind
}

const getLinkImage = ( linkType: DeepLinkKind ) => {
  if( linkType === DeepLinkKind.GIFT ) {
    return ShortLinkImage.GIFT
  } else if( linkType === DeepLinkKind.CONTACT
   || linkType === DeepLinkKind.KEEPER || linkType === DeepLinkKind.EXISTING_CONTACT
   || linkType === DeepLinkKind.PRIMARY_KEEPER || linkType === DeepLinkKind.RECIPROCAL_KEEPER ) {
    return ShortLinkImage.FF
  } else {
    return ''
  }
}

const getLinkTitle = ( linkType: DeepLinkKind ) => {
  if( linkType === DeepLinkKind.GIFT ) {
    return ShortLinkTitle.GIFT
  } else if( linkType === DeepLinkKind.CONTACT
   || linkType === DeepLinkKind.KEEPER || linkType === DeepLinkKind.EXISTING_CONTACT
   || linkType === DeepLinkKind.PRIMARY_KEEPER || linkType === DeepLinkKind.RECIPROCAL_KEEPER ) {
    return ShortLinkTitle.FF
  } else {
    return ''
  }
}

const getLinkDescription = ( linkType: DeepLinkKind ) => {
  if( linkType === DeepLinkKind.GIFT ) {
    return ShortLinkDescription.GIFT
  } else if( linkType === DeepLinkKind.CONTACT ) {
    return ShortLinkDescription.FF
  } else if( linkType === DeepLinkKind.KEEPER || linkType === DeepLinkKind.EXISTING_CONTACT
    || linkType === DeepLinkKind.PRIMARY_KEEPER || linkType === DeepLinkKind.RECIPROCAL_KEEPER ){
    return ShortLinkDescription.KEEPER
  }else {
    return ''
  }
}

export const generateDeepLink = async( { deepLinkKind, encryptionType, encryptionKey, walletName, keysToEncrypt, generateShortLink, extraData, currentLevel }:{ deepLinkKind: DeepLinkKind, encryptionType: DeepLinkEncryptionType, encryptionKey: string, walletName: string, keysToEncrypt: string, generateShortLink?: boolean, extraData?: any, currentLevel?: number } ) => {

  let encryptedChannelKeys: string
  let encryptionHint: string
  switch ( encryptionType ) {
      case DeepLinkEncryptionType.DEFAULT:
        encryptionHint = ''
        encryptedChannelKeys = keysToEncrypt
        break

      case DeepLinkEncryptionType.NUMBER:
      case DeepLinkEncryptionType.EMAIL:
      case DeepLinkEncryptionType.OTP:
      case DeepLinkEncryptionType.LONG_OTP:
        encryptionHint = encryptionKey[ 0 ] + encryptionKey.slice( encryptionKey.length - 2 )
        encryptedChannelKeys = TrustedContactsOperations.encryptViaPsuedoKey(
          keysToEncrypt,
          encryptionKey
        )
        break

      case DeepLinkEncryptionType.SECRET_PHRASE:
        encryptionHint = `${Buffer.from( extraData.giftHint ).toString( 'hex' )}`
        encryptedChannelKeys = TrustedContactsOperations.encryptViaPsuedoKey(
          keysToEncrypt,
          encryptionKey
        )
        break
  }

  const appType = config.APP_STAGE
  const appVersion = DeviceInfo.getVersion()
  let deepLink: string
  if( extraData?.note ) {
    //extraData.note=  extraData.note.replace( / /g, '%20' )
    extraData.note=`${Buffer.from( extraData.note ).toString( 'hex' )}`
  }

  if( deepLinkKind === DeepLinkKind.GIFT || deepLinkKind === DeepLinkKind.CONTACT_GIFT ){
    deepLink =
    `https://hexawallet.io/${appType}/${deepLinkKind}/${walletName}/${encryptedChannelKeys}/${encryptionType}-${encryptionHint}/${extraData.channelAddress}/${extraData.amount}/${extraData.note}/${extraData.themeId}/v${appVersion}`
  } else {
    deepLink =
    `https://hexawallet.io/${appType}/${deepLinkKind}/${walletName}/${encryptedChannelKeys}/${encryptionType}-${encryptionHint}/v${appVersion}${currentLevel != undefined ? '/'+ currentLevel: ''}`
  }

  let shortLink = ''
  if( generateShortLink ) {
    try {
      const url = deepLink.replace( /\s+/g, '' )
      let domain = ''
      if( deepLinkKind === DeepLinkKind.CONTACT ) {
        domain = ShortLinkDomain.CONTACT
      } else if( deepLinkKind === DeepLinkKind.GIFT ||  deepLinkKind === DeepLinkKind.CONTACT_GIFT ) {
        domain = ShortLinkDomain.GIFT
      } else if( deepLinkKind === DeepLinkKind.KEEPER || deepLinkKind === DeepLinkKind.PRIMARY_KEEPER || deepLinkKind === DeepLinkKind.RECIPROCAL_KEEPER ) {
        domain = ShortLinkDomain.CONTACT
      } else {
        domain = ShortLinkDomain.DEFAULT
      }
      shortLink = await dynamicLinks().buildShortLink( {
        link: url,
        domainUriPrefix: domain,
        android: {
          packageName: DeviceInfo.getBundleId(),
          fallbackUrl: url,
        },
        ios: {
          fallbackUrl: url,
          bundleId: DeviceInfo.getBundleId()
        },
        navigation: {
          forcedRedirectEnabled:  false
        },
        social: {
          descriptionText: getLinkDescription( deepLinkKind ),
          title: getLinkTitle( deepLinkKind ),
          imageUrl: getLinkImage( deepLinkKind ),
        }
      }, dynamicLinks.ShortLinkType.UNGUESSABLE )
    } catch ( error ) {
      console.log( error )
      shortLink = ''
    }
  }

  return {
    deepLink, encryptedChannelKeys, encryptionType, encryptionHint, shortLink: shortLink? shortLink.replace( /\s+/g, '' ): ''
  }
}

export const processDeepLink = ( deepLink: string ) => {
  try {
    const splits = deepLink.split( '/' )
    // swan link(external)
    if ( splits.includes( 'swan' ) )
      return {
        swanRequest: {
          deepLink
        }
      }

    if ( splits.includes( 'wyre' ) ) {
      if( splits.includes( 'failed' ) ) {
        Alert.alert( 'Wyre purchase failed', 'Please try again after sometime.' )
      }
      return
    }

    // hexa links GiftQR
    // if ( splits[ 3 ] !== config.APP_STAGE ){
    //   Alert.alert(
    //     'Invalid deeplink',
    //     `Following deeplink could not be processed by Hexa:${config.APP_STAGE.toUpperCase()}, use Hexa:${
    //       splits[ 3 ].toUpperCase()
    //     }`,
    //   )
    //   return
    // }

    if( splits[ 4 ] === DeepLinkKind.CAMPAIGN ){
      return{
        campaignId:  splits[ 5 ]
      }
    }
    const version = splits.pop().slice( 1 )
    const encryptionMetaSplits = splits[ 7 ].split( '-' )
    const encryptionType = encryptionMetaSplits[ 0 ] as DeepLinkEncryptionType
    const encryptionHint = encryptionMetaSplits[ 1 ]
    switch( splits[ 4 ] as DeepLinkKind ){
        case DeepLinkKind.CONTACT:
        case DeepLinkKind.KEEPER:
        case DeepLinkKind.PRIMARY_KEEPER:
        case DeepLinkKind.RECIPROCAL_KEEPER:
        case DeepLinkKind.EXISTING_CONTACT:
          const trustedContactRequest = {
            walletName: splits[ 5 ],
            encryptedChannelKeys: splits[ 6 ],
            encryptionType,
            encryptionHint,
            isKeeper: [ DeepLinkKind.KEEPER, DeepLinkKind.RECIPROCAL_KEEPER, DeepLinkKind.PRIMARY_KEEPER, DeepLinkKind.EXISTING_CONTACT ].includes( ( splits[ 4 ] as DeepLinkKind ) ), // only used as a flag for the UI(not to be passed to initTC during approval)
            isPrimaryKeeper: DeepLinkKind.PRIMARY_KEEPER === splits[ 4 ],
            isExistingContact: [ DeepLinkKind.RECIPROCAL_KEEPER, DeepLinkKind.EXISTING_CONTACT ].includes( ( splits[ 4 ] as DeepLinkKind ) ),
            isQR: false,
            deepLinkKind: splits[ 4 ],
            version,
          }
          return {
            trustedContactRequest
          }

        case DeepLinkKind.GIFT:
          const giftRequest = {
            walletName: splits[ 5 ],
            encryptedChannelKeys: splits[ 6 ],
            encryptionType,
            encryptionHint,
            isQR: false,
            deepLinkKind: splits[ 4 ],
            channelAddress: splits[ 8 ],
            amount: splits[ 9 ],
            note: splits[ 10 ],
            themeId: splits[ 11 ],
            version,
          }
          return {
            giftRequest
          }

        case DeepLinkKind.CONTACT_GIFT:
          const trustedContactGiftRequest = {
            walletName: splits[ 5 ],
            encryptedChannelKeys: splits[ 6 ],
            encryptionType,
            encryptionHint,
            isKeeper: [ DeepLinkKind.KEEPER, DeepLinkKind.RECIPROCAL_KEEPER, DeepLinkKind.PRIMARY_KEEPER, DeepLinkKind.EXISTING_CONTACT ].includes( ( splits[ 4 ] as DeepLinkKind ) ), // only used as a flag for the UI(not to be passed to initTC during approval)
            isPrimaryKeeper: DeepLinkKind.PRIMARY_KEEPER === splits[ 4 ],
            isExistingContact: [ DeepLinkKind.RECIPROCAL_KEEPER, DeepLinkKind.EXISTING_CONTACT ].includes( ( splits[ 4 ] as DeepLinkKind ) ),
            isContactGift: true,
            isQR: false,
            deepLinkKind: splits[ 4 ],
            channelAddress: splits[ 8 ],
            amount: splits[ 9 ],
            note: splits[ 10 ],
            themeId: splits[ 11 ],
            version,
          }
          return {
            trustedContactRequest: trustedContactGiftRequest
          }

        default:
          throw new Error() // no mechanism to process an otherwise valid link
    }
  }
  catch ( error ) {
    Linking.openURL( deepLink )
      .then( ( ) => {
        // console.log('WhatsApp Opened');
      } )
      .catch( () => {
        //
      } )
    return

  }
}

const isUrl = string => {
  try { return Boolean( new URL( string ) ) }
  catch( e ){ return false }
}

const isJson = ( str ) => {
  try {
    JSON.parse( str )
  } catch ( e ) {
    return false
  }
  return true
}

export const processRequestQR =async ( qrData: string ) => {
  if( isJson( qrData ) ) {
    const parsedData = JSON.parse( qrData )
    let trustedContactRequest, giftRequest
    switch ( parsedData.type ) {
        case QRCodeTypes.CONTACT_REQUEST:
        case QRCodeTypes.PRIMARY_KEEPER_REQUEST:
        case QRCodeTypes.KEEPER_REQUEST:
          trustedContactRequest = {
            walletName: parsedData.walletName,
            encryptedChannelKeys: parsedData.encryptedChannelKeys,
            encryptionType: parsedData.encryptionType,
            encryptionHint: parsedData.encryptionHint,
            isKeeper: parsedData.type === QRCodeTypes.KEEPER_REQUEST || parsedData.type === QRCodeTypes.PRIMARY_KEEPER_REQUEST, // only used as a flag for the UI(not to be passed to initTC during approval)
            isPrimaryKeeper: parsedData.type === QRCodeTypes.PRIMARY_KEEPER_REQUEST,
            isExistingContact: false,
            isQR: true,
            version: parsedData.version,
            type: parsedData.type,
            isCurrentLevel0: parsedData.currentLevel == 0 ? true : false
          }
          break

        case QRCodeTypes.EXISTING_CONTACT:
          trustedContactRequest = {
            walletName: parsedData.walletName,
            channelKey: parsedData.channelKey,
            contactsSecondaryChannelKey: parsedData.secondaryChannelKey,
            isKeeper: true,
            isQR: true,
            version: parsedData.version,
            type: parsedData.type,
            isExistingContact: true,
            isCurrentLevel0: parsedData.currentLevel == 0 ? true : false
          }
          break

        case QRCodeTypes.APPROVE_KEEPER:
          trustedContactRequest = {
            walletName: parsedData.walletName,
            channelKey: parsedData.channelKey,
            contactsSecondaryChannelKey: parsedData.secondaryChannelKey,
            isKeeper: false,
            isQR: true,
            version: parsedData.version,
            type: parsedData.type,
            isExistingContact: false,
            isCurrentLevel0: parsedData.currentLevel == 0 ? true : false
          }
          break

        case QRCodeTypes.GIFT:
          giftRequest = {
            walletName: parsedData.walletName,
            encryptedChannelKeys: parsedData.encryptedChannelKeys,
            encryptionType: parsedData.encryptionType,
            encryptionHint: parsedData.encryptionHint,
            channelAddress: parsedData.channelAddress,
            amount: parsedData.amount,
            note: parsedData.note,
            themeId: parsedData.themeId,
            version: parsedData.version,
            type: parsedData.type,
            isQR: true,
          }
          break

        case QRCodeTypes.CONTACT_GIFT:
          trustedContactRequest = {
            walletName: parsedData.walletName,
            encryptedChannelKeys: parsedData.encryptedChannelKeys,
            encryptionType: parsedData.encryptionType,
            encryptionHint: parsedData.encryptionHint,
            isKeeper: parsedData.type === QRCodeTypes.KEEPER_REQUEST || parsedData.type === QRCodeTypes.PRIMARY_KEEPER_REQUEST, // only used as a flag for the UI(not to be passed to initTC during approval)
            isPrimaryKeeper: parsedData.type === QRCodeTypes.PRIMARY_KEEPER_REQUEST,
            isContactGift: true,
            channelAddress: parsedData.channelAddress,
            amount: parsedData.amount,
            note: parsedData.note,
            themeId: parsedData.themeId,
            isExistingContact: false,
            isQR: true,
            version: parsedData.version,
            type: parsedData.type,
          }
          break

        default:
          throw new Error() // no mechanism to process an otherwise valid link
    }
    return {
      trustedContactRequest, giftRequest
    }
  } else {
    if( isUrl( qrData ) ) {
      try {
        const { url } = await dynamicLinks().resolveLink( qrData )
        if( url ) {
          return processDeepLink( url )
        } else {
          return processDeepLink( qrData )
        }
      } catch ( error ) {
        return processDeepLink( qrData )
      }
    } else {
      Alert.alert( 'Invalid/Incompatible QR, updating your app might help' )
      return {
      }
    }
  }

}
