/* eslint-disable react/jsx-key */
import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  StyleSheet
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
import { translations, LocalizationContext } from '../common/content/LocContext'
import ChangeCurrency from '../assets/images/icon_currency.svg'
import IconLanguage from '../assets/images/icon_language.svg'
import Languages from '../common/content/availableLanguages'

const styles = StyleSheet.create( {
  container: {
    flexGrow: 1,
    paddingHorizontal:  wp( '5%' ),
    backgroundColor: Colors.background,
  },
  textHeading: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 24 ),
    color: Colors.blue,
    marginBottom: wp( '5%' ),
    marginTop: wp( '10%' ),
  },
  textTitle: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 15 ),
    color: Colors.blue,
  },
  textSubtitle: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
    color: Colors.textColorGrey,
  },
  row: {
    flexDirection: 'row',
    marginBottom: wp( '2%' ),
    marginTop: wp( '8%' ),
  },
  containerItem: {
    marginHorizontal: wp( '5%' ),
  },
  btn:{
    flexDirection: 'row',
    height: wp( '13%' ),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  textCurrency: {
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 18 ),
    color: Colors.textColorGrey,
  },
  icArrow: {
    marginLeft: wp( '3%' ),
    marginRight: wp( '3%' ),
    alignSelf: 'center',
  },
  textValue: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    marginLeft: wp( '3%' ),
  },
  textHelpUs: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 16 ),
    color: Colors.blue,
    marginLeft: wp( '3%' ),
  },
  textHelpUsSub: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    marginLeft: wp( '3%' ),
    marginTop: wp( '1%' ),
  }
} )


export default function ChangeCurrencyScreen( props ) {
  const [ currencyList ] = useState( FiatCurrencies )
  const CurrencyCode = useSelector( ( state ) => state.preferences.currencyCode )
  const dispatch = useDispatch()
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
  const {
    appLanguage,
    setAppLanguage,
  } = useContext( LocalizationContext )
  const [ isVisible, setIsVisible ] = useState( false )
  //const [ showCurrencies, setShowCurrencies ] = useState( false )
  const [ showLanguages, setShowLanguages ] = useState( false )
  const [ selectedLanguage, setSelectedLanguage ] = useState( Languages.find( lang => lang.iso === appLanguage ) )
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

  const setNewCurrency = () => {
    dispatch( setCurrencyCode( currency.code ) )
    props.navigation.goBack()
  }

  const MenuHeading = ( { title, subtitle, Icon } ) => {
    return (
      <View style={styles.row}>
        <Icon />
        <View style={styles.containerItem}>
          <Text style={styles.textTitle}>{title}</Text>
          <Text
            style={styles.textSubtitle}
          >
            {subtitle}
          </Text>
        </View>
      </View>
    )
  }

  const Menu = ( { label, value, onPress, arrow } ) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.btn}
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
            style={styles.textCurrency}
          >
            {label}
          </Text>
        </View>
        <View
          style={{
            flex: 1, justifyContent: 'center', height: wp( '13%' )
          }}
        >
          <Text
            style={styles.textValue}
          >
            {value}
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
            name={arrow ? 'chevron-up' : 'chevron-down'}
            color={Colors.textColorGrey}
            size={18}
            style={styles.icArrow}
          />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <ScrollView contentContainerStyle={styles.container} overScrollMode="never" showsVerticalScrollIndicator={false}>
        <Text style={styles.textHeading}>{strings.ChangeCurrency}</Text>
        <MenuHeading
          title={strings.AlternateCurrency}
          subtitle={strings.Selectyourlocalcurrency}
          Icon={()=> <ChangeCurrency width={40 } height={40}/>}
        />
        <Menu
          onPress={()=> {
            setIsVisible( !isVisible )
            setIsDisabled( false )
            setShowLanguages( false )
          }}
          arrow={isVisible}
          label={currency ? currency.symbol : '$'}
          value={currency ? currency.code : CurrencyCode}
        />
        <View style={{
          position: 'relative',
        }}>
          {isVisible && (
            <View
              style={{
                marginTop: wp( '3%' ),
                borderRadius: 10,
                borderWidth: 1,
                borderColor: Colors.borderColor,
                overflow: 'hidden',
                height: wp( '60%' )
              }}
            >
              <ScrollView>
                {currencyList.map( ( item ) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setCurrency( item )
                        setIsVisible( false )
                        dispatch( setCurrencyCode( item.code ) )
                      }}
                      style={{
                        flexDirection: 'row', height: wp( '13%' )
                      }}
                    >
                      <View
                        style={{
                          height: wp( '13%' ),
                          width: wp( '15%' ),
                          backgroundColor: Colors.white,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderBottomWidth: 1,
                          borderBottomColor: Colors.borderColor,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.Medium,
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
                          backgroundColor: Colors.white,

                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.Regular,
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

        <MenuHeading
          title={strings.LanguageSettings}
          subtitle={strings.Chooseyourlanguage}
          Icon={()=> <IconLanguage width={40 } height={40}/>}
        />
        <Menu
          onPress={()=> {
            setShowLanguages( !showLanguages )
            setIsDisabled( false )
          }}
          arrow={showLanguages}
          label={selectedLanguage.flag}
          value={`${selectedLanguage.country_code.toUpperCase()}- ${selectedLanguage.displayTitle}`}
        />
        {showLanguages && (
          <View
            style={{
              marginTop: wp( '3%' ),
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.borderColor,
              overflow: 'hidden',
              height: wp( '60%' )
            }}
          >
            <ScrollView>
              {Languages.map( ( item ) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setAppLanguage( item.iso )
                      setShowLanguages( false )
                      setIsVisible( false )
                      setSelectedLanguage( Languages.find( lang => lang.iso === item.iso ) )
                    }}
                    style={{
                      flexDirection: 'row', height: wp( '13%' )
                    }}
                  >
                    <View
                      style={{
                        height: wp( '13%' ),
                        width: wp( '15%' ),
                        backgroundColor: Colors.white,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.borderColor,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: RFValue( 22 ),
                          color: 'black',
                        }}
                      >
                        {item.flag}
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
                          fontFamily: Fonts.Regular,
                          fontSize: RFValue( 13 ),
                          color: Colors.textColorGrey,
                          marginLeft: wp( '3%' ),
                        }}
                      >
                        <Text style={{
                          textTransform: 'uppercase'
                        }}>
                          {item.country_code}
                        </Text>
                        <Text>{`- ${item.displayTitle}`}</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              } )}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity
          onPress={()=> Linking.openURL( 'https://crowdin.com/project/hexa-wallet' )
          }
          activeOpacity={0.6}
          style={[ {
            marginTop: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: Colors.borderColor,
            paddingVertical: 5,
            flexDirection: 'row'
          } ]}
        >
          <View style={{
            flex: 1
          }}>
            <Text
              style={styles.textHelpUs}
            >
              {strings.HelpUstranslate}
            </Text>
            <Text
              style={styles.textHelpUsSub}
            >
              {strings.HelpUstranslateSub}
            </Text>
          </View>
          <Ionicons
            name={'chevron-forward'}
            color={Colors.textColorGrey}
            size={22}
            style={styles.icArrow}
          />
        </TouchableOpacity>

      </ScrollView>


      {/* <View>
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
              fontFamily: Fonts.Medium,
            }}
          >
            {strings.SaveChanges}
          </Text>
        </TouchableOpacity>
      </View>
     */}
    </SafeAreaView>
  )
}
