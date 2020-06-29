import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function AddressBookHelpContents(props) {
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
                    Friends and Family
                </Text>
            </View>
            <View
                style={{
                backgroundColor: Colors.homepageButtonColor,
                height: 1,
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                marginBottom: hp('1%')
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
                Friends and Family are contacts whom you{'\n'}know and trust, and those whom you transact with{'\n'}routinely. When transacting with Friends and{'\n'}Family, you are not required to ask them for a QR code{'\n'}when sending bitcoin
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/FnF_recovery_key_2.png')}
                    style={{ width: wp('80%'), height: wp('80%'), resizeMode: 'contain' }}
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
                Selecting a contact as Friends and Family{'\n'}creates a secure channel betweem you and the{'\n'}contact. This secure channel enables easy{'\n'}exchange of information without requiring{'\n'}user action
            </Text>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                The secure channel is a 2 party ECDH channel,{'\n'}most frequently used in Internet{'\n'}communication. ECDH communications are{'\n'}encrypted end-to-end, enabling only the receiver{'\n'}and sender to decrypt information
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
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingTop:hp('2%'), paddingBottom: hp('4%')}}>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                These ECDH channels are used to{'\n'}communicate your extended public key. An{'\n'}extended public key can be used by a peer to{'\n'}generate new addresses on your behalf.
            </Text>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                Possessing an extended public key does not{'\n'}allow one to gain possession of funds. This is{'\n'}because the contact does not possess your private{'\n'}key which affirms ownership of funds
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/test_account_info_2.png')}
                    style={{ width: wp('80%'), height: wp('80%'), resizeMode: 'contain' }}
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
                Creation of ECDH channels is facilitated by the{'\n'}BitHyve Relay Server. After creation however,{'\n'}the Relay Server (and others on the internet) is{'\n'}blind to all communications between the{'\n'}two parties
            </Text>
            <Text
                style={{
                    textAlign: 'center',
                    color: Colors.white,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                    marginHorizontal: wp('10%'),
                }}
            >
                Know more: https://en.wikipedia.org/wiki/Elliptic-curve_Diffie–Hellman
            </Text>
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