import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from "../../components/AppBottomSheetTouchableWrapper";
import Octicons from 'react-native-vector-icons/Octicons';

export default function InstructionsModalContents(props) {
    return (<View style={{ ...styles.modalContentContainer, height: '100%', }}>
        <View style={{ height: '100%' }}>
            <View style={styles.successModalHeaderView}>
                <Text style={styles.modalTitleText}>{props.title}</Text>
                {props.info ? <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>{props.info}</Text> : null}
            </View> 
            <View style={{ height:'auto', marginRight: wp('8%'), marginLeft: wp('8%'), marginTop:wp('3%'),}}>
                {props.bulletPoints.map((value)=>{
                    console.log("value",value)
                    return <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Octicons name={"primitive-dot"} size={RFValue(10)} color={Colors.yellow} />
                        <Text style={{ marginLeft:wp("2%"), color: Colors.textColorGrey, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>{value}</Text>
                    </View>
                })}
            </View>
            <View style={{...styles.successModalHeaderView, marginTop: wp('8%'),}}>
                <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>{props.subInfo}</Text>
            </View> 
            <View style={{height: hp('18%'), flexDirection: 'row', marginTop: 'auto', alignItems: 'center', }} >
                <AppBottomSheetTouchableWrapper
                    onPress={() => props.onPressProceed()}
                    style={{ ...styles.successModalButtonView }}
                >
                    <Text style={styles.proceedButtonText}>{props.proceedButtonText}</Text>
                </AppBottomSheetTouchableWrapper>
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
        color: Colors.black,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansRegular,
    },
    modalInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(11),
        fontFamily: Fonts.FiraSansRegular,
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
        backgroundColor: Colors.yellow,
        alignSelf: 'center',
        marginLeft: wp('8%'),
    },
    proceedButtonText: {
        color: Colors.black,
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansMedium
    },
})