import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import FiatCurrencies from '../common/FiatCurrencies'
import { RFValue } from 'react-native-responsive-fontsize'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { ScrollView } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrencyCode } from '../store/actions/preferences'
import { translations } from '../common/content/LocContext'

export default function ChangeCurrencyScreen( props ) {
  const [ currencyList ] = useState( FiatCurrencies )
  const CurrencyCode = useSelector( ( state ) => state.preferences.currencyCode )
  const dispatch = useDispatch()
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
  const [ isVisible, setIsVisible ] = useState( false )
  const [ currency, setCurrency ] = useState( {
    code: 'USD',
    symbol: '$',
  } )
  const [ isDisabled, setIsDisabled ] = useState( true )

  useEffect( () => {
    ( async () => {
      const currencyCode = CurrencyCode || 'USD'
      setCurrency(
        currencyList[
          currencyList.findIndex( ( value ) => value.code == currencyCode )
        ],
      )
    } )()
  }, [] )

  const setNewCurrency = async () => {
    dispatch( setCurrencyCode( currency.code ) )
    props.navigation.goBack()
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <Text
        style={{
          fontFamily: Fonts.FiraSansRegular,
          fontSize: RFValue( 11 ),
          color: Colors.textColorGrey,
          marginLeft: wp( '10%' ),
          marginRight: wp( '10%' ),
          marginTop: wp( '5%' ),
          marginBottom: wp( '7%' ),
        }}
      >
        {strings.Selectyourlocalcurrency}
      </Text>
      <TouchableOpacity
        onPress={() => {
          setIsVisible( !isVisible )
          setIsDisabled( false )
        }}
        style={{
          flexDirection: 'row',
          height: wp( '13%' ),
          borderRadius: 10,
          borderWidth: 1,
          borderColor: Colors.borderColor,
          marginLeft: wp( '10%' ),
          marginRight: wp( '10%' ),
        }}
      >
        <View
          style={{
            height: wp( '13%' ),
            width: wp( '15%' ),
            backgroundColor: Colors.borderColor,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.FiraSansMedium,
              fontSize: RFValue( 13 ),
              color: Colors.textColorGrey,
            }}
          >
            {currency ? currency.symbol : '$'}
          </Text>
        </View>
        <View
          style={{
            flex: 1, justifyContent: 'center', height: wp( '13%' )
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue( 13 ),
              color: Colors.textColorGrey,
              marginLeft: wp( '3%' ),
            }}
          >
            {currency ? currency.code : CurrencyCode}
          </Text>
        </View>
        <View
          style={{
            marginLeft: 'auto',
            height: wp( '13%' ),
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={isVisible ? 'ios-arrow-up' : 'ios-arrow-down'}
            color={Colors.textColorGrey}
            size={15}
            style={{
              marginLeft: wp( '3%' ),
              marginRight: wp( '3%' ),
              alignSelf: 'center',
            }}
          />
        </View>
      </TouchableOpacity>
      <View style={{
        position: 'relative', flex: 1
      }}>
        {isVisible && (
          <View
            style={{
              marginTop: wp( '3%' ),
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.borderColor,
              overflow: 'hidden',
              marginLeft: wp( '10%' ),
              marginRight: wp( '10%' ),
            }}
          >
            <ScrollView>
              {currencyList.map( ( item ) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setCurrency( item )
                      setIsVisible( false )
                    }}
                    style={{
                      flexDirection: 'row', height: wp( '13%' )
                    }}
                  >
                    <View
                      style={{
                        height: wp( '13%' ),
                        width: wp( '15%' ),
                        backgroundColor: Colors.borderColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.white,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.FiraSansMedium,
                          fontSize: RFValue( 13 ),
                          color: Colors.textColorGrey,
                        }}
                      >
                        {item.symbol}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        height: wp( '13%' ),
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.borderColor,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.FiraSansRegular,
                          fontSize: RFValue( 13 ),
                          color: Colors.textColorGrey,
                          marginLeft: wp( '3%' ),
                        }}
                      >
                        {item.code}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              } )}
            </ScrollView>
          </View>
        )}
      </View>

      <View>
        <TouchableOpacity
          disabled={isDisabled}
          onPress={() => setNewCurrency()}
          style={{
            backgroundColor: isDisabled ? Colors.lightBlue : Colors.blue,
            width: wp( '35%' ),
            height: wp( '13%' ),
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 30,
            marginRight: 20,
            marginBottom: hp( '3%' ),
          }}
        >
          <Text
            style={{
              fontSize: RFValue( 13 ),
              color: Colors.white,
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            {strings.SaveChanges}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
