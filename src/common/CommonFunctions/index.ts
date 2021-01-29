import { AsyncStorage } from "react-native";
import { LevelHealthInterface, LevelInfo } from "../../bitcoin/utilities/Interface";
import SSS from "../../bitcoin/utilities/sss/SSS";
import AccountShell from "../data/models/AccountShell";
import { encrypt } from "../encryption";

export const nameToInitials = fullName => {
  const namesArray = fullName.split( ' ' )
  if ( namesArray.length === 1 ) return `${namesArray[ 0 ].charAt( 0 )}`
  else
    return `${namesArray[ 0 ].charAt( 0 )}${namesArray[
      namesArray.length - 1
    ].charAt( 0 )}`
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
export const getFormattedString = (qrString: string) => {
  qrString = qrString.split('"').join('Dquote');
  qrString = qrString.split(':').join('Qutation');
  qrString = qrString.split('{').join('Lbrace');
  qrString = qrString.split('}').join('Rbrace');
  qrString = qrString.split('/').join('Slash');
  qrString = qrString.split(',').join('Comma');
  qrString = qrString.split("'").join('Squote');
  qrString = qrString.split(' ').join('Space');
  return qrString;
};

export const generateRandomString = (length: number): string => {
  let randomString: string = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let itr = 0; itr < length; itr++) {
    randomString += possibleChars.charAt(
      Math.floor(Math.random() * possibleChars.length),
    );
  }
  return randomString;
};

const asyncDataToBackup = async () => {
  const [
    [ , TrustedContactsInfo ],
    [ , personalCopyDetails ],
    [ , FBTCAccount ],
    [ , PersonalNode ]
  ] = await AsyncStorage.multiGet( [
    'TrustedContactsInfo',
    'personalCopyDetails',
    'FBTCAccount',
    'PersonalNode'
  ] )
  const ASYNC_DATA = {
  }
  if ( TrustedContactsInfo )
    ASYNC_DATA[ 'TrustedContactsInfo' ] = TrustedContactsInfo
  if ( personalCopyDetails )
    ASYNC_DATA[ 'personalCopyDetails' ] = personalCopyDetails
  if ( FBTCAccount ) ASYNC_DATA[ 'FBTCAccount' ] = FBTCAccount
  if( PersonalNode ) ASYNC_DATA[ 'PersonalNode' ] = PersonalNode

  return ASYNC_DATA
}

function* stateDataToBackup(accountShells, activePersonalNode) {
  // state data to backup
  const STATE_DATA = {
  }
  if ( accountShells && accountShells.length )
    STATE_DATA[ 'accountShells' ] = JSON.stringify( accountShells )

  if( activePersonalNode )
    STATE_DATA[ 'activePersonalNode' ] = JSON.stringify( activePersonalNode )

  return STATE_DATA
}
export const CloudData = async (database, accountShells, activePersonalNode) => {
  let encryptedCloudDataJson;
    let walletImage = {
      SERVICES: {},
      DECENTRALIZED_BACKUP: {},
      ASYNC_DATA: {},
      WALLET_SETUP: {},
      STATE_DATA: {},
    };
   // console.log("DATABASE", database);
    let CloudDataJson = {};
    if (!isEmpty(database)) {
      if (database.SERVICES)
        walletImage.SERVICES = database.SERVICES;
      if (database.DECENTRALIZED_BACKUP)
        walletImage.DECENTRALIZED_BACKUP = database.DECENTRALIZED_BACKUP;
      if (database.WALLET_SETUP)
        walletImage.WALLET_SETUP = database.WALLET_SETUP;
      walletImage.ASYNC_DATA = await asyncDataToBackup();
      walletImage.STATE_DATA = stateDataToBackup(accountShells,activePersonalNode);
      let key = SSS.strechKey(database.WALLET_SETUP.security.answer);
      CloudDataJson = {
        walletImage,
        keeperInfo: [],
      };
      console.log("walletImage", walletImage);
      encryptedCloudDataJson = await encrypt(CloudDataJson, key);
      // console.log('encryptedDatabase', encryptedCloudDataJson);
      return encryptedCloudDataJson;
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
};

export const getKeeperInfoFromShareId = (levelHealthVar: LevelHealthInterface[], shareId: string) : {
  shareType: string;
  updatedAt: number;
  status: string;
  shareId: string;
  reshareVersion?: number;
  name?: string;
} =>{
  let index;
  for (let i = 0; i < levelHealthVar.length; i++) {
    const element = levelHealthVar[i];
    index = element.levelInfo.findIndex(value=>value.shareId == shareId);
    if(index>-1){
      return element.levelInfo[index];
    }
  }
}

export const getLevelInfo = (levelHealthVar: LevelHealthInterface[], currentLevel: number) : LevelInfo[] =>{
  if (levelHealthVar[currentLevel]) {
    if(levelHealthVar[1]){
      for (let i = 0; i < levelHealthVar[currentLevel].levelInfo.length; i++) {
        if (levelHealthVar[currentLevel].levelInfo[i].updatedAt !== 0 && levelHealthVar[currentLevel].levelInfo[i].shareType !== "securityQuestion") {
          return levelHealthVar[currentLevel].levelInfo;
        }
      }
    }
    else return levelHealthVar[0].levelInfo;
  }
  return levelHealthVar[currentLevel - 1].levelInfo;
}
