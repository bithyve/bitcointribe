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
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../components/ContactList";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";

export default function TransactionDetailsContents(props) {

    return (<View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => props.onPressBack()} style={{ height: 30, width: 30, justifyContent: 'center', }}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitleText}>{"Transaction Details"}</Text>
            </View>
        </View>
        <View style={{ flexDirection: 'row', marginLeft: hp('2%'), marginRight: hp('2%'), alignItems: 'center', paddingTop: hp('2%'), paddingBottom: hp('2%') }}>
            <View>
                <Image source={require("../assets/images/icons/icon_regular.png")} style={{ width: wp('12%'), height: wp('12%') }} />
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                <View>
                    <Text style={{ color: Colors.blue, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(14, 812) }}>Regular account</Text>
                    <Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812), marginTop: hp('1%') }}>30 November 2019 <Entypo size={10} name={'dot-single'} color={Colors.textColorGrey} /> 11:00am</Text>
                </View>
                <FontAwesome style={{ marginLeft: 'auto' }} name="long-arrow-down" color={Colors.green} size={17} />
            </View>
        </View>
        <View style={{ flex: 1 }}>
            <View style={styles.infoCardView}>
                <Text style={{ color: Colors.blue, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812) }}>Amount</Text>
                <View style={{ flexDirection: "row", alignItems: 'center', marginTop: hp('0.5%') }}>
                    <Image source={require("../assets/images/icons/icon_bitcoin_gray.png")} style={{ width: wp('3%'), height: wp('3%'), resizeMode: "contain" }} />
                    <Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812), marginLeft: 3 }}>0.025</Text>
                </View>
            </View>
            <View style={styles.infoCardView}>
                <Text style={{ color: Colors.blue, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812) }}>To Address</Text>
                <Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812), marginTop: hp('0.5%') }}>8572308235034623</Text>
            </View>
            <View style={styles.infoCardView}>
                <Text style={{ color: Colors.blue, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812) }}>From Address</Text>
                <Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812), marginTop: hp('0.5%') }}>234255609325230</Text>
            </View>
            <View style={styles.infoCardView}>
                <Text style={{ color: Colors.blue, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812) }}>To Address</Text>
                <Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812), marginTop: hp('0.5%') }}>0.00134</Text>
            </View>
            <View style={styles.infoCardView}>
                <Text style={{ color: Colors.blue, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812) }}>Fees</Text>
                <Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812), marginTop: hp('0.5%') }}>0.0001</Text>
            </View>
            <View style={styles.infoCardView}>
                <Text style={{ color: Colors.blue, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812) }}>Transaction ID</Text>
                <Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812), marginTop: hp('0.5%') }}>3242533466db</Text>
            </View>
            <View style={styles.infoCardView}>
                <Text style={{ color: Colors.blue, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812) }}>Confirmations</Text>
                <Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812), marginTop: hp('0.5%') }}>6+</Text>
            </View>
        </View>
    </View>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.backgroundColor,
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
        paddingRight: hp('1%'),
        paddingBottom: hp('1.5%'),
        paddingTop: hp('1%'),
        marginLeft: hp('2%'),
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18, 812),
        fontFamily: Fonts.FiraSansMedium
    },
    infoCardView: {
        backgroundColor: Colors.white,
        marginLeft: hp('2%'),
        marginRight: hp('2%'),
        height: hp("8%"),
        borderRadius: 10,
        justifyContent: 'center',
        paddingLeft: hp('2%'),
        paddingRight: hp('2%'),
        marginBottom: hp('0.5%'),
        marginTop: hp('0.5%'),
    }
})