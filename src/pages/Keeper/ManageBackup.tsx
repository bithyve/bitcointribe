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
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AddContactAddressBook from '../Contacts/AddContactAddressBook';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import AddressBookHelpContents from '../../components/Helper/AddressBookHelpContents';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import {
  approveTrustedContact,
  fetchEphemeralChannel,
  clearPaymentDetails,
} from '../../store/actions/trustedContacts';
import idx from 'idx';
import KeeperTypeModalContents from './KeeperTypeModalContent';
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter';
import moment from 'moment';
import SetupPrimaryKeeper from './SetupPrimaryKeeper';

interface ManageBackupStateTypes {
  levelData: any;
  selectedId: any;
  isLevel2: boolean;
}

interface ManageBackupPropsTypes {
  navigation: any;
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
    this.state = {
      selectedId: 0,
      levelData: [
        {
          type: 'icloud',
          health: 0,
          status: 'good',
          title: 'Level 1',
          infoRed: 'Keepers need your attention',
          infoGreen: 'All Keepers are accessible',
          isSetupDone: true,
          keeper1Done: false,
          keeper1Name: '',
          keeper2Done: false,
          keeper2Name: '',
          id: 1,
        },
        {
          type: 'keeper',
          health: 0,
          status: 'ugly',
          title: 'Level 2',
          infoGray: 'Improve security by adding Keepers',
          infoRed: 'Keepers need your attention',
          infoGreen: 'All Keepers are accessible',
          isSetupDone: true,
          keeper1Done: true,
          keeper1Name: 'Add Primary Keeper',
          keeper2Done: false,
          keeper2Name: '',
          id: 2,
        },
        {
          type: 'keeper',
          health: 0,
          status: '',
          title: 'Level 3',
          infoGray: 'Improve security by adding Keepers',
          infoRed: 'Keepers need your attention',
          infoGreen: 'All Keepers are accessible',
          manageText: 'Setup',
          isSetupDone: false,
          keeper1Done: false,
          keeper1Name: '',
          keeper2Done: false,
          keeper2Name: '',
          id: 3,
        },
      ],
      isLevel2: false
    };
    
  }

  setSelectedCards = () => {
    const { levelData } = this.state;
    for(let a= 0; a < levelData.length; a++){
      console.log("levelData.status", levelData[a].status);
      if(levelData[a].status == 'ugly')
        this.setState({ selectedId: levelData[a].id });
    }
  }

  componentDidMount = () => {
    this.setSelectedCards();
  };

  selectId = (value) => {
    if (value != this.state.selectedId) this.setState({ selectedId: value });
    else this.setState({ selectedId: 0 });
    if(value.id === 2){
      this.setState({isLevel2: true});
    } else{
      this.setState({isLevel2: false})
    }
  };

  getTime = (item) => {
    return (item.toString() && item.toString() == '0') ||
      item.toString() == 'never'
      ? 'never'
      : timeFormatter(moment(new Date()), item);
  };

  render() {
    const { levelData, selectedId,isLevel2} = this.state;
    const { navigation } = this.props;
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
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.topHealthView}>
            <ImageBackground
              source={require('../../assets/images/icons/keeper_sheild.png')}
              style={{ ...styles.healthShieldImage, position: 'relative' }}
              resizeMode={'contain'}
            >
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
            </ImageBackground>
            <View style={styles.headerSeparator} />
            <View>
              <Text style={styles.backupText}>Backup</Text>
              <Text style={styles.backupInfoText}>Security is</Text>
              <Text style={styles.backupInfoText}>at level 1</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', position: 'relative' }}>
            {levelData.map((value) => {
              return (
                <View
                  style={{
                    borderRadius: 10,
                    marginTop: wp('7%'),
                    backgroundColor: value.isSetupDone
                      ? Colors.blue
                      : Colors.backgroundColor,
                    shadowRadius: selectedId && selectedId == value.id ? 10 : 0,
                    shadowColor: Colors.borderColor,
                    shadowOpacity:
                      selectedId && selectedId == value.id ? 10 : 0,
                    shadowOffset: { width: 5, height: 5 },
                    elevation: selectedId && selectedId == value.id ? 10 : 0,
                    opacity: selectedId && selectedId == value.id ? 1 : 0.3,
                  }}
                >
                  <View style={styles.cardView}>
                    <View style={{ flexDirection: 'row' }}>
                      {value.isSetupDone ? (
                        <View
                          style={{
                            ...styles.cardHealthImageView,
                            backgroundColor:
                              value.status == 'ugly'
                                ? Colors.red
                                : value.status == 'good'
                                ? Colors.green
                                : Colors.yellow,
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
                          source={require('../../assets/images/icons/Spaner.png')}
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
                          backgroundColor: value.isSetupDone
                            ? Colors.deepBlue
                            : Colors.white,
                        }}
                      >
                        <Text
                          style={{
                            ...styles.cardButtonText,
                            color: value.isSetupDone
                              ? Colors.white
                              : Colors.textColorGrey,
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
                            color: value.isSetupDone
                              ? Colors.white
                              : Colors.textColorGrey,
                          }}
                        >
                          {value.title}
                        </Text>
                        <Text
                          style={{
                            ...styles.levelInfoText,
                            color: value.isSetupDone
                              ? Colors.white
                              : Colors.textColorGrey,
                          }}
                        >
                          {value.isSetupDone
                            ? value.health
                              ? value.infoGreen
                              : value.infoRed
                            : value.infoGray}
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
                            padding: 10,
                            color: value.isSetupDone
                              ? Colors.white
                              : Colors.black,
                          }}
                          onPress={() => this.selectId(value.id)}
                        >
                          {value.isSetupDone ? 'Manage' : 'Setup'}
                        </Text>
                        <AntDesign
                          name={
                            selectedId && selectedId == value.id
                              ? 'arrowup'
                              : 'arrowright'
                          }
                          color={
                            value.isSetupDone ? Colors.white : Colors.black
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
                              color: value.isSetupDone
                                ? Colors.white
                                : Colors.textColorGrey,
                              fontFamily: Fonts.FiraSansRegular,
                              fontSize: RFValue(10),
                            }}
                          >
                            Lorem ipsum dolor sit amet, consetetur
                          </Text>
                        </View>
                        {value.id == 1 ? (
                          <View
                            style={{ flexDirection: 'row', marginTop: 'auto' }}
                          >
                            <TouchableOpacity style={styles.appBackupButton}>
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
                                Add Backup
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                ...styles.appBackupButton,
                                width: wp('41%'),
                                borderColor: Colors.red,
                                borderWidth: 0.5,
                                marginLeft: 'auto',
                              }}
                              onPress={()=> navigation.navigate('SecurityQuestionHistoryKeeper',{
                                selectedTime: this.getTime(new Date()),
                                selectedStatus: 'Ugly',
                              })}
                            >
                              <ImageBackground
                                source={require('../../assets/images/icons/questionMark.png')}
                                style={{
                                  ...styles.resetImage,
                                  position: 'relative',
                                }}
                              >
                                <View
                                  style={{
                                    backgroundColor: Colors.red,
                                    width: wp('1%'),
                                    height: wp('1%'),
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                  }}
                                />
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
                            style={{ flexDirection: 'row', marginTop: 'auto' }}
                          >
                            <TouchableOpacity
                              style={{
                                ...styles.appBackupButton,
                                backgroundColor: value.isSetupDone
                                  ? Colors.deepBlue
                                  : Colors.white,
                                width: 'auto',
                                paddingLeft: wp('3%'),
                                paddingRight: wp('3%'),
                                borderColor: Colors.red,
                                borderWidth: 0.5,
                              }}
                              onPress={()=>{
                                if(value.id === 2){
                                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(1)
                                } else{
                                  (this.refs.keeperTypeBottomSheet as any).snapTo(1);
                                }
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor: Colors.red,
                                  width: wp('2%'),
                                  height: wp('2%'),
                                  borderRadius: wp('2%') / 2,
                                }}
                              />
                              <Text
                                style={{
                                  ...styles.cardButtonText,
                                  color: value.isSetupDone
                                    ? Colors.white
                                    : Colors.textColorGrey,
                                  fontSize: RFValue(11),
                                  marginLeft: wp('3%'),
                                }}
                              >
                                {value.isSetupDone
                                  ? value.keeper1Name
                                  : 'Add Keeper'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                ...styles.appBackupButton,
                                backgroundColor: value.isSetupDone
                                  ? Colors.deepBlue
                                  : Colors.white,
                                width: 'auto',
                                paddingLeft: wp('3%'),
                                paddingRight: wp('3%'),
                                borderColor: Colors.red,
                                borderWidth: 0.5,
                                marginLeft: wp('4%'),
                              }}
                              onPress={()=>{
                                if(value.id === 2){
                                  this.setState({isLevel2: true});
                                } else{
                                  this.setState({isLevel2: false});
                                }
                                setTimeout(() => {
                                (this.refs.keeperTypeBottomSheet as any).snapTo(1);
                                }, 2);
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor: Colors.red,
                                  width: wp('2%'),
                                  height: wp('2%'),
                                  borderRadius: wp('2%') / 2,
                                }}
                              />
                              <Text
                                style={{
                                  ...styles.cardButtonText,
                                  fontSize: RFValue(11),
                                  color: value.isSetupDone
                                    ? Colors.white
                                    : Colors.textColorGrey,
                                  marginLeft: wp('3%'),
                                }}
                              >
                                {value.isSetupDone && value.keeper2Done
                                  ? value.keeper2Name
                                  : 'Add Keeper'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  ) : null}
                </View>
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
              onPressSetup={(type, name) =>{
                if(type === 'contact'){
                  navigation.navigate("TrustedContactHistoryKeeper", {
                    selectedTime: this.getTime(new Date()),
                    selectedStatus: 'Ugly',
                    selectedTitle: name,
                    isLevel2: isLevel2} );
                }
                if(type === 'device'){
                  navigation.navigate("KeeperDeviceHistory", {
                    selectedTime: this.getTime(new Date()),
                    selectedStatus: 'Ugly',
                    selectedTitle: name,
                    isLevel2: isLevel2} );
                }
                if(type === 'pdf'){
                  navigation.navigate("PersonalCopyHistoryKeeper", {
                    selectedTime: this.getTime(new Date()),
                    selectedStatus: 'Ugly',
                    selectedTitle: name,
                    isLevel2: isLevel2} );
                }
                (this.refs.keeperTypeBottomSheet as any).snapTo(0)
              }
              }
              onPressBack={() =>
                (this.refs.keeperTypeBottomSheet as any).snapTo(0)
              }
              isLevel2={isLevel2}
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
              ? hp('40%')
              : hp('50%'),
          ]}
          renderContent={() => (
            <SetupPrimaryKeeper
            onPressContinue={() =>
              {navigation.navigate('KeeperFeatures');
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0)}
              }
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
    overallHealth: idx(state, (_) => _.sss.overallHealth),
    trustedContacts: idx(state, (_) => _.trustedContacts.service),
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    fetchEphemeralChannel,
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
    elevation: 10,
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
    marginRight: 3,
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
});
