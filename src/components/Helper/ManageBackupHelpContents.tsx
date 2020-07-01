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

export default function ManageBackupHelpContents(props) {

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
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingBottom: hp('4%')}}>
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
                    Health of the App
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
                The Health Shield shows if your Recovery Keys{'\n'}are available. There are three modes - Red,{'\n'}Yellow and Green. Red requires immediate{'\n'}action and Yellow requires you to act when{'\n'}possible. Green shows your Recovery Keys{'\n'}are available
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/manage_backup_info_1.png')}
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
                Hexa’s backup scheme enables you to recover{'\n'}your wallet at any time by retrieving three of{'\n'}your five Recovery Keys. These need to be{'\n'}constantly available in order to enable you to{'\n'}retrieve your account
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
                This recovery is enabled by a cryptographic{'\n'}scheme known as Shamir’s Secret Sharing or{'\n'}SSS. SSS uses polynomial points to enable you to{'\n'}recover your Hexa Wallet with three of your{'\n'}five Recovery Keys
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/FnF_recovery_key.png')}
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
                Recovery Keys need to be available at all times{'\n'}to enable recovery. If your keys are not available,{'\n'}you will not be able to recover your Wallet
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
                    To know more,
                </Text>
                <TouchableOpacity style={{marginLeft: 5}} onPress={() => openLink("https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing")}> 
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