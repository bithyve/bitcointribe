import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  Image,
  ScrollView,
  Platform,
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
          info: 'Keepers need your attention',
          manageText: 'Manage',
          isSetupDone: true,
          id: 1
        },
        {
          type: 'keeper',
          health: 0,
          title: 'Level 2',
          info: 'Improve security by adding Keepers',
          manageText: 'Setup',
          isSetupDone: false,
          id: 2
        },
        {
          type: 'keeper',
          health: 0,
          title: 'Level 3',
          info: 'Improve security by adding Keepers',
          manageText: 'Setup',
          isSetupDone: false,
          id: 3
        },
      ],
    };
  }

  render() {
    const {
      levelData,
      selectedId,
    } = this.state;
    const {
      navigation
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
        <View style={{ flex: 1 }}>
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
            <View style={{borderRadius: 10, marginTop: wp('7%'), backgroundColor: Colors.blue,}}>
              <View style={styles.cardView}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.cardHealthImageView}>
                    <Image
                      source={require('../../assets/images/icons/icon_error_yellow.png')}
                      style={styles.cardHealthImage}
                    />
                  </View>
                  <TouchableOpacity style={styles.cardButtonView}>
                    <Text style={styles.cardButtonText}>iCloud</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 'auto' }}>
                  <View style={{ justifyContent: 'center' }}>
                    <Text
                      style={{
                        ...styles.levelText,
                        color: Colors.white,
                      }}
                    >
                      {'value.title'}
                    </Text>
                    <Text
                      style={{
                        ...styles.levelInfoText,
                        color: Colors.white,
                      }}
                    >
                      {'value.info'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={()=>{if(!selectedId) {this.setState({selectedId: 1})} else this.setState({selectedId: 0})}} style={styles.manageButton}>
                    <Text
                      style={{
                        ...styles.manageButtonText,
                        color: Colors.white,
                      }}
                    >
                      {'Manage'}
                    </Text>
                    <AntDesign name="arrowright" color={Colors.white} size={12} />
                  </TouchableOpacity>
                </View>
              </View>
              {selectedId ? (<View>
              <View style={{backgroundColor: Colors.white, height: 0.5}} />
              <View style={styles.cardView}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.cardHealthImageView}>
                    <Image
                      source={require('../../assets/images/icons/icon_error_yellow.png')}
                      style={styles.cardHealthImage}
                    />
                  </View>
                  <TouchableOpacity style={styles.cardButtonView}>
                    <Text style={styles.cardButtonText}>iCloud</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 'auto' }}>
                  <View style={{ justifyContent: 'center' }}>
                    <Text
                      style={{
                        ...styles.levelText,
                        color: Colors.white,
                      }}
                    >
                      {'value.title'}
                    </Text>
                    <Text
                      style={{
                        ...styles.levelInfoText,
                        color: Colors.white,
                      }}
                    >
                      {'value.info'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.manageButton}>
                    <Text
                      style={{
                        ...styles.manageButtonText,
                        color: Colors.white,
                      }}
                    >
                      {'Manage'}
                    </Text>
                    <AntDesign name="arrowright" color={Colors.white} size={12} />
                  </TouchableOpacity>
                </View>
              </View>
              </View>) : null}
            </View>
            {/* {levelData.map((value) => {
              return (
                <View
                  style={{
                    ...styles.cardView,
                    backgroundColor: value.isSetupDone
                      ? Colors.blue
                      : Colors.backgroundColor1,
                  }}
                >
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

                    {value.type == 'icloud' && (
                      <TouchableOpacity style={styles.cardButtonView}>
                        <Text style={styles.cardButtonText}>iCloud</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', marginTop: 'auto' }}>
                    <View style={{ justifyContent: 'center' }}>
                      <Text
                        style={{
                          ...styles.levelText,
                          color: value.isSetupDone
                            ? Colors.white
                            : Colors.babyGray,
                        }}
                      >
                        {value.title}
                      </Text>
                      <Text
                        style={{
                          ...styles.levelInfoText,
                          color: value.isSetupDone
                            ? Colors.white
                            : Colors.babyGray,
                        }}
                      >
                        {value.info}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.manageButton}>
                      <Text
                        style={{
                          ...styles.manageButtonText,
                          color: value.isSetupDone
                            ? Colors.white
                            : Colors.black,
                        }}
                      >
                        {value.manageText}
                      </Text>
                      <AntDesign
                        name="arrowright"
                        color={value.isSetupDone ? Colors.white : Colors.black}
                        size={12}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })} */}
          </View>
        </View>
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
    backgroundColor: Colors.deepBlue,
    width: wp('20%'),
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
});
