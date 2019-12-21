import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import KnowMoreButton from '../components/KnowMoreButton';
import QrScanner from '../components/QrScanner';

export default function RestoreByCloudQrCodeContents(props) {
    const [qrData, setQrData] = useState("");
    return (<SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <ScrollView style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ height: 30, width: 30, }}>
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.modalHeaderTitleText}>Enter Recovery Secret{"\n"}from Cloud</Text>
                    <Text numberOfLines={2} style={styles.modalHeaderInfoText}>{props.pageInfo}These are the 8 QR codes saved in the{"\n"}PDF you stored in your cloud service</Text>
                </View>
                <View style={{ flexDirection: 'row', marginLeft: 'auto', }}>
                    <KnowMoreButton onpress={() => { alert(qrData) }} containerStyle={{}} textStyle={{}} />
                    <Image source={require("../assets/images/icons/icon_error_red.png")} style={{ width: wp('5%'), height: wp('5%'), resizeMode: 'contain' }} />
                </View>
            </View>
        </View>
        <View style={{ marginLeft: 30 }}>
            <Text style={{
                color: Colors.blue,
                fontSize: RFValue(13, 812),
                fontFamily: Fonts.FiraSansMedium
            }}>Step 5 of 8</Text>
            <Text numberOfLines={2} style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(11, 812),
                fontFamily: Fonts.FiraSansMedium
            }}>{props.pageInfo}Please scan the 5th QR code on the{"\n"}PDF you have</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{
                width: wp('100%'),
                height: wp('100%'),
                overflow: "hidden",
                borderRadius: 20,
                marginTop: hp('3%')
            }}>
                <QrScanner onScanQRCode={async (data) => { setQrData(data) }} />
            </View>
        </View>
        <View style={{ marginBottom: hp('3%'), marginTop: hp('3%'), marginRight: 20, }}>
            <View style={styles.statusIndicatorView}>
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorActiveView} />
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorInactiveView} />
            </View>
        </View>
    </ScrollView>
    </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.white,
        width: '100%'
    },
    modalHeaderTitleView: {
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingBottom: hp('1.5%'),
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
        marginTop: hp('0.7%'),
        flexWrap: 'wrap'
    },
    qrModalImage: {
        width: wp('100%'),
        height: wp('100%'),
        borderRadius: 20,
        marginTop: hp('5%')
    },
    statusIndicatorView: {
        flexDirection: 'row',
        marginLeft: 'auto',
    },
    statusIndicatorActiveView:
    {
        height: 5,
        width: 25,
        backgroundColor: Colors.blue,
        borderRadius: 10,
        marginLeft: 2,
        marginRight: 2
    },
    statusIndicatorInactiveView: {
        width: 5,
        backgroundColor: Colors.lightBlue,
        borderRadius: 10,
        marginLeft: 2,
        marginRight: 2
    }
})