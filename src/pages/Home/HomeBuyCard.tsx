import React, { useMemo, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native'
import { Button } from 'react-native-elements'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from './../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import MaterialCurrencyCodeIcon from '../../components/MaterialCurrencyCodeIcon'
import { getCurrencyImageByRegion, getCurrencyImageName } from '../../common/CommonFunctions'

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
    TRUSTED_CONTACT_REQUEST,
    ADD_CONTACT_FROM_ADDRESS_BOOK,
    NOTIFICATIONS_LIST,
    SWAN_STATUS_INFO,
    WYRE_STATUS_INFO,
    RAMP_STATUS_INFO,
    ERROR,
    CLOUD_ERROR,
  }

export const materialIconCurrencyCodes = [
  'BRL',
  'BDT',
  'CNY',
  'JPY',
  'GBP',
  'KRW',
  'KZT',
  'RUB',
  'TRY',
  'INR',
  'ILS',
  'MNT',
  'NGN',
  'PHP',
  'EUR',
  'USD',
]

const HomeBuyCard = ( {
  cardContainer,
  amount,
  incramount,
  percentIncr,
  asset,
  openBottomSheet,
  //   netBalance,
  //   getCurrencyImageByRegion,
  //   exchangeRates,
  currencyCode,
} ) => {
//   const currencyKind: CurrencyKind = useCurrencyKind()
  const fiatCurrencyCode = useCurrencyCode()
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
          // marginLeft: 2,
          fontFamily: Fonts.FiraSansRegular,
          alignSelf: 'flex-start'
        }}>
              BTC to {fiatCurrencyCode} today
        </Text>
        <View style={{
          flexDirection: 'row', marginTop: hp( '1' ), alignSelf: 'flex-start'
        }}>
          {materialIconCurrencyCodes.includes( fiatCurrencyCode ) ? (
          // setCurrencyCodeToImage(
          //   getCurrencyImageName( CurrencyCode ),
          //   'light'
          // )
            <MaterialCurrencyCodeIcon
              currencyCode={fiatCurrencyCode}
              color={Colors.blue}
              size={wp( '3.5%' )}
              style={{
                width: 20,
                // height: 18,
                // resizeMode: 'contain',
                marginTop: hp( 0.3 )
              }}
            />
          ) : currencyCode.includes( currencyCode ) && (
            <Text style={{
              marginTop: hp( 0.5 )
            }}>
              {setCurrencyCodeToImage( getCurrencyImageName( currencyCode ), Colors.blue )}
            </Text>
          )}
          <Text>{amount}</Text>
          <Text>{incramount}</Text>
        </View>
      </View>
      <Button
        raised
        title="Buy BTC"
        icon={
          <Image
            source={require( '../../assets/images/icons/recurring_buy.png' )}
            style={{
              width: wp( 6 ),
              height: wp( 6 ),
              resizeMode: 'contain'
            }}
          />
        }
        buttonStyle={{
          ...ButtonStyles.floatingActionButton,
          borderRadius: wp( 3 ),
          // alignSelf:'flex-end',
          // minHeight: hp( 4 ),
          paddingVertical: 12,
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
  )
}
const styles = StyleSheet.create( {
  cardBitCoinImage: {
    width: wp( '3.5%' ),
    height: wp( '3.5%' ),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp( '0.7%' ),
  },
} )

export default HomeBuyCard
