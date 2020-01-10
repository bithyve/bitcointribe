import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';

export default function RegenerateHealper(props) {
    const array = [1, 2, 3, 4];
    return (<View style={styles.modalContainer}>
        <ScrollView>
            <View style={{ height: '100%', }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <AppBottomSheetTouchableWrapper onPress={() => props.onPressRegenerateShare()} style={{
                        width: wp('85%'), height: wp('13%'), backgroundColor: Colors.homepageButtonColor,
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: hp('2%'), marginBottom: hp('2%')
                    }} >
                        <Text style={{ color: Colors.white, fontFamily: Fonts.FiraSansMedium, fontSize: RFValue(14) }}>{props.topButtonText}</Text>
                    </AppBottomSheetTouchableWrapper>
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require("../../assets/images/icons/testAccountHelperImage.png")} style={{ width: wp("50%"), height: wp("50%"), resizeMode: "contain" }} />
                </View>
                {array.map((value) =>
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: wp('10%'), marginRight: wp('10%'), marginTop: hp('2%'), marginBottom: hp('2%'), flexDirection: 'row' }}>
                        <View style={{
                            borderStyle: "dotted",
                            borderWidth: 2,
                            borderRadius: 15 / 2,
                            height: 15, width: 15,
                            borderColor: Colors.white
                        }} />
                        <Text style={{ marginLeft: 20, color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>{"Lorem ipsum dolor sit amet, consetetur\nsadipscing elitr, sed diam nonumy eirmod"}</Text>
                    </View>
                )}
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('2%') }}>
                    <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansMedium }}>{"Lorem ipsum dolor sit amet, consetetur\nsadipscing elitr, sed diam nonumy"}</Text>
                </View>
            </View>
        </ScrollView>
        <View style={{
            flexDirection: 'row',
            marginTop: hp('1%'),
            marginBottom: hp('5%'),
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <AppBottomSheetTouchableWrapper onPress={() => props.onPressContinue()} style={{
                width: wp('40%'), height: wp('13%'),
                backgroundColor: Colors.white,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{ color: Colors.blue, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>{props.continueButtonText}</Text>
            </AppBottomSheetTouchableWrapper>
            <AppBottomSheetTouchableWrapper onPress={() => props.onPressQuit()} style={{
                width: wp('20%'), height: wp('13%'),
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{ color: Colors.white, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>{props.quitButtonText}</Text>
            </AppBottomSheetTouchableWrapper>
        </View>
    </View>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.blue,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: Colors.blue,
        borderTopColor: Colors.borderColor,
        alignSelf: 'center',
        width: '100%',
        paddingBottom: hp('5%'),
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 2 },
    },
})