import React, { useState } from 'react'
import {
  Platform, StyleSheet, Text, TextInput, View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'

export default function WalletName( props ) {
  const [ walletName, setWalletName ] = useState( '' )
  return (
    <View style={styles.modalContentContainer}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.headerTitleText}>Enter your Wallet’s Name</Text>
        <Text style={styles.headerInfoText}>
        Please use the same name, as of the wallet that you have lost
        </Text>
      </View>
      <View style={{
        paddingTop: wp( '10%' ), paddingBottom: wp( '10%' ), justifyContent: 'center', alignItems: 'center'
      }}>
        <TextInput
          placeholder={'Enter wallet name ( no need of capitals)'}
          placeholderTextColor={Colors.borderColor}
          value={walletName}
          style={styles.inputStyle}
          onChangeText={( text )=>{setWalletName( text )}}
          onFocus={() => {
            if ( Platform.OS == 'ios' ) {
              props.modalRef.snapTo( 2 )
            }
          }}
          onBlur={() => {
            if ( Platform.OS == 'ios' ) {
              props.modalRef.snapTo( 1 )
            }
          }}
        />
      </View>
      <View style={styles.successModalAmountView}>
        <Text style={styles.bottomInfoText}>
        Click Continue to create a link that helps you source your wallet. Click Forgot? and we'll try to remind it to you
        </Text>
      </View>
      <View style={styles.bottomButtonsView}>
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressProceed()}
          style={styles.successModalButtonView}
        >
          <Text
            style={{
              ...styles.proceedButtonText,
              color: Colors.white,
            }}
          >
            Continue
          </Text>
        </AppBottomSheetTouchableWrapper>
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressBack()}
          style={styles.transparentButtonView}
        >
          <Text
            style={{
              ...styles.proceedButtonText,
              color: Colors.blue,
            }}
          >
            Forgot Name
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Medium,
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    marginTop: wp( '1.5%' ),
  },
  bottomInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    marginBottom: hp( '1%' ),
    marginTop: 'auto',
  },
  bottomButtonsView: {
    height: hp( '15%' ),
    flexDirection: 'row',
    alignItems: 'center',
  },
  transparentButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalHeaderView: {
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: wp( '4%' ),
  },
  successModalAmountView: {
    justifyContent: 'center',
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    // elevation: 10,
    // shadowColor: Colors.shadowBlue,
    // shadowOpacity: 1,
    // shadowOffset: {
    //   width: 15, height: 15
    // },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '8%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  inputStyle: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    width: wp( '90%' ),
    paddingLeft: wp( '2%' ),
    paddingRight: wp( '2%' ),
  },
} )
