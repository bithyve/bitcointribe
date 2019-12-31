import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    ImageBackground,
    Platform,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import KnowMoreButton from '../../components/KnowMoreButton';
import QrScanner from '../../components/QrScanner';
import { RNCamera } from 'react-native-camera';
import BackupStyles from './Styles';
import { getIconByStatus } from './utils';

export default function CloudHealthCheck(props) {
    const [selectedStatus, setSelectedStatus] = useState('error'); // for preserving health of this entity
    const [qrData, setQrData] = useState("");
    global.isCameraOpen = true;
    const barcodeRecognized = async (barcodes) => {
        if (barcodes.data) {
            props.navigation.state.params.scanedCode(barcodes.data);
            props.navigation.goBack();
        }
    };
    return (<View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <SafeAreaView style={{ flex: 0, backgroundColor: Colors.backgroundColor }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <ScrollView style={styles.modalContainer}>
            <View style={{ ...styles.modalHeaderTitleView, paddingLeft: 10, paddingRight: 10, }}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => { props.navigation.goBack(); }} style={{ height: 30, width: 30, justifyContent: "center" }} >
                        <FontAwesome
                            name="long-arrow-left"
                            color={Colors.blue}
                            size={17}
                        />
                    </TouchableOpacity>
                    <Text style={styles.modalHeaderTitleText}>{""}</Text>
                </View>
            </View>
            <View style={{ ...BackupStyles.modalHeaderTitleView, marginLeft: 30, marginRight: 20, }}>
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text style={BackupStyles.modalHeaderTitleText}>Confirm Recovery Secret{"\n"}from Cloud</Text>
                    <Text style={BackupStyles.modalHeaderInfoText}>
                        Scan the first QR code from the PDF{"\n"}you saved in your cloud storage
                    </Text>
                </View>
                <Image style={BackupStyles.cardIconImage} source={getIconByStatus(selectedStatus)} />
            </View>
            <View style={{ marginLeft: 30 }}>
                <Text style={{
                    color: Colors.blue,
                    fontSize: RFValue(13, 812),
                    fontFamily: Fonts.FiraSansMedium
                }}>Lorem Ipsum Dolor</Text>
                <Text numberOfLines={2} style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(11, 812),
                    fontFamily: Fonts.FiraSansMedium
                }}>{props.pageInfo}Lorem ipsum dolor Lorem dolor sit amet,{"\n"}consectetur dolor sit</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{
                    width: wp('100%'),
                    height: wp('100%'),
                    overflow: "hidden",
                    borderRadius: 20,
                    marginTop: hp('3%')
                }}>
                    <View style={{
                        width: wp('100%'),
                        height: wp('100%'),
                        overflow: "hidden",
                        borderRadius: 20,
                        marginTop: hp('3%')
                    }}>
                        <RNCamera
                            ref={(ref) => { this.cameraRef = ref; }}
                            style={{
                                width: wp('100%'),
                                height: wp('100%')
                            }}
                            onBarCodeRead={barcodeRecognized}
                        >
                            <View style={{ flexDirection: 'row', paddingTop: 12, paddingRight: 12, paddingLeft: 12, width: '100%' }}>
                                <View style={{ borderLeftWidth: 1, borderTopColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderTopWidth: 1 }} />
                                <View style={{ borderTopWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderTopColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
                            </View>
                            <View style={{ marginTop: 'auto', flexDirection: 'row', paddingBottom: 30, paddingRight: 12, paddingLeft: 12, width: '100%', }}>
                                <View style={{ borderLeftWidth: 1, borderBottomColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderBottomWidth: 1 }} />
                                <View style={{ borderBottomWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderBottomColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
                            </View>
                        </RNCamera>
                    </View>
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
    </View>
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