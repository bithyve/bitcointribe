import AsyncStorage from '@react-native-async-storage/async-storage'
import { DeepLinkEncryptionType, DeepLinkKind, LevelHealthInterface, LevelInfo, NewWalletImage, QRCodeTypes, TrustedContact, TrustedContactRelationTypes } from '../../bitcoin/utilities/Interface'
import { encrypt } from '../encryption'
import DeviceInfo from 'react-native-device-info'
import config from '../../bitcoin/HexaConfig'
import { Alert } from 'react-native'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import Toast from '../../components/Toast'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import crypto from 'crypto'
import { getVersions } from '../utilities'

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

export const WIEncryption = async ( accounts, encKey, contacts, walletDB, answer, accountShells,
  activePersonalNode,
  versionHistory,
  restoreVersions, ) => {
  const acc = {
  }
  accounts.forEach( account => {
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
  contacts.forEach( contact => {
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

export const generateDeepLink = ( encryptionType: DeepLinkEncryptionType, encryptionKey: string, correspondingTrustedContact: TrustedContact, walletName: string ) => {
  const keysToEncrypt = correspondingTrustedContact.channelKey + '-' + ( correspondingTrustedContact.secondaryChannelKey ? correspondingTrustedContact.secondaryChannelKey : '' )
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
        encryptionHint = encryptionKey[ 0 ] + encryptionKey.slice( encryptionKey.length - 2 )
        encryptedChannelKeys = TrustedContactsOperations.encryptViaPsuedoKey(
          keysToEncrypt,
          encryptionKey
        )
        break
  }

  let deepLinkKind: DeepLinkKind
  switch( correspondingTrustedContact.relationType ){
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

  const appType = config.APP_STAGE
  const appVersion = DeviceInfo.getVersion()

  const deepLink =
      `https://hexawallet.io
      /${appType}
      /${deepLinkKind}` +
      `/${walletName}` +
      `/${encryptedChannelKeys}` +
      `/${encryptionType}-${encryptionHint}` +
      `/v${appVersion}`

  return {
    deepLink, encryptedChannelKeys, encryptionType, encryptionHint
  }
}

export const processDeepLink = async ( deepLink: string ) =>{
  try {
    const splits = deepLink.split( '/' )
    if ( [ DeepLinkKind.CONTACT, DeepLinkKind.KEEPER, DeepLinkKind.PRIMARY_KEEPER, DeepLinkKind.RECIPROCAL_KEEPER, DeepLinkKind.EXISTING_CONTACT ].includes( ( splits[ 4 ] as DeepLinkKind ) ) ) {
      if ( splits[ 3 ] !== config.APP_STAGE ) {
        Alert.alert(
          'Invalid deeplink',
          `Following deeplink could not be processed by Hexa:${config.APP_STAGE.toUpperCase()}, use Hexa:${
            splits[ 3 ]
          }`,
        )
      } else {
        const version = splits.pop().slice( 1 )
        const encryptionMetaSplits = splits[ 7 ].split( '-' )
        const encryptionType = encryptionMetaSplits[ 0 ] as DeepLinkEncryptionType
        const encryptionHint = encryptionMetaSplits[ 1 ]

        const trustedContactRequest = {
          walletName: splits[ 5 ],
          encryptedChannelKeys: splits[ 6 ],
          encryptionType,
          encryptionHint,
          isKeeper: [ DeepLinkKind.KEEPER, DeepLinkKind.RECIPROCAL_KEEPER, DeepLinkKind.PRIMARY_KEEPER, DeepLinkKind.EXISTING_CONTACT ].includes( ( splits[ 4 ] as DeepLinkKind ) ), // only used as a flag for the UI(not to be passed to initTC during approval)
          isPrimaryKeeper: DeepLinkKind.PRIMARY_KEEPER === splits[ 4 ],
          isExistingContact: [ DeepLinkKind.RECIPROCAL_KEEPER, DeepLinkKind.EXISTING_CONTACT ].includes( ( splits[ 4 ] as DeepLinkKind ) ),
          isQR: false,
          version,
        }
        return {
          trustedContactRequest
        }
      }
    } else if ( splits.includes( 'swan' ) )
      return {
        swanRequest: {
          deepLink
        }
      }
  }
  catch ( error ) {
    Alert.alert( 'Invalid/Incompatible link, updating your app might help' )
  }
}

export const processFriendsAndFamilyQR = ( qrData: string ) => {
  try {
    const scannedData = JSON.parse( qrData )
    // disabled check version compatibility
    // if ( scannedData.version ) {
    //   const isAppVersionCompatible = await checkAppVersionCompatibility( {
    //     relayCheckMethod: scannedData.type,
    //     version: scannedData.ver,
    //   } )

    //   if ( !isAppVersionCompatible ) {
    //     return
    //   }
    // }

    let trustedContactRequest
    switch ( scannedData.type ) {
        case QRCodeTypes.CONTACT_REQUEST:
        case QRCodeTypes.PRIMARY_KEEPER_REQUEST:
        case QRCodeTypes.KEEPER_REQUEST:
          trustedContactRequest = {
            walletName: scannedData.walletName,
            encryptedChannelKeys: scannedData.encryptedChannelKeys,
            encryptionType: scannedData.encryptionType,
            encryptionHint: scannedData.encryptionHint,
            isKeeper: scannedData.type === QRCodeTypes.KEEPER_REQUEST || scannedData.type === QRCodeTypes.PRIMARY_KEEPER_REQUEST, // only used as a flag for the UI(not to be passed to initTC during approval)
            isPrimaryKeeper: scannedData.type === QRCodeTypes.PRIMARY_KEEPER_REQUEST,
            isExistingContact: false,
            isQR: true,
            version: scannedData.version,
            type: scannedData.type,
          }
          break

        case QRCodeTypes.EXISTING_CONTACT:
          trustedContactRequest = {
            walletName: scannedData.walletName,
            channelKey: scannedData.channelKey,
            contactsSecondaryChannelKey: scannedData.secondaryChannelKey,
            isKeeper: true,
            isQR: true,
            version: scannedData.version,
            type: scannedData.type,
            isExistingContact: true
          }
          break
    }

    return trustedContactRequest
  } catch ( err ) {
    Alert.alert( 'Invalid/Incompatible QR, updating your app might help' )
  }
}
