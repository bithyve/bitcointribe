import { useNavigation, useRoute } from '@react-navigation/native'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
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
import { useDispatch } from 'react-redux'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import RGBServices from '../../services/RGBServices'
import { fetchExchangeRates, fetchFeeRates } from '../../store/actions/accounts'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'

const numberWithCommas = ( x ) => {
  return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
}

export default function RGBTxDetail( ) {
  const dispatch = useDispatch()
  const navigation = useNavigation<any>();
  const route = useRoute();
  const accountsState = useAccountsState()
  const { averageTxFees, exchangeRates } = accountsState
  const [ loading, setLoading ] = useState( true )
  const [ transactionData, setTransactionData ] = useState( [] )
  const asset = route.params?.asset
  useEffect( () => {
    getTransfers()
    console.log("jkadc",route.params?.asset)
  }, [] )

  const getTransfers = async () => {
    try {
      const txns = await RGBServices.getRgbAssetTransactions( asset.assetId )
      if ( txns ) {
        setTransactionData( txns )
        setLoading( false )
      } else {
        //navigation.goBack()
      }
    } catch ( error ) {
      console.log( error )
      //navigation.goBack()
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


  const onItemClick = ( item ) => {
    navigation.navigate( 'AssetTransferDetails', {
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
              color: ( item.kind === 'RECEIVE_BLIND' || item.kind ==='ISSUANCE' || item.kind === 'RECEIVE_WITNESS' ) ? '#04A777' : '#FD746C'
            } ]}
          >
            {numberWithCommas(item && item.amount)}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
        <TouchableOpacity
          onPress={() => {
            navigation.goBack()
          }}
          style={styles.headerContainer}
        >
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
              style={styles.arrowIcon}
            />
          <Text style={styles.headerLabel}>Recent Transactions</Text>
        </TouchableOpacity>
      <View style={{
        flex: 1,
      }}>
        {
          loading ? <ActivityIndicator /> :
            <FlatList
              data={transactionData}
              renderItem={renderItem}
              keyExtractor={( item, index ) => index.toString()}
            />
        }
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
  },
  headerLabel:{
    fontSize:16,
    fontFamily:Fonts.Medium,
  },
  headerContainer:{
    flexDirection:'row',
    alignItems:'center',
    marginTop:10
  },
  arrowIcon:{
    marginLeft:10,
    marginRight:10
  }
} )
