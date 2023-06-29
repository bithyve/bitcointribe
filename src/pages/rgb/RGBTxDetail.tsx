import React, { useContext, useState, useEffect, useMemo } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
  Image,
  FlatList,
  ActivityIndicator
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fonts from '../../common/Fonts'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import { LocalizationContext } from '../../common/content/LocContext'
import { useDispatch } from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import config from '../../bitcoin/HexaConfig'
import NetworkKind from '../../common/data/enums/NetworkKind'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'
import { fetchExchangeRates, fetchFeeRates } from '../../store/actions/accounts'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useAccountShellFromNavigation from '../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import ButtonBlue from '../../components/ButtonBlue'
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
import RGBServices from '../../services/RGBServices'
import moment from 'moment'

export default function RGBTxDetail( props ) {
  const dispatch = useDispatch()
  const { translations } = useContext( LocalizationContext )
  const accountStr = translations[ 'accounts' ]
  const asset = props.navigation.getParam( 'asset' )
  const accountsState = useAccountsState()
  const { averageTxFees, exchangeRates } = accountsState
  const accountShell = useAccountShellFromNavigation( props.navigation )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const account = useAccountByAccountShell( accountShell )
  const { rgbConfig } = account
  const [ loading, setLoading ] = useState( true )
  const [ transactionData, setTransactionData ] = useState( [ ] )

  useEffect( () => {
    getTransfers()
  }, [] )

  const getTransfers = async () => {
    try {
      const txns = await RGBServices.getRgbAssetTransactions( rgbConfig.mnemonic, rgbConfig.xpub, asset.assetId )
      if ( txns ) {
        setTransactionData( txns )
        setLoading( false )
      } else {
        props.navigation.goBack()
      }
    } catch ( error ) {
      console.log( error )
      props.navigation.goBack()
    }
  }



  const isShowingDonationButton = useMemo( () => {
    return primarySubAccount?.kind === SubAccountKind.DONATION_ACCOUNT
  }, [ primarySubAccount?.kind ] )

  const isTestAccount = false
  const currencyKind = useCurrencyKind()
  const bitcoinUnit = BitcoinUnit.SATS
  const balance = 5000
  const bitcoinIconColor = 'gray'
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
    ) {
      dispatch( fetchFeeRates() )
      dispatch( fetchExchangeRates() )
    }
  }, [] )

  const renderFooter = () => {
    return (
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

          {isShowingDonationButton && (
            <View style={{
              alignItems: 'center',
              marginTop: 36,
            }}>
              <ButtonBlue
                buttonText={'Donation Webpage'}
                handleButtonPress={() => showWebView( true )}
              />
            </View>
          )}
        </View>
      </View>
    )
  }

  const onItemClick = ( item ) => {
    props.navigation.navigate( 'AssetTransferDetails', {
      item, asset
    } )
  }

  const renderAmountCurrency = ( balance ) => {
    return (
      <View style={styles.currencyContainer}>
        <View style={{
          marginRight: 4,
          marginLeft: ( prefersBitcoin || isTestAccount ) ? -wp( 1 ) : [ 'SEK', 'BRL', 'DKK', 'ISK', 'KRW', 'PLN', 'SEK' ].includes( fiatCurrencyCode ) ? 0 : -wp( 1 )
        }}>
        </View>
        <Text
          numberOfLines={1}
          style={styles.amountText}
        >
          {balance}
        </Text>
      </View>
    )
  }

  const renderItem = ( { item } ) => {
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => onItemClick( item )}>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{item.status}</Text>
          <Text style={styles.itemDesc}>{moment.unix( item.createdAt ).format( 'DD/MM/YY • hh:MMa' )}</Text>
        </View>
        <View style={styles.currencyContainer}>
          <Text
            numberOfLines={1}
            style={[ styles.amountText, {
              color: item.kind === 'receive' ? 'green' : 'tomato'
            } ]}
          >
            {item.amount}
          </Text>
        </View>
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
      <TouchableOpacity onPress={() => props.navigation.navigate( 'AssetMetaData', {
        accountShell,
        asset
      } )}>
        <Text style={styles.headerTitleText}>{asset.name}</Text>
        <Text style={styles.headerSubtitle}>{asset.ticker}</Text>
      </TouchableOpacity>
      <View style={{
        flex: 1,
      }}>
        <Text style={styles.balanceText}>Total Balance</Text>
        <View style={{
          alignSelf: 'center', marginTop: 5
        }}>
          {renderAmountCurrency( asset.futureBalance )}
        </View>
        <Text style={styles.assetText}>Asset ID</Text>
        <CopyThisText
          backgroundColor={Colors.white}
          text={asset.assetId}
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
        {
          loading ? <ActivityIndicator style={{
            height: '40%'
          }} /> :
            <FlatList
              data={transactionData}
              renderItem={renderItem}
              keyExtractor={( item, index ) => index.toString()}
            />
        }
        {renderFooter()}

      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.Regular,
    textAlign: 'center'
  },
  headerSubtitle: {
    color: 'gray',
    fontSize: RFValue( 14 ),
    fontFamily: Fonts.Regular,
    textAlign: 'center'
  },
  viewSectionContainer: {
    marginBottom: 10,
  },
  footerSection: {
    paddingVertical: 15,
  },
  amountTextStyle: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 17 ),
    color: 'gray'
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
    alignItems: 'center',
  },
  itemContainer: {
    marginHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
    flexDirection: 'row'
  },
  itemImage: {
    width: 35, height: 35, borderRadius: 20, backgroundColor: 'gray'
  },
  textContainer: {
    flex: 1, marginStart: 10
  },
  itemTitle: {
    fontFamily: Fonts.Regular, fontSize: RFValue( 13 ), textTransform: 'capitalize'
  },
  itemDesc: {
    color: Colors.textColorGrey, fontFamily: Fonts.Regular,
    fontSize: RFValue( 10 ), marginTop: 2
  },
  balanceText: {
    fontSize: 18, fontFamily: Fonts.Medium,
    color: Colors.textColorGrey, marginTop: 40,
    alignSelf: 'center'
  },
  assetText: {
    fontSize: 14, fontFamily: Fonts.Regular,
    color: Colors.textColorGrey,
    marginTop: 20,
    marginStart: 40,
    marginBottom: -20
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
