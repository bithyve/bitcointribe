import React, { useState, useEffect } from 'react';
import {
    View,
    Platform
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RNCamera } from 'react-native-camera';

export default function QrScanner(props) {
    const [cameraRef, setcameraRef] = useState(React.createRef());
    const barcodeRecognized = async (barcodes) => {
        await props.onScanQRCode(barcodes.data)
    };
    return (
        <View style={{
            width: wp('100%'),
            height: wp('100%'),
            overflow: "hidden",
            borderRadius: 20,
            marginTop: hp('3%')
        }}>
            <RNCamera
                ref={cameraRef}
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
    )
}
