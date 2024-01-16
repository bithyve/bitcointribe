import { useNavigation, useRoute } from '@react-navigation/native'
import React, { createRef, useState } from 'react'
import {
  SafeAreaView,
  StatusBar, Text, TouchableOpacity, View
} from 'react-native'
import { RNCamera } from 'react-native-camera'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import BottomInfoBox from '../../components/BottomInfoBox'
import getFormattedStringFromQRString from '../../utils/qr-codes/GetFormattedStringFromQRData'

export type Props = {
  navigation: any;
};

const GiftQRScannerScreen: React.FC<Props> = ( ) => {
  const title = ''
  const cameraRef = createRef<RNCamera>()
  const [ isCameraOpen, setIsCameraOpen ] = useState( true )
  const [ scanQRFlag, setScanQRFlag ] = useState( [ RNCamera.Constants.BarCodeType.qr ] )
  const navigation: any = useNavigation()
  const route = useRoute()
  const onCodeScanned = route.params?.onCodeScanned

  const barcodeRecognized = async barcodes => {
    if ( barcodes.data ) {
      setScanQRFlag( [] )
      setIsCameraOpen( false )

      if( onCodeScanned ){
        onCodeScanned(
          getFormattedStringFromQRString( barcodes.data ),
        )
      }
      navigation.goBack()
    }
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar barStyle="dark-content" />
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
      <View style={{
        flex: 1,
        justifyContent:'center',
        alignItems:'center'
      }}>


        <View
          style={{
            width: wp( '100%' ),
            height: wp( '100%' ),
            overflow: 'hidden',
            borderRadius: 0,
            marginTop: hp( '5%' ),
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


export default GiftQRScannerScreen
