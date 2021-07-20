import AsyncStorage from '@react-native-async-storage/async-storage'
import { DeepLinkHintType, DeepLinkKind, LevelHealthInterface, LevelInfo, TrustedContact, TrustedContactRelationTypes } from '../../bitcoin/utilities/Interface'
import SSS from '../../bitcoin/utilities/sss/SSS'
import AccountShell from '../data/models/AccountShell'
import { encrypt } from '../encryption'
import DeviceInfo from 'react-native-device-info'
import config from '../../bitcoin/HexaConfig'
import { Alert } from 'react-native'
import checkAppVersionCompatibility from '../../utils/CheckAppVersionCompatibility'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'

export const nameToInitials = fullName => {
  if( !fullName ) return
  const namesArray = fullName.split( ' ' )
  if ( namesArray.length === 1 ) return `${namesArray[ 0 ].charAt( 0 )}`
  else
    return `${namesArray[ 0 ].charAt( 0 )} ${namesArray[ namesArray.length - 1 ].charAt( 0 )}`
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

export const stateDataToBackup = ( accountShells, activePersonalNode, versionHistory, trustedContactsInfo ) => {
  // state data to backup
  const STATE_DATA = {
  }
  if ( accountShells && accountShells.length )
    STATE_DATA[ 'accountShells' ] = JSON.stringify( accountShells )

  if ( trustedContactsInfo && trustedContactsInfo.length )
    STATE_DATA[ 'trustedContactsInfo' ] = JSON.stringify( trustedContactsInfo )

  if ( activePersonalNode )
    STATE_DATA[ 'activePersonalNode' ] = JSON.stringify( activePersonalNode )

  if ( versionHistory && versionHistory.length )
    STATE_DATA[ 'versionHistory' ] = JSON.stringify( versionHistory )

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
    const key = 'answer'//SSS.strechKey( database.WALLET_SETUP.security.answer )
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

export const generateDeepLink = ( selectedContact: any, correspondingTrustedContact: TrustedContact, walletName: string ) => {
  if ( selectedContact.phoneNumbers && selectedContact.phoneNumbers.length ){
    const phoneNumber = selectedContact.phoneNumbers[ 0 ].number
    let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
    number = number.slice( number.length - 10 ) // last 10 digits only
    const numHintType = DeepLinkHintType.NUMBER
    const numHint = number[ 0 ] + number.slice( number.length - 2 )
    const numberEncChannelKey = TrustedContactsOperations.encryptData(
      correspondingTrustedContact.channelKey,
      number,
    ).encryptedData

    let deepLinkKind: DeepLinkKind
    switch( correspondingTrustedContact.relationType ){
        case TrustedContactRelationTypes.CONTACT:
          deepLinkKind = DeepLinkKind.CONTACT
          break

        case TrustedContactRelationTypes.KEEPER:
          deepLinkKind = DeepLinkKind.KEEPER
          break

        case TrustedContactRelationTypes.KEEPER_WARD:
          deepLinkKind = DeepLinkKind.RECIPROCAL_KEEPER
          break
    }

    const appType = config.APP_STAGE
    const appVersion = DeviceInfo.getVersion()

    const deepLink =
      `https://hexawallet.io
      /${appType}
      /${deepLinkKind}` +
      `/${walletName}` +
      `/${numberEncChannelKey}` +
      `/${numHintType}` +
      `/${numHint}` +
      `/v${appVersion}`

    return deepLink
  }
}

export const processDL = async ( url ) =>{
  const splits = url.split( '/' )

  if ( splits.includes( 'swan' ) ) {
    const swanRequest = {
      url
    }
    return {
      swanRequest
    }
  }

  if ( splits[ 5 ] === 'sss' ) {
    const requester = splits[ 4 ]

    if ( splits[ 6 ] === 'ek' ) {
      const custodyRequest = {
        requester,
        ek: splits[ 7 ],
        uploadedAt: splits[ 8 ],
      }
      return custodyRequest
    } else if ( splits[ 6 ] === 'rk' ) {
      const recoveryRequest = {
        requester, rk: splits[ 7 ]
      }
      return {
        recoveryRequest
      }
    }
  } else if ( [ 'tc', 'tcg', 'atcg', 'ptc' ].includes( splits[ 4 ] ) ) {
    if ( splits[ 3 ] !== config.APP_STAGE ) {
      Alert.alert(
        'Invalid deeplink',
        `Following deeplink could not be processed by Hexa:${config.APP_STAGE.toUpperCase()}, use Hexa:${
          splits[ 3 ]
        }`,
      )
    } else {
      const version = splits.pop().slice( 1 )

      if ( version ) {
        if ( !( await checkAppVersionCompatibility( {
          relayCheckMethod: splits[ 4 ],
          version,
        } ) ) ) {
          return
        }
      }

      const trustedContactRequest = {
        isGuardian: [ 'tcg', 'atcg' ].includes( splits[ 4 ] ),
        approvedTC: splits[ 4 ] === 'atcg' ? true : false,
        isPaymentRequest: splits[ 4 ] === 'ptc' ? true : false,
        requester: splits[ 5 ],
        encryptedKey: splits[ 6 ],
        hintType: splits[ 7 ],
        hint: splits[ 8 ],
        uploadedAt: splits[ 9 ],
        version,
      }
      return {
        trustedContactRequest
      }
    }
  } else if ( splits[ 4 ] === 'rk' ) {
    const recoveryRequest = {
      isRecovery: true,
      requester: splits[ 5 ],
      encryptedKey: splits[ 6 ],
      hintType: splits[ 7 ],
      hint: splits[ 8 ],
    }
    return {
      recoveryRequest
    }
  } else if ( splits[ 4 ] === 'rrk' ) {
    Alert.alert(
      'Restoration link Identified',
      'Restoration links only works during restoration mode',
    )
  } else if ( url.includes( 'fastbitcoins' ) ) {
    const userKey = url.substr( url.lastIndexOf( '/' ) + 1 )
    return {
      userKey
    }
  } else {
    const EmailToken = url.substr( url.lastIndexOf( '/' ) + 1 )
    return {
      EmailToken
    }
  }
}
