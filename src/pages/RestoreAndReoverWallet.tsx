import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Text
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from "react-native-vector-icons/Ionicons"
import Fonts from '../common/Fonts';
import Colors from '../common/Colors';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

export default class RestoreAndReoverWallet extends Component {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={{ flex: 1 }}>
          <View style={{ ...styles.viewSetupWallet, paddingTop: wp('10%') }}>
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(20, 812),
                marginLeft: 15,
                marginRight: 15,
                fontFamily: Fonts.FiraSansRegular
              }}
            >
              New Wallet
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12, 812),
                marginLeft: 15,
                marginRight: 15,
                fontWeight: 'normal',
                marginTop: 3,
                fontFamily: Fonts.FiraSansRegular
              }}
            >
              The app creates a new wallet for you with accounts to start using
              right away
            </Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('NewWalletName')
              }
              style={{
                flex: 1,
                flexDirection: 'row',
                marginLeft: 20,
                marginRight: 20,
              }}
            >
              <Image
                style={[{ resizeMode: 'contain', width: 35, height: 35, alignSelf: 'center' }]}
                source={require("./../assets/images/icons/icon_newwallet.png")}
              />
              <View
                style={{ marginLeft: 10, flex: 1, justifyContent: 'center' }}
              >
                <Text style={{ color: Colors.blue, fontSize: RFValue(13, 812), fontFamily: Fonts.FiraSansRegular }}>
                  Start with a new Hexa Wallet
                </Text>
              </View>
              <View
                style={{
                  marginLeft: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name="ios-arrow-forward"
                  color={Colors.textColorGrey}
                  size={15}
                  style={{ alignSelf: 'center' }}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ height: 4, backgroundColor: Colors.backgroundColor }} />
          <View style={{ ...styles.viewSetupWallet, paddingTop: wp('10%') }}>
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(20, 812),
                marginLeft: 15,
                marginRight: 15,
                fontFamily: Fonts.FiraSansRegular
              }}
            >
              Restore Wallet{' '}
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12, 812),
                marginLeft: 15,
                marginRight: 15,
                marginTop: 3,
                fontFamily: Fonts.FiraSansRegular
              }}
            >
              If you previously had a Hexa wallet use this method to restore
              your wallet.
            </Text>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate('RestoreSelectedContactsList')
              }
              style={{
                flex: 1,
                flexDirection: 'row',
                marginLeft: 20,
                marginRight: 20,
                paddingTop: 20,
                paddingBottom: 20,
              }}
            >
              <Image
                style={[{ resizeMode: 'contain', width: 35, height: 35, alignSelf: 'center' }]}
                source={require('./../assets/images/icons/icon_secrets.png')}
              />
              <View
                style={{ marginLeft: 10, flex: 1, justifyContent: 'center' }}
              >
                <Text style={{ color: Colors.blue, fontSize: RFValue(13, 812), fontFamily: Fonts.FiraSansRegular }}>
                  Using Recovery Secrets
                </Text>
              </View>
              <View
                style={{
                  marginLeft: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name="ios-arrow-forward"
                  color={Colors.textColorGrey}
                  size={15}
                  style={{ alignSelf: 'center' }}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ height: 4, backgroundColor: Colors.backgroundColor }} />
          <View style={{ flex: 1 }}>
            <View style={{ margin: 20, padding: 20, marginTop: 'auto', backgroundColor: Colors.backgroundColor, borderRadius: 10 }}>
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue(13, 812),
                  marginLeft: 15,
                  marginRight: 15,
                  fontFamily: Fonts.FiraSansRegular
                }}
              >
                Importing a wallet
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12, 812),
                  marginLeft: 15,
                  marginRight: 15,
                  fontWeight: 'normal',
                  marginBottom: 10,
                  fontFamily: Fonts.FiraSansRegular
                }}
              >
                If you have seed words/ mnemonics from another wallet, this can
                be done once a Hexa wallet is created using “Import Wallet"
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView >
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewSetupWallet: {
    height: wp('55%'),
    backgroundColor: Colors.white,
  },
});
