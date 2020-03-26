import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Platform,
  AsyncStorage,
  Linking,
  NativeModules,
  Alert,
  SafeAreaView,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import CommonStyles from '../../common/Styles';
import DeviceInfo from 'react-native-device-info';
import ToggleSwitch from '../../components/ToggleSwitch';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from '../../components/Toast';
import Octicons from 'react-native-vector-icons/Octicons';
import BottomInfoBox from '../../components/BottomInfoBox';

export default function SignUpInfo(props) {
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');

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
                Lorem ipsum dolor sit amet consectetur adipisicing elit. 
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{ flex: 1, marginTop: 10, marginLeft: 25, marginBottom: 20, marginRight: 20 }}
        >
          <Text style={styles.modalHeaderSmallTitleText}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae rem
            porro ducimus repudiandae alias optio accusantium numquam illum
            autem, voluptatum ullam reiciendis laboriosam obcaecati hic! Ab sit
            iusto facere minus?
          </Text>
          <View style={{marginTop: 10}}>
            {[1, 2, 3, 4].map(value => {
              return (
                <Text style={styles.modalHeaderSmallTitleText}>
                  <Octicons size={RFValue(13)} color={Colors.yellow} name={"primitive-dot"}/> Lorem ipsum dolor sit amet consectetur adipisicing elit 
                </Text>
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
              props.navigation.navigate('SignUpDetails');
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
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
});
