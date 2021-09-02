import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import NavStyles from '../../common/Styles/NavStyles'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomInfoBox from '../../components/BottomInfoBox'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import QRCode from '../../components/QRCode'


export default function SecondaryDeviceModelContents( props ) {
  return (
    <View
      style={{
        // height: '100%',
        backgroundColor: Colors.white,
        borderColor: Colors.borderColor,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <View
        style={{
          ...NavStyles.modalHeaderTitleView,
          paddingTop: hp( '3%' ),
          alignItems: 'center',
          marginLeft: 20,
        }}
      >
        <Text style={NavStyles.modalHeaderTitleText}>Scan QR Code</Text>
      </View>

      <Text style={{
        color: Colors.textColorGrey,
        fontSize: RFValue( 12 ),
        fontFamily: Fonts.FiraSansRegular,
        marginLeft: 20,
        marginRight: 20
      }}>
  Open the QR scanner at the top right of the home screen on another Personal Device running Hexa app and scan this QR
      </Text>
      <View style={NavStyles.modalContentView}>
        {!props.secondaryQR ? (
          <View style={{
            height: hp( '27%' ), justifyContent: 'center',
          }}>
            <ActivityIndicator size="large" animating color={Colors.gray1}/>
          </View>
        ) : (
          <QRCode title="Keeper request" value={props.secondaryQR} size={hp( '27%' )} />
        )}
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressOk()}
          style={{
            backgroundColor: Colors.blue,
            borderRadius: 10,
            width: wp( '50%' ),
            height: wp( '13%' ),
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp( '3%' ),
            marginBottom: hp( '3%' ),
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            Yes, I have scanned
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
    </View>
  )
}
