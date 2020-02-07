import React, { useState } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function LoaderModal(props) {

    return (<View style={{ ...styles.modalContentContainer, height: '100%', }}>
        <View style={{ height: '100%'}}>
         <View style={styles.successModalHeaderView}>
         <Image source={require('../assets/images/icons/loader.png')} style={styles.successModalImage} />
            
         {/* <ActivityIndicator style={{ marginBottom: wp('10%'),}} size="large" color={Colors.blue} />
                <Text style={styles.modalTitleText}>{props.headerText}</Text>
                <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>{props.messageText}</Text> */}
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
        // marginRight: wp('10%'),
        // marginLeft: wp('10%'),
        flex: 1.7,
        marginBottom: 'auto'
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
        width: wp('100%'),
        height: hp('18%'),
        resizeMode: 'contain'
    },
    proceedButtonText: {
        color: Colors.white,
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansMedium
    },
})