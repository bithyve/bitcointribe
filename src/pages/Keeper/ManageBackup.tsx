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
import { trustedChannelsSync } from '../../store/actions/trustedContacts';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import {
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/serviceTypes';
import { TrustedContactDerivativeAccountElements } from '../../bitcoin/utilities/Interface';
import { nameToInitials } from '../../common/CommonFunctions';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import BottomInfoBox from '../../components/BottomInfoBox';
import AddContactAddressBook from '../Contacts/AddContactAddressBook';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../../components/ModalHeader';
import config from '../../bitcoin/HexaConfig';
import KnowMoreButton from '../../components/KnowMoreButton';
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
interface ManageBackupStateTypes {
  levelData: any;
  selectedId: any;
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
          title: 'Level 2',
          infoGray: 'Improve security by adding Keepers',
          infoRed: 'Keepers need your attention',
          infoGreen: 'All Keepers are accessible',
          isSetupDone: true,
          keeper1Done: true,
          keeper1Name: 'iPad Pro',
          keeper2Done: false,
          keeper2Name: '',
          id: 2,
        },
        {
          type: 'keeper',
          health: 0,
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
    };
  }

  selectId = (value) => {
    if (value != this.state.selectedId) this.setState({ selectedId: value });
    else this.setState({ selectedId: 0 });
  };

  render() {
    const { levelData, selectedId } = this.state;
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
              source={require('../../assets/images/icons/shield_blue.png')}
              style={styles.healthShieldImage}
              resizeMode={'contain'}
            ></ImageBackground>
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
                  }}
                >
                  <View style={styles.cardView}>
                    <View style={{ flexDirection: 'row' }}>
                      {value.isSetupDone ? (
                        <View style={styles.cardHealthImageView}>
                          <Image
                            source={require('../../assets/images/icons/icon_error_yellow.png')}
                            style={styles.cardHealthImage}
                          />
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
                            color: value.isSetupDone
                              ? Colors.white
                              : Colors.black,
                          }}
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
                                App Backup
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
                                backgroundColor: value.isSetupDone && value.keeper1Done ? Colors.deepBlue : Colors.white,
                                width: 'auto',
                                paddingLeft: wp('3%'),
                                paddingRight: wp('3%'),
                                borderColor: Colors.red,
                                borderWidth: 0.5,
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor: Colors.red,
                                  width: wp('2%'),
                                  height: wp('2%'),
                                  borderRadius: wp('2%')/2,
                                }}
                              />
                              <Text
                                style={{
                                  ...styles.cardButtonText,
                                  color: value.isSetupDone && value.keeper1Done ? Colors.white : Colors.textColorGrey,
                                  fontSize: RFValue(11),
                                  marginLeft: wp('3%')
                                }}
                              >
                                {value.isSetupDone && value.keeper1Done ? value.keeper1Name :'App Keeper'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                ...styles.appBackupButton,
                                backgroundColor: value.isSetupDone && value.keeper2Done ? Colors.deepBlue : Colors.white,
                                width: 'auto',
                                paddingLeft: wp('3%'),
                                paddingRight: wp('3%'),
                                borderColor: Colors.red,
                                borderWidth: 0.5,
                                marginLeft: wp('4%')
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor: Colors.red,
                                  width: wp('2%'),
                                  height: wp('2%'),
                                  borderRadius: wp('2%')/2,
                                }}
                              />
                              <Text
                                style={{
                                  ...styles.cardButtonText,
                                  fontSize: RFValue(11),
                                  color: value.isSetupDone && value.keeper2Done ? Colors.white : Colors.textColorGrey,
                                  marginLeft: wp('3%')
                                }}
                              >
                                {value.isSetupDone && value.keeper2Done ? value.keeper2Name :'App Keeper'}
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
    paddingRight: 10,
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
