import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView,
    StatusBar, AsyncStorage
} from "react-native";
import Fonts from "../../common/Fonts";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from "react-native-responsive-screen";
import BottomInfoBox from "../../components/BottomInfoBox";
import { useDispatch, useSelector } from "react-redux";
import { SECURE_ACCOUNT, TEST_ACCOUNT, REGULAR_ACCOUNT, } from "../../common/constants/serviceTypes";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Colors from "../../common/Colors";
import { RFValue } from "react-native-responsive-fontsize";

const AddressBook = props => {

    useEffect(() => {
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 0 }} />
            <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
            <View style={styles.modalHeaderTitleView}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                        onPress={() => {
                            props.navigation.goBack();
                        }}
                        style={{ height: 30, width: 30, justifyContent: "center" }}
                    >
                        <FontAwesome
                            name="long-arrow-left"
                            color={Colors.blue}
                            size={17}
                        />
                    </TouchableOpacity>
                    <Text style={styles.modalHeaderTitleText}>{"Address Book"}</Text>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ margin:30 }}>
                    <Text style={{ color: Colors.blue, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(14) }}>You are the Keeper of</Text>
                    <Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(10) }}>Lorem ipsum dolor sit amet, consectetur adipiscing</Text>
                </View>
                <View style={{ marginLeft: 30, marginRight:30, marginTop:10, marginBottom:10, flexDirection: "row", alignItems:'center' }}>
                    <Text style={{ color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(13) }}>Pamela Aalto</Text>
                    <TouchableOpacity onPress={()=>{props.navigation.navigate("ShareRecoverySecretOtp", {shareByType:"otp"})}} style={{ justifyContent:'center', alignItems:'center', width:wp("15%"), height:wp('8%'), borderRadius: 5, borderWidth: 1, borderColor: Colors.borderColor, marginLeft:'auto', backgroundColor:Colors.backgroundColor }}><Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(10) }}>Share</Text></TouchableOpacity>
                </View>
                <View style={{ marginLeft: 30, marginRight:30, marginTop:10, marginBottom:10, flexDirection: "row", alignItems:'center' }}>
                    <Text style={{ color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(13) }}>Pamela Aalto</Text>
                    <TouchableOpacity onPress={()=>{props.navigation.navigate("ShareRecoverySecretOtp", {shareByType:"qr"})}} style={{ justifyContent:'center', alignItems:'center', width:wp("15%"), height:wp('8%'), borderRadius: 5, borderWidth: 1, borderColor: Colors.borderColor, marginLeft:'auto', backgroundColor:Colors.backgroundColor }}><Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(10) }}>Share</Text></TouchableOpacity>
                </View>
            </View>
            <View style={{  }}>
            <BottomInfoBox title={'Lorem ipsum'} infoText={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'} />
        </View>
        </View>
    );
};

export default AddressBook;

const styles = StyleSheet.create({
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansRegular
    },
    modalHeaderTitleView: {
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: "center",
        flexDirection: "row",
        paddingRight: 10,
        paddingBottom: hp("1.5%"),
        paddingTop: hp("1%"),
        marginLeft: 10,
        marginRight: 10,
        marginBottom: hp("1.5%")
    },
})