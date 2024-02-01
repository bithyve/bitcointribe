import React, { useContext, useState } from 'react'
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch } from 'react-redux'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import NetworkKind from '../../common/data/enums/NetworkKind'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import RgbAccountDetailsCard from '../../components/rgbAccountDetail/RgbAccountDetailsCard'
import RgbTransactionCard from '../../components/rgbAccountDetail/RgbTransactionCard'
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter'



export default function CollectibleDetailScreen( props ) {
  const dispatch = useDispatch()
  const { translations } = useContext( LocalizationContext )
  const accountStr = translations[ 'accounts' ]
  const [ loading, setLoading ] = useState( true )
  const [ transactionData, setTransactionData ] = useState( [ '1', '2' ] )

  const renderFooter = () => {
    return (
      <View style={styles.viewSectionContainer}>
        <View style={styles.footerSection}>
          <SendAndReceiveButtonsFooter
            onSendPressed={() => {
              props.navigation.navigate( 'RGBSendWithQR' )
            }}
            onReceivePressed={() => {

            }}
            averageTxFees={''}
            network={ NetworkKind.TESTNET}
            isTestAccount={true}
          />
        </View>
      </View>
    )
  }
  const onItemClick = () => {
    props.navigation.navigate( 'AssetsDetailScreen' )
  }
  const renderItem = ( { item } ) => {
    return (
      <RgbTransactionCard
        title={'02/02/23 - 08:00am'}
        ammount={'34,000'}
        image={null}
        onItemPress={()=>{
          onItemClick()
        }}
        txType={'send'}
      />
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
        flex: 1,
      }}>
        <RgbAccountDetailsCard
          currency={null}
          assetId={null}
          name={'Eye of the Beholder'}
          ammount={'2,000,000'}
          image={null}
          description={'rud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
          onViewDetailPress={()=>{}}
          viewDetails={'View Details'}
          labelBg={'#A29DD3'}
          containerBg={'#B7B7B7'}
        />

        {/* <View style={styles.viewMoreLinkRow}>
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
              colors={[
                Colors.skyBlue,
                Colors.skyBlue
              ]}
              style={styles.viewMoreWrapper}
            >
              <Text style={styles.headerTouchableText}>
                {'View All'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View> */}
        <FlatList
          data={transactionData}
          renderItem={renderItem}
          keyExtractor={( item, index ) => index.toString()}
        />
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
  amountText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 14.5 ),
    marginHorizontal: wp( 2 ),
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
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContainer: {
    marginHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: Colors.gray1
  },
  textContainer: {
    flex: 1,
    marginStart: 10,
    flexDirection: 'row',
    alignItems :'center'
  },
  itemDesc: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 10 ),
    marginTop: 2,
    marginLeft: 10
  },
  viewMoreLinkRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop:15
  },
  headerDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
  },
  headerTouchableText: {
    color: Colors.white,
    fontSize: RFValue( 11 ),
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
