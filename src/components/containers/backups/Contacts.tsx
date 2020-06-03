import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Fonts from '../../../common/Fonts';
import BackupStyles from './Styles';
import Colors from '../../../common/Colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import ContactList from '../../ContactList';
import { uploadEncMShare, ErrorSending } from '../../../store/actions/sss';
import { useDispatch, useSelector } from 'react-redux';
import CommunicationModeModalContents from '../../CommunicationModeModalContents';
import DeviceInfo from 'react-native-device-info';
import BottomSheet from 'reanimated-bottom-sheet';
import { textWithoutEncoding, email } from 'react-native-communications';
import ErrorModalContents from '../../../components/ErrorModalContents';
import ModalHeader from '../../../components/ModalHeader';

const Contacts = props => {
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const isErrorSendingFailed = useSelector(state => state.sss.errorSending);
  console.log('isErrorSendingFailed', isErrorSendingFailed);
  const [selectedStatus, setSelectedStatus] = useState('Ugly'); // for preserving health of this entity
  const [contacts, setContacts] = useState([]);
  const [communicationModeBottomSheet, setCommunicationMode] = useState(
    React.createRef(),
  );

  function selectedContactsList(list) {
    if (list.length > 0) setContacts([...list]);
  }

  const dispatch = useDispatch();
  const { DECENTRALIZED_BACKUP, WALLET_SETUP } = useSelector(
    state => state.storage.database,
  );
  const { SHARES_TRANSFER_DETAILS } = DECENTRALIZED_BACKUP;

  const continueNProceed = async () => {
    if (!SHARES_TRANSFER_DETAILS[props.index])
      dispatch(uploadEncMShare(props.index));
    communicationModeBottomSheet.current.snapTo(1);
  };

  const communicate = async selectedContactMode => {
    if (!SHARES_TRANSFER_DETAILS[props.index]) {
      Alert.alert('Failed to share');
      return;
    }
    const deepLink =
      `https://hexawallet.io/app/${WALLET_SETUP.walletName}/sss/ek/` +
      SHARES_TRANSFER_DETAILS[props.index].ENCRYPTED_KEY;

    switch (selectedContactMode.type) {
      case 'number':
        textWithoutEncoding(selectedContactMode.info, deepLink);
        break;

      case 'email':
        email(
          [selectedContactMode.info],
          null,
          null,
          'Keeper request',
          deepLink,
        );
        break;
    }
  };

  function requestHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => closeModal()}
        style={{ ...styles.modalHeaderContainer }}
      >
        <View style={styles.modalHeaderHandle} />
      </TouchableOpacity>
    );
  }

  function closeModal() {
    communicationModeBottomSheet.current.snapTo(0);
    return;
  }

  function renderCommunicationModeContent() {
    return (
      <CommunicationModeModalContents
        onPressProceed={communicate}
        contact={contacts[0]}
      />
    );
  }

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
        bottomImage={require('../../../assets/images/icons/errorImage.png')}
      />
    );
  }, [errorMessage, errorMessageHeader]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  if (isErrorSendingFailed) {
    setTimeout(() => {
      setErrorMessageHeader('Error sending Recovery Key');
      setErrorMessage(
        'There was an error while sending your Recovery Key, please try again in a little while',
      );
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(ErrorSending(null));
  }

  return (
    <View style={BackupStyles.modalContainer}>
      <View style={BackupStyles.modalHeaderTitleView}>
        <View style={{ marginTop: hp('2%') }}>
          <Text style={BackupStyles.modalHeaderTitleText}>Friends and Family</Text>
          <Text style={BackupStyles.modalHeaderInfoText}>Never backed up</Text>
        </View>
        <Image
          style={BackupStyles.cardIconImage}
          source={props.getIconByStatus(selectedStatus)}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            marginLeft: 30,
            color: Colors.textColorGrey,
            fontFamily: Fonts.FiraSansRegular,
            fontSize: RFValue(12),
            marginTop: 5,
          }}
        >
          Select contact to{' '}
          <Text
            style={{
              fontFamily: Fonts.FiraSansMediumItalic,
              fontWeight: 'bold',
            }}
          >
            send recovery key
          </Text>
        </Text>
        <ContactList
          style={{}}
          onPressContinue={continueNProceed}
          onSelectContact={selectedContactsList}
        />
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={communicationModeBottomSheet}
        snapPoints={[
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('75%'),
        ]}
        renderContent={renderCommunicationModeContent}
        renderHeader={requestHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalHeaderContainer: {
    paddingTop: 20,
  },
  modalHeaderHandle: {
    width: 30,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
    marginBottom: 7,
  },
});
export default Contacts;
