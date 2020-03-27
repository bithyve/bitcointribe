import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import BottomInfoBox from '../../components/BottomInfoBox';

export default function SignUpInfo(props) {
  const bitcoinAddress = props.navigation.state.params ? props.navigation.state.params.address : '';
  const selectedAccount = props.navigation.state.params ? props.navigation.state.params.selectedAccount : '';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.backgroundColor1 }}>
      <StatusBar backgroundColor={Colors.backgroundColor1} barStyle="dark-content" />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.black1}
                size={17}
              />
            </TouchableOpacity>
            <View style={{flex: 1,marginRight: 10, marginBottom: 10}}>
              <Text style={styles.modalHeaderTitleText}>{'Get Bittr'}</Text>
              <Text style={{...styles.modalHeaderSmallTitleText, marginBottom: 10}}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{ flex: 1, marginTop: 10, marginLeft:wp('12%'), marginRight:wp('10%') }}
        >
          <Text style={{...styles.modalHeaderSmallTitleText, marginBottom:wp('7%')}}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          </Text>
          <View style={{marginTop: 10}}>
            {[1, 2, 3, 4].map(value => {
              return (
                <View style={{flexDirection: "row", }}>
                  <Octicons size={RFValue(10)} color={Colors.yellow} style={{marginTop:3}} name={"primitive-dot"}/> 
                  <Text style={{...styles.modalHeaderSmallTitleText, marginLeft:8}}>
                    Lorem ipsum dolor sit amet conse ctetur adipi sicing elit 
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={{marginTop: 'auto'}}>
          <BottomInfoBox
            backgroundColor={Colors.white}
            titleColor={Colors.black1}
            title={"Note"}
            infoText={
              'Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem ipsum dolor'
            }
          />
        </View>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 'auto',
            marginBottom: hp('4%'),
            marginLeft: wp('8%'),
          }}
        >
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('SignUpDetails', {address: bitcoinAddress, selectedAccount: selectedAccount});
            }}
            style={{
              height: wp('13%'),
              width: wp('40%'),
              backgroundColor: Colors.yellow,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
              elevation: 10,
              shadowColor: Colors.shadowYellow,
              shadowOpacity: 1,
              shadowOffset: { width: 15, height: 15 },
              
            }}
          >
            <Text>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack()
            }}
            style={{
              width: wp('20%'),
              height: wp('13%'),
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 10
            }}
          >
            <Text>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    marginTop: hp('5%'),
  },
  modalHeaderTitleText: {
    color: Colors.black1,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor1,
    width: '100%',
  },
  modalHeaderSmallTitleText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
});
