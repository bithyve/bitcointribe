import React, { useState, createRef } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RNCamera } from 'react-native-camera'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomInfoBox from '../components/BottomInfoBox'
import getFormattedStringFromQRString from '../utils/qr-codes/GetFormattedStringFromQRData'
import CameraUnauthorized from '../components/CameraUnauthorized'

export type Props = {
  navigation: any;
  route: any;
};

const QRScannerScreen: React.FC<Props> = ( { navigation, route }: Props ) => {
  const title = route.params.title;
  const cameraRef = createRef<RNCamera>()
  const [ isCameraOpen, setIsCameraOpen ] = useState( true )
  const [ scanQRFlag, setScanQRFlag ] = useState( [ RNCamera.Constants.BarCodeType.qr ] )

  const barcodeRecognized = async barcodes => {
    if ( barcodes.data ) {
      setScanQRFlag( [] )
      setIsCameraOpen( false )

      route.params?.onCodeScanned(
        getFormattedStringFromQRString( barcodes.data ),
      )

      navigation.goBack()
    }
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar barStyle="dark-content" />

      <View style={{
        flex: 1
      }}>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: Colors.borderColor,
            alignItems: 'center',
            flexDirection: 'row',
            paddingRight: 10,
            paddingBottom: 15,
            paddingTop: 10,
            marginLeft: 20,
            marginBottom: 15,
          }}
        >

          <View style={{
            flexDirection: 'row', alignItems: 'center'
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{
                top: 20, left: 20, bottom: 20, right: 20
              }}
              style={{
                height: 30, width: 30, justifyContent: 'center'
              }}
            >
              <FontAwesome name="long-arrow-left" color={Colors.homepageButtonColor} size={17} />
            </TouchableOpacity>

            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue( 18 ),
                fontFamily: Fonts.Medium,
              }}
            >
              {title ? title : 'Scan QR code'}
            </Text>
          </View>
        </View>

        <View
          style={{
            width: wp( '100%' ),
            height: wp( '100%' ),
            overflow: 'hidden',
            borderRadius: 20,
            marginTop: hp( '3%' ),
          }}
        >
          {isCameraOpen && (
            <RNCamera
              ref={cameraRef}
              barCodeTypes={scanQRFlag}
              style={{
                width: wp( '100%' ),
                height: wp( '100%' ),
              }}
              onBarCodeRead={barcode => barcodeRecognized( barcode )}
              captureAudio={false}
              notAuthorizedView={<CameraUnauthorized/>}
            >
              {/* ---- Scanner frame indicators ---- */}
              <View
                style={{
                  flexDirection: 'row',
                  paddingTop: 12,
                  paddingRight: 12,
                  paddingLeft: 12,
                  width: '100%',
                }}
              >
                <View
                  style={{
                    borderLeftWidth: 1,
                    borderTopColor: 'white',
                    borderLeftColor: 'white',
                    height: hp( '5%' ),
                    width: hp( '5%' ),
                    borderTopWidth: 1,
                  }}
                />
                <View
                  style={{
                    borderTopWidth: 1,
                    borderRightWidth: 1,
                    borderRightColor: 'white',
                    borderTopColor: 'white',
                    height: hp( '5%' ),
                    width: hp( '5%' ),
                    marginLeft: 'auto',
                  }}
                />
              </View>
              <View
                style={{
                  marginTop: 'auto',
                  flexDirection: 'row',
                  paddingBottom: 12,
                  paddingRight: 12,
                  paddingLeft: 12,
                  width: '100%',
                }}
              >
                <View
                  style={{
                    borderLeftWidth: 1,
                    borderBottomColor: 'white',
                    borderLeftColor: 'white',
                    height: hp( '5%' ),
                    width: hp( '5%' ),
                    borderBottomWidth: 1,
                  }}
                />
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderRightWidth: 1,
                    borderRightColor: 'white',
                    borderBottomColor: 'white',
                    height: hp( '5%' ),
                    width: hp( '5%' ),
                    marginLeft: 'auto',
                  }}
                />
              </View>
            </RNCamera>
          )}
        </View>

        <View style={{
          marginTop: 'auto'
        }} />

        {/* TODO: Ideally, this shouldn't be a concern here. We should probably have a separate screen for "Scan Exit Key" that uses a QR Scanning component alongside a component for this info box */}
        {title == 'Scan Exit Key' ?
          <BottomInfoBox
            title={'Note'}
            infoText={
              'Exit Key This can be found on page of your pdf Recovery Key. Please scan it to reset your 2FA'
            }
          /> : null}
      </View>
    </SafeAreaView>
  )
}


export default QRScannerScreen
