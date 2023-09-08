import React, { useContext, useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
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
import NetworkKind from '../../common/data/enums/NetworkKind'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'
import { fetchExchangeRates, fetchFeeRates } from '../../store/actions/accounts'
import RGBServices from '../../services/RGBServices'
import moment from 'moment'
import DetailsCard from './DetailsCard'

export default function RGBTxDetail( props ) {
  const dispatch = useDispatch()
  const { translations } = useContext( LocalizationContext )
  const accountStr = translations[ 'accounts' ]
  const asset = props.navigation.getParam( 'asset' )
  const accountsState = useAccountsState()
  const { averageTxFees, exchangeRates } = accountsState
  const [ loading, setLoading ] = useState( true )
  const [ transactionData, setTransactionData ] = useState( [] )

  useEffect( () => {
    getTransfers()
  }, [] )

  const getTransfers = async () => {
    try {
      const txns = await RGBServices.getRgbAssetTransactions( asset.assetId )
      console.log( 'txns', JSON.stringify( txns ) )
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


  useEffect( () => {
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
              props.navigation.navigate( 'RGBSend' )
            }}
            onReceivePressed={() => {
              props.navigation.navigate( 'RGBReceive', {
              } )
            }}
            averageTxFees={averageTxFees}
            network={
              NetworkKind.MAINNET
            }
            isTestAccount={false}
          />
        </View>
      </View>
    )
  }

  const onItemClick = ( item ) => {
    props.navigation.navigate( 'AssetTransferDetails', {
      item, asset
    } )
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
              color: item.kind === 'receive' || item.kind ==='issuance' ? '#04A777' : '#FD746C'
            } ]}
          >
            {item.amount.toLocaleString()}
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
      <View style={{
        paddingHorizontal: 20, marginBottom: 20,
      }}>
        <DetailsCard
          onKnowMorePressed={() => {
            props.navigation.navigate( 'AssetMetaData', {
              asset
            } )
          }}
          showKnowMore
          onSettingsPressed={() => { }}
          balance={asset.spendableBalance.toLocaleString()}
          cardColor={'#A29DD3'}
          title={asset.name}
          description={asset.ticker}
          assetId={asset.assetId}
          renderIcon={() => <View style={[ styles.labelContainer, {
            backgroundColor: '#7e7aac'
          } ]}>
            <Text style={styles.labelText}>{asset.ticker.substring( 0, 3 )}</Text>
          </View>}
          isBitcoin={false}
        />
      </View>


      <View style={{
        flex: 1,
      }}>
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
          loading ? <ActivityIndicator /> :
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
  },
  labelContainer: {
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 20,
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  labelText: {
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.SemiBold,
    color: Colors.white,
  }
} )
