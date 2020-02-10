import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from './Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getIconByStatus } from './utils';
import { useDispatch, useSelector } from 'react-redux';
import { uploadEncMShare } from '../../store/actions/sss';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFValue } from 'react-native-responsive-fontsize';
import TransparentHeaderModal from '../../components/TransparentHeaderModal';
import ErrorModalContents from '../../components/ErrorModalContents';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../../components/ModalHeader';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import HistoryPageComponent from '../../components/HistoryPageComponent';
import SecondaryDevice from './SecondaryDevice';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import _ from 'underscore';

const SecondaryDeviceHistory = props => {
  const [secondaryDeviceHistory, setSecondaryDeviceHistory] = useState([
    {
      id: 1,
      title: 'Recovery Secret Created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Secret In-Transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Secret Accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Secret Not Accessible',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    // {
    //   id: 5,
    //   title: 'Recovery Secret In-Transit',
    //   date: '20 May ‘19, 11:00am',
    //   info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    // },
    // {
    //   id: 6,
    //   title: 'Recovery Secret Not Accessible',
    //   date: '19 May ‘19, 11:00am',
    //   info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    // },
  ]);
  const [secondaryDeviceBottomSheet, setSecondaryDeviceBottomSheet] = useState(
    React.createRef(),
  );
  const [secondaryQR, setSecondaryQR] = useState('');
  const SHARES_TRANSFER_DETAILS = useSelector(
    state =>
      state.storage.database.DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
  );
  const WALLET_SETUP = useSelector(
    state => state.storage.database.WALLET_SETUP,
  );

  const uploadMetaShare = useSelector(
    state => state.sss.loading.uploadMetaShare,
  );

  const updateAutoHighlightFlags = props.navigation.getParam(
    'updateAutoHighlightFlags',
  );
  const next = props.navigation.getParam('next');

  const saveInTransitHistory = async () => {
    const shareHistory = JSON.parse(await AsyncStorage.getItem('shareHistory'));
    if (shareHistory) {
      const updatedShareHistory = [...shareHistory];
      updatedShareHistory[0] = {
        ...updatedShareHistory[0],
        inTransit: Date.now(),
      };
      updateHistory(updatedShareHistory);
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify(updatedShareHistory),
      );
    }
  };

  const renderSecondaryDeviceContents = useCallback(() => {
    return (
      <SecondaryDevice
        secondaryQR={secondaryQR}
        uploadMetaShare={uploadMetaShare}
        onPressOk={async () => {
          updateAutoHighlightFlags();
          saveInTransitHistory();
          (secondaryDeviceBottomSheet as any).current.snapTo(0);
          if (next) {
            props.navigation.goBack();
          }
        }}
        onPressBack={() => {
          (secondaryDeviceBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [secondaryQR, uploadMetaShare]);

  const renderSecondaryDeviceHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (secondaryDeviceBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  useEffect(() => {
    if (next) (secondaryDeviceBottomSheet as any).current.snapTo(1);
  }, [next]);

  const sortedHistory = history => {
    const currentHistory = history.filter(element => {
      if (element.date) return element;
    });

    const sortedHistory = _.sortBy(currentHistory, 'date');
    sortedHistory.forEach(element => {
      element.date = moment(element.date)
        .utc()
        .local()
        .format('DD MMMM YYYY HH:mm');
    });

    return sortedHistory;
  };

  const updateHistory = shareHistory => {
    const updatedSecondaryHistory = [...secondaryDeviceHistory];
    if (shareHistory[0].createdAt)
      updatedSecondaryHistory[0].date = shareHistory[0].createdAt;
    if (shareHistory[0].inTransit)
      updatedSecondaryHistory[1].date = shareHistory[0].inTransit;

    if (shareHistory[0].accessible)
      updatedSecondaryHistory[2].date = shareHistory[0].accessible;

    if (shareHistory[0].notAccessible)
      updatedSecondaryHistory[3].date = shareHistory[0].notAccessible;
    console.log({ updatedSecondaryHistory });
    setSecondaryDeviceHistory(updatedSecondaryHistory);
  };

  useEffect(() => {
    (async () => {
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem('shareHistory'),
      );
      console.log({ shareHistory });
      if (shareHistory) updateHistory(shareHistory);
    })();
  }, []);

  const dispatch = useDispatch();
  useEffect(() => {
    if (SHARES_TRANSFER_DETAILS[0]) {
      if (Date.now() - SHARES_TRANSFER_DETAILS[0].UPLOADED_AT > 600000) {
        dispatch(uploadEncMShare(0));
      } else {
        // do nothing
      }
      setSecondaryQR(
        JSON.stringify({
          requester: WALLET_SETUP.walletName,
          ...SHARES_TRANSFER_DETAILS[0],
          type: 'secondaryDeviceQR',
        }),
      );
    } else {
      dispatch(uploadEncMShare(0));
    }
  }, [SHARES_TRANSFER_DETAILS]);
  console.log({ secondaryQR });
  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
      <SafeAreaView
        style={{ flex: 0, backgroundColor: Colors.backgroundColor }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View
        style={{
          ...styles.modalHeaderTitleView,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              marginLeft: 10,
              marginRight: 10,
            }}
          >
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={BackupStyles.modalHeaderTitleText}>
                {props.navigation.state.params.selectedTitle}
              </Text>
              <Text style={BackupStyles.modalHeaderInfoText}>
                Last backup{' '}
                <Text
                  style={{
                    fontFamily: Fonts.FiraSansMediumItalic,
                    fontWeight: 'bold',
                  }}
                >
                  {' '}
                  {props.navigation.state.params.selectedTime}
                </Text>
              </Text>
            </View>
            <Image
              style={{ ...BackupStyles.cardIconImage, alignSelf: 'center' }}
              source={getIconByStatus(
                props.navigation.state.params.selectedStatus,
              )}
            />
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <HistoryPageComponent
          data={sortedHistory(secondaryDeviceHistory)}
          // reshareInfo={
          //   'consectetur Lorem ipsum dolor sit amet, consectetur sit '
          // }
          onPressConfirm={() => {
            // ConfirmBottomSheet.current.snapTo(1);
            alert('confirm');
          }}
          onPressReshare={() => {
            alert('reshare');
            // ReshareBottomSheet.current.snapTo(1);
          }}
          onPressContinue={() => {
            (secondaryDeviceBottomSheet as any).current.snapTo(1);
          }}
        />
      </View>
      <BottomSheet
        onCloseStart={() => {
          secondaryDeviceBottomSheet.current.snapTo(0);
        }}
        enabledInnerScrolling={true}
        ref={secondaryDeviceBottomSheet}
        snapPoints={[-30, hp('90%')]}
        renderContent={renderSecondaryDeviceContents}
        renderHeader={renderSecondaryDeviceHeader}
      />
    </View>
  );
};

export default SecondaryDeviceHistory;

const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('3%'),
    marginTop: 20,
    marginBottom: 15,
  },
});
