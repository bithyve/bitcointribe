import moment from 'moment'
import React, { useContext, useMemo } from 'react'
import {
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { useSelector } from 'react-redux'
import semver from 'semver'
import Colors from '../../common/Colors'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { LocalizationContext } from '../../common/content/LocContext'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import Fonts from '../../common/Fonts'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'

const DashedLargeContainer = ( props ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const currencyKind = useSelector(
    ( state ) => state.preferences.giftCurrencyKind,
  )
  const currencyCode = useCurrencyCode()
  const exchangeRates = useSelector(
    ( state ) => state.accounts.exchangeRates
  )
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

  const getText = text => {
    try {
      if( semver.gte( props.version, '2.0.66' ) ){
        return Buffer.from( text, 'hex' ).toString( 'utf-8' )
      } else {
        return text.replace( /%20/g, ' ' )
      }

    } catch ( error ) {
      return text.replace( /%20/g, ' ' )
    }
  }

  return(
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => props.onPress ? props.onPress() : () => {}}
      key={props.key}
      style={{
        width: '90%',
        backgroundColor: Colors.gray7,
        // shadowOpacity: 0.06,
        // shadowOffset: {
        //   width: 10, height: 10
        // },
        // shadowRadius: 10,
        // elevation: 2,
        alignSelf: 'center',
        borderRadius: wp( 2 ),
        marginTop: hp( 1 ),
        marginBottom: hp( 1 ),
        paddingVertical: wp( 1 ),
        paddingHorizontal: wp( 1 ),
        borderColor: props.theme ? props.theme?.color : Colors.lightBlue,
        borderWidth: 1,
      }}>
      <View style={{
        backgroundColor: Colors.gray7,
        borderRadius: wp( 2 ),
        paddingVertical: hp( 2 ),
        paddingHorizontal: wp( 4 ),
        borderColor: props.theme ? props.theme?.color : Colors.lightBlue,
        borderWidth: 1,
        borderStyle: 'dashed',
        padding: wp( 3 )
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <View>
            <Text style={{
              color: Colors.black,
              fontSize: RFValue( 14 ),
              fontFamily: Fonts.Regular,
              // fontWeight: '700',
              letterSpacing: 0.01,
              lineHeight: 18
            }}>
              {props.titleText}
            </Text>
            <Text style={{
              color: Colors.lightTextColor,
              fontSize: RFValue( 11 ),
              letterSpacing: 0.55,
              lineHeight: RFValue( 15 ),
              fontFamily: Fonts.Regular,
              marginRight: wp( 3 ),
            }}>
              {'You have received a bitcoin gift from '}
              <Text style={{
                color: Colors.blue,
                fontSize: RFValue( 11 ),
                fontFamily: Fonts.Italic,
              }}>
                {props.subText}
              </Text>
              {!props.isAccept ? '\n\nScan the QR and receive bitcoin in your Bitcoin Tribe bitcoin wallet.': '\n\nYou can either add the sats to an Account or retain it to forward to your loved ones.'}
            </Text>
          </View>
          {props.date &&
          <Text style={{
            color: Colors.lightTextColor,
            fontSize: RFValue( 10 ),
            letterSpacing: 0.12,
            lineHeight: RFValue( 18 ),
            fontFamily: Fonts.Regular,

          }}>
            {moment( props.date ).format( 'lll' )}
          </Text>
          }
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: hp( 1 )
        }}>

          <View style={{
            flex: 1
          }}>
            <Text style={{
              color: Colors.lightTextColor,
              fontSize: RFValue( 12 ),
              letterSpacing: 0.12,
              lineHeight: 18,
              fontFamily: Fonts.Italic,
            }}>
              {props.extraText ? props.isSend ? props.extraText.replace( /%20/g, ' ' ): getText( props.extraText ) : ''}
            </Text>
            <Text style={{
              color: Colors.blue,
              fontSize: RFValue( 24 ),
              fontFamily: Fonts.Regular,
              marginVertical: hp( 1 )
            }}>
              {getAmt( props.amt )}
              <Text style={{
                color: Colors.lightTextColor,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.Regular
              }}> {prefersBitcoin ? ' sats' : currencyCode}
              </Text>
            </Text>
          </View>
          <View style={{
            alignSelf: 'flex-end'
          }}>
            {props.theme ? props.theme?.avatar : props.image}
          </View>

        </View>
        {props.renderQrOrLink &&
        <View style={{
          height: 2, borderWidth: 1, borderColor: Colors.lightBlue, borderStyle: 'dotted', marginTop: hp( 2 )
        }}/>
        }
        {props.renderQrOrLink && props.renderQrOrLink()}

      </View>
    </TouchableOpacity>
  )
}

export default DashedLargeContainer

