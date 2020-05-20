import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function WalletBackupAndRecoveryContents(props) {

    return (<ScrollView style={styles.modalContainer}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {/* <AppBottomSheetTouchableWrapper onPress={()=>props.onPressManageBackup()} style={{
                width: wp('50%'), height: wp('13%'), backgroundColor: Colors.homepageButtonColor,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('2%'), marginBottom: hp('2%')
            }} > */}
                <Text style={{ color: Colors.white, fontFamily: Fonts.FiraSansMedium, fontSize: RFValue(20), marginTop: hp('1%'),
                marginBottom: hp('1%'), }}>Manage Backup</Text>
            {/* </AppBottomSheetTouchableWrapper> */}
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require("../../assets/images/icons/shieldWithRoundBorder.png")} style={{ width: wp("50%"), height: wp("50%"), resizeMode: "contain" }} />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('2%') }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>In <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansMedium }}>Hexa</Text>, you have full control of your bitcoins.{"\n"}This gives you <Text style={{ color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansMedium }}>better privacy and more security</Text></Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('2%'), marginBottom: hp('2%') }}>
            <Image source={require("../../assets/images/icons/mobileWithCircle.png")} style={{ width: wp("25%"), height: wp("25%"), resizeMode: "contain" }} />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>As only you can access your wallet,{"\n"}it is important to back it up properly{"\n"}in case you lose your phone</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("5%") }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>Once backed up,{'\n'}the automated health check process ensures{'\n'} you have access to the backup at all times</Text>
            <Text style={{ marginTop: 5, textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansMedium }}>The shield tells you{'\n'}how healthy your back-up is</Text>
        </View>
        <View style={{
            flexDirection: 'row',
            marginTop: hp('2%'),
            marginBottom: hp('2%'),
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <AppBottomSheetTouchableWrapper onPress={()=>props.onStartBackup()} style={{
                width: wp('30%'), height: wp('13%'),
                backgroundColor: Colors.white,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{ color: Colors.blue, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>Start Backup</Text>
            </AppBottomSheetTouchableWrapper>
            <AppBottomSheetTouchableWrapper onPress={()=>props.onSkip()} style={{
                width: wp('20%'), height: wp('13%'),
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{ color: Colors.white, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>Skip</Text>
            </AppBottomSheetTouchableWrapper>
        </View>
        <View style={{ position: 'relative', flexDirection: 'row', justifyContent: "space-around", alignItems: 'center' }}>
            <View style={{
                borderStyle: 'dotted',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: Colors.white,
                width: wp('30%'),
                height: 0,
            }} />
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(16), fontFamily: Fonts.FiraSansMedium }}>How It Works</Text>
            <View style={{
                borderStyle: 'dotted',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: Colors.white,
                width: wp('30%'),
                height: 0
            }} />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("4%") }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>The app creates five Recovery Keys for your wallet</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("4%") }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>All you need to do is follow the steps and{'\n'}share these Recovery Keys{'\n'}with five separate and unrelated Keepers</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("2%") }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>(Don’t worry, Keepers can only help you recover{'\n'}your wallet and cannot see or use your bitcoins)</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('2%'), marginBottom: hp('2%') }}>
            <Image source={require("../../assets/images/icons/walletBackupIllutration.png")} style={{ width: wp("90%"), height: wp("80%"), resizeMode: "contain" }} />
        </View>
        <View style={{ backgroundColor: Colors.homepageButtonColor, height: 1, marginLeft: wp('5%'), marginRight: wp('5%') }} />
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("5%"),  }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>If you lose your phone,{'\n'}all you have to do is get back <Text style={{ marginTop: 5, textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansMedium }}>three of the five</Text> Recovery Keys</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('2%'), marginBottom: hp('2%') }}>
            <Image source={require("../../assets/images/icons/walletbackupRequestBackupThree.png")} style={{ width: wp("90%"), height: wp("80%"), resizeMode: "contain" }} />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center',}}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12), fontFamily: Fonts.FiraSansRegular }}>Once you answer your secure question,{"\n"}the wallet is instantly recreated</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('1%'), marginBottom: hp('2%') }}>
            <Image source={require("../../assets/images/icons/Walletbackupwalletrecreate.png")} style={{ width: wp("90%"), height: wp("50%"), resizeMode: "contain" }} />
        </View>
        <View style={{ backgroundColor: Colors.homepageButtonColor, height: 1, marginLeft: wp('5%'), marginRight: wp('5%') }} />
        <View style={{
            flexDirection: 'row',
            marginTop: hp('2%'),
            marginBottom: hp('2%'),
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <AppBottomSheetTouchableWrapper onPress={()=>props.onStartBackup()} style={{
                width: wp('30%'), height: wp('13%'),
                backgroundColor: Colors.white,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{ color: Colors.blue, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>Start Backup</Text>
            </AppBottomSheetTouchableWrapper>
            <AppBottomSheetTouchableWrapper onPress={()=>props.onSkip()} style={{
                width: wp('20%'), height: wp('13%'),
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{ color: Colors.white, fontSize: RFValue(13), fontFamily: Fonts.FiraSansRegular }}>Skip</Text>
            </AppBottomSheetTouchableWrapper>
        </View>
    </ScrollView>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.blue,
        alignSelf: 'center',
        width: '100%',
        paddingBottom: hp('5%'),
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 2 },
    },
})