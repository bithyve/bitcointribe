import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AccountType } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'
import DashedContainerSmall from './DashedContainerSmall'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import {  useSelector } from 'react-redux'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import CurrencyKind from '../../common/data/enums/CurrencyKind'

export type Props = {
  sourcePrimarySubAccount: any;
  sourceAccountHeadlineText: any;
  onAccountChange: () => void;
  getTheme: () => void;
  onCancel: () => void;
  spendableBalance: string;
  formattedUnitText: string;
  renderButton: ( text, isDisabled ) => void;
  giftAmount: string
};


export default function AccountSelected( { giftAmount, onAccountChange, sourcePrimarySubAccount, sourceAccountHeadlineText, spendableBalance, formattedUnitText, getTheme, renderButton, onCancel } ) {
  const exchangeRates = useSelector(
    ( state ) => state.accounts.exchangeRates
  )
  const currencyKind = useSelector(
    ( state ) => state.preferences.giftCurrencyKind,
  )
  const currencyCode = useCurrencyCode()

  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  const getAmt = ( sats ) => {
    if( prefersBitcoin ) {
      return numberWithCommas( sats )
    } else {
      if( exchangeRates && exchangeRates[ currencyCode ] ) {
        return ( exchangeRates[ currencyCode ].last /SATOSHIS_IN_BTC * sats ).toFixed( 2 )
      } else {
        return numberWithCommas( sats )
      }
    }
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {onCancel() }}
        style={{
          width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
          alignSelf: 'flex-end',
          backgroundColor: Colors.CLOSE_ICON_COLOR, alignItems: 'center', justifyContent: 'center',
          marginTop: wp( 3 ), marginRight: wp( 3 )
        }}
      >
        <FontAwesome name="close" color={Colors.white} size={19}/>
      </TouchableOpacity>
      {/* <View> */}
      <View style={{
        marginLeft: wp( 6 ), marginBottom: hp( 2 )
      }}>
        <Text style={styles.modalTitleText}>Confirm adding gift</Text>
        <Text style={{
          ...styles.modalInfoText,
        }}>Choose the account where you'd like to stack the sats</Text>
      </View>
      <DashedContainerSmall
        image={<GiftCard />}
        theme={getTheme()}
        amt={getAmt( giftAmount )}
        currency={prefersBitcoin ? ' sats' : currencyCode}
      />
      <TouchableOpacity
        onPress={() => { onAccountChange()}}
        style={{
          width: '90%',
          // height: '54%',
          backgroundColor: Colors.white,
          // shadowOpacity: 0.06,
          // shadowOffset: {
          //   width: 10, height: 10
          // },
          // shadowRadius: 10,
          // elevation: 2,
          alignSelf: 'center',
          borderRadius: wp( 2 ),
          marginVertical: hp( 2 ),
          paddingVertical: hp( 2 ),
          paddingHorizontal: wp( 4 ),

          flexDirection: 'row',
          alignItems: 'center'
        }}>
        {getAvatarForSubAccount( sourcePrimarySubAccount, false, true )}
        <View style={{
          marginHorizontal: wp( 3 )
        }}>
          <Text style={{
            color: Colors.gray4,
            fontSize: RFValue( 10 ),
            fontFamily: Fonts.Regular,
          }}>
              Bitcoin will be transferred to
          </Text>
          <Text
            style={{
              color: Colors.black,
              fontSize: RFValue( 14 ),
              fontFamily: Fonts.Regular,
              marginVertical: hp( 0.3 )
            }}
          >
            {sourceAccountHeadlineText}
          </Text>
          <Text style={styles.availableToSpendText}>
              Balance
            <Text style={styles.balanceText}> {spendableBalance} {formattedUnitText}</Text>
          </Text>

        </View>
      </TouchableOpacity>
      <View style={{
        flexDirection: 'row', alignItems: 'center', marginHorizontal: wp( 6 ), marginTop: hp( 3 )
      }}>
        {renderButton( 'Confirm' )}
        <View style={styles.statusIndicatorView}>
          <View style={styles.statusIndicatorInactiveView} />
          {/* <View style={styles.statusIndicatorInactiveView} /> */}
          <View style={styles.statusIndicatorActiveView} />
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create( {
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Italic,
    lineHeight: 15,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Italic,
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '1%' ),
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  buttonView: {
    height: wp( '14%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    marginLeft: wp( 6 ),
    marginTop: hp( 1 )
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular,
  },
  modalInfoText: {
    // marginTop: hp( '3%' ),
    marginTop: hp( 0.5 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    marginRight: wp( 12 ),
    letterSpacing: 0.6
  },
} )
