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
  RefreshControl,
  ImageBackground,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { fetchEphemeralChannel } from '../../store/actions/trustedContacts';
import {
  setCloudBackupStatus,
  setIsBackupProcessing,
} from '../../store/actions/preferences';
import idx from 'idx';
import KeeperTypeModalContents from './KeeperTypeModalContent';
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter';
import moment from 'moment';
import SetupPrimaryKeeper from './SetupPrimaryKeeper';
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/serviceTypes';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import {
  CloudData,
  getKeeperInfoFromShareId,
  getLevelInfo,
} from '../../common/CommonFunctions';
import CloudBackup from '../../common/CommonFunctions/CloudBackup';
import {
  generateMetaShare,
  checkMSharesHealth,
  initLevelTwo,
  updateMSharesHealth,
  sendApprovalRequest,
  onApprovalStatusChange,
  reShareWithSameKeeper,
  autoShareContact
} from '../../store/actions/health';
import { modifyLevelStatus } from './ManageBackupFunction';
import ApproveSetup from './ApproveSetup';
import { MetaShare, notificationType } from '../../bitcoin/utilities/Interface';
import firebase from 'react-native-firebase';
import { fetchKeeperTrustedChannel } from '../../store/actions/keeper';
import { nameToInitials } from '../../common/CommonFunctions';

interface ManageBackupStateTypes {
  levelData: any[];
  selectedId: any;
  encryptedCloudDataJson: any;
  isPrimaryKeeper: any;
  isError: boolean;
  selectedKeeper: {
    shareType: string;
    updatedAt: number;
    status: string;
    shareId: string;
    reshareVersion: number;
    name: string;
    data: any;
  };
  selectedLevelId: number;
  selectedKeeperType: string;
  selectedKeeperName: string;
}

interface ManageBackupPropsTypes {
  navigation: any;
  setCloudBackupStatus: any;
  setIsBackupProcessing: any;
  isBackupProcessing: any;
  cloudBackupStatus: any;
  walletName: string;
  regularAccount: RegularAccount;
  database: any;
  overallHealth: any;
  levelHealth: any[];
  currentLevel: any;
  healthLoading: any;
  generateMetaShare: any;
  checkMSharesHealth: any;
  isLevelTwoMetaShareCreated: Boolean;
  isLevel2Initialized: Boolean;
  isLevel3Initialized: Boolean;
  initLevelTwo: any;
  s3Service: any;
  updateMSharesHealth: any;
  keeperInfo: any[];
  sendApprovalRequest: any;
  service: any;
  isLevelThreeMetaShareCreated: Boolean;
  onApprovalStatusChange: any;
  secureAccount: any;
  fetchKeeperTrustedChannel: any;
  keeperApproveStatus: any;
  metaShares: MetaShare[];
  reShareWithSameKeeper: any;
  autoShareContact: any;
}

class ManageBackup extends Component<
  ManageBackupPropsTypes,
  ManageBackupStateTypes
> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;
  NoInternetBottomSheet: any;
  unsubscribe: any;

  constructor(props) {
    super(props);
    this.focusListener = null;
    this.appStateListener = null;
    this.NoInternetBottomSheet = React.createRef();
    this.unsubscribe = null;
    let obj = {
      shareType: '',
      updatedAt: 0,
      status: 'notAccessible',
      shareId: '',
      reshareVersion: 0,
      name: '',
      data: {},
      uuid: '',
    };
    this.state = {
      selectedKeeper: obj,
      selectedId: 0,
      isError: false,
      levelData: [
        {
          status: 'notSetup',
          infoGray: 'Improve security by adding Keepers',
          infoRed: 'Keepers need your attention',
          infoGreen: 'All Keepers are accessible',
          keeper1: obj,
          keeper2: obj,
          id: 1,
        },
        {
          status: 'notSetup',
          infoGray: 'Improve security by adding Keepers',
          infoRed: 'Keepers need your attention',
          infoGreen: 'All Keepers are accessible',
          keeper1: obj,
          keeper2: obj,
          id: 2,
        },
        {
          status: 'notSetup',
          infoGray: 'Improve security by adding Keepers',
          infoRed: 'Keepers need your attention',
          infoGreen: 'All Keepers are accessible',
          keeper1: obj,
          keeper2: obj,
          id: 3,
        },
      ],
      isPrimaryKeeper: false,
      encryptedCloudDataJson: [],
      selectedLevelId: 0,
      selectedKeeperType: '',
      selectedKeeperName: '',
    };
  }

  createNotificationListeners = async () => {
    this.firebaseNotificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        this.onNotificationArrives(notification);
      });
  };

  onNotificationArrives = async (notification) => {
    let {
      s3Service,
      secureAccount,
      levelHealth,
      keeperApproveStatus,
      fetchKeeperTrustedChannel,
    } = this.props;
    let data = JSON.parse(notification.data.content);
    if (
      data.notificationType == 'secureXpub' &&
      !secureAccount.secureHDWallet.xpubs.secondary
    ) {
      let share = getKeeperInfoFromShareId(
        levelHealth,
        s3Service.levelhealth.metaShares[1].shareId,
      );
      fetchKeeperTrustedChannel(
        s3Service.levelhealth.metaShares[1].shareId,
        data.notificationType,
        share.name,
      );
    }
    if (data.notificationType == 'uploadPDFShare') {
      if (data.shareID == keeperApproveStatus.shareId) {
        onApprovalStatusChange(
          true,
          moment(new Date()).valueOf(),
          data.shareID,
        );
      }
    }
  };

  componentDidMount = async () => {
    await this.onRefresh();
    this.createNotificationListeners();
    this.modifyLevelData();
  };

  modifyLevelData = () => {
    let { levelHealth, currentLevel, keeperInfo } = this.props;
    let levelHealthObject = [...levelHealth];
    let levelData = modifyLevelStatus(
      this.state.levelData,
      levelHealthObject,
      currentLevel,
      keeperInfo,
    );
    this.setState({
      levelData: levelData.levelData,
      isError: levelData.isError,
    });
    this.setSelectedCards();
  };

  setSelectedCards = () => {
    const { levelData } = this.state;
    for (let a = 0; a < levelData.length; a++) {
      if (levelData[a].status == 'notSetup') {
        this.setState({ selectedId: levelData[a].id });
        break;
      }
    }
    let level = 1;
    if (
      levelData.findIndex(
        (value) => value.status == 'bad' || value.status == 'notSetup',
      )
    ) {
      let index = levelData.findIndex(
        (value) => value.status == 'bad' || value.status == 'notSetup',
      );
      level = levelData[index > -1 ? index - 1 : 2].id;
    }
    let value = 1;
    if (this.state.levelData[0].status == 'notSetup') value = 1;
    else if (level) value = level + 1;
    else if (level == 3) value = 3;
    this.setState({ selectedId: value });
  };

  selectId = (value) => {
    if (value != this.state.selectedId) this.setState({ selectedId: value });
    else this.setState({ selectedId: 0 });
  };

  getTime = (item) => {
    return (item.toString() && item.toString() == '0') ||
      item.toString() == 'never'
      ? 'never'
      : timeFormatter(moment(new Date()), item);
  };

  cloudData = async (kpInfo?, level?, share?) => {
    const { walletName, regularAccount } = this.props;
    let encryptedCloudDataJson;
    let shares =
      share &&
      !(Object.keys(share).length === 0 && share.constructor === Object)
        ? JSON.stringify(share)
        : '';
    encryptedCloudDataJson = await CloudData(this.props.database);
    this.setState({ encryptedCloudDataJson: encryptedCloudDataJson });
    let keeperData = [
      {
        shareId: '',
        KeeperType: 'cloud',
        updated: '',
        reshareVersion: 0,
      },
    ];
    let data = {
      levelStatus: level ? level : 1,
      shares: shares,
      encryptedCloudDataJson: encryptedCloudDataJson,
      walletName: walletName,
      regularAccount: regularAccount,
      keeperData: kpInfo ? JSON.stringify(kpInfo) : JSON.stringify(keeperData),
    };

    if (!this.props.isBackupProcessing.status) {
      this.props.setIsBackupProcessing({ status: true });
      let cloudObject = new CloudBackup({
        dataObject: data,
        callBack: this.setCloudBackupStatus,
        share,
      });
      cloudObject.CloudDataBackup(data, this.setCloudBackupStatus, share);
    }
  };

  setCloudBackupStatus = (share) => {
    try{
    this.props.setCloudBackupStatus({ status: true });
    if (this.props.cloudBackupStatus.status && this.props.currentLevel == 0) {
      this.updateHealthForCloud();
    } else if (
      (this.props.cloudBackupStatus.status && this.props.currentLevel == 1) ||
      this.props.currentLevel == 2
    ) {
      this.updateHealthForCloud(share);
    }
    this.props.setIsBackupProcessing({ status: false });
  }catch(error){
    console.log("ERRORsf", error);
  }
  };

  updateHealthForCloud = (share?) => {
    try{
    let levelHealth = this.props.levelHealth;
    let levelHealthVar = levelHealth[0].levelInfo[0];
    if (
      share &&
      !(Object.keys(share).length === 0 && share.constructor === Object) &&
      levelHealth.length > 0
    ) {
      levelHealthVar = levelHealth[levelHealth.length - 1].levelInfo[0];
    }
    // health update for 1st upload to cloud
    if (
      this.props.cloudBackupStatus &&
      levelHealth.length &&
      levelHealthVar.status != 'accessible'
    ) {
      console.log("cloudBackupStatus inside if", levelHealthVar);
      if (levelHealthVar.shareType == 'cloud') {
        levelHealthVar.updatedAt = moment(new Date()).valueOf();
        levelHealthVar.status == 'accessible';
        levelHealthVar.reshareVersion = 0;
        levelHealthVar.guardian = 'cloud';
      }
      let shareArray = [
        {
          walletId: this.props.s3Service.getWalletId().data.walletId,
          shareId: levelHealthVar.shareId,
          reshareVersion: levelHealthVar.reshareVersion,
          updatedAt: moment(new Date()).valueOf(),
          status: 'accessible',
          shareType: 'cloud',
        },
      ];
      this.props.updateMSharesHealth(shareArray);
    }
    } catch(error){
      console.log("jasdjhERROR", error);
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.levelHealth != this.props.levelHealth) {
      this.modifyLevelData();
    }

    if (JSON.stringify(prevProps.levelHealth) !== JSON.stringify(this.props.levelHealth)) {
      if (
        this.props.levelHealth.length > 0 &&
        this.props.levelHealth.length == 1 &&
        prevProps.levelHealth.length == 0
      ) {
        this.cloudData();
      } else {
        this.updateCloudData();
        this.autoUploadShare();
      }
    }

    if (
      prevProps.levelHealth != this.props.levelHealth &&
      this.state.selectedLevelId == 3 &&
      prevProps.isLevelThreeMetaShareCreated !=
        this.props.isLevelThreeMetaShareCreated &&
      prevProps.isLevel3Initialized != this.props.isLevel3Initialized &&
      this.state.selectedKeeper.shareId == '' &&
      this.props.metaShares.length == 5 &&
      this.props.isLevel3Initialized &&
      this.props.isLevelThreeMetaShareCreated
    ) {
      let obj = {
        shareType: this.state.selectedKeeperType,
        name: this.state.selectedKeeperName,
        reshareVersion: 0,
        status: 'notAccessible',
        updatedAt: 0,
        shareId: this.props.s3Service.levelhealth.metaShares[3].shareId,
        data: {},
      };
      this.setState({
        selectedKeeper: obj,
      });
      this.sendApprovalRequestToPK();
      (this.refs.keeperTypeBottomSheet as any).snapTo(0);
    }
  };

  updateCloudData = () => {
    let { currentLevel, keeperInfo, levelHealth, s3Service } = this.props;
    let secretShare = {};
    if (levelHealth.length > 0) {
      let levelInfo = getLevelInfo(levelHealth, currentLevel);
      if (levelInfo) {
        if (
          levelInfo[2] &&
          levelInfo[3] &&
          levelInfo[2].status == 'accessible' &&
          levelInfo[3].status == 'accessible'
        ) {
          for (let i = 0; i < s3Service.levelhealth.metaShares.length; i++) {
            const element = s3Service.levelhealth.metaShares[i];
            if (levelInfo[0].shareId == element.shareId) {
              secretShare = element;
            }
          }
        }
      }
    }
    this.cloudData(keeperInfo, currentLevel, secretShare);
  };

  autoUploadShare = () => {
    let { levelHealth, currentLevel, reShareWithSameKeeper, autoShareContact } = this.props;
    if (levelHealth[2] &&
      currentLevel == 2 &&
      levelHealth[2].levelInfo[4].status == 'accessible' &&
      levelHealth[2].levelInfo[5].status == 'accessible'
    ) {
      let deviceLevelInfo = [];
      let contactLevelInfo = [];
      for (let i = 2; i < levelHealth[2].levelInfo.length - 2; i++) {
        if (levelHealth[2].levelInfo[i].status != 'accessible' && 
          (levelHealth[1].levelInfo[i].shareType == 'primaryKeeper' ||
          levelHealth[1].levelInfo[i].shareType == 'device')
        ) {
          let obj = { ...levelHealth[1].levelInfo[i], newShareId: levelHealth[2].levelInfo[i].shareId, index: i };
          deviceLevelInfo.push(obj);
        }
        if (levelHealth[2].levelInfo[i].status != 'accessible' && levelHealth[1].levelInfo[i].shareType == 'contact') {
          let obj = { ...levelHealth[1].levelInfo[i], newShareId: levelHealth[2].levelInfo[i].shareId, index: i }
          contactLevelInfo.push(obj);
        }
      }
      console.log('contactLevelInfo', contactLevelInfo);
      if(deviceLevelInfo.length) reShareWithSameKeeper(deviceLevelInfo);
      if(contactLevelInfo.length) autoShareContact(contactLevelInfo);
    }
  };

  goToHistory = (value) => {
    let {
      shareType,
      keeperStatus,
      name,
      updatedAt,
      id,
      selectedKeeper,
      isSetup,
    } = value;
    let navigationParams = {
      selectedTime: updatedAt ? this.getTime(updatedAt) : 'never',
      selectedStatus: keeperStatus,
      selectedTitle: name,
      isPrimaryKeeper: this.state.isPrimaryKeeper,
      selectedLevelId: id,
      selectedContact: selectedKeeper.data,
      selectedKeeper,
    };
    if (shareType == 'device' || shareType == 'primaryKeeper') {
      this.props.navigation.navigate('KeeperDeviceHistory', navigationParams);
    } else if (shareType == 'contact') {
      let index = 1;
      let contactIndex = this.state.levelData.findIndex(
        (value) =>
          value.keeper1.shareType == 'contact' ||
          value.keeper2.shareType == 'contact',
      );
      let count = 0;
      for (let i = 0; i < this.state.levelData.length; i++) {
        const element = this.state.levelData[i];
        if (element.keeper1.shareType == 'contact') count++;
        if (element.keeper2.shareType == 'contact') count++;
      }
      if (count == 1 && isSetup) index = 2;
      else if (count == 0 && isSetup) index = 1;
      else {
        if (contactIndex == -1) index = 1;
        else {
          let idxTmp = 0;
          for (let i = 0; i < this.state.levelData.length; i++) {
            const element = this.state.levelData[i];
            if (element.keeper1.shareType == 'contact') {
              idxTmp++;
            }
            if (
              element.keeper1.shareType == 'contact' &&
              element.keeper1.shareId == selectedKeeper.shareId
            ) {
              break;
            }
            if (element.keeper2.shareType == 'contact') {
              idxTmp++;
            }
            if (
              element.keeper2.shareType == 'contact' &&
              element.keeper2.shareId == selectedKeeper.shareId
            ) {
              break;
            }
          }
          index = idxTmp;
        }
      }
      this.props.navigation.navigate('TrustedContactHistoryKeeper', {
        ...navigationParams,
        index,
      });
    } else if (shareType) {
      this.props.navigation.navigate(
        'PersonalCopyHistoryKeeper',
        navigationParams,
      );
    }
  };

  sendApprovalRequestToPK = () => {
    let {
      levelHealth,
      currentLevel,
      sendApprovalRequest,
      onApprovalStatusChange,
    } = this.props;
    let PKShareId =
      currentLevel == 2 || currentLevel == 1
        ? levelHealth[1].levelInfo[2].shareId
        : currentLevel == 3
        ? levelHealth[2].levelInfo[2].shareId
        : levelHealth[1].levelInfo[2].shareId;

    sendApprovalRequest(
      this.state.selectedKeeper.shareId,
      PKShareId,
      this.state.selectedKeeperType == 'pdf'
        ? notificationType.uploadPDFShare
        : notificationType.approveKeeper,
    );
    if (this.state.selectedKeeperType == 'pdf') {
      onApprovalStatusChange(
        false,
        moment(new Date()).valueOf(),
        this.state.selectedKeeper.shareId,
      );
    }
    (this.refs.ApprovePrimaryKeeperBottomSheet as any).snapTo(1);
  };

  onPressKeeper = (value, number) => {
    let keeper = number == 1 ? value.keeper1 : value.keeper2;
    this.setState({
      selectedKeeper: keeper,
      isPrimaryKeeper: value.id === 2 && number == 1 ? true : false,
      selectedLevelId: value.id,
    });
    if (keeper.updatedAt > 0) {
      let obj = {
        shareType: keeper.shareType,
        keeperStatus: keeper.status,
        name: keeper.name,
        shareId: keeper.shareId,
        updatedAt: keeper.updatedAt,
        id: value.id,
        selectedKeeper: keeper,
        isSetup: false,
      };
      this.goToHistory(obj);
      return;
    } else {
      if (value.id === 2 && number == 1)
        (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(1);
      else (this.refs.keeperTypeBottomSheet as any).snapTo(1);
    }
  };

  onRefresh = async () => {
    this.props.checkMSharesHealth();
  };

  getImageIcon = (chosenContact) => {
    if (chosenContact && chosenContact.name) {
      if (chosenContact.imageAvailable) {
        return (
          <View style={styles.imageBackground}>
            <Image source={{uri: chosenContact.image.uri}} style={styles.contactImage} />
          </View>
        );
      } else {
        return (
          <View style={styles.imageBackground}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: RFValue(9),
              }}
            >
              {chosenContact &&
              chosenContact.firstName === 'F&F request' &&
              chosenContact.contactsWalletName !== undefined &&
              chosenContact.contactsWalletName !== ''
                ? nameToInitials(`${chosenContact.contactsWalletName}'s wallet`)
                : chosenContact && chosenContact.name
                ? nameToInitials(
                    chosenContact &&
                      chosenContact.firstName &&
                      chosenContact.lastName
                      ? chosenContact.firstName + ' ' + chosenContact.lastName
                      : chosenContact.firstName && !chosenContact.lastName
                      ? chosenContact.firstName
                      : !chosenContact.firstName && chosenContact.lastName
                      ? chosenContact.lastName
                      : '',
                  )
                : ''}
            </Text>
          </View>
        );
      }
    }
    return (
      <Image
        style={styles.contactImageAvatar}
        source={require('../../assets/images/icons/icon_user.png')}
      />
    );
  };

  render() {
    const {
      levelData,
      selectedId,
      isError,
      selectedLevelId,
      selectedKeeperType,
    } = this.state;
    const {
      navigation,
      healthLoading,
      keeperApproveStatus,
      currentLevel,
    } = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackArrowView}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerSettingImageView}
          >
            <Image
              source={require('../../assets/images/icons/setting.png')}
              style={styles.headerSettingImage}
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={healthLoading}
              onRefresh={() => this.onRefresh()}
            />
          }
          style={{ flex: 1 }}
        >
          <View style={styles.topHealthView}>
            <ImageBackground
              source={require('../../assets/images/icons/keeper_sheild.png')}
              style={{ ...styles.healthShieldImage, position: 'relative' }}
              resizeMode={'contain'}
            >
              {isError && (
                <View
                  style={{
                    backgroundColor: Colors.red,
                    height: wp('3%'),
                    width: wp('3%'),
                    borderRadius: wp('3%') / 2,
                    position: 'absolute',
                    top: wp('5%'),
                    right: 0,
                    borderWidth: 2,
                    borderColor: Colors.white,
                  }}
                />
              )}
            </ImageBackground>
            <View style={styles.headerSeparator} />
            <View>
              <Text style={styles.backupText}>Backup</Text>
              <Text style={styles.backupInfoText}>Security is</Text>
              <Text style={styles.backupInfoText}>at level {currentLevel}</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', position: 'relative' }}>
            {levelData.map((value) => {
              return (
                <TouchableOpacity onPress={() => this.selectId(value.id)}>
                  <View
                    style={{
                      borderRadius: 10,
                      marginTop: wp('7%'),
                      backgroundColor:
                        value.status == 'good' || value.status == 'bad'
                          ? Colors.blue
                          : Colors.backgroundColor,
                      shadowRadius:
                        selectedId && selectedId == value.id ? 10 : 0,
                      shadowColor: Colors.borderColor,
                      shadowOpacity:
                        selectedId && selectedId == value.id ? 10 : 0,
                      shadowOffset: { width: 5, height: 5 },
                      elevation:
                        selectedId == value.id || selectedId == 0 ? 10 : 0,
                      opacity:
                        selectedId == value.id || selectedId == 0 ? 1 : 0.3,
                    }}
                  >
                    <View style={styles.cardView}>
                      <View style={{ flexDirection: 'row' }}>
                        {value.status == 'good' || value.status == 'bad' ? (
                          <View
                            style={{
                              ...styles.cardHealthImageView,
                              elevation:
                                selectedId == value.id || selectedId == 0
                                  ? 10
                                  : 0,
                              backgroundColor:
                                value.status == 'good'
                                  ? Colors.green
                                  : Colors.red,
                            }}
                          >
                            {value.status == 'good' ? (
                              <Image
                                source={require('../../assets/images/icons/check_white.png')}
                                style={{
                                  ...styles.cardHealthImage,
                                  width: wp('4%'),
                                }}
                              />
                            ) : (
                              <Image
                                source={require('../../assets/images/icons/icon_error_white.png')}
                                style={styles.cardHealthImage}
                              />
                            )}
                          </View>
                        ) : (
                          <Image
                            source={require('../../assets/images/icons/icon_setup.png')}
                            style={{
                              borderRadius: wp('7%') / 2,
                              width: wp('7%'),
                              height: wp('7%'),
                            }}
                          />
                        )}
                        <TouchableOpacity
                          style={{
                            ...styles.cardButtonView,
                            backgroundColor:
                              value.status == 'notSetup'
                                ? Colors.white
                                : Colors.deepBlue,
                          }}
                        >
                          <Text
                            style={{
                              ...styles.cardButtonText,
                              color:
                                value.status == 'notSetup'
                                  ? Colors.textColorGrey
                                  : Colors.white,
                            }}
                          >
                            Know More
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={{ flexDirection: 'row', marginTop: 'auto' }}>
                        <View style={{ justifyContent: 'center' }}>
                          <Text
                            style={{
                              ...styles.levelText,
                              color:
                                value.status == 'notSetup'
                                  ? Colors.textColorGrey
                                  : Colors.white,
                            }}
                          >
                            Level {value.id}
                          </Text>
                          <Text
                            style={{
                              ...styles.levelInfoText,
                              color:
                                value.status == 'notSetup'
                                  ? Colors.textColorGrey
                                  : Colors.white,
                            }}
                          >
                            {value.keeper1.status == 'notAccessible' &&
                            value.keeper2.status == 'notAccessible' &&
                            value.keeper1.updatedAt == 0 &&
                            value.keeper2.updatedAt == 0
                              ? value.infoGray
                              : value.keeper1.status == 'accessible' &&
                                value.keeper2.status == 'accessible'
                              ? value.infoGreen
                              : value.keeper1.status == 'accessible' ||
                                value.keeper2.status == 'accessible'
                              ? value.infoRed
                              : value.infoRed}
                          </Text>
                        </View>
                        <TouchableOpacity
                          activeOpacity={10}
                          onPress={() => this.selectId(value.id)}
                          style={styles.manageButton}
                        >
                          <Text
                            style={{
                              ...styles.manageButtonText,
                              color:
                                value.status == 'notSetup'
                                  ? Colors.black
                                  : Colors.white,
                            }}
                            onPress={() => this.selectId(value.id)}
                          >
                            {value.status == 'notSetup' ? 'Setup' : 'Manage'}
                          </Text>
                          <AntDesign
                            name={
                              selectedId && selectedId == value.id
                                ? 'arrowup'
                                : 'arrowright'
                            }
                            color={
                              value.status == 'notSetup'
                                ? Colors.black
                                : Colors.white
                            }
                            size={12}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {selectedId == value.id ? (
                      <View>
                        <View
                          style={{ backgroundColor: Colors.white, height: 0.5 }}
                        />
                        <View style={styles.cardView}>
                          <View style={{ width: wp('40%') }}>
                            <Text
                              numberOfLines={2}
                              style={{
                                color:
                                  value.status == 'notSetup'
                                    ? Colors.textColorGrey
                                    : Colors.white,
                                fontFamily: Fonts.FiraSansRegular,
                                fontSize: RFValue(10),
                              }}
                            >
                              Lorem ipsum dolor sit amet, consetetur
                            </Text>
                          </View>
                          {value.id == 1 ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                marginTop: 'auto',
                              }}
                            >
                              <TouchableOpacity
                                style={{
                                  ...styles.appBackupButton,
                                  borderColor:
                                    value.keeper1.status == 'accessible'
                                      ? Colors.deepBlue
                                      : Colors.red,
                                  borderWidth:
                                    value.keeper1.status == 'accessible'
                                      ? 0
                                      : 1,
                                }}
                                onPress={() => {
                                  if (!this.props.cloudBackupStatus.status) {
                                    this.cloudData();
                                  }
                                }}
                              >
                                <Image
                                  source={require('../../assets/images/icons/reset.png')}
                                  style={styles.resetImage}
                                />
                                <Text
                                  style={{
                                    ...styles.cardButtonText,
                                    fontSize: RFValue(11),
                                  }}
                                >
                                  {value.keeper1.status == 'accessible'
                                    ? 'Data Backed-Up'
                                    : 'Add Backup'}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{
                                  ...styles.appBackupButton,
                                  width: wp('41%'),
                                  borderColor:
                                    value.keeper2.status == 'accessible'
                                      ? value.status == 'notSetup'
                                        ? Colors.white
                                        : Colors.deepBlue
                                      : Colors.red,
                                  borderWidth:
                                    value.keeper2.status == 'accessible'
                                      ? 0
                                      : 0.5,
                                  marginLeft: 'auto',
                                }}
                                onPress={() =>
                                  navigation.navigate(
                                    'SecurityQuestionHistoryKeeper',
                                    {
                                      selectedTime: this.getTime(new Date()),
                                      selectedStatus: 'Ugly',
                                    },
                                  )
                                }
                              >
                                <ImageBackground
                                  source={require('../../assets/images/icons/questionMark.png')}
                                  style={{
                                    ...styles.resetImage,
                                    position: 'relative',
                                  }}
                                >
                                  {value.keeper2.status == 'notAccessible' ? (
                                    <View
                                      style={{
                                        backgroundColor: Colors.red,
                                        width: wp('1%'),
                                        height: wp('1%'),
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        borderRadius: wp('1%') / 2,
                                      }}
                                    />
                                  ) : null}
                                </ImageBackground>
                                <Text
                                  style={{
                                    ...styles.cardButtonText,
                                    fontSize: RFValue(11),
                                  }}
                                >
                                  Security Question
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View
                              style={{
                                flexDirection: 'row',
                                marginTop: 'auto',
                              }}
                            >
                              <TouchableOpacity
                                style={{
                                  ...styles.appBackupButton,
                                  backgroundColor:
                                    value.status == 'notSetup'
                                      ? Colors.white
                                      : Colors.deepBlue,
                                  width: 'auto',
                                  paddingLeft: wp('3%'),
                                  paddingRight: wp('3%'),
                                  borderColor:
                                    value.keeper1.status == 'accessible'
                                      ? value.status == 'notSetup'
                                        ? Colors.white
                                        : Colors.deepBlue
                                      : Colors.red,
                                  borderWidth:
                                    value.keeper1.status == 'accessible'
                                      ? 0
                                      : 1,
                                }}
                                onPress={() => this.onPressKeeper(value, 1)}
                              >
                                {value.keeper1.status == 'accessible' &&
                                (value.keeper1.shareType == 'device' ||
                                  value.keeper1.shareType ==
                                    'primaryKeeper') ? (
                                  <Image
                                    source={
                                      value.keeper1.shareType == 'device' ||
                                      value.keeper1.shareType == 'primaryKeeper'
                                        ? require('../../assets/images/icons/icon_ipad_blue.png')
                                        : require('../../assets/images/icons/pexels-photo.png')
                                    }
                                    style={{
                                      width: wp('6%'),
                                      height: wp('6%'),
                                      resizeMode: 'contain',
                                      borderRadius: wp('6%') / 2,
                                    }}
                                  />
                                ) : value.keeper1.shareType == 'contact' &&
                                  value.keeper1.updatedAt != 0 ? this.getImageIcon(value.keeper1.data) : (
                                  <View
                                    style={{
                                      backgroundColor: Colors.red,
                                      width: wp('2%'),
                                      height: wp('2%'),
                                      borderRadius: wp('2%') / 2,
                                    }}
                                  />
                                )}
                                <Text
                                  style={{
                                    ...styles.cardButtonText,
                                    color:
                                      value.status == 'notSetup'
                                        ? Colors.textColorGrey
                                        : Colors.white,
                                    fontSize: RFValue(11),
                                    marginLeft: wp('3%'),
                                  }}
                                >
                                  {value.status == 'good' ||
                                  (value.status == 'bad' && value.keeper1.name)
                                    ? value.keeper1.name
                                    : value.id == 2
                                    ? 'Add Primary Keeper'
                                    : 'Add Keeper'}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{
                                  ...styles.appBackupButton,
                                  backgroundColor:
                                    value.status == 'notSetup'
                                      ? Colors.white
                                      : Colors.deepBlue,
                                  width: 'auto',
                                  paddingLeft: wp('3%'),
                                  paddingRight: wp('3%'),
                                  borderColor:
                                    value.keeper2.status == 'accessible'
                                      ? value.status == 'notSetup'
                                        ? Colors.white
                                        : Colors.deepBlue
                                      : Colors.red,
                                  borderWidth:
                                    value.keeper2.status == 'accessible'
                                      ? 0
                                      : 0.5,
                                  marginLeft: wp('4%'),
                                }}
                                onPress={() => this.onPressKeeper(value, 2)}
                              >
                                {value.keeper2.status == 'accessible' &&
                                (value.keeper2.shareType == 'device' ||
                                  value.keeper2.shareType ==
                                    'primaryKeeper') ? (
                                  <Image
                                    source={
                                      value.keeper2.shareType == 'device' ||
                                      value.keeper2.shareType == 'primaryKeeper'
                                        ? require('../../assets/images/icons/icon_ipad_blue.png')
                                        : require('../../assets/images/icons/pexels-photo.png')
                                    }
                                    style={{
                                      width: wp('6%'),
                                      height: wp('6%'),
                                      resizeMode: 'contain',
                                      borderRadius: wp('6%') / 2,
                                    }}
                                  />
                                ) : value.keeper2.shareType == 'contact' &&
                                  value.keeper2.updatedAt != 0 ? this.getImageIcon(value.keeper2.data) : (
                                  <View
                                    style={{
                                      backgroundColor: Colors.red,
                                      width: wp('2%'),
                                      height: wp('2%'),
                                      borderRadius: wp('2%') / 2,
                                    }}
                                  />
                                )}
                                <Text
                                  style={{
                                    ...styles.cardButtonText,
                                    fontSize: RFValue(11),
                                    color:
                                      value.status == 'notSetup'
                                        ? Colors.textColorGrey
                                        : Colors.white,
                                    marginLeft: wp('3%'),
                                  }}
                                >
                                  {(value.status == 'bad' ||
                                    value.status == 'good') &&
                                  value.keeper2.name
                                    ? value.keeper2.name
                                    : 'Add Keeper'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'keeperTypeBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('75%')
              : hp('75%'),
          ]}
          renderContent={() => (
            <KeeperTypeModalContents
              onPressSetup={async (type, name) => {
                this.setState({
                  selectedKeeperType: type,
                  selectedKeeperName: name,
                });
                if (
                  selectedLevelId == 3 &&
                  !this.props.isLevelThreeMetaShareCreated &&
                  !this.props.isLevel3Initialized &&
                  this.props.currentLevel == 2
                ) {
                  await this.props.generateMetaShare(selectedLevelId);
                } else if (
                  this.props.currentLevel == 1 &&
                  selectedLevelId == 3
                ) {
                  alert('Please complete Level 2');
                } else {
                  this.sendApprovalRequestToPK();
                  (this.refs.keeperTypeBottomSheet as any).snapTo(0);
                }
              }}
              onPressBack={() =>
                (this.refs.keeperTypeBottomSheet as any).snapTo(0)
              }
              selectedLevelId={selectedLevelId}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              onPressHeader={() =>
                (this.refs.keeperTypeBottomSheet as any).snapTo(0)
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'SetupPrimaryKeeperBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('60%')
              : hp('70'),
          ]}
          renderContent={() => (
            <SetupPrimaryKeeper
              title={'Setup Primary Keeper\non a Personal Device'}
              subText={
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore.'
              }
              textToCopy={'http://hexawallet.io/keeperapp'}
              info={
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore.'
              }
              proceedButtonText={'Proceed'}
              backButtonText={'Back'}
              onPressBack={() =>
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0)
              }
              onPressContinue={() => {
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0);
                const {
                  levelData,
                  selectedLevelId,
                  selectedKeeper,
                } = this.state;
                let PKStatus = levelData[1].keeper1.keeper1Done
                  ? 'accessed'
                  : 'notAccessible';
                let navigationParams = {
                  selectedTime: this.getTime(new Date()),
                  selectedStatus: PKStatus,
                  selectedTitle: 'Primary Keeper',
                  isPrimaryKeeper: true,
                  isSetUp: true,
                  selectedLevelId,
                  selectedContact: selectedKeeper.data,
                  selectedKeeper: selectedKeeper,
                };
                this.props.navigation.navigate(
                  'KeeperDeviceHistory',
                  navigationParams,
                );
              }}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              onPressHeader={() =>
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0)
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'ApprovePrimaryKeeperBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('60%')
              : hp('70'),
          ]}
          renderContent={() => (
            <ApproveSetup
              isContinueDisabled={
                selectedKeeperType == 'pdf'
                  ? !keeperApproveStatus.status
                  : false
              }
              onPressContinue={() => {
                (this.refs.ApprovePrimaryKeeperBottomSheet as any).snapTo(0);
                let {
                  selectedKeeper,
                  selectedLevelId,
                  selectedKeeperType,
                  selectedKeeperName,
                } = this.state;
                let obj = {
                  shareType: selectedKeeper.shareType
                    ? selectedKeeper.shareType
                    : selectedKeeperType,
                  keeperStatus: selectedKeeper.status
                    ? selectedKeeper.status
                    : 'notAccessible',
                  name: selectedKeeper.name
                    ? selectedKeeper.name
                    : selectedKeeperName,
                  shareId: selectedKeeper.shareId ? selectedKeeper.shareId : '',
                  updatedAt: selectedKeeper.updatedAt
                    ? selectedKeeper.updatedAt
                    : 0,
                  id: selectedLevelId,
                  selectedKeeper: selectedKeeper,
                  isSetup: true,
                };
                this.goToHistory(obj);
              }}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              onPressHeader={() => {
                (this.refs.keeperTypeBottomSheet as any).snapTo(1);
                (this.refs.ApprovePrimaryKeeperBottomSheet as any).snapTo(0);
              }}
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
    metaShares: idx(state, (_) => _.health.service.levelhealth.metaShares),
    s3Service: idx(state, (_) => _.health.service),
    overallHealth: idx(state, (_) => _.sss.overallHealth),
    trustedContacts: idx(state, (_) => _.trustedContacts.service),
    cloudBackupStatus:
      idx(state, (_) => _.preferences.cloudBackupStatus) || false,
    isBackupProcessing:
      idx(state, (_) => _.preferences.isBackupProcessing) || false,
    regularAccount: idx(state, (_) => _.accounts[REGULAR_ACCOUNT].service),
    database: idx(state, (_) => _.storage.database) || {},
    levelHealth: idx(state, (_) => _.health.levelHealth),
    currentLevel: idx(state, (_) => _.health.currentLevel),
    isLevelTwoMetaShareCreated: idx(
      state,
      (_) => _.health.isLevelTwoMetaShareCreated,
    ),
    isLevel2Initialized: idx(state, (_) => _.health.isLevel2Initialized),
    isLevel3Initialized: idx(state, (_) => _.health.isLevel3Initialized),
    isLevelThreeMetaShareCreated: idx(
      state,
      (_) => _.health.isLevelThreeMetaShareCreated,
    ),
    healthLoading: idx(state, (_) => _.health.loading.checkMSharesHealth),
    keeperSetupStatus: idx(state, (_) => _.health.loading.keeperSetupStatus),
    keeperInfo: idx(state, (_) => _.health.keeperInfo),
    service: idx(state, (_) => _.keeper.service),
    secureAccount: idx(state, (_) => _.accounts[SECURE_ACCOUNT].service),
    keeperApproveStatus: idx(state, (_) => _.health.keeperApproveStatus),
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    fetchEphemeralChannel,
    setCloudBackupStatus,
    generateMetaShare,
    checkMSharesHealth,
    initLevelTwo,
    updateMSharesHealth,
    setIsBackupProcessing,
    sendApprovalRequest,
    onApprovalStatusChange,
    fetchKeeperTrustedChannel,
    reShareWithSameKeeper,
    autoShareContact
  })(ManageBackup),
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
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  headerSettingImageView: {
    height: wp('10%'),
    width: wp('10&'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSettingImage: {
    height: wp('6%'),
    width: wp('6%'),
  },
  topHealthView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthShieldImage: {
    width: wp('17%'),
    height: wp('25%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSeparator: {
    backgroundColor: Colors.seaBlue,
    width: 4,
    borderRadius: 5,
    height: wp('17%'),
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
  },
  backupText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(15),
  },
  backupInfoText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(18),
  },
  cardView: {
    height: wp('35%'),
    width: wp('85%'),
    padding: 20,
  },
  cardHealthImageView: {
    backgroundColor: Colors.red,
    shadowColor: Colors.deepBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    borderRadius: wp('7%') / 2,
    width: wp('7%'),
    height: wp('7%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHealthImage: {
    width: wp('2%'),
    height: wp('4%'),
    resizeMode: 'contain',
  },
  cardButtonView: {
    width: wp('21%'),
    height: wp('8'),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    borderRadius: 8,
  },
  cardButtonText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  levelText: {
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  levelInfoText: {
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginTop: 'auto',
  },
  manageButtonText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
    marginRight: 5,
  },
  appBackupButton: {
    flexDirection: 'row',
    backgroundColor: Colors.deepBlue,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderRadius: 8,
    width: wp('31%'),
    height: wp('11%'),
  },
  resetImage: {
    width: wp('4%'),
    height: wp('4%'),
    resizeMode: 'contain',
  },
  contactImageAvatar: {
    width: wp('6%'),
    height: wp('6%'),
    alignSelf: 'center',
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  contactImage: {
    height: wp('6%'),
    width: wp('6%'),
    borderRadius: wp('6%') / 2,
  },
  imageBackground: {
    backgroundColor: Colors.shadowBlue,
    height: wp('6%'),
    width: wp('6%'),
    borderRadius: wp('6%') / 2,
    borderColor: Colors.white,
    borderWidth: 1,
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
