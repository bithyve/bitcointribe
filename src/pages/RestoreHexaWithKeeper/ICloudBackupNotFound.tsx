import React, { useState } from 'react'
import { View, Image, Text, StyleSheet, ImageBackground, Platform } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'

export default function ICloudBackupNotFound( props ) {
  let name
  if ( Platform.OS == 'ios' ) name = 'iCloud'
  else name = 'GDrive'
  const [ backupName, setBackupName ] = useState( name )

  return (
    <View style={styles.modalContentContainer}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.headerTitleText}>
          { backupName + ' backup not found'}
        </Text>
        <Text style={styles.headerInfoText}>
        We did not find a backup on iCloud. Click on Continue to recover your wallet using other Recovery Keys
        </Text>
      </View>
      {/* <View style={styles.successModalAmountView}>
        <Text style={styles.bottomInfoText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
        </Text>
      </View> */}
      <View style={styles.bottomButtonsView}>
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressProceed()}
          style={styles.successModalButtonView}
        >
          <Text style={styles.proceedButtonText}>Continue</Text>
        </AppBottomSheetTouchableWrapper>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    // height: '100%',
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
    marginTop: 'auto',
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
    marginLeft: wp( '8%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  greyBox: {
    width: wp( '90%' ),
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  greyBoxImage: {
    width: wp( '15%' ),
    height: wp( '15%' ),
  },
  greyBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 20 ),
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
    marginTop: 'auto',
    lineHeight: RFValue( 17 ),
  },
  cardAmountTextGrey: {
    color: Colors.black,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 18 ),
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue( 18 ),
  },
  cardBitCoinImage: {
    width: wp( '3%' ),
    height: wp( '3%' ),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp( '0.7%' ),
  },
  successModalImage: {
    width: wp( '30%' ),
    height: wp( '35%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: -5,
  },
} )
