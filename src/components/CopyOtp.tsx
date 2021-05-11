import React, { useState } from 'react';
import {
    View,
    Image,
    Text,
    Clipboard,
    TouchableOpacity
} from 'react-native';
import Colors from '../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import Toast from '../components/Toast';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Styles from '../pages/NewBHR/Styles';

export default function CopyOTP(props) {
    function writeToClipboard() {
        console.log('writeToClipboard');

        Clipboard.setString(props.OTP);
        props.setIsCopied(true)
        // Toast('Copied Successfully');
    }
    const OTP = props.OTP
    console.log('props.OTP', props.OTP);


    return (
        <View
            style={{
                marginTop: 10,
                // paddingLeft: 25,
                paddingRight: 25,
                marginHorizontal: 9,
                // alignItems: 'center', justifyContent: 'center'
            }}
        >
            <View style={{ flexDirection: 'row', backgroundColor: Colors.backgroundColor, borderRadius: 5 }} >
                <AppBottomSheetTouchableWrapper
                    style={{
                        flexDirection: 'row', alignItems: 'center'
                    }}
                >
                    <View style={Styles.otpTextView}>
                        <Text style={Styles.otpText}>{OTP[0]}</Text>
                    </View>
                    <View style={Styles.otpTextView}>
                        <Text style={Styles.otpText}>{OTP[1]}</Text>
                    </View>
                    <View style={Styles.otpTextView}>
                        <Text style={Styles.otpText}>{OTP[2]}</Text>
                    </View>
                    <View style={Styles.otpTextView}>
                        <Text style={Styles.otpText}>{OTP[3]}</Text>
                    </View>
                    <View style={Styles.otpTextView}>
                        <Text style={Styles.otpText}>{OTP[4]}</Text>
                    </View>
                    <View style={Styles.otpTextView}>
                        <Text style={Styles.otpText}>{OTP[5]}</Text>
                    </View>
                </AppBottomSheetTouchableWrapper>
                <TouchableOpacity
                    onPress={() => {
                        console.log('presssed');
                        writeToClipboard()
                    }}
                    style={{
                        width: wp('12%'),
                        height: wp('13%'),
                        backgroundColor: Colors.borderColor,
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        style={{ width: 18, height: props.openLink ? 18 : 20 }}
                        source={
                            props.openLink
                                ? require('../assets/images/icons/openlink.png')
                                : require('../assets/images/icons/icon-copy.png')
                        }
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
