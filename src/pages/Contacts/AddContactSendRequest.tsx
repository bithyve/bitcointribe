import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackupStyles from '../ManageBackup/Styles';
import BottomInfoBox from '../../components/BottomInfoBox';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import SendViaLink from '../../components/SendViaLink';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import { nameToInitials } from '../../common/CommonFunctions';
import SendViaQR from '../../components/SendViaQR';

export default function AddContactSendRequest(props) {
  
  const [SendViaLinkBottomSheet, setSendViaLinkBottomSheet] = useState(
    React.createRef(),
  );

  const [SendViaQRBottomSheet, setSendViaQRBottomSheet] = useState(
    React.createRef(),
  );

  const SelectedContact = props.navigation.getParam('SelectedContact')
    ? props.navigation.getParam('SelectedContact')
    : [];
  console.log('SelectedContact', SelectedContact);
  const [Contact, setContact] = useState(SelectedContact ? SelectedContact[0] : {});
  
  const renderSendViaLinkContents = useCallback(() => {
    return (
      <SendViaLink
        contactText={'Adding as a Trusted Contact:'}
        contact={Contact}
        contactEmail={''}
        onPressBack={() => {
          if (SendViaLinkBottomSheet.current)
            (SendViaLinkBottomSheet as any).current.snapTo(0);
        }}
        onPressDone={() => {
          (SendViaLinkBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [Contact]);

  const renderSendViaLinkHeader = useCallback(() => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          if (SendViaLinkBottomSheet.current)
            (SendViaLinkBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderSendViaQRContents = useCallback(() => {
    return (
      <SendViaQR
        contactText={'Adding as a Trusted Contact:'}
        contact={Contact}
        contactEmail={''}
        onPressBack={() => {
          if (SendViaQRBottomSheet.current)
            (SendViaQRBottomSheet as any).current.snapTo(0);
        }}
        onPressDone={() => {
          (SendViaQRBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [Contact]);

  const renderSendViaQRHeader = useCallback(() => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          if (SendViaQRBottomSheet.current)
            (SendViaQRBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.modalContainer}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            paddingRight: 10,
            paddingBottom: hp('1.5%'),
            paddingTop: hp('1%'),
            marginLeft: 10,
            marginRight: 10,
            marginBottom: hp('1.5%'),
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...BackupStyles.modalHeaderTitleText,
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Add Contact{' '}
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                  paddingTop: 5,
                }}
              >
                Lorem ipsum dolor sit amet, consec
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {}}
              style={{
                height: wp('8%'),
                width: wp('18%'),
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.lightBlue,
                justifyContent: 'center',
                borderRadius: 8,
                alignSelf: 'center',
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.contactProfileView}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                backgroundColor: Colors.backgroundColor1,
                height: 90,
                position: 'relative',
                borderRadius: 10,
              }}
            >
              <View style={{ marginLeft: 70 }}>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(11),
                    marginLeft: 25,
                    paddingTop: 5,
                    paddingBottom: 5,
                  }}
                >
                  Adding as a Trusted Contact:
                </Text>
                <Text style={styles.contactNameText}>
                  {Contact.firstName && Contact.lastName
                    ? Contact.firstName + ' ' + Contact.lastName
                    : Contact.firstName && !Contact.lastName
                    ? Contact.firstName
                    : !Contact.firstName && Contact.lastName
                    ? Contact.lastName
                    : ''}
                </Text>
                {/* <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(10),
                    marginLeft: 25,
                    paddingTop: 5,
                    paddingBottom: 5,
                  }}
                >
                  asarah@bithyve.com
                </Text> */}
              </View>
            </View>
            {Contact.imageAvailable ? (
              <Image
                source={Contact.image}
                style={{ ...styles.contactProfileImage }}
              />
            ) : (
              <View
                style={{
                  position: 'absolute',
                  marginLeft: 15,
                  marginRight: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.shadowBlue,
                  width: 70,
                  height: 70,
                  borderRadius: 70 / 2,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: RFValue(20),
                    lineHeight: RFValue(20), //... One for top and one for bottom alignment
                  }}
                >
                  {nameToInitials(
                    Contact.firstName && Contact.lastName
                      ? Contact.firstName + ' ' + Contact.lastName
                      : Contact.firstName && !Contact.lastName
                      ? Contact.firstName
                      : !Contact.firstName && Contact.lastName
                      ? Contact.lastName
                      : '',
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ marginTop: 'auto' }}>
          <View style={{ marginBottom: hp('1%') }}>
            <BottomInfoBox
              backgroundColor={Colors.backgroundColor1}
              titleColor={Colors.black1}
              title={'Note'}
              infoText={
                'Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem ipsum dolor'
              }
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: Colors.blue,
              height: 60,
              borderRadius: 10,
              marginLeft: 25,
              marginRight: 25,
              marginBottom: hp('4%'),
              justifyContent: 'space-evenly',
              alignItems: 'center',
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: { width: 15, height: 15 },
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (SendViaLinkBottomSheet.current)
                  (SendViaLinkBottomSheet as any).current.snapTo(1);
              }}
              style={styles.buttonInnerView}
            >
              <Image
                source={require('../../assets/images/icons/openlink.png')}
                style={styles.buttonImage}
              />
              <Text style={styles.buttonText}>Via Link</Text>
            </TouchableOpacity>
            <View
              style={{ width: 1, height: 30, backgroundColor: Colors.white }}
            />
            <TouchableOpacity
              style={styles.buttonInnerView}
              onPress={() => {
                if (SendViaQRBottomSheet.current)
                  (SendViaQRBottomSheet as any).current.snapTo(1);
              }}
            >
              <Image
                source={require('../../assets/images/icons/qr-code.png')}
                style={styles.buttonImage}
              />
              <Text style={styles.buttonText}>Via QR</Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomSheet
          enabledInnerScrolling={true}
          ref={SendViaLinkBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('80%')
              : hp('85%'),
          ]}
          renderContent={renderSendViaLinkContents}
          renderHeader={renderSendViaLinkHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={SendViaQRBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('80%')
              : hp('85%'),
          ]}
          renderContent={renderSendViaQRContents}
          renderHeader={renderSendViaQRHeader}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 2,
    backgroundColor: Colors.backgroundColor,
  },
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp('1.7%'),
  },
  contactProfileImage: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    borderRadius: 60 / 2,
    elevation: 20,
    shadowColor: Colors.borderColor,
    shadowOpacity: 1,
    shadowOffset: { width: 1, height: 4 },
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('30%'),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
  commModeModalInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginLeft: 25,
    marginRight: 25,
    marginTop: hp('0.7%'),
  },
});
