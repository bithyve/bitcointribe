import React, { useContext, useState, createRef, useEffect, useCallback, useMemo } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
  Image,
  FlatList,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fonts from '../../common/Fonts'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import { LocalizationContext } from '../../common/content/LocContext'
import { useDispatch, useSelector } from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import config from '../../bitcoin/HexaConfig'
import NetworkKind from '../../common/data/enums/NetworkKind'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'
import { fetchExchangeRates, fetchFeeRates } from '../../store/actions/accounts'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useAccountShellFromNavigation from '../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import useAccountByAccountShell from '../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import BitcoinUnit, { displayNameForBitcoinUnit } from '../../common/data/enums/BitcoinUnit'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../../components/MaterialCurrencyCodeIcon'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { UsNumberFormat } from '../../common/utilities'
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import { getCurrencyImageByRegion } from '../../common/CommonFunctions'
import CopyThisText from '../../components/CopyThisText'

export default function RGBTxDetail( props ) {
  const dispatch = useDispatch()
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'login' ]
  const common = translations[ 'common' ]
  const accountStr  = translations[ 'accounts' ]
  const accountShellID = useMemo( () => {
    return props.navigation.getParam( 'accountShellID' )
  }, [ props.navigation ] )

  const accountsState = useAccountsState()
  const { averageTxFees, exchangeRates } = accountsState
  const accountShell = useAccountShellFromNavigation( props.navigation )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const [ webView, showWebView ] = useState( false )
  const account = useAccountByAccountShell( accountShell )

  const [ transactionData, setTransactionData ] =useState( [ {
    'a':'a'
  }, {
    'a':'a'
  }, {
    'a':'a'
  } ] )
  const [ paymentURI, setPaymentURI ] = useState( null )
  const [ receivingAddress, setReceivingAddress ] = useState( null )
  const isTestAccount = false
  const currencyKind = useCurrencyKind()
  const bitcoinUnit = BitcoinUnit.SATS
  const balance = 5000
  const  bitcoinIconColor = 'gray'
  const fiatCurrencyCode = useCurrencyCode()
  const textColor = Colors.currencyGray

  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

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

  const bitcoinIconSource = useMemo( () => {
    switch ( bitcoinIconColor ) {
        case 'dark':
          return require( '../../assets/images/currencySymbols/icon_bitcoin_dark.png' )
        case 'light':
          return require( '../../assets/images/currencySymbols/icon_bitcoin_light.png' )
        case 'gray':
          return require( '../../assets/images/currencySymbols/icon_bitcoin_gray.png' )
        default:
          return require( '../../assets/images/currencySymbols/icon_bitcoin_gray.png' )
    }
  }, [ bitcoinIconColor ] )

  useEffect( () => {
    // missing fee & exchange rates patch(restore & upgrade)
    if (
      !averageTxFees ||
      !Object.keys( averageTxFees ).length ||
      !exchangeRates ||
      !Object.keys( exchangeRates ).length
    ){
      dispatch( fetchFeeRates() )
      dispatch( fetchExchangeRates() )
    }
  }, [] )

  const renderFooter = () => {
    return(
      <View style={styles.viewSectionContainer}>
        <View style={styles.footerSection}>
          <SendAndReceiveButtonsFooter
            onSendPressed={() => {
              // onSendBittonPress()
            }}
            onReceivePressed={() => {
              props.navigation.navigate( 'RGBReceive', {
                accountShell,
              } )
            }}
            averageTxFees={averageTxFees}
            network={
              config.APP_STAGE === 'dev' ||
                      primarySubAccount?.sourceKind === SourceAccountKind.TEST_ACCOUNT
                ? NetworkKind.TESTNET
                : NetworkKind.MAINNET
            }
            isTestAccount={primarySubAccount?.sourceKind === SourceAccountKind.TEST_ACCOUNT}
          />
        </View>

      </View>
    )
  }

  const BalanceCurrencyIcon = () => {
    if ( prefersBitcoin || isTestAccount ) {
      return <Image style={[
        styles.currencyImage, {
          marginLeft: wp( 1 )
        }
      ]} source={bitcoinIconSource} />
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
          style={styles.currencyImage}
          source={getCurrencyImageByRegion( fiatCurrencyCode, bitcoinIconColor )}
        />
      )
    }
  }

  const onItemClick = () => {

  }

  const renderAmountCurrency = ( balance ) => {
    return(
      <View style={styles.currencyContainer}>
        <View style={{
          marginRight: 4,
          marginLeft: ( prefersBitcoin || isTestAccount ) ? -wp( 1 ) : [ 'SEK', 'BRL', 'DKK', 'ISK', 'KRW', 'PLN', 'SEK' ].includes( fiatCurrencyCode  ) ? 0 : -wp( 1 )
        }}>
          <BalanceCurrencyIcon />
        </View>

        <Text
          numberOfLines={1}
          style={styles.amountText}
        >
          {balance}
        </Text>
        <Text style={[ styles.unitTextStyles, {
        } ]}>{`${formattedUnitText}`}</Text>
      </View>
    )
  }

  const renderItem = ( { item, index } ) => {
    return(
      <TouchableOpacity style={styles.itemContainer} onPress={() =>onItemClick()}>
        <Image style={styles.itemImage} source={item?.image}/>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>SAGA</Text>
          <Text style={styles.itemDesc}>Lorem Ipsum</Text>
        </View>
        {renderAmountCurrency( formattedBalanceText )}
      </TouchableOpacity>
    )
  }

  const onViewMorePressed = () => {

  }

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitleText}>Celebrimbore Test</Text>
      <View style={{
        flex: 1,
      }}>
        <Text style={styles.balanceText}>Total Balance</Text>
        <View style={{
          alignSelf:'center', marginTop: 5
        }}>
          {renderAmountCurrency( '8000' )}
        </View>
        <Text style={styles.assetText}>Asset id</Text>
        <CopyThisText
          backgroundColor={Colors.white}
          text={paymentURI ? paymentURI : receivingAddress}
        />

        <View style={styles.viewMoreLinkRow}>
          <Text style={styles.headerDateText}>{accountStr.RecentTransactions}</Text>

          <TouchableOpacity
            onPress={onViewMorePressed}
          >
            <LinearGradient
              start={{
                x: 0, y: 0
              }} end={{
                x: 1, y: 0
              }}
              colors={[ Colors.skyBlue, Colors.darkBlue ]}
              style={styles.viewMoreWrapper}
            >
              <Text style={styles.headerTouchableText}>
                {accountStr.ViewMore}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <FlatList
          // contentContainerStyle={{
          //   flex:1, backgroundColor:'red'
          // }}
          data={ transactionData}
          renderItem={renderItem}
          keyExtractor={( item, index ) => index.toString()}
        />
        {renderFooter()}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 20 ),
    marginLeft: 20,
    // marginTop: hp( '10%' ),
    fontFamily: Fonts.Regular,
  },
  viewSectionContainer: {
    marginBottom: 10,
  },
  footerSection: {
    paddingVertical: 15,
  },
  scrollViewContainer: {
    paddingTop: 10,
    // height: '100%',
    paddingHorizontal: 0,
    backgroundColor: Colors.backgroundColor,
    // backgroundColor: 'red',
  },
  tabContainer:{
    height: 50, borderRadius: 8, backgroundColor:Colors.white,
    flexDirection:'row', marginHorizontal:20,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 2, height: 2
    },
  },
  fungibleContainer:{
    flex:1, justifyContent:'center', alignItems:'center'
  },
  fungibleInnerContainer:{
    borderRadius: 8, paddingHorizontal: 15, paddingVertical: 5
  },
  fungibleText:{
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 14 )
  },
  amountTextStyle: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 17 ),
    color:'gray'
  },
  amountText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 14.5 ),
    marginRight: wp( 1 ),
    // alignItems: 'baseline',
    // width:wp( 25 )
    color: Colors.textColorGrey
  },
  bitcoinImage: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  currencyImage: {
    width: wp( 3 ),
    height: wp( 4 ),
    resizeMode: 'contain',
    marginTop: wp( 0.3 )
  },
  unitTextStyles: {
    fontSize: RFValue( 11 ),
    color: Colors.currencyGray,
    fontFamily: Fonts.Regular,
  },
  currencyContainer: {
    flexDirection: 'row',
    // alignItems: 'baseline',
    alignItems: 'center',
  },
  itemContainer: {
    // shadowColor: Colors.shadowBlue,
    // shadowOpacity: 1,
    // shadowOffset: {
    //   width: 2, height: 2
    // },
    // backgroundColor: Colors.white,
    // borderRadius: 8,
    marginHorizontal: 20,
    // paddingHorizontal: 8,
    paddingVertical: 10,
    marginTop: 20,
    flexDirection:'row'
  },
  itemImage:{
    width: 35, height: 35, borderRadius: 20, backgroundColor:'gray'
  },
  textContainer:{
    flex:1, marginStart: 10
  },
  itemTitle:{
    color: Colors.black, fontFamily:Fonts.Medium, fontSize: RFValue( 13 )
  },
  itemDesc:{
    color: Colors.textColorGrey, fontFamily:Fonts.Regular,
    fontSize: RFValue( 10 ), marginTop: 2
  },
  balanceText:{
    fontSize: 18, fontFamily: Fonts.Medium,
    color: Colors.textColorGrey, marginTop: 40,
    alignSelf:'center'
  },
  assetText:{
    fontSize: 14, fontFamily: Fonts.Regular,
    color: Colors.textColorGrey, marginTop: 40,
    marginStart: 40,
  },
  viewMoreLinkRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 20
  },

  headerDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
  },

  headerTouchableText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Medium,
  },
  viewMoreWrapper: {
    height: 26,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    borderRadius: 5
  }
} )
