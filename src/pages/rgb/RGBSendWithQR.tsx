import React from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import ArrowRight from '../../assets/images/svgs/icon_arrow_right.svg'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import { translations } from '../../common/content/LocContext'
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RGBSendWithQR( props ) {
  const common = translations[ 'common' ]
  const asset = props.route.params?.asset

  const handleQRScanned = scannedData => {
    const validAddress = true //TODO: check if scanned data is valid address
    if ( validAddress ) {
      props.navigation.replace( 'SendAsset', {
        invoice: scannedData.data, asset
      } )
    } else {
      props.navigation.goBack( null )
    }
  }
  return (
    <SafeAreaView  style={{
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    }}>
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: Colors.backgroundColor,
      }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
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
      <Text style={styles.headerMainText}>{common.send}</Text>
      <Text style={styles.headerTitleText}>Scan QR</Text>
      <Text style={styles.headerSubTitleText}>{`Scan a ${ asset ? 'RGB invoice' : 'BTC address'}`}</Text>

      <CoveredQRCodeScanner onCodeScanned={handleQRScanned} />

      <TouchableOpacity
        onPress={() =>
          props.navigation.replace( 'SendAsset', {
            invoice: '', asset
          } )
        }
        style={styles.manualDetailsContainer}>
        <View
          style={{
            flex: 1,
            paddingLeft: 10,
          }}>
          <Text style={styles.manualDeailsText}>or Enter details manually</Text>
          <Text numberOfLines={2} style={styles.manualDetailsSubText}>
            Enter { asset ? 'RGB invoice' : 'BTC address'} manually
          </Text>
        </View>
        <ArrowRight />
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  headerMainText: {
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontSize: RFValue( 13 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
    marginTop: hp( 4 ),
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 20 ),
    marginLeft: 20,
    marginVertical: 5,
    fontFamily: Fonts.Regular,
  },
  headerSubTitleText: {
    fontSize: RFValue( 12 ),
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontFamily: Fonts.Regular,
    marginLeft: 20,
    marginTop: 3,
    marginBottom: hp( 8 ),
  },
  manualDetailsContainer: {
    width: '90%',
    backgroundColor: Colors.gray7,
    alignSelf: 'center',
    borderRadius: wp( 2 ),
    paddingHorizontal: wp( 2 ),
    paddingVertical: hp( 3 ),
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp( 10 ),
    marginBottom: hp( 2 ),
  },
  manualDeailsText: {
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Medium,
    color: Colors.THEAM_TEXT_COLOR,
  },
  manualDetailsSubText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
    color: Colors.THEAM_INFO_TEXT_COLOR,
    marginTop: 4,
  },
} )
