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
  sections,
  SectionList,
  RefreshControl,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
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
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import config from '../../bitcoin/HexaConfig'
import NetworkKind from '../../common/data/enums/NetworkKind'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'
import { fetchExchangeRates, fetchFeeRates, refreshAccountShells } from '../../store/actions/accounts'
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
import TransactionsPreviewSection from '../Accounts/Details/TransactionsPreviewSection'
import AccountDetailsCard from '../../components/account-details/AccountDetailsCard'
import AccountShell from '../../common/data/models/AccountShell'
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces'

enum SectionKind {
  TOP_TABS,
  ACCOUNT_CARD,
  TRANSACTIONS_LIST_PREVIEW,
  SEND_AND_RECEIVE_FOOTER,
}
const sectionListItemKeyExtractor = ( index ) => String( index )

export default function RGBWalletDetail( props ) {
  const dispatch = useDispatch()
  const swanDeepLinkContent = props.navigation.getParam( 'swanDeepLinkContent' )
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'login' ]
  const common = translations[ 'common' ]
  const accountShellID = useMemo( () => {
    return props.navigation.getParam( 'accountShellID' )
  }, [ props.navigation ] )
  const isRefreshing = useMemo( () => {
    return ( accountShell.syncStatus===SyncStatus.IN_PROGRESS )
  }, [ accountShell.syncStatus ] )

  const accountsState = useAccountsState()
  const { averageTxFees, exchangeRates } = accountsState
  const accountShell = useAccountShellFromNavigation( props.navigation )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const [ webView, showWebView ] = useState( false )
  const account = useAccountByAccountShell( accountShell )

  const [ selectedTab, setSelectedTab ] = useState( 'fungible' )
  const [ fungibleData, setFungibleData ] =useState( [ {
    'a':'a'
  }, {
    'a':'a'
  }, {
    'a':'a'
  } ] )
  const [ collectibleData, setCollectibleData ] =useState( [] )
  const [ showMore, setShowMore ] = useState( false )

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
  const renderTabs = () => {
    return(
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.fungibleContainer} onPress={()=>{
          // if( selectedTab == 'f' )
          setSelectedTab( 'fungible' )
        }
        } activeOpacity={1}>
          <View style={[ styles.fungibleInnerContainer, {
            backgroundColor: selectedTab == 'fungible'? Colors.CLOSE_ICON_COLOR:null,
          } ]}>
            <Text style={[ styles.fungibleText, {
              color: selectedTab == 'fungible' ?  Colors.white : Colors.CLOSE_ICON_COLOR,
            } ]}>FUNGIBLE</Text>
          </View>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.fungibleContainer} onPress={()=>{
          // if( selectedTab )
          setSelectedTab( 'collectible' )
        }} activeOpacity={1}>
          <View style={[ styles.fungibleInnerContainer, {
            backgroundColor:selectedTab == 'collectible'? Colors.CLOSE_ICON_COLOR:null,
          } ]}>
            <Text style={[ styles.fungibleText, {
              color: selectedTab == 'collectible' ?  Colors.white : Colors.CLOSE_ICON_COLOR,
            } ]}>COLLECTIBLE</Text>
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.fungibleContainer} onPress={()=>{
          // if( selectedTab )
          setSelectedTab( 'Bitcoin' )
        }} activeOpacity={1}>
          <View style={[ styles.fungibleInnerContainer, {
            backgroundColor: selectedTab == 'Bitcoin' ? Colors.CLOSE_ICON_COLOR:null,
          } ]}>
            <Text style={[ styles.fungibleText, {
              color: selectedTab == 'Bitcoin' ?  Colors.white : Colors.CLOSE_ICON_COLOR,
            } ]}>BITCOIN</Text>
          </View>
        </TouchableOpacity>
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
  function navigateToTransactionsList() {
    props.navigation.navigate( 'TransactionsList', {
      accountShellID,
    } )
  }
  function handleTransactionSelection( transaction: TransactionDescribing ) {
    props.navigation.navigate( 'TransactionDetails', {
      transaction,
      accountShellID: accountShell.id,
    } )
  }
  function navigateToAccountSettings() {
    props.navigation.navigate( 'SubAccountSettings', {
      accountShellID,
    } )
  }
  function performRefreshOnPullDown() {
    dispatch( refreshAccountShells( [ accountShell ], {
      hardRefresh: true,
    } ) )
  }

  const onItemClick = () => {
    props.navigation.navigate( 'RGBTxDetail', {
      accountShellID
    } )
  }
  const sections = useMemo( () => {
    return [
      {
        kind: SectionKind.ACCOUNT_CARD,
        data: [ null ],
        renderItem: () => {
          return (
            <View style={ {
              paddingHorizontal: 20,
            }}>
              <AccountDetailsCard
                accountShell={accountShell}
                onKnowMorePressed={() => setShowMore( true )}
                onSettingsPressed={navigateToAccountSettings}
                swanDeepLinkContent={swanDeepLinkContent}
              />
            </View>
          )
        },
      },
      {
        kind: SectionKind.TRANSACTIONS_LIST_PREVIEW,
        data: [ null ],
        renderItem: () => {

          return (
            <View style={styles.viewSectionContainer}>
              <TransactionsPreviewSection
                transactions={AccountShell.getAllTransactions( accountShell ) }
                // transactions={AccountShell.getAllTransactions( accountShell ).slice( 0, 3 )}
                availableBalance={AccountShell.getSpendableBalance( accountShell )}
                bitcoinUnit={accountShell.unit}
                isTestAccount={primarySubAccount.kind === SubAccountKind.TEST_ACCOUNT}
                onViewMorePressed={navigateToTransactionsList}
                onTransactionItemSelected={handleTransactionSelection}
                accountShellId={accountShell.id}
                kind={primarySubAccount.kind}
              />
            </View>
          )
        },
      },
    ]
  }, [ accountShell ] )

  const renderItem = ( { item, index } ) => {

    return(
      selectedTab == 'fungible' ?
        <TouchableOpacity style={styles.itemContainer} onPress={() =>onItemClick()}>
          <Image style={styles.itemImage} source={item?.image}/>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>SAGA</Text>
            <Text style={styles.itemDesc}>Lorem Ipsum</Text>
          </View>
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
              {formattedBalanceText}
            </Text>
            <Text style={[ styles.unitTextStyles, {
            // textAlignVertical: verticalAlignUnit
            } ]}>{`${formattedUnitText}`}</Text>
          </View>
        </TouchableOpacity>
        : selectedTab == 'collectible' ?
          <TouchableOpacity style={styles.itemContainer} onPress={() =>onItemClick()}>
            <Image style={{
              height: '50%', width: '50%'
            }} source={''}>
            </Image>
          </TouchableOpacity>
          : null
    )
  }

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
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
      <View style={{
        flex: 1,
      }}>
        {renderTabs()}
        { selectedTab != 'bitcoin' ?
          <FlatList
          // contentContainerStyle={{
          //   flex:1, backgroundColor:'red'
          // }}
            data={ selectedTab == 'fungible' ? fungibleData : collectibleData}
            renderItem={renderItem}
            keyExtractor={( item, index ) => index.toString()}
          /> :
          <SectionList
            contentContainerStyle={styles.scrollViewContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            refreshControl={
              <RefreshControl
                onRefresh={performRefreshOnPullDown}
                refreshing={isRefreshing}
                style={{
                  backgroundColor: Colors.backgroundColor,
                }}
              />
            }
            sections={sections}
            stickySectionHeadersEnabled={false}
            keyExtractor={sectionListItemKeyExtractor}
          />
        }
        {renderFooter()}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
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
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5
  },
  fungibleText:{
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 12 )
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
    color: Colors.currencyGray
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
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginHorizontal: 20,
    paddingHorizontal: 8,
    paddingVertical: 20,
    marginTop: 20,
    flexDirection:'row'
  },
  itemImage:{
    width: 35, height: 35, borderRadius: 20, backgroundColor:'gray'
  },
  textContainer:{
    flex:1, marginStart: 5
  },
  itemTitle:{
    color: Colors.black, fontFamily:Fonts.Medium, fontSize: RFValue( 13 )
  },
  itemDesc:{
    color: Colors.textColorGrey, fontFamily:Fonts.Regular,
    fontSize: RFValue( 10 ), marginTop: 2
  }
} )
