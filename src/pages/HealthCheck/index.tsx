import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fonts from '../../common/Fonts';
import Colors from '../../common/Colors';
import CommonStyles from '../../common/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import CopyThisText from '../../components/CopyThisText';
import KnowMoreButton from '../../components/KnowMoreButton';
import { useDispatch, useSelector } from 'react-redux';
import { checkMSharesHealth, initializeHealthSetup } from '../../store/actions/health';
import S3Service from '../../bitcoin/services/sss/S3Service';
import HomePageShield from '../../components/HomePageShield';
import BackupStyles from './Styles';
import ContactList from '../../components/ContactList';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomInfoBox from '../../components/BottomInfoBox';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import WalletBackupAndRecoveryContents from '../../components/Helper/WalletBackupAndRecoveryContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';

function getImageByType(type) {
  if (type == 'secondaryDevice') {
    return require('../../assets/images/icons/icon_secondarydevice.png');
  } else if (type == 'contact') {
    return require('../../assets/images/icons/icon_user.png');
  } else if (type == 'cloud') {
    return require('../../assets/images/icons/icon_cloud.png');
  }
  if (type == 'note') {
    return require('../../assets/images/icons/note.png');
  } else if (type == 'security') {
    return require('../../assets/images/icons/icon_securityquestion.png');
  }
}

export default function HealthCheck(props) {
  const [
    WalletBackupAndRecoveryBottomSheet,
    setWalletBackupAndRecoveryBottomSheet,
  ] = useState(React.createRef());
  const [secondaryDeviceBottomSheet, setSecondaryDeviceBottomSheet] = useState(
    React.createRef(),
  );
  const [trustedContactsBottomSheet, setTrustedContactsBottomSheet] = useState(
    React.createRef(),
  );
  const [cloudBottomSheet, setCloudBottomSheet] = useState(React.createRef());
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Ugly');
  const [contacts, setContacts] = useState([]);
  
  const [pageData, setPageData] = useState([
    {
      title: 'Secondary Device',
      time: '1 months ago',
      status: 'Ugly',
      type: 'secondaryDevice',
      route: 'SecondaryDeviceHealthCheck',
    },
    {
      title: 'Pamela Aalto',
      time: '1 month ago',
      status: 'Ugly',
      type: 'contact',
      route: 'TrustedContactHealthCheck',
    },
    {
      title: 'Sophie Babel',
      time: '12 min ago',
      status: 'Ugly',
      type: 'contact',
      route: 'TrustedContactHealthCheck',
    },
    {
      title: 'Cloud',
      time: '2 days ago',
      status: 'Ugly',
      type: 'cloud',
      route: 'CloudHealthCheck',
    },
    {
      title: 'Note',
      time: '2 days ago',
      status: 'Ugly',
      type: 'note',
      route: 'NoteHealthCheck',
    },
    {
      title: 'Security Questions',
      time: '29 day ago',
      status: 'Ugly',
      type: 'security',
      route: '',
    },
  ]);

  const getIconByStatus = status => {
    if (status == 'Ugly') {
      return require('../../assets/images/icons/icon_error_red.png');
    } else if (status == 'Bad') {
      return require('../../assets/images/icons/icon_error_yellow.png');
    } else if (status == 'Good') {
      return require('../../assets/images/icons/icon_check.png');
    }
  };


//   const renderWalletBackupAndRecoveryContents = () => {
//     return (
//       <WalletBackupAndRecoveryContents
//         onPressManageBackup={() => {
//           WalletBackupAndRecoveryBottomSheet.current.snapTo(0);
//         }}
//         onSkip={() => {
//           WalletBackupAndRecoveryBottomSheet.current.snapTo(0);
//         }}
//         onStartBackup={() => {
//           WalletBackupAndRecoveryBottomSheet.current.snapTo(0);
//         }}
//       />
//     );
//   };

//   const renderWalletBackupAndRecoveryHeader = () => {
//     return (
//       <SmallHeaderModal
//         borderColor={Colors.blue}
//         headerColor={Colors.blue}
//         onPressHandle={() => {
//           WalletBackupAndRecoveryBottomSheet.current.snapTo(0);
//         }}
//       />
//     );
//   };

  const dispatch = useDispatch();
  const s3Service: S3Service = useSelector(state => state.sss.service);
  useEffect(() => {
    //WalletBackupAndRecoveryBottomSheet.current.snapTo(1);
    if (!s3Service.levelhealth.healthCheckInitialized) dispatch(initializeHealthSetup());
  }, []);

  const { overallHealth } = useSelector(state => state.sss);

  useEffect(() => {
    if (overallHealth) {
      const updatedPageData = [...pageData];
      updatedPageData.forEach(data => {
        switch (data.title) {
          case 'Secondary Device':
            if (overallHealth.sharesInfo[0].shareStage === 'Good') {
              data.status = 'Good';
            } else if (overallHealth.sharesInfo[0].shareStage === 'Bad') {
              data.status = 'Bad';
            } else if (overallHealth.sharesInfo[0].shareStage === 'Ugly') {
              data.status = 'Ugly';
            }
            break;

          case 'Trusted Contact 1':
            if (overallHealth.sharesInfo[1].shareStage === 'Good') {
              data.status = 'Good';
            } else if (overallHealth.sharesInfo[1].shareStage === 'Bad') {
              data.status = 'Bad';
            } else if (overallHealth.sharesInfo[1].shareStage === 'Ugly') {
              data.status = 'Ugly';
            }
            break;

          case 'Trusted Contact 2':
            if (overallHealth.sharesInfo[2].shareStage === 'Good') {
              data.status = 'Good';
            } else if (overallHealth.sharesInfo[2].shareStage === 'Bad') {
              data.status = 'Bad';
            } else if (overallHealth.sharesInfo[2].shareStage === 'Ugly') {
              data.status = 'Ugly';
            }
            break;

          case 'Security Questions':
            if (overallHealth.qaStatus === 'Good') {
              data.status = 'Good';
            } else if (overallHealth.qaStatus === 'Bad') {
              data.status = 'Bad';
            } else if (overallHealth.qaStatus === 'Ugly') {
              data.status = 'Ugly';
            }
            break;

          default:
            break;
        }
      });
      setPageData(updatedPageData);
    }
  }, [overallHealth]);

  useEffect(() => {
    // HC down-streaming
    if (s3Service) {
      const { healthCheckInitialized } = s3Service.levelhealth;

      if (healthCheckInitialized) {
        dispatch(checkMSharesHealth());
      }
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.goBack();
            }}
            hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
              </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{marginLeft: 'auto',
            marginRight: 10,}}
            onPress={() => {
            }}
          >
          <Image source={require("../../assets/images/icons/icon_settings1.png")} style={styles.image} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={{ flex: 2 }}>
              <Text style={{ ...CommonStyles.headerTitles, marginLeft: 25 }}>
              Health Check
              </Text>
              <Text
                style={{ ...CommonStyles.headerTitlesInfoText, marginLeft: 25 }}
              >
                The wallet backup is not complete. Please complete the setup to
                safeguard against loss of funds
              </Text>
              <KnowMoreButton
                onpress={() => {}}
                containerStyle={{ marginTop: 10, marginLeft: 25 }}
                textStyle={{}}
              />
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {overallHealth ? (
                <HomePageShield
                  circleShadowColor={Colors.borderColor}
                  shieldImage={require('../../assets/images/icons/protector_gray.png')}
                  shieldStatus={overallHealth.overallStatus}
                />
              ) : (
                <HomePageShield
                  circleShadowColor={Colors.borderColor}
                  shieldImage={require('../../assets/images/icons/protector_gray.png')}
                  shieldStatus={0}
                />
              )}
            </View>
          </View>
          <FlatList
            data={pageData}
            extraData={selectedType}
            renderItem={({ item, index }) => (
              <View
              // style={{
              //   opacity: !selectedType || item.type == selectedType ? 1 : 0.5
              // }}
              >
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate(item.route, {
                      index:
                        item.title === 'Trusted Contact 1'
                          ? 1
                          : item.title === 'Trusted Contact 2'
                          ? 2
                          : undefined,
                    })
                  }
                  style={{
                    ...styles.manageBackupCard,
                    borderColor:
                      item.status == 'Ugly'
                        ? Colors.red
                        : item.status == 'Bad'
                        ? Colors.yellow
                        : item.status == 'Good'
                        ? Colors.green
                        : Colors.blue,
                    elevation:
                      selectedType && item.type == selectedType ? 10 : 0,
                    shadowColor:
                      selectedType && item.type == selectedType
                        ? Colors.borderColor
                        : Colors.white,
                    shadowOpacity:
                      selectedType && item.type == selectedType ? 10 : 0,
                    shadowOffset:
                      selectedType && item.type == selectedType
                        ? { width: 0, height: 10 }
                        : { width: 0, height: 0 },
                    shadowRadius:
                      selectedType && item.type == selectedType ? 10 : 0,
                  }}
                >
                  <Image
                    style={styles.cardImage}
                    source={getImageByType(item.type)}
                  />
                  <View style={{ marginLeft: 15 }}>
                    <Text style={styles.cardTitleText}>{item.title}</Text>
                    <Text style={styles.cardTimeText}>
                      Last backup{' '}
                      <Text
                        style={{
                          fontFamily: Fonts.FiraSansMediumItalic,
                          fontWeight: 'bold',
                          fontStyle: 'italic',
                        }}
                      >
                        {item.time}
                      </Text>
                    </Text>
                  </View>
                  <Image
                    style={styles.cardIconImage}
                    source={getIconByStatus(item.status)}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </ScrollView>
        {/* <BottomSheet
          enabledInnerScrolling={true}
          ref={WalletBackupAndRecoveryBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('90%')
              : hp('90%'),
          ]}
          renderContent={renderWalletBackupAndRecoveryContents}
          renderHeader={renderWalletBackupAndRecoveryHeader}
        /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  knowMoreButton: {
    marginTop: 10,
    height: wp('6%'),
    width: wp('18%'),
    marginLeft: 25,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  image: {
    width: wp("5%"),
    height: wp("5%"),
    resizeMode: "contain",
    
  },
  knowMoreButtonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
  },
  shieldImage: {
    width: wp('16%'),
    height: wp('25%'),
    resizeMode: 'contain',
    marginLeft: 'auto',
    marginRight: 20,
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 15,
  },
  modalHeader: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    height: 25,
    width: '80%',
    alignSelf: 'center',
    borderColor: Colors.borderColor,
  },
  addressView: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: RFValue(13),
    color: Colors.lightBlue,
  },
  copyIconView: {
    width: 48,
    height: 50,
    backgroundColor: Colors.borderColor,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageBackupCard: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.white,
  },
  cardImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  cardTitleText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  cardTimeText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(10),
  },
  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: 'contain',
    marginLeft: 'auto',
  },
  listElements: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
    paddingTop: 25,
    paddingBottom: 25,
    paddingLeft: 10,
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
