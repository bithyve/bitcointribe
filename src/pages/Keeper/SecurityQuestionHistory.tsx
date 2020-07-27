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
  Platform,
  Keyboard,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from './Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getIconByStatus } from './utils';
import { useDispatch } from 'react-redux';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFValue } from 'react-native-responsive-fontsize';
import moment from 'moment';
import _ from 'underscore';
import HistoryPageComponent from './HistoryPageComponent';

const SecurityQuestionHistory = (props) => {
  const [securityQuestionsHistory, setSecuirtyQuestionHistory] = useState([
    {
      id: 1,
      title: 'Security Questions created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Security Questions confirmed',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Security Questions unconfirmed',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
  ]);
  const [
    SecurityQuestionBottomSheet,
    setSecurityQuestionBottomSheet,
  ] = useState(React.createRef());
  const [
    HealthCheckSuccessBottomSheet,
    setHealthCheckSuccessBottomSheet,
  ] = useState(React.createRef());

  const updateAutoHighlightFlags = props.navigation.getParam(
    'updateAutoHighlightFlags',
  );
  const next = props.navigation.getParam('next');
  const dispatch = useDispatch();

  //   const renderSecurityQuestionContent = useCallback(() => {
  //     return (
  //       <HealthCheckSecurityQuestion
  //         bottomSheetRef={SecurityQuestionBottomSheet}
  //         onPressConfirm={async () => {
  //           Keyboard.dismiss();
  //           updateAutoHighlightFlags();
  //           saveConfirmationHistory();
  //           setTimeout(() => {
  //             (SecurityQuestionBottomSheet as any).current.snapTo(0);
  //           }, 2);
  //           (HealthCheckSuccessBottomSheet as any).current.snapTo(1);
  //         }}
  //       />
  //     );
  //   }, []);

  //   const renderSecurityQuestionHeader = useCallback(() => {
  //     return (
  //       <ModalHeader
  //         onPressHeader={() => {
  //           (SecurityQuestionBottomSheet as any).current.snapTo(0);
  //         }}
  //       />
  //     );
  //   }, []);

  //   const renderHealthCheckSuccessModalContent = useCallback(() => {
  //     return (
  //       <ErrorModalContents
  //         modalRef={HealthCheckSuccessBottomSheet}
  //         title={'Health Check Successful'}
  //         info={'Question Successfully Backed Up'}
  //         note={'Hexa will remind you to help\nremember the answer'}
  //         proceedButtonText={'View Health'}
  //         isIgnoreButton={false}
  //         onPressProceed={() => {
  //           (HealthCheckSuccessBottomSheet as any).current.snapTo(0);
  //           dispatch(checkMSharesHealth());
  //           props.navigation.goBack();
  //         }}
  //         isBottomImage={true}
  //       />
  //     );
  //   }, []);

  //   const renderHealthCheckSuccessModalHeader = useCallback(() => {
  //     return (
  //       <ModalHeader
  //         // onPressHeader={() => {
  //         //   (HealthCheckSuccessBottomSheet as any).current.snapTo(0);
  //         // }}
  //       />
  //     );
  //   }, []);

  const sortedHistory = (history) => {
    const currentHistory = history.filter((element) => {
      if (element.date) return element;
    });

    const sortedHistory = _.sortBy(currentHistory, 'date');
    sortedHistory.forEach((element) => {
      element.date = moment(element.date)
        .utc()
        .local()
        .format('DD MMMM YYYY HH:mm');
    });

    return sortedHistory;
  };

  const updateHistory = (securityQuestionHistory) => {
    const updatedSecurityQuestionsHistory = [...securityQuestionsHistory];
    if (securityQuestionHistory.created)
      updatedSecurityQuestionsHistory[0].date = securityQuestionHistory.created;

    if (securityQuestionHistory.confirmed)
      updatedSecurityQuestionsHistory[1].date =
        securityQuestionHistory.confirmed;

    if (securityQuestionHistory.unconfirmed)
      updatedSecurityQuestionsHistory[2].date =
        securityQuestionHistory.unconfirmed;
    setSecuirtyQuestionHistory(updatedSecurityQuestionsHistory);
  };

  const saveConfirmationHistory = async () => {
    const securityQuestionHistory = JSON.parse(
      await AsyncStorage.getItem('securityQuestionHistory'),
    );
    if (securityQuestionHistory) {
      const updatedSecurityQuestionsHistory = {
        ...securityQuestionHistory,
        confirmed: Date.now(),
      };
      updateHistory(updatedSecurityQuestionsHistory);
      await AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify(updatedSecurityQuestionsHistory),
      );
    }
  };

  useEffect(() => {
    if (next) (SecurityQuestionBottomSheet as any).current.snapTo(1);
  }, [next]);

  useEffect(() => {
    (async () => {
      const securityQuestionHistory = JSON.parse(
        await AsyncStorage.getItem('securityQuestionHistory'),
      );
      console.log({ securityQuestionHistory });
      if (securityQuestionHistory) updateHistory(securityQuestionHistory);
    })();
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
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={BackupStyles.modalHeaderTitleText}>
                {'Security Question'}
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
          type={'security'}
          IsReshare
          data={sortedHistory(securityQuestionsHistory)}
          // reshareInfo={
          //   'Want to send the Recovery Key again to the same destination? '
          // }
          //   onPressConfirm={() => {
          //     // ConfirmBottomSheet.current.snapTo(1);
          //     // alert('confirm');
          //     (SecurityQuestionBottomSheet as any).current.snapTo(1);
          //   }}
          //   onPressContinue={() => {
          //     (SecurityQuestionBottomSheet as any).current.snapTo(1);
          //   }}
        />
       </View>
      {/* <BottomSheet
         enabledInnerScrolling={true}
        ref={SecurityQuestionBottomSheet as any}
        snapPoints={[-30, hp('75%'), hp('90%')]}
        renderContent={renderSecurityQuestionContent}
        renderHeader={renderSecurityQuestionHeader}
      />
      <BottomSheet
         enabledGestureInteraction={false}
         enabledInnerScrolling={true}
        ref={HealthCheckSuccessBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderHealthCheckSuccessModalContent}
        renderHeader={renderHealthCheckSuccessModalHeader}
      /> */}
    </View>
  );
};

export default SecurityQuestionHistory;

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
