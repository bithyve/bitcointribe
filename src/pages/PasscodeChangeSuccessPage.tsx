import React, { useState,useEffect } from 'react';
import {
    View,
    Image,
    Text,
    SafeAreaView,
    StyleSheet,
    StatusBar
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from "../components/AppBottomSheetTouchableWrapper";
import { useDispatch, useSelector } from 'react-redux';
import {
    changeAuthCred,
    switchCredsChanged,
  } from '../store/actions/setupAndAuth';
export default function PasscodeChangeSuccessPage(props) {
    const dispatch = useDispatch();
    return (
        <SafeAreaView style={{ flex: 1 }}>
        <StatusBar />
        <View style={{ flex: 1 }}>
            <View style={{ ...styles.modalContentContainer, height: '100%', }}>
        <View style={{ height: '100%' }}>
           
            <View style={styles.successModalHeaderView}>
                <Text style={styles.modalTitleText}>Passcode changed successfully</Text>
            </View> 
            <View style={styles.successModalAmountView}>
                <Text style={{ ...styles.modalInfoText, marginBottom: hp('1%'), marginTop: 'auto' }}>Please use your new passcode to login </Text>
            </View>
            <View style={{height: hp('18%'), flexDirection: 'row', marginTop: 'auto', alignItems: 'center', }} >
                <AppBottomSheetTouchableWrapper
                    onPress={() => {
                        dispatch(switchCredsChanged());
                        props.navigation.popToTop();
                    }}
                    style={{ ...styles.successModalButtonView }}
                >
                    <Text style={styles.proceedButtonText}>View Settings</Text>
                </AppBottomSheetTouchableWrapper>
                <Image source={require('../assets/images/icons/noInternet.png') } style={styles.successModalImage} />
            </View>
        </View>
    </View>
    </View>
    </SafeAreaView>
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
        marginTop: wp('8%'),
    },
    modalTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansMedium,
    },
    modalInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(11),
        fontFamily: Fonts.FiraSansMedium,
    },
    successModalAmountView: {
        justifyContent: 'center',
        marginRight: wp('8%'),
        marginLeft: wp('8%'),
        marginTop:hp('3%')
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
        width: wp('25%'),
        height: hp('18%'),
        marginLeft: 'auto',
        resizeMode: "cover"
    },
    proceedButtonText: {
        color: Colors.white,
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansMedium
    },
})