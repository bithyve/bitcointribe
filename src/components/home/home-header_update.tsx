import React, { useMemo, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Linking,
  Platform,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from './../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import { RFValue } from 'react-native-responsive-fontsize'
import { UsNumberFormat } from '../../common/utilities'
import { useDispatch, useSelector } from 'react-redux'
import CurrencyKindToggleSwitch from '../../components/CurrencyKindToggleSwitch'
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
import S3Service from '../../bitcoin/services/sss/S3Service'
import { LevelHealthInterface } from '../../bitcoin/utilities/Interface'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'

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
  notificationData,
  walletName,
  netBalance,
  getCurrencyImageByRegion,
  exchangeRates,
  CurrencyCode,
  navigation,
  currentLevel,
} ) => {
  const levelHealth: LevelHealthInterface[] = useSelector(
    ( state ) => state.health.levelHealth
  )
  const levelData = useSelector(
    ( state ) => state.health.levelData
  )
  const dispatch = useDispatch()
  const currencyKind: CurrencyKind = useCurrencyKind()

  const s3Service: S3Service = useSelector(
    ( state ) => state.health.service
  )

  const newBHRFlowStarted = useSelector(
    ( state ) => state.health.newBHRFlowStarted
  )
  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  const upgradeProcessStatus = useSelector(
    ( state ) => state.upgradeToNewBhr.upgradeProcessStatus
  )

  const getMessage = () => {
    const { messageOne, messageTwo, isFirstMessageBold } = getMessageToShow()
    if ( isFirstMessageBold ) {
      return (
        <View
          style={{
            flexDirection: 'row',
            width: wp( '57%' ),
            alignItems: 'flex-end',
          }}
        >
          <Text
            numberOfLines={1}
            style={styles.manageBackupMessageTextHighlight}
          >
            {messageOne}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...styles.manageBackupMessageText, flex: 1
            }}
          >
            {messageTwo}
          </Text>
        </View>
      )
    } else {
      return (
        <View
          style={{
            flexDirection: 'row',
            width: wp( '57%' ),
            alignItems: 'flex-end',
          }}
        >
          <Text style={styles.manageBackupMessageText}>{messageOne}</Text>
          <Text numberOfLines={1} style={styles.manageBackupMessageTextHighlight}>
            {messageTwo}
          </Text>
        </View>
      )
    }
  }

  useEffect( () => {
    const focusListener = navigation.addListener( 'didFocus', () => {
      getMessageToShow()
    } )
    return () => {
      focusListener.remove()
    }
  }, [] )

  const getMessageToShow = () => {
    if( levelData ){
      for ( let i = 0; i < levelData.length; i++ ) {
        const element = levelData[ i ]
        if( element.keeper1.name && element.keeper1.updatedAt > 0 && element.keeper1.status == 'notAccessible' ){
          return {
            isFirstMessageBold: true, messageOne: element.keeper1.name, messageTwo: ' needs your attention.'
          }
        }
        if( element.keeper2.name && element.keeper2.updatedAt > 0 && element.keeper2.status == 'notAccessible' ){
          return {
            isFirstMessageBold: true, messageOne: element.keeper1.name, messageTwo: ' needs your attention.'
          }
        }
        if( currentLevel == 0 ){
          return {
            isFirstMessageBold: false, messageOne: 'Cloud Backup incomplete, please complete Level 1', messageTwo: ''
          }
        }
        if( currentLevel === 1 ){
          return {
            isFirstMessageBold: false, messageOne: 'Cloud Backup complete, you can upgrade the backup to Level 2', messageTwo: ''
          }
        } else if( currentLevel === 2 ){
          return {
            isFirstMessageBold: false, messageOne: 'Double Backup complete, you can upgrade the backup to Level 3', messageTwo: ''
          }
        } else if( currentLevel == 3 ){
          return {
            isFirstMessageBold: true, messageOne: 'Multi-key Backup complete', messageTwo: ''
          }
        }
      }
    } else
    {
      let name = ''
      let message = ''
      if ( levelHealth.length ) {
        for ( let i = 0; i < levelHealth.length; i++ ) {
          const element = levelHealth[ i ].levelInfo
          let j = 0
          if ( currentLevel == 1 && i == 1 ) j = 2
          else if ( currentLevel == 2 && i == 2 ) j = 4
          for ( j; j < element.length; j++ ) {
            const item = element[ j ]
            if ( j == 1 && item.status == 'notAccessible' ) name = 'Security Question'
            if ( j == 2 && item.status == 'notAccessible' ) name = 'Primary Keeper'
            if ( j == 3 && item.status == 'notAccessible' ) name = 'Second Keeper'
            if ( j == 4 && item.status == 'notAccessible' ) name = 'Third Keeper'
            if ( j == 5 && item.status == 'notAccessible' ) name = 'Fourth Keeper'
            if ( item.name && item.status == 'notAccessible' ) name = item.name
            if ( item.updatedAt == 0 && item.status == 'notAccessible' ) {
              message = 'Add '
            } else if ( j != 0 && item.updatedAt && item.status == 'notAccessible' ) {
              message = ' needs your attention'
            } else {
              message = ''
            }
            if (
              element[ j ].status == 'notAccessible' &&
              name &&
              message == 'Add '
            ) {
              return {
                messageOne: message, messageTwo: name
              }
            } else if (
              element[ j ].status == 'notAccessible' &&
              name &&
              message == ' needs your attention'
            ) {
              return {
                messageOne: name, messageTwo: message
              }
            }
            if( currentLevel == 0 ){
              return {
                isFirstMessageBold: false, messageOne: 'Cloud Backup incomplete, please complete Level 1', messageTwo: ''
              }
            }
            if( currentLevel == 1 ){
              return {
                isFirstMessageBold: false, messageOne: 'Cloud Backup complete, you can upgrade the backup to Level 2', messageTwo: ''
              }
            } else if( currentLevel === 2 ){
              return {
                isFirstMessageBold: false, messageOne: 'Double Backup complete, you can upgrade the backup to Level 3', messageTwo: ''
              }
            } else if( currentLevel == 3 ){
              return {
                isFirstMessageBold: true, messageOne: 'Your wallet is at full security', messageTwo: ''
              }
            }
          }
        }
      } else {
        return {
          isFirstMessageBold: true, messageOne: 'Manage your wallet backup', messageTwo: ''
        }
      }
    }
    return {
      isFirstMessageBold: false, messageOne: 'Cloud Backup incomplete, please complete Level 1', messageTwo: ''
    }
  }

  return (
    <View style={{
      ...styles.headerViewContainer, flex: 1
    }}>
      <View style={{
        flexDirection: 'row'
      }}>
        <CurrencyKindToggleSwitch
          fiatCurrencyCode={CurrencyCode}
          onpress={() => {
            dispatch(
              currencyKindSet(
                prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
              )
            )
          }}
          isOn={prefersBitcoin}
          disabled={exchangeRates && exchangeRates[ CurrencyCode ] ? false : true}
        />
        <TouchableOpacity
          onPress={onPressNotifications}
          style={{
            height: wp( '10%' ),
            width: wp( '10%' ),
            justifyContent: 'center',
            marginLeft: 'auto',
          }}
        >
          <ImageBackground
            source={require( '../../assets/images/icons/icon_notification.png' )}
            style={{
              width: wp( '6%' ), height: wp( '6%' ), marginLeft: 'auto'
            }}
            resizeMode={'contain'}
          >
            {notificationData.findIndex( ( value ) => value.read == false ) > -1 ? (
              <View
                style={{
                  backgroundColor: Colors.red,
                  height: wp( '2.5%' ),
                  width: wp( '2.5%' ),
                  borderRadius: wp( '2.5%' ) / 2,
                  alignSelf: 'flex-end',
                }}
              />
            ) : null}
          </ImageBackground>
        </TouchableOpacity>
      </View>
      <View style={{
        flex: 1, justifyContent: 'center', alignItems: 'center'
      }}>
        <View
          style={{
            marginBottom: wp( '2%' ),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={styles.headerTitleText}>{`${walletName}’s Wallet`}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              // marginBottom: wp('3%'),
            }}
          >
            {prefersBitcoin ? (
              <Image
                style={{
                  ...CommonStyles.homepageAmountImage,
                  marginBottom: wp( '1.5%' ),
                }}
                source={require( '../../assets/images/icons/icon_bitcoin_light.png' )}
              />
            ) : currencyCode.includes( CurrencyCode ) ? (
              setCurrencyCodeToImage(
                getCurrencyImageName( CurrencyCode ),
                'light'
              )
            ) : (
              <Image
                style={{
                  ...styles.cardBitCoinImage,
                  marginBottom: wp( '1.5%' ),
                }}
                source={getCurrencyImageByRegion( CurrencyCode, 'light' )}
              />
            )}
            <Text style={styles.homeHeaderAmountText}>
              {prefersBitcoin
                ? UsNumberFormat( netBalance )
                : exchangeRates && exchangeRates[ CurrencyCode ]
                  ? (
                    ( netBalance / SATOSHIS_IN_BTC ) *
                    exchangeRates[ CurrencyCode ].last
                  ).toFixed( 2 )
                  : 0}
            </Text>
            <Text style={styles.homeHeaderAmountUnitText}>
              {prefersBitcoin ? 'sats' : CurrencyCode.toLocaleLowerCase()}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 'auto',
        }}
      >
        <ImageBackground
          source={require( '../../assets/images/icons/Keeper_shield_white.png' )}
          style={{
            width: wp( '15%' ),
            height: wp( '20%' ),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontFamily: Fonts.FiraSansMedium,
              fontSize: RFValue( 18 ),
            }}
          >
            {currentLevel ? currentLevel : ''}
          </Text>
        </ImageBackground>
        <TouchableOpacity
          onPress={() => {
            console.log( 'newBHRFlowStarted', newBHRFlowStarted )
            // if( upgradeProcessStatus == KeeperProcessStatus.IN_PROGRESS ){
            //   navigation.navigate( 'UpgradeBackup' )
            // } else {
            if ( newBHRFlowStarted === true ) {
              navigation.navigate( 'ManageBackupNewBHR' )
            } else {
              navigation.navigate( 'UpgradeBackup' )
            }
            //}
          }}
          style={styles.manageBackupMessageView}
        >
          {getMessage()}
          <AntDesign
            style={{
              marginLeft: 'auto'
            }}
            name={'arrowright'}
            color={Colors.white}
            size={17}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={{
        alignItems:'center', padding: 5, marginBottom: -wp( 3 )
      }} onPress={()=> Platform.OS=='android'? Linking.openURL( 'https://play.google.com/store/apps/details?id=io.hexawallet.hexa2&hl=en' ) : Linking.openURL( 'https://apps.apple.com/us/app/bitcoin-wallet-hexa-2-0/id1586334138' )}><Text style={{
          color: Colors.white, fontSize: RFValue( 13 ), fontFamily: Fonts.FiraSansMedium
        }}>{'Please download Hexa 2.0, our new improved app'}</Text></TouchableOpacity>
    </View>
  )
}

export default HomeHeader

const styles = StyleSheet.create( {
  headerViewContainer: {
    marginTop: hp( '1%' ),
    marginLeft: 20,
    marginRight: 20,
  },
  headerTitleText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 25 ),
    marginBottom: wp( '2%' ),
  },
  cardBitCoinImage: {
    width: wp( '3%' ),
    height: wp( '3%' ),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp( '0.7%' ),
  },
  manageBackupMessageView: {
    marginLeft: wp( '2%' ),
    borderRadius: wp( '13' ) / 2,
    height: wp( '13' ),
    flex: 1,
    backgroundColor: Colors.deepBlue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: wp( '5%' ),
    paddingRight: wp( '5%' ),
  },
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
    fontSize: RFValue( 9 ),
    marginBottom: 3,
    color: Colors.white,
  },
} )
