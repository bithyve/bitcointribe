import React, { useState } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Entypo from "react-native-vector-icons/Entypo"
import { AppBottomSheetTouchableWrapper } from "../components/AppBottomSheetTouchableWrapper";

export default function NoInternetModalContents(props) {

    return (<View style={{ ...styles.modalContentContainer, height: '100%', }}>
        <View style={{ height: '100%' }}>
            <View style={styles.successModalHeaderView}>
                <Text style={styles.modalTitleText}>No Internet{"\n"}Connection</Text>
                <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>There seems to be a problem with your{"\n"}<Text style={{ fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold', fontStyle: 'italic' }}>internet connection</Text></Text>
            </View>
            <View style={styles.successModalAmountView}>
                <Text style={{ ...styles.modalInfoText, marginBottom: hp('3%') }}>Some of the features will not work as expected in your Hexa app, including:</Text>
                <View style={{  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        <Entypo name={'dot-single'} size={10} color={Colors.textColorGrey} />
                        <Text style={{ ...styles.modalInfoText, }}>fetching your balance and transactions</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        <Entypo name={'dot-single'} size={10} color={Colors.textColorGrey} />
                        <Text style={styles.modalInfoText}>sending sats</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        <Entypo name={'dot-single'} size={10} color={Colors.textColorGrey} />
                        <Text style={styles.modalInfoText}>contact requests
</Text>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 'auto', alignItems:'center' }} >
                <AppBottomSheetTouchableWrapper
                    onPress={() => props.onPressTryAgain()}
                    style={{ ...styles.successModalButtonView }}
                >
                    <Text style={styles.proceedButtonText}>OK</Text>
                </AppBottomSheetTouchableWrapper>
                {/* <AppBottomSheetTouchableWrapper
                    onPress={() => props.onPressIgnore()}
                    style={{
                        height: wp('13%'),
                        width: wp('35%'),
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{...styles.proceedButtonText, color:Colors.blue, }}>Ignore</Text>
                </AppBottomSheetTouchableWrapper> */}
                <Image source={require('../assets/images/icons/noInternet.png')} style={styles.successModalImage} />
            </View>
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    modalContentContainer: {
        height: '100%',
        backgroundColor: Colors.white,
        borderTopLeftRadius: 10,
        borderLeftColor: Colors.borderColor,
        borderLeftWidth: 1,
        borderTopRightRadius: 10,
        borderRightColor: Colors.borderColor,
        borderRightWidth: 1,
        borderTopColor: Colors.borderColor,
        borderTopWidth: 1,
    },
    successModalHeaderView: {
        marginRight: wp('10%'),
        marginLeft: wp('10%'),
        marginTop: wp('10%'),
        flex: 1.7
    },
    modalTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansMedium,
    },
    modalInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(11),
        fontFamily: Fonts.FiraSansRegular,
    },
    successModalAmountView: {
        flex: 2,
        justifyContent: 'center',
        marginRight: wp('10%'),
        marginLeft: wp('10%'),
    },
    successModalWalletNameText: {
        color: Colors.black,
        fontSize: RFValue(25),
        fontFamily: Fonts.FiraSansRegular
    },
    successModalAmountImage: {
        width: wp('3%'),
        height: wp('3%'),
        marginRight: 5,
        marginBottom: wp('1%'),
        resizeMode: 'contain',
    },
    successModalAmountText: {
        color: Colors.black,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(21),
        marginRight: 5
    },
    successModalAmountUnitText: {
        color: Colors.borderColor,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(11),
    },
    successModalAmountInfoView: {
        flex: 0.4,
        marginRight: wp('10%'),
        marginLeft: wp('10%'),
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
        marginLeft: wp('10%'),
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