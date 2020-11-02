import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../../common/Colors";
import NavStyles from '../../common/Styles/NavStyles';
import CommonStyles from '../../common/Styles/Styles';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { RNCamera } from 'react-native-camera';
import { getIconByStatus } from './utils';


export default function CloudHealthCheck(props) {
  const [selectedStatus] = useState('Ugly'); // for preserving health of this entity
  const [] = useState("");
  const barcodeRecognized = async (barcodes) => {
    if (barcodes.data) {
      props.scannedCode(barcodes.data);
      props.goPressBack();
    }
  };
  return (<View style={{
    height: '100%',
    backgroundColor: Colors.backgroundColor,
  }}>
    <ScrollView style={NavStyles.modalContainer}>
      <View style={{ ...NavStyles.modalHeaderTitleView, paddingLeft: 10, paddingRight: 10, }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => { props.goPressBack(); }} style={{ height: 30, width: 30, justifyContent: "center" }} >
            <FontAwesome
              name="long-arrow-left"
              color={Colors.blue}
              size={17}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ ...NavStyles.modalHeaderTitleView, marginLeft: 30, marginRight: 20, }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={NavStyles.modalHeaderTitleText}>Confirm Recovery Key{"\n"}from Cloud</Text>
          <Text style={NavStyles.modalHeaderInfoText}>
            Scan the first QR code from the PDF{"\n"}you saved in your cloud storage
                    </Text>
        </View>
        <Image style={CommonStyles.cardIconImage} source={getIconByStatus(selectedStatus)} />
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
            {props.LoadCamera ?
              <RNCamera
                ref={(ref) => { this.cameraRef = ref; }}
                style={{
                  width: wp('100%'),
                  height: wp('100%')
                }}
                onBarCodeRead={barcodeRecognized}
                captureAudio={false}
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
              : null}
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
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  statusIndicatorActiveView: {
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
