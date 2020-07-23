import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function SendHelpContents(props) {
  const openLink = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  return (
    <View style={styles.modalContainer}>
      <AppBottomSheetTouchableWrapper
        style={{ justifyContent: 'center', alignItems: 'center' }}
        activeOpacity={10}
        onPress={() => props.titleClicked && props.titleClicked()}
      >
        <Text style={styles.headerText}>Sending bitcoin</Text>
      </AppBottomSheetTouchableWrapper>
      <View style={styles.headerSeparator} />
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: Colors.blue,
        }}
        snapToInterval={hp('89%')}
        decelerationRate="fast"
      >
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('10%'),
            }}
          >
            When you want to send bitcoin, you need a destination, which is denoted by the recipient’s address. This address is an alphanumeric string beginning with “1”, “3” or “bc1” for Bitcoin Mainnet, and “2” for  Bitcoin Testnet
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/bitcoin_send_info_1.png')}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              marginBottom: wp('15%'),
            }}
          >
            Bitcoin transactions can not be reversed or cancelled. For this reason, it is recommended that you scan a QR code instead of keying in characters
          </Text>
          <View
            style={{
              borderStyle: 'dotted',
              borderWidth: 1,
              borderRadius: 1,
              borderColor: Colors.white,
              ...styles.separatorView,
            }}
          />
        </View>
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('10%'),
            }}
          >
            Once you press “Send” on Hexa, the transaction is relayed to a bitcoin full node. This full node then announces the transactions to other full nodes, including those of miners
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/bitcoin_send_info_2.png')}
              style={styles.helperImage}
            />
          </View>
          <View style={styles.bottomLinkView}>
            <Text style={{...styles.infoText, marginLeft: 0, marginRight: 0,}}>
            A miner includes a transaction within their block only if the fee associated is sufficiently high. This is why Hexa requests for a fee when sending a transaction
            </Text>
            <View style={{...styles.linkView, marginTop: wp('7%')}}>
              <Text style={styles.toKnowMoreText}>To know more,</Text>
              <AppBottomSheetTouchableWrapper
                style={{ marginLeft: 5 }}
                onPress={() =>
                  openLink('https://en.bitcoin.it/wiki/Miner_fees')
                }
              >
                <Text style={styles.clickHereText}>click here</Text>
              </AppBottomSheetTouchableWrapper>
            </View>
          </View>
          <View style={styles.separatorView} />
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(20),
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  headerSeparator: {
    backgroundColor: Colors.homepageButtonColor,
    height: 1,
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    marginBottom: hp('1%'),
  },
  infoText: {
    textAlign: 'center',
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: wp('10%'),
    marginRight: wp('10%'),
  },
  clickHereText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  toKnowMoreText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  linkView: {
    flexDirection: 'row',
    marginLeft: wp('10%'),
    marginRight: wp('10%'),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ElementView: {
    height: hp('89%'),
    justifyContent: 'space-between',
  },
  separatorView: {
    width: wp('70%'),
    height: 0,
    alignSelf: 'center',
    marginBottom: wp('1%'),
  },
  helperImage: {
    width: wp('80%'),
    height: wp('65%'),
    resizeMode: 'contain',
  },
  bottomLinkView: {
    marginLeft: wp('10%'),
    marginRight: wp('10%'),
    marginBottom: wp('15%'),
  },
});
