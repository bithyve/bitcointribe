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
            <AppBottomSheetTouchableWrapper onPress={()=>props.onPressManageBackup()} style={{
                width: wp('50%'), height: wp('13%'), backgroundColor: Colors.homepageButtonColor,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('2%'), marginBottom: hp('2%')
            }} >
                <Text style={{ color: Colors.white, fontFamily: Fonts.FiraSansMedium, fontSize: RFValue(20, 812) }}>Manage Backup</Text>
            </AppBottomSheetTouchableWrapper>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require("../../assets/images/icons/shieldWithRoundBorder.png")} style={{ width: wp("50%"), height: wp("50%"), resizeMode: "contain" }} />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('2%') }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansRegular }}>In <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansMedium }}>Hexa</Text>, you have full control of your bitcoins.{"\n"}This gives you <Text style={{ color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansMedium }}>better privacy and more security.</Text></Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('2%'), marginBottom: hp('2%') }}>
            <Image source={require("../../assets/images/icons/mobileWithCircle.png")} style={{ width: wp("25%"), height: wp("25%"), resizeMode: "contain" }} />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansRegular }}>Since, you and only you can access your wallet,{"\n"}it is important to back it up properly{"\n"}in case you lose your phone.</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("5%") }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansRegular }}>Once backed up,{"\n"}the automated health process help{"\n"}keep the back up accessible at all times.</Text>
            <Text style={{ marginTop: 5, textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansMedium }}>The shield tells you{"\n"}how healthy your wallet back-up is.</Text>
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
                <Text style={{ color: Colors.blue, fontSize: RFValue(13, 812), fontFamily: Fonts.FiraSansRegular }}>Start Backup</Text>
            </AppBottomSheetTouchableWrapper>
            <AppBottomSheetTouchableWrapper onPress={()=>props.onSkip()} style={{
                width: wp('20%'), height: wp('13%'),
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{ color: Colors.white, fontSize: RFValue(13, 812), fontFamily: Fonts.FiraSansRegular }}>Skip</Text>
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
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(16, 812), fontFamily: Fonts.FiraSansMedium }}>How It Works</Text>
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
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansRegular }}>For wallet recovery,{"\n"}you have <Text style={{ marginTop: 5, textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansMedium }}>five recovery secrets</Text>{"\n"}that your app generates</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("4%") }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansRegular }}>All you need to do is to follow the steps and share{"\n"}these across <Text style={{ marginTop: 5, textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansMedium }}>five separate</Text> and unrelated sources</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('2%'), marginBottom: hp('2%') }}>
            <Image source={require("../../assets/images/icons/walletBackupIllutration.png")} style={{ width: wp("90%"), height: wp("80%"), resizeMode: "contain" }} />
        </View>
        <View style={{ backgroundColor: Colors.homepageButtonColor, height: 1, marginLeft: wp('5%'), marginRight: wp('5%') }} />
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("5%"),  }}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansRegular }}>In the situation, where you have lost the phone and want{"\n"}to recreate the wallet, all you have to do is{"\n"}<Text style={{ marginTop: 5, textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansMedium }}>request back three</Text> of the five secrets</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('2%'), marginBottom: hp('2%') }}>
            <Image source={require("../../assets/images/icons/walletbackupRequestBackupThree.png")} style={{ width: wp("90%"), height: wp("80%"), resizeMode: "contain" }} />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center',}}>
            <Text style={{ textAlign: 'center', color: Colors.white, fontSize: RFValue(12, 812), fontFamily: Fonts.FiraSansRegular }}>Once you answer your secure question,{"\n"}the wallet is instantly recreated</Text>
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
                <Text style={{ color: Colors.blue, fontSize: RFValue(13, 812), fontFamily: Fonts.FiraSansRegular }}>Start Backup</Text>
            </AppBottomSheetTouchableWrapper>
            <AppBottomSheetTouchableWrapper onPress={()=>props.onSkip()} style={{
                width: wp('20%'), height: wp('13%'),
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{ color: Colors.white, fontSize: RFValue(13, 812), fontFamily: Fonts.FiraSansRegular }}>Skip</Text>
            </AppBottomSheetTouchableWrapper>
        </View>
    </ScrollView>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.blue,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: Colors.blue,
        borderTopColor: Colors.borderColor,
        alignSelf: 'center',
        width: '100%',
        paddingBottom: hp('5%'),
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 2 },
    },
})