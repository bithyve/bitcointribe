import React, { useMemo, useEffect, useContext, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Platform,
  FlatList,
} from 'react-native'
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen'

import { hp, wp } from '../../common/data/responsiveness/responsive'
import Colors from '../../common/Colors'
import Fonts from './../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import { RFValue } from 'react-native-responsive-fontsize'
import { UsNumberFormat } from '../../common/utilities'
import { useDispatch, useSelector } from 'react-redux'
import CurrencyKindToggleSwitch from '../../components/CurrencyKindToggleSwitch'
import { LocalizationContext } from '../../common/content/LocContext'
import ModalContainer from '../../components/home/ModalContainer'
import ErrorModalContents from '../../components/ErrorModalContents'
import { setCloudBackupStatus, setCloudErrorMessage, updateCloudData } from '../../store/actions/cloud'
import CloudStatus from '../../common/data/enums/CloudBackupStatus'

const currencyCode = [
  'BRL',
  'CNY',
  'JPY',
  'GBP',
  'KRW',
  'RUB',
  'TRY',
  'INR',
  'EUR',
]
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { getCurrencyImageName } from '../../common/CommonFunctions/index'
import AntDesign from 'react-native-vector-icons/AntDesign'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import { currencyKindSet } from '../../store/actions/preferences'
import { LevelData, LevelHealthInterface } from '../../bitcoin/utilities/Interface'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import MaterialCurrencyCodeIcon, {
  materialIconCurrencyCodes,
} from '../MaterialCurrencyCodeIcon'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import { onPressKeeper } from '../../store/actions/BHR'
import ToggleContainer from '../../pages/Home/ToggleContainer'
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText'
import BitcoinUnit, { displayNameForBitcoinUnit } from '../../common/data/enums/BitcoinUnit'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import AccountShell from '../../common/data/models/AccountShell'
import useSourceAccountShellForSending from '../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'

function setCurrencyCodeToImage( currencyName, currencyColor ) {
  return (
    <View
      style={{
        marginRight: 5,
        marginBottom: wp( '0.7%' ),
      }}
    >
      <MaterialCommunityIcons
        name={currencyName}
        color={currencyColor == 'light' ? Colors.white : Colors.lightBlue}
        size={wp( '3.5%' )}
      />
    </View>
  )
}

const HomeHeader = ( {
  onPressNotifications,
  navigateToQRScreen,
  notificationData,
  walletName,
  netBalance,
  getCurrencyImageByRegion,
  exchangeRates,
  navigation,
  currentLevel,
  isTestAccount = false,
  bitcoinUnit = BitcoinUnit.SATS,
  textColor = Colors.currencyGray,
} ) => {
  const { translations, } = useContext( LocalizationContext )
  const strings = translations[ 'header' ]
  const fiatCurrencyCode = useCurrencyCode()
  const levelData: LevelData[] = useSelector(
    ( state ) => state.bhr.levelData
  )
  const currencyKind: CurrencyKind = useCurrencyKind()
  const levelHealth: LevelHealthInterface[] = useSelector( ( state ) => state.bhr.levelHealth )
  const navigationObj: any = useSelector( ( state ) => state.bhr.navigationObj )
  const bitcoinIconColor = 'gray'

  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  const cloudBackupStatus = useSelector(
    ( state ) => state.cloud.cloudBackupStatus
  )

  const CurrencyCode = useSelector(
    ( state ) => state.preferences.currencyCode
  )
  const cloudErrorMessage: string = useSelector( ( state ) => state.cloud.cloudErrorMessage )
  const stringsBhr = translations[ 'bhr' ]
  const common = translations[ 'common' ]
  const iCloudErrors = translations[ 'iCloudErrors' ]
  const driveErrors = translations[ 'driveErrors' ]
  const dispatch = useDispatch()

  const [ cloudErrorModal, setCloudErrorModal ] = useState( false )
  const [ errorMsg, setErrorMsg ] = useState( '' )
  const [ days, setDays ] = useState( 0 )
  const [ familyData, setFamilyData ] = useState( [ {
  }, {
  }, {
  } ] )

  const [ onKeeperButtonClick, setOnKeeperButtonClick ] = useState( false )
  const [ modalVisible, setModalVisible ] = useState( false )
  const defaultKeeperObj: {
    shareType: string
    updatedAt: number;
    status: string
    shareId: string
    reshareVersion: number;
    name?: string
    data?: any;
    channelKey?: string
  } = {
    shareType: '',
    updatedAt: 0,
    status: 'notAccessible',
    shareId: '',
    reshareVersion: 0,
    name: '',
    data: {
    },
    channelKey: ''
  }
  const [ selectedKeeper, setSelectedKeeper ]: [{
    shareType: string;
    updatedAt: number;
    status: string;
    shareId: string;
    reshareVersion: number;
    name?: string;
    data?: any;
    channelKey?: string;
  }, any] = useState( defaultKeeperObj )

  const accountShell = useSourceAccountShellForSending()
  const balance = AccountShell.getTotalBalance( accountShell )

  const amountToDisplay = useMemo( () => {
    const divisor = [ BitcoinUnit.SATS, BitcoinUnit.TSATS ].includes( bitcoinUnit ) ? 1 : SATOSHIS_IN_BTC

    return balance / divisor
  }, [ balance, bitcoinUnit ] )

  const formattedBalanceText = isTestAccount ?
    UsNumberFormat( amountToDisplay )
    : useFormattedAmountText( amountToDisplay )

  const formattedUnitText = isTestAccount ?
    displayNameForBitcoinUnit( BitcoinUnit.TSATS )
    : useFormattedUnitText( {
      bitcoinUnit, currencyKind
    } )

  useEffect( () => {
    if ( navigationObj.selectedKeeper && onKeeperButtonClick ) {
      setSelectedKeeper( navigationObj.selectedKeeper )
      const navigationParams = {
        selectedTitle: navigationObj.selectedKeeper.name,
        SelectedRecoveryKeyNumber: 1,
        selectedKeeper: navigationObj.selectedKeeper,
        selectedLevelId: levelData[ 0 ].id
      }
      navigation.navigate( 'SeedBackupHistory', navigationParams )
    }
  }, [ navigationObj ] )

  useEffect( () => {
    async function fetchWalletDays() {
      const walletBackupDate = await AsyncStorage.getItem( 'walletBackupDate' )
      if ( walletBackupDate && walletBackupDate != null ) {
        const backedupDate = moment( JSON.parse( walletBackupDate ) )
        // const currentDate = moment( '2023-04-10T11:27:25.000Z' )
        const currentDate = moment( Date() )
        setDays( currentDate.diff( backedupDate, 'days' ) )
      }
    }

    fetchWalletDays()
  }, [] )

  useEffect( () => {
    if ( cloudErrorMessage != '' ) {
      const message = Platform.select( {
        ios: iCloudErrors[ cloudErrorMessage ],
        android: driveErrors[ cloudErrorMessage ],
      } )
      setErrorMsg( message )
      setCloudErrorModal( true )
      //setErrorMsg( cloudErrorMessage )
      dispatch( setCloudErrorMessage( '' ) )
    } else if ( cloudBackupStatus == CloudBackupStatus.COMPLETED || cloudBackupStatus == CloudBackupStatus.IN_PROGRESS ) {
      setCloudErrorModal( false )
    }
  }, [ cloudErrorMessage, cloudBackupStatus ] )


  const walletNameLength = walletName?.split( '' ).length
  const walletNameNew = walletName.split( '' )[ walletNameLength - 1 ].toLowerCase() === 's' ? `${walletName}’ Wallet` : `${walletName}’s Wallet`

  // const getMessage = () => {
  //   const { messageOne, messageTwo, isFirstMessageBold, isError, isInit } = getMessageToShow()

  //   return <TouchableOpacity
  //     onPress={()=> {
  //       if( levelData[ 0 ].keeper1ButtonText?.toLowerCase() == 'seed'||
  //       levelData[ 0 ].keeper1ButtonText?.toLowerCase() == 'write down seed-words' ){
  //         if ( ( levelHealth.length == 0 ) || ( levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ) {
  //           const navigationParams = {
  //             selectedTitle: navigationObj?.selectedKeeper?.name,
  //             SelectedRecoveryKeyNumber: 1,
  //             selectedKeeper: navigationObj?.selectedKeeper,
  //             selectedLevelId: levelData[ 0 ].id
  //           }
  //           navigation.navigate( 'SeedBackupHistory', navigationParams )
  //         } else {
  //           setSelectedKeeper( levelData[ 0 ].keeper1 )
  //           dispatch( onPressKeeper( levelData[ 0 ], 1 ) )
  //           setOnKeeperButtonClick( true )
  //         }
  //       } else navigation.navigate( 'WalletBackup' )
  //     // navigation.navigate( 'WalletBackup' ), {
  //       // messageOne, messageTwo, isFirstMessageBold, isError, isInit
  //     // }
  //     }
  //     }
  //     activeOpacity={0.6}
  //     style={{
  //       flexDirection: 'row', alignItems: 'center', marginTop: hp( 1.8 )
  //     }}>
  //     { isInit ?
  //       <View style={{
  //         width: wp( '4.7%' ), height: wp( '4.7%' ), borderRadius: wp( '4.7/2%' ), backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center'
  //       }}>
  //         <Image
  //           source={require( '../../assets/images/icons/icon_account_sync_in_progress.gif' )}
  //           style={{
  //             width: wp( '4.0%' ), height: wp( '4.0%' ), borderRadius: wp( '4.0/2%' ),
  //           }}
  //           resizeMode={'contain'}
  //         />
  //       </View>
  //       : <View style={{
  //         backgroundColor: ( levelData[ 0 ].keeper1.shareType == 'seed' ? Colors.green : Colors.red ),
  //         // backgroundColor: isError ? currentLevel === 0 ? Colors.white : Colors.red : Colors.green,
  //         width: wp( '4.7%' ), height: wp( '4.7%' ), borderRadius: wp( '4.7/2%' ),
  //         alignItems:'center',
  //         justifyContent: 'center'
  //       }}>
  //         {/* { levelData[ 0 ].keeper1.status == 'accessible' && levelData[ 0 ].keeper1.shareType == 'seed' ?
  //         <Image
  //           source={ require( '../../assets/images/icons/check_white.png' )}
  //           style={{
  //             width: wp( '2.7%' ), height: wp( '2.7%' ),
  //             tintColor: Colors.white
  //           }}
  //           resizeMode={'contain'}
  //         /> : */}
  //         <Image
  //           source={levelData[ 0 ].keeper1.shareType !== 'seed' ? require( '../../assets/images/icons/icon_error_white.png' ) : require( '../../assets/images/icons/check_white.png' )}
  //           style={{
  //             width: wp( '2.7%' ), height: wp( '2.7%' ),
  //             // tintColor: Colors.white
  //           }}
  //           resizeMode={'contain'}
  //         />
  //         {/* } */}
  //       </View>
  //     }
  //     {/* { <Text ellipsizeMode="middle" numberOfLines={1} style={{
  //       flex:1, color: Colors.backgroundColor1, marginLeft: wp( 1 ), fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, marginTop: wp( 0.8 )
  //     }}>{ levelData[ 0 ].keeper1.shareType == '' ? 'Confirm backup phrase' : ( levelData[ 0 ].keeper1.shareType == 'seed' ? 'Wallet backup confirmed' : 'Confirm backup phrase' )}</Text> } */}

  //     <Text ellipsizeMode="middle" numberOfLines={1} style={{
  //       flex:1, color: Colors.backgroundColor1, marginLeft: wp( 1 ), fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, marginTop: wp( 0.8 )
  //     }}>{days > 180
  //         ? 'Wallet backup phrase is expired'
  //         : days > 150
  //           ? 'Wallet backup phrase will expire soon'
  //           : levelData[ 0 ].keeper1.shareType == ''
  //             // ? strings.Backupyour
  //             ? 'Confirm backup phrase'
  //             : ( levelData[ 0 ].keeper1.shareType == 'seed'
  //               ? 'Wallet backup confirmed' : 'Confirm backup phrase' )}
  //     </Text>

  //     {/* {isFirstMessageBold ? <Text ellipsizeMode="middle" numberOfLines={1} style={{
  //       flex:1, color: Colors.backgroundColor1, marginLeft: wp( 1 ), fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, marginTop: wp( 0.8 )
  //     }}><Text style={{
  //         fontFamily: Fonts.FiraSansMediumItalic
  //       }}>{messageOne}</Text>{messageTwo}</Text> : <Text ellipsizeMode="middle" numberOfLines={1} style={{
  //       flex:1, color: Colors.backgroundColor1, marginLeft: wp( 1 ), fontSize: RFValue( 11 ), marginTop: wp( 0.8 )
  //     }}>{messageOne} <Text style={{
  //         fontFamily: Fonts.FiraSansMediumItalic
  //       }}>{messageTwo}</Text></Text>} */}
  //   </TouchableOpacity>
  // }

  useEffect( () => {
    const focusListener = navigation.addListener( 'didFocus', () => {
      getMessageToShow()
    } )
    return () => {
      focusListener.remove()
    }
  }, [] )

  const getMessageToShow = () => {
    if ( levelData[ 0 ].keeper2.updatedAt == 0 && currentLevel == 0 && cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) {
      return {
        isFirstMessageBold: false, messageOne: strings.init, messageTwo: '', isError: false, isInit: true
      }
    }
    if ( levelData ) {
      let messageOneName = ''
      for ( let i = 0; i < levelData.length; i++ ) {
        const element = levelData[ i ]
        if ( element.keeper1.name && element.keeper1.status == 'notAccessible' ) {
          return {
            isFirstMessageBold: true, messageOne: element.keeper1.name, messageTwo: strings.needAttention, isError: true
          }
        }
        if ( element.keeper2.name && element.keeper2.status == 'notAccessible' ) {
          return {
            isFirstMessageBold: true, messageOne: element.keeper2.name, messageTwo: strings.needAttention, isError: true
          }
        }
        if ( element.keeper1.status == 'accessible' && element.keeper1.shareType == 'seed' ) {
          messageOneName = 'Seed ' + strings.backupIsCompleted
        }
        if ( element.keeper2.status == 'accessible' ) {
          messageOneName = element.keeper2.name
        }
      }
      if ( currentLevel == 0 && levelData[ 0 ].keeper1.shareType != 'seed' ) {
        return {
          isFirstMessageBold: false, messageOne: strings.Backupyour, messageTwo: '', isError: true
        }
      } else if ( currentLevel === 1 ) {
        if ( messageOneName ) {
          return {
            isFirstMessageBold: false, messageOne: `${messageOneName} ` + strings.backupIsCompleted, messageTwo: '', isError: false
          }
        }
        return {
          isFirstMessageBold: false, messageOne: Platform.OS == 'ios' ? strings.l1 : strings.l1Drive, messageTwo: '', isError: false
        }
      } else if ( currentLevel === 2 ) {
        return {
          isFirstMessageBold: false, messageOne: strings.l2, messageTwo: '', isError: false
        }
      } else if ( currentLevel == 3 ) {
        return {
          isFirstMessageBold: true, messageOne: strings.l3, messageTwo: '', isError: false
        }
      }
    }
    if ( currentLevel === 1 ) {
      return {
        isFirstMessageBold: false, messageOne: Platform.OS == 'ios' ? strings.l1 : strings.l1Drive, messageTwo: '', isError: false
      }
    } else if ( currentLevel == 0 && levelData[ 0 ].keeper1.shareType == 'seed' ) {
      return {
        isFirstMessageBold: false, messageOne: 'Seed ' + strings.backupIsCompleted, messageTwo: '', isError: true
      }
    } else {
      return {
        isFirstMessageBold: false, messageOne: strings.Backupyour, messageTwo: '', isError: true
      }
    }
  }

  const bitcoinIconSource = useMemo( () => {
    switch ( bitcoinIconColor ) {
        // case 'dark':
        //   return require( '../../assets/images/currencySymbols/icon_bitcoin_dark.png' )
        // case 'light':
        //   return require( '../../assets/images/currencySymbols/icon_bitcoin_light.png' )
        case 'gray':
          return require( '../../assets/images/currencySymbols/icon_bitcoin_gray.png' )
        default:
          return require( '../../assets/images/currencySymbols/icon_bitcoin_gray.png' )
    }
  }, [ bitcoinIconColor ] )

  const BalanceCurrencyIcon = () => {
    const style = {
      ...styles.currencyImage,
      // ...currencyImageStyle,
    }

    if ( prefersBitcoin || isTestAccount ) {
      return <Image style={{
        ...style, marginLeft: wp( 1 )
      }} source={bitcoinIconSource} />
    }

    if ( materialIconCurrencyCodes.includes( fiatCurrencyCode ) ) {
      return (
        <MaterialCurrencyCodeIcon
          currencyCode={fiatCurrencyCode}
          color={textColor}
          size={RFValue( 16 )}
          style={{
          }}
        />
      )
    }
    else {
      return (
        <Image
          style={style}
          source={getCurrencyImageByRegion( fiatCurrencyCode, bitcoinIconColor )}
        />
      )
    }
  }

  const renderItems = ( { item, index } ) => {
    return (
      <View style={{
        marginEnd: wp( 16 ), alignItems: 'center'
      }}>
        <View style={{
          width: wp( 40 ), height: wp( 40 ), borderRadius: wp( 20 ), backgroundColor: Colors.white,
          justifyContent: 'center', alignItems: 'center'
        }}>
          <View style={{
            width: wp( 38 ), height: wp( 38 ), borderRadius: wp( 19 ), backgroundColor: Colors.red
          }}>

          </View>
        </View>
        <Text style={styles.familyText}>BitBot</Text>
      </View>
    )
  }

  return (
    <View style={{
      ...styles.headerViewContainer
    }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center'
      }}>
        <View style={{
          height: wp( 40 ),
          width: wp( 40 ),
          backgroundColor: Colors.white,
          borderRadius: wp( 20 ),
          justifyContent:'center',
          alignItems:'center'
        }}>
          <View style={{
            height: wp( 38 ),
            width: wp( 38 ),
            backgroundColor: Colors.red,
            borderRadius: wp( 20 )
          }}>

          </View>
        </View>
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'flex-start',
          marginStart: wp( 15 )
        }}>
          <Text style={styles.headerTitleText}>{walletNameNew}</Text>
        </View>
        <TouchableOpacity
          onPress={navigateToQRScreen}
          style={{
            height: wp( 20 ),
            width: wp( 28 ),
            // justifyContent: 'center',
          }}
        >
          <ImageBackground
            source={require( '../../assets/images/icons/qr.png' )}
            style={{
              height: wp( 20 ),
              width: wp( 28 )
            }}
            resizeMode={'contain'}
          >
            {/* {notificationData.findIndex( ( value ) => value.read == false ) > -1 ? (
              <View
                style={{
                  backgroundColor: Colors.red,
                  height: wp( '2.5%' ),
                  width: wp( '2.5%' ),
                  borderRadius: wp( '2.5%' ) / 2,
                  alignSelf: 'flex-end',
                }}
              />
            ) : null} */}
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressNotifications}
          style={{
            height: wp( 23 ),
            width: wp( 21 ),
            marginLeft: wp( 25 )
            // justifyContent: 'center',
          }}
        >
          <ImageBackground
            source={require( '../../assets/images/icons/settings.png' )}
            style={{
              height: wp( 23 ),
              width: wp( 21 )
            }}
            resizeMode={'contain'}
          >
            {/* {notificationData.findIndex( ( value ) => value.status === 'unread' ) > -1 ? (
              <View
                style={{
                  backgroundColor: Colors.red,
                  height: wp( '2.5%' ),
                  width: wp( '2.5%' ),
                  borderRadius: wp( '2.5%' ) / 2,
                  alignSelf: 'flex-end',
                }}
              />
            ) : null} */}
          </ImageBackground>
        </TouchableOpacity>
      </View>
      {/* {getMessage()} */}

      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: hp( 90 ), alignItems: 'center'
      }}>
        <Text style={styles.walletBalanceText}>Wallet Balance</Text>
        <ToggleContainer />
      </View>

      <View style={{
        flexDirection: 'row', alignItems: 'center', marginTop: hp( 10 )
      }}>
        <View style={{
          width: wp( 25 ), height: wp( 25 ), backgroundColor: Colors.white,
          borderRadius: wp( 14 )
        }} />
        <BalanceCurrencyIcon />
        <Text style={styles.amountText}>40,005</Text>
      </View>

      <FlatList
        style={{
          marginTop: hp( 130 )
        }}
        keyExtractor={( item, index ) => item.id}
        data={familyData}
        // extraData={radioOnOff}
        showsVerticalScrollIndicator={false}
        renderItem={renderItems}
        horizontal
      />
      <ModalContainer onBackground={() => setCloudErrorModal( false )} visible={cloudErrorModal} closeBottomSheet={() => setCloudErrorModal( false )}>
        <ErrorModalContents
          title={Platform.OS == 'ios' ? stringsBhr[ 'CloudBackupError' ] : stringsBhr[ 'driveBackupError' ]}
          //info={cloudErrorMessage}
          note={errorMsg}
          onPressProceed={() => {
            setCloudErrorModal( false )
            dispatch( updateCloudData() )
            //dispatch( setCloudBackupStatus( CloudStatus.IN_PROGRESS ) )
          }}
          onPressIgnore={() => setTimeout( () => { setCloudErrorModal( false ) }, 500 )}
          proceedButtonText={common.tryAgain}
          cancelButtonText={common.ok}
          isIgnoreButton={true}
          isBottomImage={true}
          isBottomImageStyle={{
            width: wp( '27%' ),
            height: wp( '27%' ),
            marginLeft: 'auto',
            resizeMode: 'stretch',
            marginBottom: hp( '-3%' ),
          }}
          bottomImage={require( '../../assets/images/icons/cloud_ilustration.png' )}
        />
      </ModalContainer>
    </View>
  )
}

export default HomeHeader

const styles = StyleSheet.create( {
  headerViewContainer: {
    paddingTop: hp( 30 ),
    paddingStart: wp( 25 ),
    paddingEnd: wp( 25 ),
    paddingBottom:hp( 30 ),
    backgroundColor: Colors.appPrimary,
  },
  headerTitleText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 25 ),
    // marginBottom: wp(  ),
    letterSpacing: RFValue( 0.01 )
  },
  // cardBitCoinImage: {
  //   width: wp( '3.5%' ),
  //   height: wp( '3.5%' ),
  //   marginRight: 5,
  //   resizeMode: 'contain',
  //   // marginBottom: wp( '0.7%' ),
  // },
  // manageBackupMessageView: {
  //   marginLeft: wp( '2%' ),
  //   borderRadius: wp( '13' ) / 2,
  //   height: wp( '13' ),
  //   flex: 1,
  //   backgroundColor: Colors.deepBlue,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingLeft: wp( '5%' ),
  //   paddingRight: wp( '5%' ),
  // },
  manageBackupMessageTextHighlight: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMediumItalic,
    fontSize: RFValue( 13 ),
  },
  manageBackupMessageText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 12 ),
    color: Colors.white,
  },
  homeHeaderAmountText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 19 ),
    marginRight: 5,
    color: Colors.white,
  },
  homeHeaderAmountUnitText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 10 ),
    // marginBottom: 3,
    color: Colors.white,
    marginTop: hp( 0.7 )
  },
  walletBalanceText: {
    color: Colors.white,
    fontFamily: Fonts.RobotoSlabRegular,
    fontSize: RFValue( 12 ),
    letterSpacing: RFValue( 0.6 )
  },
  currencyImage: {
    width: wp( 3 ),
    height: wp( 4 ),
    resizeMode: 'contain',
    // marginTop: wp( 0.3 )
    marginStart: wp( 3 )
  },
  amountText: {
    color: Colors.white,
    fontFamily: Fonts.RobotoSlabMedium,
    fontSize: RFValue( 34 ),
    letterSpacing: RFValue( 1.7 ),
    marginStart: wp( 2 )
  },
  familyText: {
    color: Colors.white,
    fontFamily: Fonts.RobotoSlabBold,
    fontSize: RFValue( 10 ),
    letterSpacing: RFValue( 0.2 ),
    marginTop: hp( 10 )
  }
} )
