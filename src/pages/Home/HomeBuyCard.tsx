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
          // marginLeft: 2,
          fontFamily: Fonts.FiraSansRegular,
          alignSelf: 'flex-start'
        }}>
              BTC to USD today
        </Text>
        <View style={{
          flexDirection: 'row', marginTop: hp( '1' ), alignSelf: 'flex-start'
        }}>
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
              width: wp( 5.7 ),
              height: wp( 5.7 ),
              resizeMode: 'contain'
            }}
          />
        }
        buttonStyle={{
          ...ButtonStyles.floatingActionButton,
          borderRadius: wp( 10 ),
          alignSelf:'flex-end',
          // minHeight: hp( 4 )
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

export default HomeBuyCard
