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
  SectionList,
  RefreshControl,
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
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import config from '../../bitcoin/HexaConfig'
import NetworkKind from '../../common/data/enums/NetworkKind'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'
import { fetchExchangeRates, fetchFeeRates, refreshAccountShells } from '../../store/actions/accounts'
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
import AccountDetailsCard from '../../components/account-details/AccountDetailsCard'
import SyncStatus from '../../common/data/enums/SyncStatus'
import { RGB_ASSET_TYPE } from '../../bitcoin/utilities/Interface'

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
  const accountShellID = props.navigation.getParam( 'accountShellID' )
  const accountShell = useAccountShellFromNavigation( props.navigation )

  const isRefreshing = useMemo( () => {
    return ( accountShell.syncStatus===SyncStatus.IN_PROGRESS )
  }, [ accountShell.syncStatus ] )

  const accountsState = useAccountsState()
  const { averageTxFees, exchangeRates } = accountsState
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const account = useAccountByAccountShell( accountShell )
  const [ selectedTab, setSelectedTab ] = useState( 'fungible' )

  const [ showMore, setShowMore ] = useState( false )

  const isTestAccount = false
  const currencyKind = useCurrencyKind()
  const bitcoinUnit = BitcoinUnit.SATS
  const balance = 5000
  const  bitcoinIconColor = 'gray'
  const fiatCurrencyCode = useCurrencyCode()
  const textColor = Colors.currencyGray
  const [ fungibleData, setFungibleData ] =useState(  account.rgb?.rgb20Assets || [] )

  const [ collectibleData, setCollectibleData ] =useState( [] )
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

  const renderFooter = ( assetType: RGB_ASSET_TYPE ) => {
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
                assetType
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
          setSelectedTab( 'fungible' )
        }
        } activeOpacity={1}>
          <View style={[ styles.fungibleInnerContainer, {
            backgroundColor: selectedTab == 'fungible'? Colors.THEAM_TEXT_COLOR:null,
          } ]}>
            <Text style={[ styles.fungibleText, {
              color: selectedTab == 'fungible' ?  Colors.white : Colors.THEAM_TEXT_COLOR,
            } ]}>FUNGIBLE</Text>
          </View>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.fungibleContainer} onPress={()=>{
          // if( selectedTab )
          setSelectedTab( 'collectible' )
        }} activeOpacity={1}>
          <View style={[ styles.fungibleInnerContainer, {
            backgroundColor:selectedTab == 'collectible'? Colors.THEAM_TEXT_COLOR:null,
          } ]}>
            <Text style={[ styles.fungibleText, {
              color: selectedTab == 'collectible' ?  Colors.white : Colors.THEAM_TEXT_COLOR,
            } ]}>COLLECTIBLE</Text>
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.fungibleContainer} onPress={()=>{
          // if( selectedTab )
          setSelectedTab( 'Bitcoin' )
        }} activeOpacity={1}>
          <View style={[ styles.fungibleInnerContainer, {
            backgroundColor: selectedTab == 'Bitcoin' ? Colors.THEAM_TEXT_COLOR:null,
          } ]}>
            <Text style={[ styles.fungibleText, {
              color: selectedTab == 'Bitcoin' ?  Colors.white : Colors.THEAM_TEXT_COLOR,
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

  const onItemClick = ( item ) => {
    props.navigation.navigate( 'RGBTxDetail', {
      accountShellID,
      asset: item
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
              <FlatList
                data={ account?.rgb?.bitcoinAssets || []}
                renderItem={( { item } ) =>
                  <TouchableOpacity style={styles.itemContainer} onPress={() =>{}}>
                    <View style={styles.textContainer}>
                      <Text numberOfLines={1} style={styles.itemTitle}>{item.txid}</Text>
                      <Text style={styles.itemDesc}>{item.confirmationTime}</Text>
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
                        style={[ styles.amountText, {
                        } ]}
                      >
                        {item.received !== 0? item.received :item.sent}
                      </Text>
                      <Text style={[ styles.unitTextStyles, {
                      // textAlignVertical: verticalAlignUnit
                      } ]}>{`${formattedUnitText}`}</Text>
                    </View>
                  </TouchableOpacity>}
                keyExtractor={( item, index ) => index.toString()}
              />
            </View>
          )
        },
      },
    ]
  }, [ accountShell ] )

  const renderItem = ( { item } ) => {
    return(
      selectedTab == 'fungible' ?
        <TouchableOpacity style={styles.itemContainer} onPress={() =>onItemClick( item )}>
          <View style={[ styles.itemImage, {
            justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundColor
          } ]}>
            <Text style={{
              color: 'gray',
              fontFamily: Fonts.Medium,
            }}>{item.ticker.slice( 0, 1 )}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text numberOfLines={1} style={styles.itemDesc}>{item.assetId}</Text>
          </View>
          <View style={[ styles.currencyContainer, {
            flex: 0.4, justifyContent: 'flex-end'
          } ]}>
          </View>
          <Text
            numberOfLines={1}
            style={styles.amountText}
          >
            {item.futureBalance}
          </Text>

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
        { selectedTab != 'Bitcoin' ?
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
        {renderFooter( selectedTab === 'Bitcoin' ? RGB_ASSET_TYPE.BITCOIN : RGB_ASSET_TYPE.RGB20 )}
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
    fontSize: 13
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
    color: Colors.currencyGray,
    textAlign: 'right'
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
    flex:1,
    marginStart: 10
  },
  itemTitle:{
    color: Colors.black, fontFamily:Fonts.Medium, fontSize: RFValue( 13 )
  },
  itemDesc:{
    color: Colors.textColorGrey, fontFamily:Fonts.Regular,
    fontSize: RFValue( 10 ), marginTop: 2
  }
} )
