import React, { Component } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function RequestModalContents(props) {

    return (<View style={{ ...styles.modalContentContainer, height: '100%' }}>
        <View style={{ height: '100%' }}>
            <View style={{ marginTop: hp('3.5%'), marginBottom: hp('2%'), }}>
                <Text style={styles.commModeModalHeaderText}>Request Recovery Secret{"\n"}from trusted contact</Text>
                <Text style={styles.commModeModalInfoText}>Request share from Trusted Contact, you can change your trusted contact, or their primary mode of contact</Text>
            </View>
            <View style={styles.contactProfileView}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, backgroundColor: Colors.backgroundColor, height: 80, marginLeft: 60, overflow: 'hidden', position: "relative", borderRadius: 10 }}>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.contactNameText}>Sophie Babel</Text>
                            <Text style={{
                                color: Colors.textColorGrey,
                                fontFamily: Fonts.FiraSansRegular,
                                fontSize: RFValue(13, 812),
                                marginLeft: 25,
                            }}>sophiebabel@bithyve.com</Text>
                        </View>
                        <View style={{ marginRight: 10 }}>
                            <Image source={require('../assets/images/icons/phone-book.png')} style={styles.contactIconImage} />
                        </View>
                    </View>
                    <View style={{ backgroundColor: Colors.white, width: 80, height: 80, borderRadius: 80 / 2, position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../assets/images/icons/pexels-photo.png')} style={styles.contactProfileImage} />
                    </View>
                </View>

            </View>
            <Text style={{ ...styles.commModeModalInfoText, marginBottom: hp('3.5%') }}>You can choose to request the share via phone or email or via QR if your trusted contact is nearby</Text>
            <View style={{ flexDirection: 'row', backgroundColor: Colors.blue, height: 60, borderRadius: 10, marginLeft: 25, marginRight: 25, marginTop: hp('3%'), justifyContent: "space-evenly", alignItems: 'center' }}>
                <TouchableOpacity onPress={() => props.onPressRequest()} style={styles.buttonInnerView}>
                    <Image source={require("../assets/images/icons/icon_email.png")} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>Via Email</Text>
                </TouchableOpacity>
                <View style={{ width: 1, height: 30, backgroundColor: Colors.white }} />
                <TouchableOpacity style={styles.buttonInnerView}>
                    <Image source={require("../assets/images/icons/qr-code.png")} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>Via QR</Text>
                </TouchableOpacity>
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
    commModeModalHeaderText: {
        color: Colors.blue,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(18, 812),
        marginLeft: 25,
        marginRight: 25
    },
    commModeModalInfoText: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(11, 812),
        marginLeft: 25,
        marginRight: 25,
        marginTop: hp('0.7%')
    },
    contactProfileView: {
        flexDirection: 'row',
        marginLeft: 25,
        marginRight: 25,
        alignItems: 'center',
        justifyContent: "space-between",
        marginBottom: hp('3.5%'),
        marginTop: hp('1.7%')
    },
    contactProfileImage: {
        width: 70,
        height: 70,
        resizeMode: 'cover',
        borderRadius: 70 / 2
    },
    contactNameText: {
        color: Colors.black,
        fontSize: RFValue(25, 812),
        fontFamily: Fonts.FiraSansRegular,
        marginLeft: 25
    },
    contactIconImage: {
        width: 20,
        height: 20,
        resizeMode: 'cover',
    },
    buttonInnerView: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        width: wp('30%'),
    },
    buttonImage: {
        width: 20,
        height: 20,
        resizeMode: "contain"
    },
    buttonText: {
        color: Colors.white,
        fontSize: RFValue(12, 812),
        fontFamily: Fonts.FiraSansRegular,
        marginLeft: 10
    }
})