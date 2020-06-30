import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';

export default function WalletNameChangeSuccessModalContents(props) {
    return (<View style={{ ...styles.modalContentContainer, height: '100%', }}>
    <View style={{ height: '100%' }}>
        <View style={styles.successModalHeaderView}>
            <Text style={styles.modalTitleText}>{props.title}</Text>
            {props.info ? <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>{props.info}</Text> : null}
        </View> 
        <View style={styles.successModalAmountView}>
        {props.note ?<Text style={{ ...styles.modalInfoText, marginBottom: hp('1%'), marginTop: 'auto' }}>{props.note}{props.noteNextLine ? "\n" + props.noteNextLine : null}</Text> : null }
        </View>
        <View style={{height: hp('18%'), flexDirection: 'row', marginTop: 'auto', alignItems: 'center', }} >
            <AppBottomSheetTouchableWrapper
                onPress={() => props.onPressProceed()}
                style={{ ...styles.successModalButtonView }}
            >
                <Text style={styles.proceedButtonText}>{props.proceedButtonText}</Text>
            </AppBottomSheetTouchableWrapper>
            {props.isIgnoreButton &&
                <AppBottomSheetTouchableWrapper
                    onPress={() => props.onPressIgnore()}
                    style={{ height: wp('13%'), width: wp('35%'), justifyContent: 'center', alignItems: 'center', }}
                >
                    {props.isLoading ? <ActivityIndicator size="small" color={Colors.black} /> : 
                    <Text style={{ ...styles.proceedButtonText, color: Colors.blue, }}>{props.cancelButtonText ? props.cancelButtonText : 'Ignore'}</Text>
                    }
                </AppBottomSheetTouchableWrapper>
            }
            {props.isBottomImage &&
                <Image source={props.bottomImage ? props.bottomImage : require('../assets/images/icons/illustration.png') } style={styles.successModalImage} />
            }
        </View>
    </View>
</View>
)
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginTop: wp('5%'),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  successModalAmountView: {
    justifyContent: 'center',
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginTop: hp('3%'),
  },
  successModalButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp('8%'),
  },
  successModalImage: {
    width: wp('30%'),
    height: wp('35%'),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: -5,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});
