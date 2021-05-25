import React, { useMemo, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native'
import { Button } from 'react-native-elements'
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
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import S3Service from '../../bitcoin/services/sss/S3Service'
import { LevelHealthInterface } from '../../bitcoin/utilities/Interface'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'

import ButtonStyles from '../../common/Styles/ButtonStyles'

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
export enum BottomSheetKind {
    TAB_BAR_BUY_MENU,
    CUSTODIAN_REQUEST,
    CUSTODIAN_REQUEST_REJECTED,
    TRUSTED_CONTACT_REQUEST,
    ADD_CONTACT_FROM_ADDRESS_BOOK,
    NOTIFICATIONS_LIST,
    SWAN_STATUS_INFO,
    WYRE_STATUS_INFO,
    RAMP_STATUS_INFO,
    ERROR,
    CLOUD_ERROR,
  }

const HomeBuyCard = ( {
    cardContainer,
    amount,
    incramount,
    percentIncr,
    asset,
    openBottomSheet
//   netBalance,
//   getCurrencyImageByRegion,
//   exchangeRates,
//   CurrencyCode,
} ) => {
//   const currencyKind: CurrencyKind = useCurrencyKind()

//   const prefersBitcoin = useMemo( () => {
//     return currencyKind === CurrencyKind.BITCOIN
//   }, [ currencyKind ] )


  return (
<View
            style={cardContainer}
          >
              <View>
            <Text style={{
                color: Colors.blue,
                fontSize: RFValue( 10 ),
                marginLeft: 2,
                fontFamily: Fonts.FiraSansRegular,
              }}>
              BTC to USD today
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Text>$</Text>
              <Text> {amount}</Text>
              <Text> {incramount}</Text>
            </View> 
            </View>
            <Button
              raised
              title="Buy BTC"
              icon={
                <Image
                  source={require( '../../assets/images/icons/recurring_buy.png' )}
                  style={{
                    width: wp( 8 ),
                    height: wp( 8 ),
                    marginTop: wp( -3 ),
                    marginBottom: wp( -3 ),
                  }}
                />
              }
              buttonStyle={{
                ...ButtonStyles.floatingActionButton,
                borderRadius: 9999,
                alignSelf:'flex-end'
                // paddingHorizontal: widthPercentageToDP( 10 ),
              }}
              titleStyle={{
                ...ButtonStyles.floatingActionButtonText,
                marginLeft: 8,
              }}
              onPress={() =>
                openBottomSheet( BottomSheetKind.TAB_BAR_BUY_MENU )
              }
            />
          </View>
    // <View style={{
    //   ...styles.headerViewContainer, flex: 1
    // }}>
    //       <View
    //         style={{
    //           flexDirection: 'row',
    //           alignItems: 'flex-end',
    //           // marginBottom: wp('3%'),
    //         }}
    //       >
    //         {prefersBitcoin ? (
    //           <Image
    //             style={{
    //               ...CommonStyles.homepageAmountImage,
    //               marginBottom: wp( '1.5%' ),
    //             }}
    //             source={require( '../../assets/images/icons/icon_bitcoin_light.png' )}
    //           />
    //         ) : currencyCode.includes( CurrencyCode ) ? (
    //           setCurrencyCodeToImage(
    //             getCurrencyImageName( CurrencyCode ),
    //             'light'
    //           )
    //         ) : (
    //           <Image
    //             style={{
    //               ...styles.cardBitCoinImage,
    //               marginBottom: wp( '1.5%' ),
    //             }}
    //             source={getCurrencyImageByRegion( CurrencyCode, 'light' )}
    //           />
    //         )}
    //         <Text style={styles.homeHeaderAmountText}>
    //           {prefersBitcoin
    //             ? UsNumberFormat( netBalance )
    //             : exchangeRates && exchangeRates[ CurrencyCode ]
    //               ? (
    //                 ( netBalance / SATOSHIS_IN_BTC ) *
    //                 exchangeRates[ CurrencyCode ].last
    //               ).toFixed( 2 )
    //               : 0}
    //         </Text>
    //       </View>
    // </View>
  )
}

export default HomeBuyCard

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