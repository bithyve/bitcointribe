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

export default function TestAccountHelpContents(props) {

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
                    Test Account
                </Text>
            </View>
            <View
                style={{
                backgroundColor: Colors.homepageButtonColor,
                height: 1,
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
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
            The Test Account is designed as an account{'\n'}that enables people to experience Bitcoin{'\n'}without buying bitcoin. It comes preloaded{'\n'}with test bitcoin.
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/test_account_info_1.png')}
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
                Use the Test Account to learn all {'\n'}the features of the Checking Account
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
                Test Account addresses start with “2”{'\n'}compared with “1”, “3” or “bc1” for Bitcoin{'\n'}Mainnet. If you are sending Test bitcoin to{'\n'}your friend, please make sure to verify this
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/test_account_info_2.png')}
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
                Real bitcoin sent to a Test Bitcoin address and vice{'\n'}versa can not be retrieved
            </Text>
            <Text
                style={{
                    textAlign: 'center',
                    color: Colors.white,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                }}
            >
                This is because a{'\n'}Test Bitcoin address only supports Test Bitcoin{'\n'}and a Bitcoin Mainnet address only supports{'\n'}Mainnet Bitcoin
            </Text>
            <View style={{flexDirection: 'row', marginLeft: wp('10%'), marginRight: wp('10%'), justifyContent: 'center', flexWrap: 'wrap'}}>
                <Text
                    style={{
                        color: Colors.white,
                        // textAlign: 'center',
                        fontSize: RFValue(12),
                        fontFamily: Fonts.FiraSansRegular,
                    }}
                >
                    To read more,
                </Text>
                <TouchableOpacity style={{marginLeft: 5}} onPress={() => openLink("https://en.bitcoin.it/wiki/Testnet")}> 
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