import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from './Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getIconByStatus } from './utils';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkPDFHealth,
  pdfHealthChecked,
  checkMSharesHealth,
} from '../../store/actions/sss';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFValue } from 'react-native-responsive-fontsize';
import BottomSheet from 'reanimated-bottom-sheet';
import ModalHeader from '../../components/ModalHeader';
import HistoryPageComponent from '../../components/HistoryPageComponent';
import { ModalShareIntent } from '../../components/Modal/ManageBackup';
import moment from 'moment';
import _ from 'underscore';
import Toast from '../../components/Toast';

const PersonalCopyHistory = props => {
  const [personalCopyHistory, setPersonalCopyHistory] = useState([
    {
      id: 1,
      title: 'Recovery Secret created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Secret in-transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Secret accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Secret not accessible',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
  ]);
  const [
    PersonalCopyShareBottomSheet,
    setPersonalCopyShareBottomSheet,
  ] = useState(React.createRef());

  const updateAutoHighlightFlags = props.navigation.getParam(
    'updateAutoHighlightFlags',
  );
  const selectedPersonalCopy = props.navigation.getParam(
    'selectedPersonalCopy',
  );
  const next = props.navigation.getParam('next');
  const { loading } = useSelector(state => state.sss);
  const dispatch = useDispatch();

  const onConfirm = useCallback(() => {
    // ConfirmBottomSheet.current.snapTo(1);
    // alert('confirm');
    const index = selectedPersonalCopy.type === 'copy1' ? 3 : 4;
    props.navigation.navigate('QrScanner', {
      scanedCode: qrData => {
        dispatch(checkPDFHealth(qrData, index));
      },
      title: 'Confirm your Recovery Secret',
    });
  }, [selectedPersonalCopy]);

  useEffect(() => {
    if (loading.pdfHealthChecked) {
      console.log(
        'loading.pdfHealthChecked && personalCopyIndex',
        loading.pdfHealthChecked,
      );
      Toast('PDF scanned Successfully');
      dispatch(checkMSharesHealth());
      dispatch(pdfHealthChecked(''));
    }
  }, [loading.pdfHealthChecked]);

  const renderPersonalCopyShareModalContent = useCallback(() => {
    return (
      <ModalShareIntent
        removeHighlightingFromCard={() => {}}
        selectedPersonalCopy={selectedPersonalCopy}
        onPressBack={() => {
          (PersonalCopyShareBottomSheet as any).current.snapTo(0);
        }}
        onPressShare={() => {
          (PersonalCopyShareBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [selectedPersonalCopy]);

  const renderPersonalCopyShareModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (PersonalCopyShareBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  useEffect(() => {
    if (next) (PersonalCopyShareBottomSheet as any).current.snapTo(1);
  }, [next]);

  const [personalCopyShared, setPersonalCopyShared] = useState(false);

  const saveInTransitHistory = async () => {
    const index = selectedPersonalCopy.type === 'copy1' ? 3 : 4;
    const shareHistory = JSON.parse(await AsyncStorage.getItem('shareHistory'));
    if (shareHistory) {
      const updatedShareHistory = [...shareHistory];
      updatedShareHistory[index] = {
        ...updatedShareHistory[index],
        inTransit: Date.now(),
      };
      updateHistory(updatedShareHistory);
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify(updatedShareHistory),
      );
    }
    if (next) {
      props.navigation.goBack();
    }
  };

  const shared = useSelector(state => state.manageBackup.shared);
  useEffect(() => {
    if (selectedPersonalCopy.type === 'copy1' && shared.personalCopy1) {
      setPersonalCopyShared(true);
      updateAutoHighlightFlags();
      saveInTransitHistory();
    } else if (selectedPersonalCopy.type === 'copy2' && shared.personalCopy2) {
      setPersonalCopyShared(true);
      updateAutoHighlightFlags();
      saveInTransitHistory();
    }
  }, [shared]);

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
    const index = selectedPersonalCopy.type === 'copy1' ? 3 : 4;
    const updatedPersonalCopyHistory = [...personalCopyHistory];
    if (shareHistory[index].createdAt)
      updatedPersonalCopyHistory[0].date = shareHistory[index].createdAt;
    if (shareHistory[index].inTransit)
      updatedPersonalCopyHistory[1].date = shareHistory[index].inTransit;

    if (shareHistory[index].accessible)
      updatedPersonalCopyHistory[2].date = shareHistory[index].accessible;

    if (shareHistory[index].notAccessible)
      updatedPersonalCopyHistory[3].date = shareHistory[index].notAccessible;

    setPersonalCopyHistory(updatedPersonalCopyHistory);
  };

  useEffect(() => {
    (async () => {
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem('shareHistory'),
      );
      if (shareHistory) updateHistory(shareHistory);
    })();
  }, []);

  useEffect(() => {
    if (selectedPersonalCopy.type === 'copy1') {
      AsyncStorage.getItem('personalCopy1Shared').then(shared => {
        if (shared) {
          setPersonalCopyShared(true);
        }
      });
    } else if (selectedPersonalCopy.type === 'copy2') {
      AsyncStorage.getItem('personalCopy2Shared').then(shared => {
        if (shared) {
          setPersonalCopyShared(true);
        }
      });
    }
  }, []);

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
              // marginLeft: 10,
              marginRight: 10,
            }}
          >
            <Image
              style={{
                width: wp('9%'),
                height: wp('9%'),
                resizeMode: 'contain',
                alignSelf: 'center',
                marginRight: 8,
              }}
              source={require('../../assets/images/icons/note.png')}
            />
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
              style={{
                width: personalCopyShared ? 14 : 17,
                height: personalCopyShared ? 16 : 17,
                resizeMode: 'contain',
                marginLeft: 'auto',
                alignSelf: 'center',
              }}
              source={
                personalCopyShared
                  ? getIconByStatus(
                      props.navigation.state.params.selectedStatus,
                    )
                  : require('../../assets/images/icons/settings.png')
              }
            />
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <HistoryPageComponent
          type={'copy'}
          // IsReshare
          IsReshare={personalCopyShared ? true : false}
          data={sortedHistory(personalCopyHistory)}
          reshareInfo={
            personalCopyShared
              ? 'Want to send the Recovery Secret again to the same destination? '
              : null
          }
          onPressConfirm={onConfirm}
          onPressReshare={() => {
            // alert('reshare');
            (PersonalCopyShareBottomSheet as any).current.snapTo(1);
          }}
          onPressContinue={() => {
            (PersonalCopyShareBottomSheet as any).current.snapTo(1);
          }}
        />
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={PersonalCopyShareBottomSheet}
        snapPoints={[-50, hp('85%')]}
        renderContent={renderPersonalCopyShareModalContent}
        renderHeader={renderPersonalCopyShareModalHeader}
      />
    </View>
  );
};

export default PersonalCopyHistory;

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
