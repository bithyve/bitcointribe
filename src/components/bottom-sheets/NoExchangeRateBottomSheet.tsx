import React from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'

export default function NoExchangeRateBottomSheet( props ) {

  return ( <View style={{
    ...styles.modalContentContainer 
  }}>
    <View style={{
      height: '100%' 
    }}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.modalTitleText}>Currency Converter Not Available</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '1.5%' ) 
        }}>There seems to be a problem fetching {'\n'}bitcoin exchange rates or we dont have the exchange rate for the selected currency.</Text>
        <Text style={{
          ...styles.modalInfoText, marginBottom: hp( '3%' ) 
        }}>{'\n'}Balance and transaction amounts will be displayed in sats while this problem persists. Please check your internet connection or try after sometime</Text>
      </View>

      <View style={{
        flexDirection: 'row', marginTop: 'auto', alignItems: 'center' 
      }} >
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onClickSetting()}
          style={{
            ...styles.successModalButtonView 
          }}
        >
          <Text style={styles.proceedButtonText}>OK</Text>
        </AppBottomSheetTouchableWrapper>
        <Image source={require( '../../assets/images/icons/noInternet.png' )} style={styles.successModalImage} />
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
    fontFamily: Fonts.Medium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
  },
  successModalAmountView: {
    flex: 2,
    justifyContent: 'center',
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
  },
  successModalWalletNameText: {
    color: Colors.black,
    fontSize: RFValue( 25 ),
    fontFamily: Fonts.Regular
  },
  successModalAmountImage: {
    width: wp( '3%' ),
    height: wp( '3%' ),
    marginRight: 5,
    marginBottom: wp( '1%' ),
    resizeMode: 'contain',
  },
  successModalAmountText: {
    color: Colors.black,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 21 ),
    marginRight: 5
  },
  successModalAmountUnitText: {
    color: Colors.borderColor,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
  },
  successModalAmountInfoView: {
    flex: 0.4,
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
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
    fontFamily: Fonts.Medium
  },
} )
