import React, { useEffect, useState } from 'react'
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { ActivityIndicator } from 'react-native-paper'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import HeaderTitle from '../../components/HeaderTitle'
import RGBServices from '../../services/RGBServices'

const UnspentList = props => {
  const [ showLoader, setShowLoader ] = useState( true )
  const [ listData, setListData ] = useState( [] )
  useEffect( () => {
    ( async () => {
      const unspentData: any = await RGBServices.getUnspents()
      const btcData =
        ( unspentData.bitcoin &&
          JSON.parse( unspentData.bitcoin )
            ?.map( val => ( {
              type: 'btc',
              txid: val.outpoint?.txid,
              btcAmount: val.txout?.value || 0,
            } ) )
            ?.filter( val => val.txid ) ) ||
        []
      const rgbData =
        ( unspentData.rgb &&
          JSON.parse( unspentData.rgb )
            ?.map( val => ( {
              type: 'rgb',
              txid: val.utxo?.outpoint?.txid,
              btcAmount: val.utxo?.btcAmount || 0,
              rgbAllocations: val.rgbAllocations?.filter( rgb => rgb.settled ) || [],
            } ) )
            ?.filter( val => val.txid ) ) ||
        []
      setListData( [ ...btcData, ...rgbData ] )
      setShowLoader( false )
    } )()
  }, [] )

  return (
    <SafeAreaView
      style={{
        backgroundColor: Colors.backgroundColor,
        flex: 1,
      }}>
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
          }}>
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <HeaderTitle
        firstLineTitle={'Unspent list'}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      {showLoader ? (
        <View
          style={styles.loaderStyle}>
          <ActivityIndicator size="large" color={Colors.babyGray} />
        </View>
      ) : (
        <FlatList
          data={listData}
          style={{
            marginTop: wp( 4 ),
          }}
          showsVerticalScrollIndicator={false}
          renderItem={( { item, index } ) => (
            <TouchableOpacity
              onPress={() => Linking.canOpenURL( `https://blockstream.info/testnet/tx/${item.txid}` ).then( supported => {
                if( supported ) {
                  Linking.openURL( `https://blockstream.info/testnet/tx/${item.txid}` )
                }
              } )}
              key={`${item.txid}_${index}`}
              style={styles.listItemStyle}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                  marginBottom: wp( 3 )
                }}>
                <Image
                  style={{
                    width: item.type === 'rgb' ? wp( 8 ) : wp ( 6 ),
                    height: wp( 8 ),
                  }}
                  source={item.type === 'rgb' ? require( '../../assets/images/icons/rgb_logo_round.png' ) : require( '../../assets/images/currencySymbols/icon_bitcoin_test.png' )}
                />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={styles.txIdText}>
                  {item.txid}
                </Text>
                <Text style={styles.satsValueText}>SATS {item.btcAmount}</Text>
              </View>
              {item.type === 'rgb' && item.rgbAllocations.length ? (
                <>
                  {item.rgbAllocations.map( ( rgb, index ) => (
                    <View
                      key={`${rgb.assetId}_${index}`}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        marginBottom: wp( 2 ),
                      }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        style={styles.assetIdText}>
                        {rgb.assetId}
                      </Text>
                      <Text style={styles.assetAmountText}>AMT {rgb.amount}</Text>
                    </View>
                  ) )}
                </>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  loaderStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  listItemStyle: {
    marginVertical: hp( 0.5 ),
    borderRadius: 10,
    padding: wp( 2 ),
    backgroundColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 1,
    marginHorizontal: wp( 3 ),
  },
  txIdText: {
    flex: 1,
    marginHorizontal: wp( 3 ),
    color: '#2C3E50',
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
  },
  satsValueText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.SemiBold,
    fontSize: RFValue( 12 ),
  },
  assetIdText: {
    flex: 1,
    marginRight: wp( 4 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 10 ),
  },
  assetAmountText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.SemiBold,
    fontSize: RFValue( 10 ),
  },
} )

export default UnspentList
