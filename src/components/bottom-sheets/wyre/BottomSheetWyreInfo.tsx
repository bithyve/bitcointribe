import React from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../AppBottomSheetTouchableWrapper'

let boottomSheetRenderCount = 0
type Props = {
  wyreDeepLinkContent: string | null;
  onClickSetting: ()=>any;
}

const BottomSheetWyreInfo: React.FC<Props> = ( { wyreDeepLinkContent, onClickSetting }: Props ) => {
  console.log( {
    boottomSheetRenderCount: boottomSheetRenderCount++,
    ...{
      wyreDeepLinkContent
    }
  } )
  let wyreMessage = 'Your order has been successful the purchased bitcoin will be transferred to your Wyre account shortly'
  let wyreTitle = 'Order successful'
  if( wyreDeepLinkContent.search( 'fail' )>=0 ) {
    wyreMessage = 'Wyre was not able to process your payment. Please use a different payment payment'
    wyreTitle = 'Wyre order failed'
  }
  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    <View style={{
      height: '90%'
    }}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.modalTitleText}>{wyreTitle}</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '1.5%' )
        }}>{wyreMessage}.</Text>
      </View>

      <View style={{
        flexDirection: 'row', marginTop: 'auto', alignItems: 'center'
      }} >
        <AppBottomSheetTouchableWrapper
          onPress={() => onClickSetting()}
          style={{
            ...styles.successModalButtonView
          }}
        >
          <Text style={styles.proceedButtonText}>OK</Text>
        </AppBottomSheetTouchableWrapper>
        {/* <Image source={require( '../../../assets/images/icons/icon_swan@3x.png' )} style={styles.successModalImage} /> */}
      </View>
    </View>
  </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
    marginTop: wp( '10%' ),
    flex: 1.7
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '10%' ),
  },
  successModalImage: {
    width: wp( '25%' ),
    height: hp( '18%' ),
    marginLeft: 'auto',
    resizeMode: 'cover'
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium
  },
} )

export default BottomSheetWyreInfo
