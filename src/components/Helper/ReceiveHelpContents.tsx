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
                    Receive Bitcoins
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
                When you want to receive Bitcoins, the sender{'\n'}needs to know where to send them to. This is{'\n'}given by your address shown as a QR code and{'\n'}as plaintext above 
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/bitcoin_receive_info_1.png')}
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
                Bitcoin transactions can not be reversed or cancelled.{'\n'}For this reason, it is recommended that you scan a QR{'\n'}code instead of keying in the characters
            </Text>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                To improve your privacy, a new address is{'\n'}generated each time you want to receive{'\n'}bitcoins. If you would like to receive bitcoins{'\n'}from Friends and Family, please check the{'\n'}checkbox above
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
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    style={{
                        textAlign: 'center',
                        color: Colors.white,
                        fontSize: RFValue(12),
                        fontFamily: Fonts.FiraSansRegular,
                    }}
                >
                    Once the sender sends the transaction, the{'\n'}transaction is relayed to a bitcoin full node.{'\n'}This full node then announces the{'\n'}transactions to other full nodes, including{'\n'}those of miners
                </Text>
                <Image
                    source={require('../../assets/images/icons/bitcoin_send_info_2.png')}
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
                A miner includes a transaction within their{'\n'}block only if the fee associated with it is{'\n'}sufficiently high. Please make sure the sender{'\n'}sends the transaction with appropriate fees{'\n'}for it to reach you faster
            </Text>
            <Text
                style={{
                    textAlign: 'center',
                    color: Colors.white,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                }}
            >
                If the fee associated with a transaction is low,{'\n'}you may increase the fee paid by RBF or{'\n'}Replace-By-Fee. This provides additional{'\n'}incentive for the miner to mine your{'\n'}transaction, and may result in you receiving{'\n'}bitcoins earlier
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
                Know more: https://github.com/6102bitcoin/bitcoin-intro#step-12-buying-privately
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