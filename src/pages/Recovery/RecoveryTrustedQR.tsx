import React, {  } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
} from 'react-native'
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
import { translations } from '../../common/content/LocContext'
import CopyThisText from '../../components/CopyThisText'

export default function RecoveryTrustedQR( props ) {
  const strings  = translations[ 'bhr' ]

  return (
    <View
      style={{
        height: '100%',
        backgroundColor: Colors.white,
        borderColor: Colors.borderColor,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <View style={NavStyles.modalHeaderTitleView}>
        <View style={{
          flexDirection: 'row'
        }}>
          <View
            style={{
              alignSelf: 'center', flex: 1, justifyContent: 'center'
            }}
          >
            <Text style={NavStyles.modalHeaderTitleText}>{strings.ScanQRCode}</Text>

          </View>
        </View>
      </View>
      <View style={NavStyles.modalContentView}>
        {!props.trustedQR ? (
          <View style={{
            height: hp( '27%' ), justifyContent: 'center'
          }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <QRCode value={props.trustedQR} size={hp( '27%' )} />
        )}
        {props.trustedOR?<CopyThisText
          backgroundColor={Colors.backgroundColor}
          text={props.trustedQR}
          width={'20%'}
          height={'15%'}
        /> : null}
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
            {strings.Ihavescanned}
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
      <BottomInfoBox
        title={'Send your Recovery Key'}
        infoText={strings.OpentheQRscanner}
      />
    </View>
  )
}
