import React, { useState, useEffect } from 'react';
import {
    View,
    Platform,
    TouchableOpacity,
    Text,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RNCamera } from 'react-native-camera';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";

export default function QrScanner(props) {
    const [cameraRef, setcameraRef] = useState(React.createRef());
    global.isCameraOpen = true;
    const barcodeRecognized = async (barcodes) => {
        if(barcodes.data){
            props.navigation.state.params.scanedCode(barcodes.data);
            props.navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />
            <View style={{
                borderBottomWidth: 1,
                borderColor: Colors.borderColor,
                alignItems: "center",
                flexDirection: "row",
                paddingRight: 10,
                paddingBottom: 15,
                paddingTop: 10,
                marginLeft: 20,
                marginBottom: 15
            }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                        onPress={() => props.navigation.goBack()}
                        style={{ height: 30, width: 30, justifyContent: "center" }}
                    >
                        <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                    </TouchableOpacity>
                    <Text style={{
                        color: Colors.blue,
                        fontSize: RFValue(18),
                        fontFamily: Fonts.FiraSansMedium
                    }}>Scan QR code</Text>
                </View>

            </View>
            <View style={{
                width: wp('100%'),
                height: wp('100%'),
                overflow: "hidden",
                borderRadius: 20,
                marginTop: hp('3%')
            }}>
                <RNCamera
                    ref={(ref) =>{this.cameraRef=ref;}}
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
                    <View style={{ marginTop: 'auto', flexDirection: 'row', paddingBottom: 12, paddingRight: 12, paddingLeft: 12, width: '100%', }}>
                        <View style={{ borderLeftWidth: 1, borderBottomColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderBottomWidth: 1 }} />
                        <View style={{ borderBottomWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderBottomColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
                    </View>
                </RNCamera>
            </View>
        </SafeAreaView>
    )
}
