import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../common/Fonts';
import Colors from '../common/Colors';
import CommonStyles from "../common/Styles";
import { TextInput } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

export default function RestoreWalletBySecondaryDevice(props) {
  const [walletName, setWalletName] = useState('');
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => { props.navigation.navigate('RestoreSelectedContactsList'); }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
            </View>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == 'ios' ? 'padding' : ''} enabled>
          <View style={{ flex: 2 }}>
            <Text style={styles.pageTitle}>Restore wallet using {"\n"}Secondary Device</Text>
            <Text style={styles.labelStyle}>Use the Recover Secret stored in your secondary device. {"\n"}<Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>you will need to have the other device with you</Text></Text>

          </View>
          <View style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}>
            <View>
              <Image
                style={{ width: hp('25%'), height: hp('25%') }}
                source={require('../assets/images/qrcode.png')}
              />
            </View>

            <View style={{ flex: 1, flexDirection: 'row', paddingLeft: 25, paddingRight: 25, marginTop: 30 }}>
              <View style={{ flex: 1, backgroundColor: Colors.backgroundColor, borderBottomLeftRadius: 8, borderTopLeftRadius: 8, height: 50, paddingLeft: 15, paddingRight: 15, justifyContent: 'center' }}>
                <Text numberOfLines={1} style={{ fontSize: RFValue(13, 812), color: Colors.lightBlue }}>lk2j3429-85213-5134=50t-934285623877wer78er7</Text>
              </View>
                < View style={{ width: 48, height: 50, backgroundColor: Colors.borderColor, borderTopRightRadius: 8, borderBottomRightRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    style={{ width: 18, height: 20 }}
                    source={require('../assets/images/icons/icon-copy.png')}
                  />
                </View>
            </View>
          </View>
          <View style={{ flex: 2, justifyContent: 'flex-end' }}>
            <View style={{ marginBottom: 25, padding: 20, backgroundColor: Colors.backgroundColor, marginLeft: 15, marginRight: 15, borderRadius: 10, justifyContent: 'center' }}>
              <Text style={styles.bottomNoteText}>Note</Text>
              <Text style={styles.bottomNoteInfoText}>The transaction may not be instantly visible on the app as it may take some time to get confirmed on the blockchain</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  pageTitle: {
    color: Colors.blue,
    fontSize: RFValue(25, 812),
    marginLeft: 15,
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular
  },
  labelStyle:
  {
    color: Colors.textColorGrey,
    fontSize: RFValue(12, 812),
    marginLeft: 15,
    fontFamily: Fonts.FiraSansRegular
  },
  bottomNoteText: {
    color: Colors.blue,
    fontSize: RFValue(13, 812),
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular
  },
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  buttonView: {
    height: wp('13%'),
    width: wp('30%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.blue
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 40,
    paddingTop: 30,
    alignItems: 'center'
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
    borderRadius: 10
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5
  }

});
