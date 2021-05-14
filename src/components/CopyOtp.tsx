import React, { useState } from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard'
import Colors from '../common/Colors';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Styles from '../pages/NewBHR/Styles';

export default function CopyOTP(props) {
    function writeToClipboard() {
        Clipboard.setString(props.OTP);
        props.setIsCopied(true)
        // Toast('Copied Successfully');
    }
    const OTP = props.OTP

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
                <AppBottomSheetTouchableWrapper
                    onPress={() => {
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
                </AppBottomSheetTouchableWrapper>
            </View>
        </View>
    );
}
