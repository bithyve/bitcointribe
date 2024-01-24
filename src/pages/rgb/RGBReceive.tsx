import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import NavStyles from '../../common/Styles/NavStyles'
import CommonStyles from '../../common/Styles/Styles'
import BottomInfoBox from '../../components/BottomInfoBox'

import { useDispatch, useSelector } from 'react-redux'
import { RGB_ASSET_TYPE } from '../../bitcoin/utilities/Interface'
import { translations } from '../../common/content/LocContext'
import CopyThisText from '../../components/CopyThisText'
import QRCode from '../../components/QRCode'
import Toast from '../../components/Toast'
import { receiveRgbAsset } from '../../store/actions/rgb'

export default function RGBReceive( props ) {
  const strings = translations[ 'accounts' ]
  const common = translations[ 'common' ]
  const assetType: RGB_ASSET_TYPE = props.route.params?.assetType || RGB_ASSET_TYPE.BITCOIN
  const dispatch = useDispatch()
  const [ receivingAddress, setReceivingAddress ] = useState( null )
  const [ paymentURI, setPaymentURI ] = useState( null )
  const { nextFreeAddress } = useSelector( state => state.rgb )
  const { loading, isError, message, data } = useSelector( state => state.rgb.receiveAssets )
  const [ requesting, setRequesting ] = useState( false )

  useEffect( () => {
    if ( assetType == RGB_ASSET_TYPE.BITCOIN ) {
      setReceivingAddress( nextFreeAddress )
    } else {
      dispatch( receiveRgbAsset() )
    }
  }, [] )

  useEffect( () => {
    if ( assetType == RGB_ASSET_TYPE.RGB20 ) {
      if ( loading ) {
        setRequesting( true )
      }
      if ( !loading && isError ) {
        Toast( message )
        props.navigation.goBack()
      }
      if ( !loading && !isError ) {
        setReceivingAddress( data.invoice )
        setRequesting( false )
      }

    }
  }, [ isError, loading ] )



  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView style={{
        flex: 0
      }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={() => { }}>
        <KeyboardAvoidingView
          style={{
            flex: 1
          }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <View style={NavStyles.modalContainer}>
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
            <Text style={styles.headerTitleText}>Receive</Text>

            {
              requesting ? <ActivityIndicator style={{
                height: '70%'
              }} size="large" /> :
                <ScrollView>
                  <View style={styles.QRView}>
                    <QRCode title={assetType === RGB_ASSET_TYPE.BITCOIN ? 'Bitcoin address' : 'RGB Invoice'} value={paymentURI ? paymentURI : receivingAddress ? receivingAddress : 'null'} size={hp( '27%' )} />
                  </View>

                  <CopyThisText
                    backgroundColor={Colors.white}
                    text={paymentURI ? paymentURI : receivingAddress}
                    toastText='Address Copied Successfully'
                  />

                </ScrollView>
            }
            <View style={{
              marginBottom: hp( '2.5%' )
            }}>
              <BottomInfoBox
                backgroundColor={Colors.white}
                title={common.note}
                infoText={assetType === RGB_ASSET_TYPE.BITCOIN ? strings.Itwouldtake: 'Blinded UTXO in this invoice will expire after 24 hours '}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

    </View>
  )
}

const styles = StyleSheet.create( {
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    marginBottom: hp( '1%' ),
  },
  textBoxImage: {
    width: wp( '6%' ),
    height: wp( '6%' ),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 13 ),
  },
  QRView: {
    height: hp( '30%' ),
    justifyContent: 'center',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp( '3%' )
  },
  titleText: {
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    color: Colors.textColorGrey,
  },
  text: {
    justifyContent: 'center', marginRight: 10, marginLeft: 10, flex: 1
  },
  knowMoreTouchable: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 'auto',
  },
  selectedView: {
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: hp( 4 ),
    marginTop: hp( 2 ),
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  forwardIcon: {
    marginLeft: wp( '3%' ),
    marginRight: wp( '3%' ),
    alignSelf: 'center',
  },
  text1: {
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: wp( '5%' )
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 20 ),
    marginLeft: 20,
    // marginTop: hp( '10%' ),
    fontFamily: Fonts.Regular,
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
  },
} )
