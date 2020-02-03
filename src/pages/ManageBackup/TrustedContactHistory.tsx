import React, { useState, useEffect } from 'react';
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
import ErrorModalContents from '../../components/ErrorModalContents';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../../components/ModalHeader';
import HistoryPageComponent from '../../components/HistoryPageComponent';
import TrustedContacts from './TrustedContacts';
import CommunicationMode from './CommunicationMode';
import AsyncStorage from '@react-native-community/async-storage';
import ShareOtpWithTrustedContact from './ShareOtpWithTrustedContact';

const TrustedContactHistory = props => {
    const [ChangeBottomSheet, setChangeBottomSheet] = useState(React.createRef());
    const [ReshareBottomSheet, setReshareBottomSheet] = useState(React.createRef());
    const [ConfirmBottomSheet, setConfirmBottomSheet] = useState(React.createRef());
    const [OTP, setOTP] = useState('');
    const [chosenContactIndex, setChosenContactIndex] = useState(1);
    const [chosenContact, setChosenContact] = useState({});
    const [IsReshare, setIsReshare] = useState(false);
    const [ContactToConfirm, setContactToConfirm] = useState({});
    const [trustedContactsBottomSheet, setTrustedContactsBottomSheet] = useState(React.createRef());
    const [shareOtpWithTrustedContactBottomSheet,setShareOtpWithTrustedContactBottomSheet] = useState(React.createRef());
    const [CommunicationModeBottomSheet,setCommunicationModeBottomSheet] = useState(React.createRef());
    const [LoadContacts, setLoadContacts] = useState(false);
    const [contacts, setContacts] = useState([]);
    let [SelectedContacts, setSelectedContacts] = useState([]);
    const [isSecretShared1, setIsSecretShared1] = useState(false);
    const [isSecretShared2, setIsSecretShared2] = useState(false);
    const [autoHighlightFlags, setAutoHighlightFlags] = useState({
        secondaryDevice: false,
        trustedContact1: false,
        trustedContact2: false,
        personalCopy1: false,
        personalCopy2: false,
        securityAns: false,
      });
    const index = props.navigation.state.params && props.navigation.state.params.selectedTitle == "Trusted Contact 1" ? 1 : 2;
    const [secondaryDeviceHistory, setSecondaryDeviceHistory] = useState([
        {
            id: 1,
            title: 'Recovery Secret Not Accessible',
            date: '19 May ‘19, 11:00am',
            info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
        },
        {
            id: 2,
            title: 'Recovery Secret Received',
            date: '1 June ‘19, 9:00am',
            info: 'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
        },
        {
            id: 3,
            title: 'Recovery Secret In-Transit',
            date: '30 May ‘19, 11:00am',
            info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
        },
        {
            id: 4,
            title: 'Recovery Secret Accessible',
            date: '24 May ‘19, 5:00pm',
            info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
        },
        {
            id: 5,
            title: 'Recovery Secret In-Transit',
            date: '20 May ‘19, 11:00am',
            info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
        },
        {
            id: 6,
            title: 'Recovery Secret Not Accessible',
            date: '19 May ‘19, 11:00am',
            info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
        },
    ]);

    const secretSharedTrustedContact1 = isSecretShared1 => {
        setIsSecretShared1(isSecretShared1);
    };
    
    const secretSharedTrustedContact2 = isSecretShared2 => {
        setIsSecretShared2(isSecretShared2);
    };

    useEffect(()=>{
        getInfo();
    },[]);

    const getInfo = async() =>{
        let SelectedContactsTemp = JSON.parse(await AsyncStorage.getItem('SelectedContacts'));
        setSelectedContacts(SelectedContactsTemp);
        if(SelectedContactsTemp){
            if(props.navigation.state.params.selectedTitle == "Trusted Contact 1" && SelectedContactsTemp[0]){
                setChosenContact(SelectedContactsTemp[0]);  
            }
            if(props.navigation.state.params.selectedTitle == "Trusted Contact 2" && SelectedContactsTemp[1]){
                setChosenContact(SelectedContactsTemp[1]);
            }
            if(props.navigation.state.params.isConfirm){
                ConfirmBottomSheet.current.snapTo(1);
            }
        }
        let setupFlowFlags = JSON.parse(await AsyncStorage.getItem('AutoHighlightFlags'));
        if(setupFlowFlags){
            setAutoHighlightFlags(setupFlowFlags);
        }
    }

    function renderTrustedContactsContent() {
        return (
            <TrustedContacts
                LoadContacts={LoadContacts}
                onPressBack={() => {
                trustedContactsBottomSheet.current.snapTo(0);
                }}
                onPressContinue={(selectedContacts, index) =>
                    getContacts(selectedContacts, index)
                }
                index={index}
            />
        );
    }
    
    function renderTrustedContactsHeader() {
        return (
            <ModalHeader
                onPressHeader={() => {
                    (trustedContactsBottomSheet as any).current.snapTo(0);
                }}
            />
        );
    }

    const getContacts = async (selectedContacts, index) => {
        let contactList = SelectedContacts;
        if (!contactList) {
            contactList = [];
        }
        if (index == 1) {
            contactList[0] = selectedContacts[0];
        }
        if (index == 2) {
            contactList[1] = selectedContacts[0];
        }

        setTimeout(() => {
            setContacts(selectedContacts);
        }, 2);
        setTimeout(() => {
            setChosenContact(contactList.length==2 && index==2 ? contactList[1] : contactList[0]);
        }, 2);
        trustedContactsBottomSheet.current.snapTo(0);
        CommunicationModeBottomSheet.current.snapTo(1);
    };
    
    function renderCommunicationModeModalContent() {
        return (
            <CommunicationMode
                secretSharedTrustedContact1={secretSharedTrustedContact1}
                secretSharedTrustedContact2={secretSharedTrustedContact2}
                contact={chosenContact ? chosenContact : null}
                index={index}
                onPressBack={() => {
                    CommunicationModeBottomSheet.current.snapTo(0);
                }}
                onPressContinue={(OTP, index) => {
                    setTimeout(() => {
                    setOTP(OTP);
                    setChosenContactIndex(index);
                    }, 10);
                    CommunicationModeBottomSheet.current.snapTo(0);
                    shareOtpWithTrustedContactBottomSheet.current.snapTo(1);
                }}
            />
        );
    }
    
    function renderCommunicationModeModalHeader() {
        return (
            <ModalHeader
                onPressHeader={() => {
                    (CommunicationModeBottomSheet as any).current.snapTo(0);
                }}
            />
        );
    }

    function renderShareOtpWithTrustedContactContent() {
        return (
            <ShareOtpWithTrustedContact
                onPressOk={index => onOTPShare(index)}
                onPressBack={() => {
                    shareOtpWithTrustedContactBottomSheet.current.snapTo(0);
                }}
                OTP={OTP}
                index={chosenContactIndex}
            />
        );
    }
    
    function renderShareOtpWithTrustedContactHeader() {
        return (
            <ModalHeader
                onPressHeader={() => {
                    (shareOtpWithTrustedContactBottomSheet as any).current.snapTo(0);
                }}
            />
        );
    }
    
    const onOTPShare = async index => {
        shareOtpWithTrustedContactBottomSheet.current.snapTo(0);
        let selectedContactList = JSON.parse(await AsyncStorage.getItem("SelectedContacts"));
        if(!selectedContactList){
            selectedContactList = [];
        }
        if (index == 2) {
            selectedContactList[1] = chosenContact;
        } else if (index == 1) {
            selectedContactList[0] = chosenContact;
        }
        await AsyncStorage.setItem('SelectedContacts', JSON.stringify(selectedContactList));
        let setupFlowFlags = JSON.parse(await AsyncStorage.getItem('AutoHighlightFlags'));
        if(index == 1){
            setupFlowFlags.trustedContact1 = true;
        }
        else{
            setupFlowFlags.trustedContact2 = true;
        }
        setAutoHighlightFlags(setupFlowFlags);
        await AsyncStorage.setItem('AutoHighlightFlags', JSON.stringify(setupFlowFlags));
        // remaining Set setup flag 
        shareOtpWithTrustedContactBottomSheet.current.snapTo(0);
    };
    
    const renderConfirmContent = () => {
        return (
        <ErrorModalContents
            modalRef={ConfirmBottomSheet}
            title={'Confirm Recovery Secret\nwith Trusted Contact'}
            info={'Your Trusted Contact seems away from their Hexa App'}
            note={'You can send them a reminder to open their app to\nensure they have your Recovery Secret'}
            proceedButtonText={'Confirm'}
            cancelButtonText={'Back'}
            isIgnoreButton={true}
            onPressProceed={() => {
                onPressConfirm();
            }}
            onPressIgnore={() => {
                (ConfirmBottomSheet as any).current.snapTo(0);
            }}
            isBottomImage={false}
        />
        );
    };

    const onPressConfirm = () => {
        (ConfirmBottomSheet as any).current.snapTo(0);
    };

    const renderConfirmHeader = () => {
        return (
        <ModalHeader
            onPressHeader={() => {
                (ConfirmBottomSheet as any).current.snapTo(0);
            }}
        />
        );
    };

    const renderReshareContent = () => {
        return (
        <ErrorModalContents
            modalRef={ReshareBottomSheet}
            title={'Reshare Recovery Secret\nwith Trusted Contact'}
            info={'Did your contact not receive the Recovery Secret?'}
            note={'You can reshare the Recovery Secret with your Trusted\nContact via Email or Sms'}
            proceedButtonText={'Reshare'}
            cancelButtonText={'Back'}
            isIgnoreButton={true}
            onPressProceed={() => {
                onPressReshare();
            }}
            onPressIgnore={() => {
                (ReshareBottomSheet as any).current.snapTo(0);
            }}
            isBottomImage={false}
        />
        );
    };

    const onPressReshare = async() => {
        let selectedContactList = JSON.parse(await AsyncStorage.getItem("SelectedContacts"));
        if (props.navigation.state.params.selectedTitle == 'Trusted Contact 1') {
            setChosenContact(selectedContactList[0]);
        } else if (props.navigation.state.params.selectedTitle == 'Trusted Contact 2') {
            setChosenContact(selectedContactList[1]);
        }
        CommunicationModeBottomSheet.current.snapTo(1);
        (ReshareBottomSheet as any).current.snapTo(0);
    };

    const renderReshareHeader = () => {
        return (
        <ModalHeader
            onPressHeader={() => {
            (ReshareBottomSheet as any).current.snapTo(0);
            }}
        />
        );
    };

    const renderChangeContent = () => {
        return (
        <ErrorModalContents
            modalRef={ChangeBottomSheet}
            title={'Change your\nTrusted Contact'}
            info={'Having problems with your Trusted Contact'}
            note={'You can change the Trusted Contact you selected to share your Recovery Secret'}
            proceedButtonText={'Change'}
            cancelButtonText={'Back'}
            isIgnoreButton={true}
            onPressProceed={() => {
                setTimeout(() => {
                    setLoadContacts(true);
                }, 2);
                trustedContactsBottomSheet.current.snapTo(1);
                (ChangeBottomSheet as any).current.snapTo(0);
            }}
            onPressIgnore={() => {
                (ChangeBottomSheet as any).current.snapTo(0);
            }}
            isBottomImage={false}
        />
        );
    };

    const renderChangeHeader = () => {
        return (
        <ModalHeader
            onPressHeader={() => {
                (ChangeBottomSheet as any).current.snapTo(0);
            }}
        />
        );
    };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <SafeAreaView style={{ flex: 0, backgroundColor: Colors.backgroundColor }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={{ ...styles.modalHeaderTitleView, paddingLeft: 10, paddingRight: 10, }}>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={() => { props.navigation.goBack(); }} style={{ height: 30, width: 30, justifyContent: "center" }} >
                    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                </TouchableOpacity>
                <View style={{ flex: 1, flexDirection:'row', marginLeft: 10, marginRight: 10, }}>
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <Text style={BackupStyles.modalHeaderTitleText}>{props.navigation.state.params.selectedTitle}</Text>
                        <Text style={BackupStyles.modalHeaderInfoText}>
                            Last backup{' '}<Text style={{ fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold', }}> {props.navigation.state.params.selectedTime}</Text>
                        </Text>
                    </View>
                    <Image style={{...BackupStyles.cardIconImage, alignSelf:'center'}} source={getIconByStatus(props.navigation.state.params.selectedStatus)} />
                </View>
            </View>
        </View>
        <View style={{flex:1}}>
            <HistoryPageComponent
                IsReshare = {((autoHighlightFlags.trustedContact1 && props.navigation.state.params.selectedTitle == "Trusted Contact 1") || (autoHighlightFlags.trustedContact2 && props.navigation.state.params.selectedTitle == "Trusted Contact 2")) ? true : false}
                onPressContinue={()=>{setTimeout(() => {
                    setLoadContacts(true);
                }, 2);trustedContactsBottomSheet.current.snapTo(1)}}
                data={secondaryDeviceHistory}
                reshareInfo={'consectetur Lorem ipsum dolor sit amet, consectetur sit '}
                changeInfo={'Lorem ipsum dolor sit amet, consectetur sit amet '}
                onPressChange={() => {
                    ChangeBottomSheet.current.snapTo(1);
                }}
                onPressConfirm={() => {
                    ConfirmBottomSheet.current.snapTo(1);
                }}
                onPressReshare={() => {
                    ReshareBottomSheet.current.snapTo(1);
                }}
            />
        </View>
        <BottomSheet
            enabledInnerScrolling={true}
            ref={trustedContactsBottomSheet}
            snapPoints={[-30, hp('90%')]}
            renderContent={renderTrustedContactsContent}
            renderHeader={renderTrustedContactsHeader}
        />
        <BottomSheet
            enabledInnerScrolling={true}
            ref={CommunicationModeBottomSheet}
            snapPoints={[-30, hp('75%')]}
            renderContent={renderCommunicationModeModalContent}
            renderHeader={renderCommunicationModeModalHeader}
        />
        <BottomSheet
            enabledInnerScrolling={true}
            ref={shareOtpWithTrustedContactBottomSheet}
            snapPoints={[-30, hp('70%')]}
            renderContent={renderShareOtpWithTrustedContactContent}
            renderHeader={renderShareOtpWithTrustedContactHeader}
        />
        <BottomSheet
            enabledInnerScrolling={true}
            ref={ChangeBottomSheet}
            snapPoints={[
                -50,
                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('37%')
                : hp('45%'),
            ]}
            renderContent={renderChangeContent}
            renderHeader={renderChangeHeader}
        />
        <BottomSheet
            enabledInnerScrolling={true}
            ref={ReshareBottomSheet}
            snapPoints={[
                -50,
                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('37%')
                : hp('45%'),
            ]}
            renderContent={renderReshareContent}
            renderHeader={renderReshareHeader}
        />
        <BottomSheet
            enabledInnerScrolling={true}
            ref={ConfirmBottomSheet}
            snapPoints={[
                -50,
                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('37%')
                : hp('45%'),
            ]}
            renderContent={renderConfirmContent}
            renderHeader={renderConfirmHeader}
        />
    </View>
  );
};

export default TrustedContactHistory;

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
    marginTop:20,
    marginBottom: 15,
  },
});
