import React, { useState } from 'react';
import {
    View,
    Image,
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
import { AppBottomSheetTouchableWrapper } from "../components/AppBottomSheetTouchableWrapper";

export default function AddContactsModalContents(props) {
    return (<View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', }}>
            <AppBottomSheetTouchableWrapper onPress={() => props.onPressBack()} style={{ height: 30, width: 30, }}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
            </AppBottomSheetTouchableWrapper>
                <View>
                    <Text style={styles.modalHeaderTitleText}>{"Add Contact"}</Text>
                    <Text style={styles.modalHeaderInfoText}>Add contact from your{"\n"}address book</Text>
                </View>
            </View>
        </View>
        <View style={{ flex: 1, }}>
            <AppBottomSheetTouchableWrapper onPress={()=>props.onPressFriendAndFamily()} style={styles.cardView}>
                <Image source={require("../assets/images/icons/user.png")} style={styles.image} />
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.titleText}>Friends and Family</Text>
                    <Text style={styles.infoText}>Lorem ipsum dolor sit amet, consectetur</Text>
                </View>
                <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={12}
                    style={{ marginLeft: 'auto', marginRight: 20 }}
                />
            </AppBottomSheetTouchableWrapper>
            <AppBottomSheetTouchableWrapper onPress={()=>props.onPressBiller()} style={styles.cardView}>
                <Image source={require("../assets/images/icons/invoice.png")} style={styles.image} />
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.titleText}>Billers</Text>
                    <Text style={styles.infoText}>Lorem ipsum dolor sit amet, consectetur</Text>
                </View>
                <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={12}
                    style={{ marginLeft: 'auto', marginRight: 20 }}
                />
            </AppBottomSheetTouchableWrapper>
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