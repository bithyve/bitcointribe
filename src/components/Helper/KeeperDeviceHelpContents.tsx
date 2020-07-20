import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function KeeperDeviceHelpContents(props) {

    const openLink = (url) => {
        Linking.canOpenURL(url).then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            console.log("Don't know how to open URI: " + url);
          }
        })
    }

  return (
    <ScrollView
        style={styles.modalContainer}
        snapToInterval={hp('89%')}
        decelerationRate='fast'
    >
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingBottom: hp('6%')}}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    style={{
                        color: Colors.white,
                        fontFamily: Fonts.FiraSansMedium,
                        fontSize: RFValue(20),
                        marginTop: hp('1%'),
                        marginBottom: hp('1%'),
                    }}
                >
                    Recovery Keys on a Keeper Device
                </Text>
            </View>
            <View
                style={{
                backgroundColor: Colors.homepageButtonColor,
                height: 1,
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                marginBottom: hp('1%'),
                }}
            />
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                One of your five Recovery Keys can be{'\n'}delegated to a Keeper, which is a device on{'\n'}which you have Hexa installed. This device{'\n'}must be different from the one you are using{'\n'}right now
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/keeper_device_recovery_key.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                If your Keeper Device is not accessible, it is{'\n'}possible to restore it using your primary device{'\n'}and a Guardian.
            </Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <View
                    style={{
                        borderStyle: 'dotted',
                        borderWidth: 1,
                        borderRadius: 1,
                        borderColor: Colors.white,
                        width: wp('70%'),
                        height: 0,
                    }}
                />
            </View>
        </View>
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingTop:hp('2%'), paddingBottom: hp('6%')}}>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                  The Keeper acts as the host of the Exit Key,{'\n'}which can be used to migrate from Hexa{'\n'}to another wallet at any time. The Keeper also{'\n'}stores the 2FA Key required to spend{'\n'} from the Savings Account
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/keeper_device_recovery_key_2.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
                style={{
                    textAlign: 'center',
                    color: Colors.white,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                }}
            >
                The Exit Key on the Keeper Device is an{'\n'}alphanumeric string that can be used to derive{'\n'}your addresses and private keys at any time.{'\n'}This string is also called a “mnemonic”.
            </Text>
        </View>
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingTop:hp('2%'), paddingBottom: hp('6%')}}>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                  Your primary device has no access to the Exit Key.{'\n'}Therefore, a person with access to your{'\n'}primary device does not have access to{'\n'}your Savings Account
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/keeper_device_recovery_key_3.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <View style={{flexDirection: 'row', marginLeft: wp('10%'), marginRight: wp('10%'), justifyContent: 'center', flexWrap: 'wrap'}}>
                <Text
                    style={{
                        color: Colors.white,
                        // textAlign: 'center',
                        fontSize: RFValue(12),
                        fontFamily: Fonts.FiraSansRegular,
                    }}
                >
                    To know more,
                </Text>
                <TouchableOpacity style={{marginLeft: 5}} onPress={() => openLink("https://en.bitcoin.it/wiki/Seed_phrase")}> 
                    <Text
                        style={{
                            color: Colors.white,
                            fontSize: RFValue(12),
                            fontFamily: Fonts.FiraSansRegular,
                            textDecorationLine: 'underline',
                            textAlign: 'center',
                        }}
                    >
                        click here
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    </ScrollView>
  );
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
});