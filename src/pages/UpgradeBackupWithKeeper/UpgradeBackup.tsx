import React, { Component } from "react";
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
  Keyboard,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import {
  fetchEphemeralChannel,
  clearPaymentDetails,
} from "../../store/actions/trustedContacts";
import idx from "idx";
import { timeFormatter } from "../../common/CommonFunctions/timeFormatter";
import moment from "moment";
import BottomSheet from "reanimated-bottom-sheet";
import ModalHeader from "../../components/ModalHeader";
import DeviceInfo from "react-native-device-info";
import AntDesign from "react-native-vector-icons/AntDesign";
import { requestTimedout } from "../../store/utils/utilities";
import BottomInfoBox from "../../components/BottomInfoBox";
import RestoreFromICloud from "../RestoreHexaWithKeeper/RestoreFromICloud";
import SetupPrimaryKeeper from "../Keeper/SetupPrimaryKeeper";
import SmallHeaderModal from "../../components/SmallHeaderModal";
import SecurityQuestion from "../Keeper/SecurityQuestion";
import UpgradingKeeperContact from "./UpgradingKeeperContact";
import UpgradePdfKeeper from "./UpgradePdfKeeper";
import Dash from "react-native-dash";
import S3Service from "../../bitcoin/services/sss/S3Service";
import {
  initializeHealthSetup,
  updateMSharesHealth,
} from "../../store/actions/health";
import { REGULAR_ACCOUNT } from "../../common/constants/serviceTypes";
import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import { CloudData } from "../../common/CommonFunctions";
import CloudBackup from "../../common/CommonFunctions/CloudBackup";
import { setCloudBackupStatus } from "../../store/actions/preferences";
import { LevelHealthInterface } from "../../bitcoin/utilities/Interface";
import AccountShell from "../../common/data/models/AccountShell";
import PersonalNode from "../../common/data/models/PersonalNode";
import { setIsNewHealthSystemSet } from '../../store/actions/setupAndAuth';
interface UpgradeBackupStateTypes {
  selectedIds: any[];
  listData: {
    title: String;
    info: String;
    subTitle: String;
    type: String;
    image: any;
    status: String;
  }[];
  selectedContact: any[];
  encryptedCloudDataJson: any;
  isCloudBackupProcessing: Boolean;
}

interface UpgradeBackupPropsTypes {
  navigation: any;
  s3Service: S3Service;
  initializeHealthSetup: any;
  walletName: string;
  regularAccount: RegularAccount;
  database: any;
  setCloudBackupStatus: any;
  cloudBackupStatus: any;
  levelHealth: LevelHealthInterface[];
  currentLevel: number;
  keeperInfo: any[];
  isLevel2Initialized: Boolean;
  isLevel3Initialized: Boolean;
  updateMSharesHealth: any;
  accountShells: AccountShell[];
  activePersonalNode: PersonalNode;
  isBackupProcessing: any;
  setIsNewHealthSystemSet: any;
  versionHistory: any;

}

class UpgradeBackup extends Component<
  UpgradeBackupPropsTypes,
  UpgradeBackupStateTypes
> {
  constructor(props) {
    super(props);
    this.state = {
      isCloudBackupProcessing: false,
      selectedIds: [],
      encryptedCloudDataJson: [],
      listData: [
        {
          title: "App Backup",
          info: "Lorem ipsum dolor sit",
          subTitle: "Lorem ipsum dolor sit amet",
          type: "backup",
          image: require("../../assets/images/icons/icon_backup.png"),
          status: 'setup'
        },
        {
          title: "Primary Keeper",
          info: "Lorem ipsum dolor sit",
          subTitle: "Lorem ipsum dolor sit amet",
          type: "primary",
          image: require("../../assets/images/icons/icon_secondarydevice.png"),
          status: 'setup'
        },
        {
          title: "Keeper Contacts",
          info: "Lorem ipsum dolor sit",
          subTitle: "Lorem ipsum dolor sit amet",
          type: "contact",
          image: require("../../assets/images/icons/icon_contact.png"),
          status: 'setup'
        },
        {
          title: "Keeper Device & PDF Keepers",
          info: "Lorem ipsum dolor sit",
          subTitle: "Lorem ipsum dolor sit amet",
          type: "devicePDF",
          image: require("../../assets/images/icons/files-and-folders-2.png"),
          status: 'setup'
        },
        {
          title: "Security Question",
          info: "Lorem ipsum dolor sit",
          subTitle: "Lorem ipsum dolor sit amet",
          type: "securityQuestion",
          image: require("../../assets/images/icons/icon_question.png"),
          status: 'setup'
        },
      ],
      selectedContact: [
        // {
        //   checked: true,
        //   contactType: "person",
        //   emails: [
        //     {
        //       email: "floresjoyner@digifad.com",
        //       id: "826F07EC-4B52-4703-907F-8AEE4F360EA2",
        //     },
        //     {
        //       email: "francinefranks@fossiel.com",
        //       id: "A3FD9B00-C732-4EEE-96E5-CD0040C6AB19",
        //     },
        //   ],
        //   firstName: "Jessica",
        //   id: "5D447B17-CFE2-4A75-84EE-E4F36CF26436:ABPerson",
        //   imageAvailable: false,
        //   lastName: "Pearson",
        //   name: "Jessica Pearson",
        //   phoneNumbers: [
        //     {
        //       countryCode: "in",
        //       id: "BF2490FA-C3B3-4F97-925E-6E07C4B7DB41",
        //       number: "98247 52009",
        //       digits: "9824752009",
        //       label: "home",
        //     },
        //     {
        //       countryCode: "in",
        //       id: "7F31DFEF-BCFD-457C-A82A-6B88A28DA285",
        //       number: "(811) 554-3283",
        //       digits: "8115543283",
        //       label: "home",
        //     },
        //   ],
        // },
        // {
        //   checked: true,
        //   contactType: "person",
        //   emails: [
        //     {
        //       email: "floresjoyner@digifad.com",
        //       id: "826F07EC-4B52-4703-907F-8AEE4F360EA2",
        //     },
        //     {
        //       email: "francinefranks@fossiel.com",
        //       id: "A3FD9B00-C732-4EEE-96E5-CD0040C6AB19",
        //     },
        //   ],
        //   firstName: "Rachel",
        //   id: "5D447B17-CFE2-4A75-84EE-E4F36CF26436:ABPerson",
        //   imageAvailable: false,
        //   lastName: "Zane",
        //   name: "Rachel Zane",
        //   phoneNumbers: [
        //     {
        //       countryCode: "in",
        //       id: "BF2490FA-C3B3-4F97-925E-6E07C4B7DB41",
        //       number: "98247 52009",
        //       digits: "9824752009",
        //       label: "home",
        //     },
        //     {
        //       countryCode: "in",
        //       id: "7F31DFEF-BCFD-457C-A82A-6B88A28DA285",
        //       number: "(811) 554-3283",
        //       digits: "8115543283",
        //       label: "home",
        //     },
        //   ],
        // },
      ],
    };
  }

  componentDidMount = () => {
    this.upgradeProcess();
  };

  upgradeProcess = () => {
    let { levelHealth } = this.props;
    let { listData } = this.state;
    if(levelHealth[0] && levelHealth[0].levelInfo[0] && levelHealth[0].levelInfo[0].status == 'accessible') {
      listData[0].status = 'accessible';
      this.props.setIsNewHealthSystemSet(true);
      this.props.navigation.replace('ManageBackupKeeper');
    }
    else{
      (this.refs.RestoreFromICloud as any).snapTo(1);
    }
    if(levelHealth[0] && levelHealth[0].levelInfo[0] && levelHealth[0].levelInfo[1].status == 'accessible'){
      listData[4].status = 'accessible';
      (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(1);
    }
    this.setState({listData});
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevProps.s3Service.levelhealth.healthCheckInitializedKeeper !=
        this.props.s3Service.levelhealth.healthCheckInitializedKeeper &&
      this.props.s3Service.levelhealth.healthCheckInitializedKeeper
    ) {
      this.cloudData();
    }
    if(JSON.stringify(prevProps.levelHealth) != JSON.stringify(this.props.levelHealth)){
      if(this.props.levelHealth[0] && this.props.levelHealth[0].levelInfo[0] && this.props.levelHealth[0].levelInfo[0].status == 'accessible') {
        this.props.navigation.replace('ManageBackupKeeper');
      }
    }

    if(prevProps.isBackupProcessing.status != this.props.isBackupProcessing.status && !this.props.isBackupProcessing.status){
      (this.refs.RestoreFromICloud as any).snapTo(0);
    }

  };

  cloudData = async (kpInfo?, level?, share?) => {
    const { walletName, regularAccount, database, accountShells, activePersonalNode, versionHistory } = this.props;
    let encryptedCloudDataJson;
    let shares =
      share &&
      !(Object.keys(share).length === 0 && share.constructor === Object)
        ? JSON.stringify(share)
        : "";
    encryptedCloudDataJson = await CloudData(database, accountShells, activePersonalNode,versionHistory);
    console.log("encryptedCloudDataJson", encryptedCloudDataJson);
    this.setState({ encryptedCloudDataJson: encryptedCloudDataJson });
    let keeperData = [
      {
        shareId: "",
        KeeperType: "cloud",
        updated: "",
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
    let cloudObject = new CloudBackup({
      dataObject: data,
      callBack: this.setCloudBackupStatus,
      share,
    });
    cloudObject.CloudDataBackup(data, this.setCloudBackupStatus, share);
  };

  setCloudBackupStatus = (share?) => {
    this.props.setCloudBackupStatus({ status: true });
    if (this.props.cloudBackupStatus.status && this.props.currentLevel == 0) {
      this.updateHealthForCloud();
    } else if (
      this.props.cloudBackupStatus.status &&
      this.props.currentLevel == 1
    ) {
      this.updateHealthForCloud(share);
    }
  };

  updateHealthForCloud = (share?) => {
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
      !this.props.isLevel2Initialized &&
      levelHealthVar.status != "accessible"
    ) {
      if (levelHealthVar.shareType == "cloud") {
        levelHealthVar.updatedAt = moment(new Date()).valueOf();
        levelHealthVar.status = "accessible";
        levelHealthVar.reshareVersion = 0;
        levelHealthVar.name = "Cloud";
      }
      let shareArray = [
        {
          walletId: this.props.s3Service.getWalletId().data.walletId,
          shareId: levelHealthVar.shareId,
          reshareVersion: levelHealthVar.reshareVersion,
          updatedAt: moment(new Date()).valueOf(),
          status: "accessible",
          shareType: "cloud",
        },
      ];
      this.props.updateMSharesHealth(shareArray);
    }
  };

  cloudBackup = () => {
    let { s3Service, initializeHealthSetup } = this.props;
    const { healthCheckInitializedKeeper } = s3Service.levelhealth;
    if (!healthCheckInitializedKeeper) {
      initializeHealthSetup();
    }
  };

  render() {
    const { listData, selectedIds, selectedContact, isCloudBackupProcessing } = this.state;
    const { navigation } = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor1 }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: "row" }}>
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
            <View style={{ justifyContent: "center", width: wp("80%") }}>
              <Text numberOfLines={2} style={styles.modalHeaderTitleText}>
                {"Upgrade Backup"}
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
                Lorem ipsum dolor sit amet consetetur sadipscing
              </Text>
            </View>
          </View>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {listData.map((item, index) => (
            <View style={styles.greyBox}>
              <View>
                <ImageBackground
                  source={require("../../assets/images/icons/Ellipse.png")}
                  style={{ ...styles.cardsImageView }}
                >
                  <Image source={item.image} style={styles.cardImage} />
                </ImageBackground>
                {index != listData.length - 1 && (
                  <Dash
                    dashStyle={{
                      width: wp("1%"),
                      height: wp("1%"),
                      borderRadius: wp("1%") / 2,
                      overflow: "hidden",
                    }}
                    dashColor={Colors.borderColor}
                    style={{
                      height: 75,
                      width: wp("1%"),
                      flexDirection: "column",
                      marginLeft: wp("7%"),
                    }}
                    dashThickness={10}
                    dashGap={5}
                  />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 5 }}>
                <View
                  style={{
                    borderRadius: 10,
                    paddingLeft: wp("3%"),
                    paddingRight: wp("3%"),
                    height: 50,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      ...styles.greyBoxText,
                      fontSize: RFValue(13),
                      marginBottom: wp("1.5%"),
                    }}
                  >
                    Upgrade{" "}
                    <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                      {item.title}
                    </Text>
                  </Text>
                  <Text style={styles.greyBoxText}>{item.info}</Text>
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.borderColor,
                    borderRadius: 10,
                    paddingLeft: wp("3%"),
                    paddingRight: wp("3%"),
                    height: 50,
                    alignItems: "center",
                    flexDirection: "row",
                    backgroundColor: Colors.white,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontFamily: Fonts.FiraSansRegular,
                      fontSize: RFValue(10),
                    }}
                  >
                    {item.subTitle}
                  </Text>
                  <View style={{ flexDirection: "row", marginLeft: "auto" }}>
                    <View
                      style={{
                        height: wp("6%"),
                        width: "auto",
                        paddingLeft: wp("5%"),
                        paddingRight: wp("5%"),
                        backgroundColor: item.status == 'accessible' ? Colors.lightGreen : Colors.borderColor,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: item.status == 'accessible' ? Colors.darkGreen : Colors.textColorGrey,
                          fontFamily: Fonts.FiraSansRegular,
                          fontSize: RFValue(9),
                        }}
                      >
                        {item.status == 'accessible' ? 'Complete' : 'Not Setup' }
                      </Text>
                    </View>
                    {item.status != 'setup' && 
                      <View
                        style={{
                          height: wp("6%"),
                          width: wp("6%"),
                          borderRadius: wp("6%") / 2,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: Colors.lightGreen,
                          marginLeft: wp("2.5%"),
                        }}
                      >
                        <AntDesign
                          style={{ marginTop: 1 }}
                          size={RFValue(15)}
                          color={Colors.darkGreen}
                          name={"check"}
                        />
                      </View>
                    }
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        <BottomInfoBox
          backgroundColor={Colors.white}
          title={"Note"}
          infoText={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna."
          }
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={"RestoreFromICloud"}
          snapPoints={[
            -50,
            Platform.OS == "ios" && DeviceInfo.hasNotch()
              ? hp("50%")
              : hp("60%"),
          ]}
          renderContent={() => {
            let name;
            if (Platform.OS == "ios") name = "iCloud";
            else name = "GDrive";
            return (
              <RestoreFromICloud
                isLoading={isCloudBackupProcessing}
                title={"Keeper on " + name}
                subText={
                  "Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diamnonumy eirmod"
                }
                info={
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore."
                }
                cardInfo={"Store Backup"}
                cardTitle={"Hexa Wallet Backup"}
                cardSubInfo={name + " backup"}
                proceedButtonText={"Backup"}
                backButtonText={"Back"}
                modalRef={this.refs.RestoreFromICloud}
                onPressProceed={() => {
                  this.setState({isCloudBackupProcessing: true})
                  this.cloudBackup();
                  // (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(1);
                }}
                onPressBack={() => {
                  (this.refs.RestoreFromICloud as any).snapTo(0);
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
          ref={"SetupPrimaryKeeperBottomSheet"}
          snapPoints={[
            -50,
            Platform.OS == "ios" && DeviceInfo.hasNotch()
              ? hp("60%")
              : hp("70"),
          ]}
          renderContent={() => (
            <SetupPrimaryKeeper
              title={"Setup Primary Keeper\non a Personal Device"}
              subText={
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore."
              }
              textToCopy={"http://hexawallet.io/keeperapp"}
              info={
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore."
              }
              proceedButtonText={"Proceed"}
              backButtonText={"Back"}
              onPressBack={() => {
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0);
              }}
              onPressContinue={() => {
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0);
                (this.refs.UpgradingKeeperContact as any).snapTo(1);
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
          ref={"SecurityQuestionBottomSheet"}
          snapPoints={[-30, hp("75%"), hp("90%")]}
          renderContent={() => (
            <SecurityQuestion
              onFocus={() => {
                if (Platform.OS == "ios")
                  (this.refs.SecurityQuestionBottomSheet as any).snapTo(2);
              }}
              onBlur={() => {
                if (Platform.OS == "ios")
                  (this.refs.SecurityQuestionBottomSheet as any).snapTo(1);
              }}
              onPressConfirm={async () => {
                Keyboard.dismiss();
                navigation.navigate("ConfirmKeys");
                setTimeout(() => {
                  (this.refs.SecurityQuestionBottomSheet as any).snapTo(0);
                }, 2);
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                (this.refs.SecurityQuestionBottomSheet as any).snapTo(0);
              }}
            />
          )}
        />

        <BottomSheet
          enabledInnerScrolling={true}
          ref={"UpgradingKeeperContact"}
          snapPoints={[
            -50,
            Platform.OS == "ios" && DeviceInfo.hasNotch()
              ? hp("70%")
              : hp("80%"),
          ]}
          renderContent={() => {
            if(selectedContact.length){
              return (<UpgradingKeeperContact
              title={"Upgrading Keeper Contacts"}
              subText={
                "Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diamnonumy eirmod"
              }
              info={
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore."
              }
              selectedContactArray={selectedContact}
              proceedButtonText={"Proceed"}
              onPressProceed={() => {
                (this.refs.UpgradingKeeperContact as any).snapTo(0);
                (this.refs.UpgradePdfKeeper as any).snapTo(1);
              }}
            />)
          }}}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() =>
                (this.refs.UpgradingKeeperContact as any).snapTo(0)
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={"UpgradePdfKeeper"}
          snapPoints={[
            -50,
            Platform.OS == "ios" && DeviceInfo.hasNotch()
              ? hp("50%")
              : hp("60%"),
          ]}
          renderContent={() => (
            <UpgradePdfKeeper
              title={"Upgrade PDF Keeper"}
              subText={
                "Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diamnonumy eirmod"
              }
              info={
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore."
              }
              modalRef={this.refs.UpgradePdfKeeper}
              onPressSetup={() => {
                (this.refs.UpgradePdfKeeper as any).snapTo(0);
                (this.refs.SecurityQuestionBottomSheet as any).snapTo(1);
              }}
              onPressBack={() => {
                (this.refs.UpgradePdfKeeper as any).snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() =>
                (this.refs.UpgradePdfKeeper as any).snapTo(0)
              }
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
      idx(state, (_) => _.storage.database.WALLET_SETUP.walletName) || "",
    overallHealth: idx(state, (_) => _.sss.overallHealth),
    trustedContacts: idx(state, (_) => _.trustedContacts.service),
    s3Service: idx(state, (_) => _.health.service),
    regularAccount: idx(state, (_) => _.accounts[REGULAR_ACCOUNT].service),
    database: idx(state, (_) => _.storage.database) || {},
    cloudBackupStatus:
      idx(state, (_) => _.preferences.cloudBackupStatus) || false,
    levelHealth: idx(state, (_) => _.health.levelHealth),
    currentLevel: idx(state, (_) => _.health.currentLevel),
    keeperInfo: idx(state, (_) => _.health.keeperInfo),
    isLevel2Initialized: idx(state, (_) => _.health.isLevel2Initialized),
    isLevel3Initialized: idx(state, (_) => _.health.isLevel3Initialized),
    accountShells: idx(state, (_) => _.accounts.accountShells),
    activePersonalNode: idx(state, (_) => _.nodeSettings.activePersonalNode),
    isBackupProcessing: idx(state, (_) => _.preferences.isBackupProcessing) || false,
    versionHistory: idx( state, ( _ ) => _.versionHistory.versions ),

  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    fetchEphemeralChannel,
    initializeHealthSetup,
    setCloudBackupStatus,
    updateMSharesHealth,
    setIsNewHealthSystemSet,
  })(UpgradeBackup)
);

const styles = StyleSheet.create({
  modalHeaderTitleView: {
    alignItems: "center",
    flexDirection: "row",
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
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
    marginTop: hp("0.7%"),
    marginBottom: hp("0.7%"),
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: "center",
  },
  buttonInnerView: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: wp("30%"),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: "contain",
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
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: Colors.backgroundColor,
  },
  cardsImageView: {
    width: wp("15%"),
    height: wp("15%"),
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: wp("5%"),
    height: wp("5%"),
    resizeMode: "contain",
    //marginBottom: wp('1%'),
  },
  statusTextView: {
    height: wp("5%"),
    backgroundColor: Colors.backgroundColor,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginLeft: "auto",
    paddingLeft: 10,
    paddingRight: 10,
  },
  statusText: {
    fontSize: RFValue(9),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  greyBox: {
    backgroundColor: Colors.backgroundColor1,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: "row",
    //  marginTop: wp('2%'),
    //  marginBottom: wp('2%'),
  },
  greyBoxImage: {
    width: wp("15%"),
    height: wp("15%"),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: wp("15%") / 2,
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
    fontSize: RFValue(10),
  },
  successModalImage: {
    width: wp("30%"),
    height: wp("35%"),
    marginLeft: "auto",
    resizeMode: "stretch",
    marginRight: -5,
  },
});
