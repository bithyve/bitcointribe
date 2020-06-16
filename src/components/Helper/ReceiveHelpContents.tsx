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

export default function ReceiveHelpContents(props) {
  return (
    <ScrollView style={styles.modalContainer} snapToInterval={hp('89%')}>
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
                    Sending Bitcoins
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
                When you want to receive Bitcoins,{'\n'}the sender needs to know where{'\n'}to send them to 
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/receive.png')}
                    style={{ width: wp('50%'), height: wp('50%'), resizeMode: 'contain' }}
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
                This is given by your address{'\n'}shown as a QR code and as{'\n'}plaintext alphanumeric string
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                source={require('../../assets/images/icons/rabbit.png')}
                style={{ width: wp('25%'), height: wp('25%'), resizeMode: 'contain' }}
                />
            </View>
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
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/receive.png')}
                    style={{ width: wp('50%'), height: wp('50%'), resizeMode: 'contain' }}
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
                Your wallet generates these address{'\n'}automatically and a single wallet{'\n'}can have many address within them
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/rabbit.png')}
                    style={{ width: wp('25%'), height: wp('25%'), resizeMode: 'contain' }}
                />
            </View>
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
                To improve your privacy, a new{'\n'}address is generated each time you{'\n'}want to receive bitcoins.{'\n'}If you would like to receive{'\n'}bitcoins from Friends and Family,{'\n'}please check the checkbox above
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/receive.png')}
                    style={{ width: wp('50%'), height: wp('50%'), resizeMode: 'contain' }}
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
                Go further down the rabbit hole by clicking here
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/rabbit.png')}
                    style={{ width: wp('25%'), height: wp('25%'), resizeMode: 'contain' }}
                />
            </View>
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