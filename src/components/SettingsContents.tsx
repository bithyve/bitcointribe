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
import ToggleSwitch from './ToggleSwitch';
import Ionicons from "react-native-vector-icons/Ionicons";
import { AppBottomSheetTouchableWrapper } from "../components/AppBottomSheetTouchableWrapper";

export default function SettingsContents(props) {
    const [switchOn, setSwitchOn] = useState(false);
    return (<View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppBottomSheetTouchableWrapper onPress={() => props.onPressBack()} style={{ height: 30, width: 30, justifyContent: 'center', }}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </AppBottomSheetTouchableWrapper>
                <Text style={styles.modalHeaderTitleText}>{"Settings"}</Text>
            </View>
        </View>
        <View style={{ flex: 1 }}>
            {/* <View style={styles.selectedContactsView}>
                <Image source={require('../assets/images/icons/icon_secrets.png')} style={{ width: wp('7%'), height: wp('7%'), resizeMode: 'contain', marginLeft: 0, marginRight: 10 }} />
                <View style={{ justifyContent: 'center', marginRight: 10 }}>
                    <Text style={styles.titleText}>Jumble Keyboard</Text>
                    <Text style={styles.infoText}>Lorem ipsum dolor sit amet, consectetur</Text>
                </View>
                <View style={{ marginLeft: 'auto' }}>
                    <ToggleSwitch isNotImage={true} toggleColor={Colors.lightBlue} toggleCircleColor={Colors.blue} onpress={() => { setSwitchOn(!switchOn); }} toggle={switchOn} />
                </View>
            </View> */}
            <AppBottomSheetTouchableWrapper onPress={()=>props.onPressManagePIn()} style={{ ...styles.selectedContactsView, marginBottom: hp('3%') }}>
            <Image source={require('../assets/images/icons/icon_secrets.png')} style={{ width: wp('7%'), height: wp('7%'), resizeMode: 'contain', marginLeft: 0, marginRight: 10 }} />
                <View>
                    <Text style={styles.titleText}>Manage Passcode</Text>
                    <Text style={styles.infoText}>Change your passcode</Text>
                </View>
                <View style={{width: wp('17%'), justifyContent:'center', alignItems:'center', marginLeft: 'auto'}}>
                <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={15}
                    style={{ marginLeft: 'auto', alignSelf: 'center' }}
                />
                </View>
            </AppBottomSheetTouchableWrapper>
        </View>
        <View style={{
            flexDirection: 'row', elevation: 10,
            shadowColor: Colors.borderColor,
            shadowOpacity: 10,
            shadowOffset: { width: 2, height: 2 },
            backgroundColor: Colors.white,
            justifyContent: 'space-around',
            height: 45,
            alignItems: 'center',
            marginLeft: 10,
            marginRight: 10,
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: hp('1%'),
            marginBottom: hp('6%'),
            borderRadius: 10
        }}>
            <Text style={styles.addModalTitleText}>FAQ's</Text>
            <View style={{ height: 20, width: 1, backgroundColor: Colors.borderColor }} />
            <Text style={styles.addModalTitleText}>Terms And Conditions</Text>
            <View style={{ height: 20, width: 1, backgroundColor: Colors.borderColor }} />
            <Text style={styles.addModalTitleText}>Privacy Policy</Text>
        </View>
    </View>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.white,
        alignSelf: 'center',
        width: '100%'
    },
    modalHeaderTitleView: {
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 10,
        paddingBottom: 15,
        paddingTop: 10,
        marginLeft: 20,
        marginBottom: 15,
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansMedium
    },
    modalContentView: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactView: {
        height: 50,
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 20,
    },
    contactText: {
        marginLeft: 10,
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansRegular
    },
    contactIndexText: {
        fontSize: RFValue(10),
        fontFamily: Fonts.FiraSansRegular
    },
    contactIndexView: {
        flex: 0.5,
        height: '100%',
        justifyContent: 'space-evenly'
    },
    selectedContactsView: {
        marginLeft: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 20,
        borderBottomColor:Colors.borderColor,
        borderBottomWidth:1
    },
    titleText: {
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansRegular,
        color: Colors.blue
    },
    infoText: {
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansRegular,
        color: Colors.textColorGrey,
        marginTop: 5
    },
    shareButtonView: {
        height: wp('8%'),
        width: wp('15%'),
        backgroundColor: Colors.backgroundColor,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: 5,
        marginLeft: 'auto',
        justifyContent: 'center',
        alignItems: 'center'
    },
    shareButtonText: {
        fontSize: RFValue(10),
        fontFamily: Fonts.FiraSansRegular,
        color: Colors.textColorGrey
    },
    pageTitle: {
        marginLeft: 30,
        color: Colors.blue,
        fontSize: RFValue(14),
        fontFamily: Fonts.FiraSansRegular
    },
    pageInfoText: {
        marginLeft: 30,
        color: Colors.textColorGrey,
        fontSize: RFValue(10),
        fontFamily: Fonts.FiraSansRegular
    },
    addModalTitleText: {
        color: Colors.blue,
        fontSize: RFValue(14),
    },
})