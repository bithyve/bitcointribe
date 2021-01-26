import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ScrollView } from 'react-native-gesture-handler';

export default function ManageBackupHelpContents(props) {
  const scrollViewRef = useRef<ScrollView>();

  return (
    <View style={styles.modalContainer}>
      <AppBottomSheetTouchableWrapper
        style={styles.viewStyle}
        activeOpacity={10}
        onPress={() => props.titleClicked && props.titleClicked()}
      >
        <Text style={styles.headerText}>Health of the App</Text>
      </AppBottomSheetTouchableWrapper>
      <View style={styles.headerSeparator} />
      <ScrollView
        ref={scrollViewRef}
        style={{
          flex: 1,
          backgroundColor: Colors.blue,
        }}
        snapToInterval={hp('85%')}
        decelerationRate="fast"
      >
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('7%'),
            }}
          >
            Backup ensures that you can recover your wallet even if you lose your phone or accidentally delete the Hexa App from your phone
          </Text>
          <View style={styles.viewStyle}>
            <Image
              source={require('../../assets/images/icons/manage_backup_info_1.png')}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              // marginBottom: wp('15%'),
            }}
          >
            The first five items in this section are called Keepers that help to keep your Recovery Keys safe. The sixth item is your Security Question, which is used to encrypt your backup
          </Text>
          <AppBottomSheetTouchableWrapper
            style={{ alignItems: 'center' }}
            onPress={() => {
              scrollViewRef.current?.scrollTo({
                x: 0,
                y: hp('85%'),
                animated: true,
              });
            }}
          >
            <FontAwesome
              name="angle-double-down"
              color={Colors.white}
              size={40}
            />
          </AppBottomSheetTouchableWrapper>
          <View
            style={{
              ...styles.separatorViewDotted,
              ...styles.separatorView,
            }}
          />
        </View>
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('7%'),
            }}
          >
            It looks daunting we know! But backing up your wallet is literally child’s play. We have ensured it
          </Text>
          <View style={styles.viewStyle}>
            <Image
              source={require('../../assets/images/icons/FnF_recovery_key.png')}
              style={styles.helperImage}
            />
          </View>
          <Text style={{ ...styles.infoText }}>
          The Recovery Keys can be shared with Keepers and confirmed by following the steps suggested. Use Know More in each section to guide you through the process of backing up your wallet
          </Text>
          <AppBottomSheetTouchableWrapper
            style={{ alignItems: 'center' }}
            onPress={() => {
              scrollViewRef.current?.scrollTo({
                x: 0,
                y: hp('170%'),
                animated: true,
              });
            }}
          >
            <FontAwesome
              name="angle-double-down"
              color={Colors.white}
              size={40}
            />
          </AppBottomSheetTouchableWrapper>
          <View
            style={{
              ...styles.separatorViewDotted,
              ...styles.separatorView,
            }}
          />
        </View>

        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('7%'),
            }}
          >
            The Health shield indicates the extent to which your wallet is safely backed up. Red requires immediate action. Yellow requires you to act when possible. Green shows your Recovery Keys are available
          </Text>
          <View style={styles.viewStyle}>
            <Image
              source={require('../../assets/images/icons/manage_backup_info_1.png')}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              // marginBottom: wp('15%'),
            }}
          >
            Remember: Recovery Keys need to be available at all times to enable recovery, if your wallet is lost. If your keys are not available, you will not be able to recover your wallet
          </Text>

          <View
            style={{
              ...styles.separatorViewDotted,
              ...styles.separatorView,
            }}
          />
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
    height: hp('85%'),
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
    marginBottom: wp('20%'),
  },
  viewStyle: { justifyContent: 'center', alignItems: 'center' },
  separatorViewDotted: {
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: Colors.white,
  },
});
