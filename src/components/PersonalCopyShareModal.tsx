import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  Platform,
  AsyncStorage,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import Icons from '../common/Icons';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';
import { useDispatch, useSelector } from 'react-redux';
import {
  requestSharePdf,
  PDFSharingFailed,
} from '../store/actions/manageBackup';
import BottomInfoBox from './BottomInfoBox';
import { RFValue } from 'react-native-responsive-fontsize';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ErrorModalContents from './ErrorModalContents';
import ModalHeader from './ModalHeader';
import { sharePersonalCopy, personalCopyShared } from '../store/actions/sss';

export default function PersonalCopyShareModal(props) {
  // const [flagRefreshing, setFagRefreshing] = useState(false);
  const [personalCopyShareOptions, setPersonalCopyShareOptions] = useState([
    {
      id: 1,
      title: 'Send pdf on email',
      type: 'Email',
      flagShare: false,
      info: 'Make sure you delete the message from your sent folder',
      imageIcon: Icons.manageBackup.PersonalCopy.email,
    },
    {
      id: 2,
      title: 'Print a copy',
      type: 'Print',
      flagShare: false,
      info: 'Keep all the pages of the printed copy safe',
      imageIcon: Icons.manageBackup.PersonalCopy.print,
    },
    {
      id: 3,
      title: 'Store/ send pdf using other options',
      type: 'Other',
      flagShare: false,
      info:
        'Make sure that you delete the message from your device once it is sent',
      imageIcon: Icons.manageBackup.PersonalCopy.icloud,
    },
  ]);

  const dispatch = useDispatch();

  const onShare = async (shareOption) => {
    dispatch(sharePersonalCopy(shareOption.type, props.selectedPersonalCopy));
    props.onPressShare();
  };

  const disableSharingOption = useCallback(
    (shareOption) => {
      if (!props.personalCopyDetails) return false;

      const otherCopySharingDetails =
        props.personalCopyDetails[
          props.selectedPersonalCopy.type === 'copy1' ? 'copy2' : 'copy1'
        ].sharingDetails;

      if (otherCopySharingDetails) {
        return otherCopySharingDetails.shareVia == shareOption.type
          ? true
          : false;
      } else {
        return false;
      }
    },
    [props.personalCopyDetails, props.selectedPersonalCopy],
  );

  return (
    <View style={[styles.modalContainer]}>
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: Colors.borderColor,
          flexDirection: 'row',
          paddingRight: 10,
          paddingBottom: hp('1.5%'),
          marginRight: 10,
          marginBottom: hp('1.5%'),
          paddingTop: hp('0.5%'),
          alignItems: 'center',
          marginLeft: 20,
        }}
      >
        <Text
          style={{
            color: Colors.blue,
            fontSize: RFValue(18),
            fontFamily: Fonts.FiraSansMedium,
          }}
        >
          Store personal copy PDF
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={personalCopyShareOptions}
          extraData={props.personalCopyDetails}
          renderItem={({ item, index }) => (
            <View>
              <AppBottomSheetTouchableWrapper
                onPress={() => {
                  onShare(item);
                }}
                disabled={disableSharingOption(item)}
                style={[
                  styles.listElements,
                  disableSharingOption(item)
                    ? { backgroundColor: Colors.borderColor }
                    : null,
                ]}
              >
                <Image
                  style={styles.listElementsIconImage}
                  source={item.imageIcon}
                />
                <View style={{ justifyContent: 'space-between', flex: 1 }}>
                  <Text style={styles.listElementsTitle}>{item.title}</Text>
                  <Text style={styles.listElementsInfo}>{item.info}</Text>
                </View>
                <View style={styles.listElementIcon}>
                  <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={15}
                    style={{ alignSelf: 'center' }}
                  />
                </View>
              </AppBottomSheetTouchableWrapper>
              <View
                style={{
                  marginLeft: 20,
                  marginRight: 20,
                  marginTop: 2,
                  marginBottom: 2,
                  height: 1,
                  backgroundColor: Colors.borderColor,
                }}
              />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <BottomInfoBox
        title={'Security question and answer'}
        infoText={
          'The answer your your security question is used to password protect personal copies. Please use your answer, in all lowercase, to open these copies'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    height: 54,
  },
  headerLeftIconContainer: {
    height: 54,
  },
  headerLeftIconInnerContainer: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
    marginTop: 5,
  },
  listElements: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 25,
    paddingBottom: 25,
    // paddingLeft: 10,
    alignItems: 'center',
  },
  listElementsTitle: {
    color: Colors.blue,
    fontSize: RFValue(13),
    marginLeft: 13,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    marginLeft: 13,
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementIcon: {
    paddingRight: 5,
    marginLeft: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listElementsIconImage: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
    alignSelf: 'center',
  },
});
