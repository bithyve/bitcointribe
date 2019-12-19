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
import { AppBottomSheetTouchableWrapper } from "../components/AppBottomSheetTouchableWrapper";

export default function ErrorModalContents(props) {
    return (<View style={{ ...styles.modalContentContainer, height: '100%', }}>
        <View style={{ height: '100%' }}>
            <View style={styles.successModalHeaderView}>
                <Text style={styles.modalTitleText}>{props.title}{props.titleNextLine ? "\n" + props.titleNextLine : null}</Text>
                <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>{props.info}</Text>
            </View>
            <View style={styles.successModalAmountView}>
                <Text style={{ ...styles.modalInfoText, marginBottom: hp('1%'), marginTop: 'auto' }}>{props.note}{props.noteNextLine ? "\n" + props.noteNextLine : null}</Text>
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
                        <Text style={{ ...styles.proceedButtonText, color: Colors.blue, }}>{props.cancelButtonText ? props.cancelButtonText : 'Ignore'}</Text>
                    </AppBottomSheetTouchableWrapper>
                }
                {props.isBottomImage &&
                    <Image source={props.bottomImage ? props.bottomImage : require('../assets/images/icons/noInternet.png') } style={styles.successModalImage} />
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
        marginRight: wp('8%'),
        marginLeft: wp('8%'),
        marginTop: wp('8%'),
    },
    modalTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18, 812),
        fontFamily: Fonts.FiraSansMedium,
    },
    modalInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(11, 812),
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
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 10 },
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
        fontSize: RFValue(13, 812),
        fontFamily: Fonts.FiraSansMedium
    },
})