import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
  StatusBar,
  ScrollView,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { RFValue } from 'react-native-responsive-fontsize'
import { LocalizationContext } from '../../common/content/LocContext'
import HeaderTitle1 from '../../components/HeaderTitle1'
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner'
import BottomInfoBox from '../../components/BottomInfoBox'
import LndConnectUtils from '../../utils/ln/LndConnectUtils'
import Toast from '../../components/Toast'

const styles = StyleSheet.create( {
  viewContainer: {
    flex: 1,
    backgroundColor: Colors.LIGHT_BACKGROUND,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  buttonView: {
    height: wp( '12%' ),
    paddingHorizontal: wp( 2 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    // shadowColor: Colors.shadowBlue,
    // shadowOpacity: 1,
    // shadowOffset: {
    //   width: 15, height: 15
    // },
    backgroundColor: Colors.blue,
    marginHorizontal: wp( 4 ),
    marginVertical: hp( '2%' ),
  },
} )


export default function ScanNodeConfig( { navigation } ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'lightningAccount' ]
  const common = translations[ 'common' ]
  const [ knowMore, setKnowMore ] = useState( true )

  async function handleBarcodeRecognized( { data: scannedData }: { data: string } ) {
    if( scannedData.includes( 'config' ) ){
      const url = scannedData.split( 'config=' )[ 1 ]
      LndConnectUtils.procesBtcPayConfig( url ).then(
        res=> {
          console.log( res )
          const {
            uri,
            macaroon,
            chainType,
            port
          } = res.configurations[ 0 ]
          if ( uri && macaroon ) {
            navigation.navigate( 'EnterNodeConfig', {
              node: {
                host: uri, port, macaroonHex: macaroon
              },
            } )
          } else {
            Toast( 'Error fetching config' )
          }
        }
      ).catch( e=> {
        console.log( e )
        Toast( 'Error fetching config' )

      } )
    } else {
      const {
        host,
        port,
        macaroonHex
      } = LndConnectUtils.processLndConnectUrl( scannedData )
      if( host &&  macaroonHex ) {
        navigation.navigate( 'EnterNodeConfig', {
          node: {
            host: host, port: port, macaroonHex: macaroonHex
          },
        } )
      } else {
        Toast( 'Invalid QR' )
      }
    }
  }

  return (

    <SafeAreaView style={styles.viewContainer}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor,
        marginRight: wp( 4 )
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack()
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
      <ScrollView
        overScrollMode="never"
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1
        }}
        keyboardShouldPersistTaps='handled'>
        <HeaderTitle1
          firstLineTitle={'Set up Lighting Account'}
          secondLineTitle={strings.Connectyournode}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />

        <CoveredQRCodeScanner
          onCodeScanned={handleBarcodeRecognized}
          containerStyle={{
            marginBottom: 16
          }}
        />
        <TouchableOpacity
          style={styles.buttonView}
          activeOpacity={0.6}
          onPress={() => {
            navigation.navigate( 'EnterNodeConfig' )
          }}
        >
          <Text style={styles.buttonText}>{strings.Entermanually}</Text>
        </TouchableOpacity>

        <BottomInfoBox
          containerStyle={{
            paddingRight: wp( 15 ),
            // backgroundColor: 'transparent',
            // marginTop: hp( -1 )
          }}
          onPress={() => {
            navigation.navigate( 'EnterNodeConfig' )
          }}
          title={strings.Entermanually}
          // infoText={strings.NoLNDnodeSub}
          infoText={'Customize your set up'}
        />
      </ScrollView>


    </SafeAreaView>
  )
}
