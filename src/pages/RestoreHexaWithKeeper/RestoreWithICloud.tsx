import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Platform,
  ImageBackground,
  AsyncStorage,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import {
  approveTrustedContact,
  fetchEphemeralChannel,
  clearPaymentDetails,
} from '../../store/actions/trustedContacts';
import idx from 'idx';
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter';
import moment from 'moment';
import BottomSheet from 'reanimated-bottom-sheet';
import ModalHeader from '../../components/ModalHeader';
import RestoreFromICloud from './RestoreFromICloud';
import DeviceInfo from 'react-native-device-info';
import RestoreSuccess from './RestoreSuccess';
import ICloudBackupNotFound from './ICloudBackupNotFound';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { requestTimedout } from '../../store/utils/utilities';
import RestoreWallet from './RestoreWallet';
import { REGULAR_ACCOUNT } from '../../common/constants/serviceTypes';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import { CloudData, isEmpty } from '../../common/CommonFunctions';
import CloudBackup from '../../common/CommonFunctions/CloudBackup';
import { setCloudBackupStatus } from '../../store/actions/preferences';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SSS from '../../bitcoin/utilities/sss/SSS';
import { decrypt, decrypt1 } from '../../common/encryption';
import LoaderModal from '../../components/LoaderModal';
import TransparentHeaderModal from '../../components/TransparentHeaderModal';
import Loader from '../../components/loader';

import {
  checkMSharesHealth,
  recoverWalletUsingIcloud,
  downloadShares,
  downloadMShare,
  recoverWallet,
  updateCloudMShare,
} from '../../store/actions/health';
import axios from 'axios';
import {
  startupSync,
} from '../../store/actions/accounts';
import { initializeHealthSetup } from '../../store/actions/health';
import ErrorModalContents from '../../components/ErrorModalContents';
import { MetaShare } from '../../bitcoin/utilities/Interface';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import config from '../../bitcoin/HexaConfig';

interface RestoreWithICloudStateTypes {
  selectedIds: any[];
  listData: any[];
  walletsArray: any[];
  cloudBackup: boolean;
  hideShow: boolean;
  selectedBackup: any;
  metaShares: any[];
  showLoader: boolean;
}

interface RestoreWithICloudPropsTypes {
  navigation: any;
  walletName: string;
  regularAccount: RegularAccount;
  s3Service: any;
  cloudBackupStatus: any;
  database: any;
  setCloudBackupStatus: any;
  security: any;
  recoverWalletUsingIcloud: any;
  accounts: any;
  walletImageChecked: any;
  SERVICES: any;
  checkMSharesHealth: any;
  calculateExchangeRate: any;
  startupSync: any;
  initializeHealthSetup: any;
  downloadShares: any;
  downloadMShare: any;
  metaShare: any;
  DECENTRALIZED_BACKUP: any;
  recoverWallet: any;
  updateCloudMShare: any;
  walletRecoveryFailed: boolean;

}

class RestoreWithICloud extends Component<
  RestoreWithICloudPropsTypes,
  RestoreWithICloudStateTypes
  > {
  constructor(props) {
    super(props);
    this.state = {
      selectedIds: [],
      listData: [
        {
          type: 'contact',
          title: 'Jessica P.',
          info: '+34 000 000 0000',
          time: '2 weeks',
          status: 'waiting',
          image: require('../../assets/images/icons/pexels-photo.png'),
          id: 1,
        },
        {
          type: 'device',
          title: 'Keeper Contact',
          info: 'iMac Pro',
          time: '2 weeks',
          status: 'received',
          image: null,
          id: 2,
        },
        {
          type: 'contact',
          title: 'Rachel Z.',
          info: 'zaner@bithyve.com',
          time: '2 weeks',
          status: 'waiting',
          image: null,
          id: 3,
        },
      ],
      walletsArray: [],
      cloudBackup: false,
      hideShow: false,
      selectedBackup: {
        data: '',
        dateTime: '',
        walletId: '',
        walletName: '',
        levelStatus: '',
        shares: '',
        keeperData: ''
      },
      metaShares: [],
      showLoader: false,
    };
  }
  // image: require('../../assets/images/icons/icon_contact.png'),
  // image: require('../../assets/images/icons/icon_secondarydevice.png'),

  componentDidMount = () => {
    this.cloudData();
  };

  cloudData = () => {
    //console.log("INSIDE cloudData componentDidMount");
    this.setState({ showLoader: true });
    let cloudObject = new CloudBackup({ recoveryCallback: (result) => this.getData(result) });
    cloudObject.CheckCloudDataBackup((result) => this.getData(result));
  };

  componentDidUpdate = async (prevProps, prevState) => {
    const {
      walletImageChecked,
      SERVICES,
      checkMSharesHealth,
      walletRecoveryFailed
    } = this.props;
    if (
      SERVICES && prevProps.walletImageChecked != walletImageChecked
    ) {
      await AsyncStorage.setItem('walletExists', 'true');
      await AsyncStorage.setItem('walletRecovered', 'true');
      checkMSharesHealth();
      if (this.refs.loaderBottomSheet as any)
        (this.refs.loaderBottomSheet as any).snapTo(0);
      this.props.navigation.navigate('Home');
    }

    if (JSON.stringify(prevProps.DECENTRALIZED_BACKUP.RECOVERY_SHARES) !== JSON.stringify(this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES)) {
      //console.log("INSIDE prevProps.DECENTRALIZED_BACKUP.RECOVERY_SHARES");
      if (!isEmpty(this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES)) {
        this.updateList();
      }
    }

    if (prevProps.walletRecoveryFailed !== walletRecoveryFailed) {
      if (this.refs.loaderBottomSheet as any)
        (this.refs.loaderBottomSheet as any).snapTo(0);
    }

  };

  updateList = () => {
    //console.log("INSIDE updateList");
    const { listData, selectedBackup } = this.state;

    let updatedListData = [];
    const shares: MetaShare[] = [];
    updatedListData = [...listData];
    //console.log("this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES", this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES);
    //console.log("type of", typeof this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES)
    shares.push(this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES[0].META_SHARE);
    Object.keys(this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES).forEach((key) => {
      const META_SHARE: MetaShare = this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES[key].META_SHARE;
      if (META_SHARE) {
        let insert = true;
        shares.forEach((share) => {
          if (share.shareId === META_SHARE.shareId) insert = false;
        }, []);

        if (insert){
          for (var i = 0; i < updatedListData.length; i++) {
            if (META_SHARE.shareId === updatedListData[i].shareId) {
              updatedListData[i].status = "received";
              shares.push(META_SHARE);
              break;
            }
          }
        } 
      }
    });
    this.setState({ listData: updatedListData, showLoader: false }, () => {
      console.log("listData inside setState", this.state.listData, this.state.showLoader);
    });
    //console.log("updatedListData shares", shares);
    if (shares.length === 2 || shares.length === 3) {
      this.checkForRecoverWallet(shares, selectedBackup);
    }
    //console.log("updatedListData sefsgsg", updatedListData);
  }

  checkForRecoverWallet = (shares, selectedBackup) => {
    let key = SSS.strechKey(this.props.security.answer);
    let KeeperData = JSON.parse(selectedBackup.keeperData);
    const decryptedCloudDataJson = decrypt(selectedBackup.data, key);

    if (shares.length === 2 && selectedBackup.levelStatus === 2) {
      //console.log("INSIDE IF SHARES", shares.length, selectedBackup.levelStatus);
      (this.refs.loaderBottomSheet as any).snapTo(1);
      this.recoverWallet(selectedBackup.levelStatus, KeeperData, decryptedCloudDataJson);
    } else if (shares.length === 3 && selectedBackup.levelStatus === 3) {
     // console.log("INSIDE IF SHARES ### 3", shares.length, selectedBackup.levelStatus);
      (this.refs.loaderBottomSheet as any).snapTo(1);
      this.recoverWallet(selectedBackup.levelStatus, KeeperData, decryptedCloudDataJson);
    }

   
  }

  recoverWallet = (levelStatus, KeeperData, decryptedCloudDataJson) => {
    setTimeout(() => {
      this.props.recoverWallet(levelStatus, KeeperData, decryptedCloudDataJson);
    }, 2);
  }

  getData = (result) => {
    //console.log('FILE DATA', result);
    if (result) {
      var arr = [];
      var newArray = [];
      try {
        arr = JSON.parse(result);
      } catch (error) {
        //console.log('ERROR', error);
      }
      if (arr && arr.length) {
        for (var i = 0; i < arr.length; i++) {
          newArray.push(arr[i]);
        }
      }
      //console.log('ARR', newArray);
      this.setState(state => ({
        selectedBackup: newArray[0], walletsArray: newArray, showLoader: false
      }));
      (this.refs.RestoreFromICloud as any).snapTo(1);
    } else {
      (this.refs.BackupNotFound as any).snapTo(1);
    }
  };

  restoreWallet = () => {
    let listDataArray = [];
    const { selectedBackup } = this.state;
    //console.log("selectedBackup", selectedBackup);
    const { recoverWalletUsingIcloud, accounts } = this.props;
    let key = SSS.strechKey(this.props.security.answer);
    const decryptedCloudDataJson = decrypt(selectedBackup.data, key);
    //console.log('decryptedCloudDataJson', decryptedCloudDataJson);

    if (decryptedCloudDataJson && selectedBackup.shares && selectedBackup.keeperData) {
      this.setState({ cloudBackup: true });
      this.props.updateCloudMShare(JSON.parse(selectedBackup.shares), 0);
      let KeeperData = JSON.parse(selectedBackup.keeperData);
      let levelStatus = selectedBackup.levelStatus;
      if (levelStatus === 2) KeeperData = KeeperData.slice(0, 2);
      if (levelStatus === 3) KeeperData = KeeperData.slice(2, 6);
      let obj;
      //console.log("KEEPERDATA slice", KeeperData)
      for (let i = 0; i < KeeperData.length; i++) {
        obj = {
          type: KeeperData[i].type,
          title: KeeperData[i].name,
          info: '',
          time: timeFormatter(moment(new Date()), moment(selectedBackup.dateTime).valueOf()),
          status: 'waiting',
          image: null,
          shareId: KeeperData[i].shareId
        }
        listDataArray.push(obj);
      }
      this.setState({ listData: listDataArray });
      // if(selectedBackup.type == "device"){
      (this.refs.RestoreFromICloud as any).snapTo(0);
    } else if (decryptedCloudDataJson && !selectedBackup.shares) {
      (this.refs.loaderBottomSheet as any).snapTo(1);
      recoverWalletUsingIcloud(decryptedCloudDataJson);
    } else {
      (this.refs.ErrorBottomSheet as any).snapTo(1);
    }
    //   
  };

  handleScannedData = async (scannedData) => {
    const { DECENTRALIZED_BACKUP } = this.props;
    const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;
    //console.log("scannedData", scannedData, RECOVERY_SHARES, RECOVERY_SHARES.length);
    if (scannedData && scannedData.type && scannedData.type === "ReverseRecoveryQR") {
      const recoveryRequest = {
        requester: scannedData.requester,
        publicKey: scannedData.publicKey,
        uploadedAt: scannedData.UPLOADED_AT,
        isQR: true,
      };

      if (
        Date.now() - recoveryRequest.uploadedAt >
        config.TC_REQUEST_EXPIRY
      ) {
        Alert.alert(
          `${recoveryRequest.isQR ? 'QR' : 'Link'} expired!`,
          `Please ask your Guardian to initiate a new ${recoveryRequest.isQR ? 'QR' : 'Link'
          }`,
        );
      }
      this.props.downloadMShare({ encryptedKey: recoveryRequest.publicKey, downloadType: 'recovery', replaceIndex: Object.keys(RECOVERY_SHARES).length });
    }
    else {
      this.props.downloadMShare({ encryptedKey: scannedData.encryptedKey, otp: scannedData.otp, downloadType: 'recovery', replaceIndex: Object.keys(RECOVERY_SHARES).length });
    }
    this.setState({ showLoader: true });
  }

  render() {
    const {
      listData,
      hideShow,
      cloudBackup,
      walletsArray,
      selectedBackup,
      showLoader
    } = this.state;
    //console.log("INSIDE render", showLoader);
    const { navigation } = this.props;
    let name;
    if (Platform.OS == 'ios') name = 'iCloud';
    else name = 'GDrive';
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor1, position: 'relative' }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('RestoreAndRecoverWallet');
              }}
              style={styles.headerBackArrowView}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View style={{ justifyContent: 'center', width: wp('80%') }}>
              <Text numberOfLines={2} style={styles.modalHeaderTitleText}>
                {'Recover using keys'}
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
                Lorem ipsum dolor sit amet, consetetur Lorem ipsum dolor sit
                amet, consetetur Lorem ipsum dolor sit amet, consetetur
              </Text>
            </View>
          </View>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {cloudBackup &&
            listData.map((item, index) => {
              return (
                <TouchableOpacity
                  style={{
                    ...styles.cardsView,
                    borderBottomWidth: index == 2 ? 0 : 4,
                  }}
                >
                  {item.type == 'contact' && item.image ? (
                    <View
                      style={{
                        borderRadius: wp('15%') / 2,
                        borderColor: Colors.white,
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowOffset: {
                          width: 2,
                          height: 2,
                        },
                        shadowOpacity: 0.8,
                        shadowColor: Colors.textColorGrey,
                        shadowRadius: 5,
                        elevation: 10,
                        marginRight: 15,
                        marginLeft: 5,
                      }}
                    >
                      <Image
                        source={item.image}
                        style={{
                          width: wp('15%'),
                          height: wp('15%'),
                          borderRadius: wp('15%') / 2,
                        }}
                      />
                    </View>
                  ) : (
                      <ImageBackground
                        source={require('../../assets/images/icons/Ellipse.png')}
                        style={{ ...styles.cardsImageView, marginRight: 10 }}
                      >
                        <Image
                          source={
                            item.type == 'contact'
                              ? require('../../assets/images/icons/icon_contact.png')
                              : item.type == 'device'
                                ? require('../../assets/images/icons/icon_secondarydevice.png')
                                : require('../../assets/images/icons/icon_contact.png')
                          }
                          style={styles.cardImage}
                        />
                      </ImageBackground>
                    )}
                  <View style={{}}>
                    <Text
                      style={{
                        ...styles.cardsInfoText,
                        fontSize: RFValue(18),
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.cardsInfoText}>{item.info}</Text>
                    <Text style={styles.cardsInfoText}>
                      Last backup {item.time}
                    </Text>
                  </View>
                  {item.status == 'received' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 'auto',
                      }}
                    >
                      <View
                        style={{
                          ...styles.statusTextView,
                          backgroundColor: Colors.lightGreen,
                        }}
                      >
                        <Text style={styles.statusText}>Key Received</Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: Colors.lightGreen,
                          width: wp('5%'),
                          height: wp('5%'),
                          borderRadius: wp('5%') / 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginLeft: 5,
                        }}
                      >
                        <AntDesign
                          name={'check'}
                          size={RFValue(10)}
                          color={Colors.darkGreen}
                        />
                      </View>
                    </View>
                  ) : (
                      <View style={styles.statusTextView}>
                        <Text style={styles.statusText}>Waiting for Key</Text>
                      </View>
                    )}
                </TouchableOpacity>
              );
            })}
        </ScrollView>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: Colors.blue,
            height: 60,
            borderRadius: 10,
            marginLeft: 25,
            marginRight: 25,
            marginTop: 'auto',
            marginBottom: hp('4%'),
            justifyContent: 'space-evenly',
            alignItems: 'center',
            shadowColor: Colors.shadowBlue,
            shadowOpacity: 1,
            shadowOffset: { width: 15, height: 15 },
          }}
        >
          <TouchableOpacity
            onPress={() => (this.refs.RestoreWallet as any).snapTo(1)}
            style={styles.buttonInnerView}
          >
            <Image
              source={require('../../assets/images/icons/openlink.png')}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Send Request</Text>
          </TouchableOpacity>
          <View
            style={{ width: 1, height: 30, backgroundColor: Colors.white }}
          />
          <TouchableOpacity
            style={styles.buttonInnerView}
            onPress={() => {
              navigation.navigate("ScanRecoveryKey", { scannedData: (scannedData) => this.handleScannedData(scannedData) });
            }}
          >
            <Image
              source={require('../../assets/images/icons/qr-code.png')}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Scan Key</Text>
          </TouchableOpacity>
        </View>
        {showLoader ? <Loader isLoading={true} /> : null}
        {hideShow ? (
          <View style={styles.dropDownView}>
            <ScrollView>
              {walletsArray.map((value) => {
                return (
                  <AppBottomSheetTouchableWrapper
                    activeOpacity={10}
                    onPress={() => {
                      this.setState({ hideShow: false });
                      this.setState({ selectedBackup: value });
                    }}
                    style={styles.dropDownElement}
                  >
                    {value.data && (
                      <View style={styles.greyBox}>
                        <View style={styles.greyBoxImage}>
                          <MaterialCommunityIcons
                            name={'restore'}
                            size={RFValue(25)}
                            color={Colors.blue}
                          />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <Text style={styles.greyBoxText}>
                            {'Restoring Wallet from'}
                          </Text>
                          <Text
                            style={{
                              ...styles.greyBoxText,
                              fontSize: RFValue(20),
                            }}
                          >
                            {value.walletName}
                          </Text>
                          <Text
                            style={{
                              ...styles.greyBoxText,
                              fontSize: RFValue(10),
                            }}
                          >
                            {'Last backup : ' +
                              timeFormatter(moment(new Date()), moment(value.dateTime).valueOf())}
                          </Text>

                          <Text
                            style={{
                              ...styles.greyBoxText,
                              fontSize: RFValue(10),
                            }}
                          >
                            {'Backup at level : ' +
                              value.levelStatus}
                          </Text>
                        </View>
                      </View>
                    )}
                  </AppBottomSheetTouchableWrapper>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'RestoreFromICloud'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('50%')
              : hp('60%'),
          ]}
          renderContent={() => {
            let name;
            if (Platform.OS == 'ios') name = 'iCloud';
            else name = 'GDrive';
            return (
              <RestoreFromICloud
                title={'Restore from ' + name}
                subText={
                  'Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diamnonumy eirmod'
                }
                info={
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore.'
                }
                cardInfo={'Restoring Wallet from'}
                cardTitle={selectedBackup.walletName}
                levelStatus={selectedBackup.levelStatus ? name + ' backup at level ' + selectedBackup.levelStatus : ''}
                proceedButtonText={'Restore'}
                backButtonText={'Back'}
                modalRef={this.refs.RestoreFromICloud}
                onPressProceed={() => {
                  //(this.refs.RestoreFromICloud as any).snapTo(0);
                  this.restoreWallet();
                }}
                onPressBack={() => {
                  (this.refs.RestoreFromICloud as any).snapTo(0);
                }}
                onPressCard={() => {
                  this.setState({ hideShow: !hideShow });
                }}
              />
            );
          }}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() =>
                (this.refs.RestoreFromICloud as any).snapTo(0)
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'RestoreSuccess'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('50%')
              : hp('60%'),
          ]}
          renderContent={() => (
            <RestoreSuccess
              modalRef={this.refs.RestoreSuccess}
              onPressProceed={() => {
                (this.refs.RestoreSuccess as any).snapTo(0);
              }}
              onPressBack={() => {
                (this.refs.RestoreSuccess as any).snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => (this.refs.RestoreSuccess as any).snapTo(0)}
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'BackupNotFound'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('40%')
              : hp('50%'),
          ]}
          renderContent={() => (
            <ICloudBackupNotFound
              modalRef={this.refs.BackupNotFound}
              onPressProceed={() => {
                (this.refs.BackupNotFound as any).snapTo(0);
              }}
              onPressBack={() => {
                (this.refs.BackupNotFound as any).snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => (this.refs.BackupNotFound as any).snapTo(0)}
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'RestoreWallet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('60%')
              : hp('70%'),
          ]}
          renderContent={() => (
            <RestoreWallet
              modalRef={this.refs.RestoreWallet}
              onPressProceed={() => {
                (this.refs.RestoreWallet as any).snapTo(0);
              }}
              onPressBack={() => {
                (this.refs.RestoreWallet as any).snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => (this.refs.RestoreWallet as any).snapTo(0)}
            />
          )}
        />
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={'loaderBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('100%')
              : hp('100%'),
          ]}
          renderContent={() => (
            <LoaderModal
              headerText={'Creating your wallet'}
              messageText={
                'This may take some time while Hexa is using the Recovery Keys to recreate your wallet'
              }
            />
          )}
          renderHeader={() => (
            <View
              style={{
                marginTop: 'auto',
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                height: hp('75%'),
                zIndex: 9999,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          )}
        />

        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={'ErrorBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
          ]}
          renderContent={() => (
            <ErrorModalContents
              modalRef={this.refs.ErrorBottomSheet}
              title={"Error receiving Recovery Key"}
              info={'There was an error while receiving your Recovery Key, please try again'}
              proceedButtonText={'Try again'}
              onPressProceed={() => {
                (this.refs.ErrorBottomSheet as any).snapTo(0);
              }}
              isBottomImage={true}
              bottomImage={require('../../assets/images/icons/errorImage.png')}
            />
          )}
          renderHeader={() => (
            <ModalHeader
            // onPressHeader={() => {
            //   (this.refs.ErrorBottomSheet as any).snapTo(0);
            // }}
            />
          )}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    accounts: state.accounts || [],
    walletName:
      idx(state, (_) => _.storage.database.WALLET_SETUP.walletName) || '',
    s3Service: idx(state, (_) => _.sss.service),
    regularAccount: idx(state, (_) => _.accounts[REGULAR_ACCOUNT].service),
    cloudBackupStatus:
      idx(state, (_) => _.preferences.cloudBackupStatus) || false,
    database: idx(state, (_) => _.storage.database) || {},
    security: idx(state, (_) => _.storage.database.WALLET_SETUP.security),
    overallHealth: idx(state, (_) => _.health.overallHealth),
    trustedContacts: idx(state, (_) => _.trustedContacts.service),
    walletImageChecked: idx(state, (_) => _.health.walletImageChecked),
    SERVICES: idx(state, (_) => _.storage.database.SERVICES),
    metaShare: idx(state, (_) => _.health.metaShare),
    walletRecoveryFailed: idx(state, (_) => _.health.walletRecoveryFailed),
    DECENTRALIZED_BACKUP: idx(state, (_) => _.storage.database.DECENTRALIZED_BACKUP) || {},
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    fetchEphemeralChannel,
    setCloudBackupStatus,
    recoverWalletUsingIcloud,
    checkMSharesHealth,
    startupSync,
    initializeHealthSetup,
    downloadShares,
    downloadMShare,
    recoverWallet,
    updateCloudMShare
  })(RestoreWithICloud),
);

const styles = StyleSheet.create({
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  dropDownView: {
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
    backgroundColor: Colors.white,
    marginLeft: wp('10%'),
    marginRight: wp('10%'),
    width: '80%',
    height: '80%',
    marginTop: wp('15%'),
    marginBottom: wp('25%'),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    overflow: 'hidden',
  },
  dropDownElement: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: wp('3%'),
    paddingRight: wp('3%'),
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp('0.7%'),
    marginBottom: hp('0.7%'),
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
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
  cardsInfoText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  cardsView: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: Colors.backgroundColor,
  },
  cardsImageView: {
    width: wp('20%'),
    height: wp('20%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: wp('7%'),
    height: wp('7%'),
    resizeMode: 'contain',
    marginBottom: wp('1%'),
  },
  statusTextView: {
    // padding: 5,
    height: wp('5%'),
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 'auto',
    paddingLeft: 10,
    paddingRight: 10,
  },
  statusText: {
    fontSize: RFValue(9),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  greyBox: {
    width: wp('90%'),
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greyBoxImage: {
    width: wp('15%'),
    height: wp('15%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: wp('15%') / 2,
    borderColor: Colors.white,
    borderWidth: 1,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowColor: Colors.textColorGrey,
    shadowRadius: 5,
    elevation: 10,
  },
  greyBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
  },
});
