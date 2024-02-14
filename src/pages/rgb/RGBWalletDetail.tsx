import moment from 'moment'
import React, { useMemo, useState } from 'react'
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch, useSelector } from 'react-redux'
import AccountChecking from '../../assets/images/accIcons/acc_checking.svg'
import { RGB_ASSET_TYPE } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { getCurrencyImageByRegion } from '../../common/CommonFunctions'
import BitcoinUnit, { displayNameForBitcoinUnit } from '../../common/data/enums/BitcoinUnit'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import NetworkKind from '../../common/data/enums/NetworkKind'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../../components/MaterialCurrencyCodeIcon'
import { syncRgb } from '../../store/actions/rgb'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter'
import DetailsCard from './DetailsCard'

enum SectionKind {
  TOP_TABS,
  ACCOUNT_CARD,
  TRANSACTIONS_LIST_PREVIEW,
  SEND_AND_RECEIVE_FOOTER,
}
const sectionListItemKeyExtractor = ( index ) => String( index )

export default function RGBWalletDetail( props ) {
  const dispatch = useDispatch()
  const { syncing, balances, transactions } = useSelector( state=> state.rgb )

  const [ selectedTab, setSelectedTab ] = useState( 'Bitcoin' )


  const isTestAccount = false
  const currencyKind = useCurrencyKind()
  const bitcoinUnit = BitcoinUnit.SATS
  const  bitcoinIconColor = 'gray'
  const fiatCurrencyCode = useCurrencyCode()
  const textColor = Colors.currencyGray

  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

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

  const renderFooter = ( assetType: RGB_ASSET_TYPE ) => {
    return(
      <View style={styles.viewSectionContainer}>
        <View style={styles.footerSection}>
          <SendAndReceiveButtonsFooter
            onSendPressed={() => {
              props.navigation.navigate( 'RGBSendWithQR' )
            }}
            onReceivePressed={() => {
              props.navigation.navigate( 'RGBReceive', {
                assetType
              } )
            }}
            averageTxFees={null}
            network={ NetworkKind.MAINNET
            }
            isTestAccount={false}
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

  const onItemClick = ( item ) => {
    props.navigation.navigate( 'RGBTxDetail', {
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
              <DetailsCard
                showKnowMore
                knowMoreText='View UTXO'
                onKnowMorePressed={() => {
                  props.navigation.navigate( 'UnspentList' )
                }}
                onSettingsPressed={()=>{}}
                balance={balances.spendable}
                cardColor='#88B283'
                title='Bitcoin Wallet'
                description=''
                renderIcon={()=><AccountChecking/>}
                isBitcoin={true}
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
                data={transactions.reverse()}
                style={{
                  marginVertical: 20
                }}
                renderItem={( { item } ) =>
                  <TouchableOpacity style={styles.itemContainer} onPress={() =>{}}>
                    <View style={styles.textContainer}>
                      <Text numberOfLines={1} ellipsizeMode="middle" style={styles.itemTitle}>{item.txid}</Text>
                      {
                        item.confirmationTime && (
                          <Text style={styles.itemDesc}>{moment.unix( Number( item.confirmationTime.timestamp ) ).format( 'DD/MM/YY • hh:MMa' )}</Text>
                        )
                      }
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
  }, [  ] )

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
        <SectionList
          contentContainerStyle={styles.scrollViewContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                dispatch( syncRgb() )
              }}
              refreshing={syncing}
              style={{
                backgroundColor: Colors.backgroundColor,
              }}
            />
          }
          sections={sections}
          stickySectionHeadersEnabled={false}
          keyExtractor={sectionListItemKeyExtractor}
        />
        {renderFooter( RGB_ASSET_TYPE.BITCOIN )}
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
    marginHorizontal: 20,
    paddingHorizontal: 8,
    paddingVertical: 20,
    flexDirection:'row',
  },
  itemImage:{
    width: 35, height: 35, borderRadius: 20, backgroundColor:'gray'
  },
  textContainer:{
    flex:1,
    marginHorizontal: 10
  },
  itemTitle:{
    color: '#2C3E50', fontFamily:Fonts.Regular, fontSize: RFValue( 12 )
  },
  itemDesc:{
    color: Colors.textColorGrey, fontFamily:Fonts.Regular,
    fontSize: RFValue( 10 ), marginTop: 2
  }
} )
