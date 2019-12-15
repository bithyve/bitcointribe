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
import FontAwesome from "react-native-vector-icons/FontAwesome"
import Ionicons from "react-native-vector-icons/Ionicons";
import BottomInfoBox from './BottomInfoBox';

export default function FastBitcoinModalContents(props) {
    return (<View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', }}>
                <TouchableOpacity onPress={() => props.onPressBack()} style={{ height: 30, width: 30, }}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.modalHeaderTitleText}>{"Fast Bitcoin"}</Text>
                    <Text style={styles.modalHeaderInfoText}>Buy and sell bitcoins with cash,{"\n"}Lightning deposits and deliveries enabled</Text>
                </View>
            </View>
        </View>
        <View style={{ flex: 1, }}>
            <TouchableOpacity onPress={()=>props.onPressSellTab()} style={styles.cardView}>
                <Image source={require("../assets/images/icons/fastbitcoin_dark.png")} style={styles.image} />
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.titleText}>Sell</Text>
                    <Text style={styles.infoText}>Lorem ipsum dolor sit amet, consectetur</Text>
                </View>
                <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={12}
                    style={{ marginLeft: 'auto', marginRight: 20 }}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>props.onPressRedeemTab()} style={styles.cardView}>
                <Image source={require("../assets/images/icons/fastbitcoin_dark.png")} style={styles.image} />
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.titleText}>Redeem</Text>
                    <Text style={styles.infoText}>Lorem ipsum dolor sit amet, consectetur</Text>
                </View>
                <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={12}
                    style={{ marginLeft: 'auto', marginRight: 20 }}
                />
            </TouchableOpacity>
        </View>
        <View style={{  }}>
            <BottomInfoBox title={'Lorem ipsum'} infoText={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'} />
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
    cardView: {
        flexDirection: 'row',
        marginLeft: hp('2%'),
        marginRight: hp('2%'),
        alignItems: 'center',
        paddingTop: hp('2%'),
        paddingBottom: hp('2%'),
        borderBottomColor: Colors.borderColor,
        borderBottomWidth: 2
    },
    image: {
        width: wp('7%'),
        height: wp('7%'),
        resizeMode: "contain"
    },
    titleText: {
        color: Colors.blue,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(14, 812)
    },
    infoText: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(12, 812),
        marginTop: hp('0.5%')
    },
    infoView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10
    }

})