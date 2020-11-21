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
  Alert,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from './Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getIconByStatus } from './utils';
import { useDispatch, useSelector } from 'react-redux';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFValue } from 'react-native-responsive-fontsize';
import BottomSheet from 'reanimated-bottom-sheet';
import ModalHeader from '../../components/ModalHeader';
import HistoryPageComponent from './HistoryPageComponent';
import PersonalCopyShareModal from '../../components/PersonalCopyShareModal';
import moment from 'moment';
import _ from 'underscore';
import DeviceInfo, { getFirstInstallTime } from 'react-native-device-info';
import ErrorModalContents from '../../components/ErrorModalContents';
import KnowMoreButton from '../../components/KnowMoreButton';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import { SECURE_ACCOUNT } from '../../common/constants/serviceTypes';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import PersonalCopyHelpContents from '../../components/Helper/PersonalCopyHelpContents';
import HistoryHeaderComponent from './HistoryHeaderComponent';

const PersonalCopyHistory = (props) => {
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [HelpBottomSheet, setHelpBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
 
  const [blockReshare, setBlockReshare] = useState('');
  
  const [personalCopyHistory, setPersonalCopyHistory] = useState([
    {
      id: 1,
      title: 'Recovery Key created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Key in-transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Key accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Key not accessible',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
  ]);
  const [
    PersonalCopyShareBottomSheet,
    setPersonalCopyShareBottomSheet,
  ] = useState(React.createRef());

  const secureAccount: SecureAccount = useSelector(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );

  const selectedPersonalCopy = props.navigation.getParam(
    'selectedPersonalCopy',
  );
  
  const [personalCopyDetails, setPersonalCopyDetails] = useState(null);
  const [isPrimaryKeeper, setIsPrimaryKeeper] = useState(
    props.navigation.state.params.isPrimaryKeeper,
  );
  const [selectedShareId, setSelectedShareId] = useState(
    props.navigation.state.params.selectedShareId,
  );
  const [selectedLevelId, setSelectedLevelId] = useState(
    props.navigation.state.params.selectedLevelId,
  );
  const [selectedKeeper, setSelectedKeeper] = useState(
    props.navigation.state.params.selectedKeeper,
  );
  const [isReshare, setIsReshare] = useState(
    props.navigation.state.params.selectedStatus == 'notAccessible'
      ? false
      : true,
  );
  const levelHealth = useSelector((state) => state.health.levelHealth);
  const currentLevel = useSelector((state) => state.health.currentLevel);

  useEffect(() => {
    setIsPrimaryKeeper(props.navigation.state.params.isPrimaryKeeper);
    setSelectedShareId(props.navigation.state.params.selectedShareId);
    setSelectedLevelId(props.navigation.state.params.selectedLevelId);
    setSelectedKeeper(props.navigation.state.params.selectedKeeper);
    setIsReshare(
      props.navigation.state.params.selectedStatus == 'notAccessible'
        ? false
        : true,
    );
  }, [
    props.navigation.state.params.selectedShareId,
    props.navigation.state.params.selectedLevelId,
    props.navigation.state.params.isPrimaryKeeper,
    props.navigation.state.params.selectedKeeper,
    props.navigation.state.params.selectedStatus,
  ]);

  const saveInTransitHistory = async () => {
    const shareHistory = JSON.parse(await AsyncStorage.getItem('shareHistory'));
    if (shareHistory) {
      let updatedShareHistory = [...shareHistory];
      updatedShareHistory = {
        ...updatedShareHistory,
        inTransit: Date.now(),
      };
      updateHistory(updatedShareHistory);
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify(updatedShareHistory),
      );
    }
  };

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

  const updateHistory = (shareHistory) => {
    const updatedPersonalCopyHistory = [...personalCopyHistory];
    if (shareHistory.createdAt)
      updatedPersonalCopyHistory[0].date = shareHistory.createdAt;
    if (shareHistory.inTransit)
      updatedPersonalCopyHistory[1].date = shareHistory.inTransit;

    if (shareHistory.accessible)
      updatedPersonalCopyHistory[2].date = shareHistory.accessible;

    if (shareHistory.notAccessible)
      updatedPersonalCopyHistory[3].date = shareHistory.notAccessible;

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

   const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/errorImage.png')}
      />
    );
  }, [errorMessage, errorMessageHeader]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        // onPressHeader={() => {
        //   (ErrorBottomSheet as any).current.snapTo(0);
        // }}
      />
    );
  }, []);

  const renderPersonalCopyShareModalContent = useCallback(() => {
    return (
      <PersonalCopyShareModal
        removeHighlightingFromCard={() => {}}
        selectedPersonalCopy={selectedPersonalCopy}
        personalCopyDetails={personalCopyDetails}
        onPressBack={() => {
          (PersonalCopyShareBottomSheet as any).current.snapTo(0);
        }}
        onPressShare={() => {}}
        onPressConfirm={async () => {
          let personalCopyDetails = JSON.parse(
            await AsyncStorage.getItem('personalCopyDetails'),
          );
          personalCopyDetails[selectedPersonalCopy.type].shared = true;
          AsyncStorage.setItem(
            'personalCopyDetails',
            JSON.stringify(personalCopyDetails),
          );
          setPersonalCopyDetails(personalCopyDetails);
          saveInTransitHistory();
          (PersonalCopyShareBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [selectedPersonalCopy, personalCopyDetails]);

  const renderPersonalCopyShareModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (PersonalCopyShareBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderHelpHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if (HelpBottomSheet.current)
            (HelpBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderHelpContent = () => {
    return <PersonalCopyHelpContents 
    titleClicked={()=>{
      if (HelpBottomSheet.current)
            (HelpBottomSheet as any).current.snapTo(0);
    }}/>;
  };

  const confirmClick = () => {
    
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
      <SafeAreaView
        style={{ flex: 0, backgroundColor: Colors.backgroundColor }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <HistoryHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={props.navigation.state.params.selectedTitle}
        selectedTime={props.navigation.state.params.selectedTime}
        selectedStatus={props.navigation.state.params.selectedStatus}
        moreInfo={props.navigation.state.params.selectedTitle}
        headerImage={require('../../assets/images/icons/note.png')}
      />
      <View style={{ flex: 1 }}>
        <HistoryPageComponent
          type={'copy'}
          IsReshare={isReshare}
          data={sortedHistory(personalCopyHistory)}
          confirmButtonText={'Confirm'}
          onPressConfirm={() => {
            (PersonalCopyShareBottomSheet as any).current.snapTo(1);
          }}
          reshareButtonText={'Restore Keeper'}
          onPressReshare={async () => {
            (PersonalCopyShareBottomSheet as any).current.snapTo(1);
          }}
          changeButtonText={'Change Keeper'}
          onPressChange={() => {
            (PersonalCopyShareBottomSheet as any).current.snapTo(1);
          }}
        />
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={PersonalCopyShareBottomSheet as any}
        snapPoints={[-50, hp('85%')]}
        renderContent={renderPersonalCopyShareModalContent}
        renderHeader={renderPersonalCopyShareModalHeader}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    
      <BottomSheet
        enabledInnerScrolling={true}
        ref={HelpBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('87%') : hp('89%'),
        ]}
        renderContent={renderHelpContent}
        renderHeader={renderHelpHeader}
      />
    </View>
  );
};

export default PersonalCopyHistory;

const styles = StyleSheet.create({
});
