import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Platform,
    Linking
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import FontAwesome from "react-native-vector-icons/FontAwesome"
import DeviceInfo from 'react-native-device-info';

export default function GetBittrModalContents(props) {
    const signUp = () => {
        Linking.canOpenURL('https://xd.adobe.com/view/12940b0b-4aef-497d-51f7-6dd19b86fd57-64a5/').then(supported => {
          if (supported) {
            Linking.openURL('https://xd.adobe.com/view/12940b0b-4aef-497d-51f7-6dd19b86fd57-64a5/');
          } else {
            console.log("Don't know how to open URI: " + 'https://xd.adobe.com/view/12940b0b-4aef-497d-51f7-6dd19b86fd57-64a5/');
          }
        });
      };

    return (<View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', }}>
                <TouchableOpacity onPress={() => props.onPressBack()} style={{ height: 30, width: 30, }}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </TouchableOpacity>
                <View style={{ marginRight: 20, }}>
                    <Text style={styles.modalHeaderTitleText}>{"Get Bittr"}</Text>
                    <Text style={styles.modalHeaderInfoText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna</Text>
                </View>
            </View>
        </View>
        <View style={{ flex: 1, marginLeft: 20, }}>
            <Text style={styles.infoText}>Link your Gitbittr account to your wallet</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp('4%') : hp('3%') }}>
            <TouchableOpacity onPress={()=>signUp()} style={{
                marginLeft: 20,
                backgroundColor: Colors.blue, width: wp('35%'), height: wp('13%'), justifyContent: 'center', alignItems: 'center', borderRadius: 10
            }}><Text style={{ color: Colors.white, fontSize: RFValue(13, 812), fontFamily: Fonts.FiraSansMedium }}>SignUp</Text></TouchableOpacity>
            <TouchableOpacity style={{
                marginRight: 20, width: wp('35%'), height: wp('13%'), justifyContent: 'center', alignItems: 'center', borderRadius: 10
            }}><Text style={{ color: Colors.blue, fontSize: RFValue(13, 812), fontFamily: Fonts.FiraSansMedium }}>Sign In</Text></TouchableOpacity>
        </View>
    </View>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.white,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: Colors.borderColor,
        alignSelf: 'center',
        width: '100%'
    },
    modalHeaderTitleView: {
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 10,
        paddingBottom: hp('3%'),
        paddingTop: hp('2%'),
        marginLeft: 20,
        marginRight: 20,
        marginBottom: hp('1.5%'),
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18, 812),
        fontFamily: Fonts.FiraSansMedium
    },
    modalHeaderInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(11, 812),
        fontFamily: Fonts.FiraSansRegular,
        marginTop: hp('0.7%')
    },
    infoText: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(12, 812),
        marginTop: hp('0.5%')
    },
})