import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  ImageBackground,
  FlatList,
  CheckBox,
  ActivityIndicator,
  Alert,
  InteractionManager,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import BottomSheet from 'reanimated-bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BottomInfoBox from '../../components/BottomInfoBox';
import ModalHeader from '../../components/ModalHeader';
import AddContactAddressBook from '../Contacts/AddContactAddressBook';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import DeviceInfo from 'react-native-device-info';
import { nameToInitials } from '../../common/CommonFunctions';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import SendViaQR from '../../components/SendViaQR';
import SendViaLink from '../../components/SendViaLink';
import Entypo from 'react-native-vector-icons/Entypo';
import {
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/serviceTypes';
import BackupStyles from '../ManageBackup/Styles';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchAddress } from '../../store/actions/accounts';
import { updateEphemeralChannel } from '../../store/actions/trustedContacts';
import {
  EphemeralData,
  TrustedContactDerivativeAccount,
  TrustedContactDerivativeAccountElements,
} from '../../bitcoin/utilities/Interface';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import config from '../../bitcoin/HexaConfig';
import ReceiveHelpContents from '../../components/Helper/ReceiveHelpContents';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import Loader from '../../components/loader';

export default function TwoFASetupWarningModal(props) {
  return (
    <View style={styles.modalContainer}>
        <View style={styles.bodyView}>
          <BottomInfoBox
            title={'Note'}
            infoText={
              "Please ensure that you have 2FA setted up (preferably on your Keeper device), you'll require the 2FA token in order to send bitcoin from the Savings Account."
            }
          />

          <View style={styles.bottomButtonView}>
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressOk()}
              style={{
                ...styles.confirmButtonView,
                backgroundColor: Colors.blue,
                elevation: 10,
                shadowColor: Colors.shadowBlue,
                shadowOpacity: 1,
                marginRight: 5,
                shadowOffset: { width: 15, height: 15 },
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue(13),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Ok, I understand
              </Text>
            </AppBottomSheetTouchableWrapper>
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressManageBackup()}
              style={{
                ...styles.confirmButtonView,
                width: wp('30%'),
                marginLeft: 5,
              }}
            >
              <Text style={styles.manageBackupButtonText}>Manage Backup</Text>
            </AppBottomSheetTouchableWrapper>
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  confirmButtonView: {
    width: wp('40%'),
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: hp('2%'),
    elevation: 10,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  manageBackupButtonText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  bottomButtonView: {
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  bodyView: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('2%'),
  },
});
