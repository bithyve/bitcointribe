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
import { CloudData } from '../../common/CommonFunctions';
import {
  CheckCloudDataBackup,
  CloudDataBackup,
} from '../../common/CommonFunctions/CloudBackup';
import { setCloudBackupStatus } from '../../store/actions/preferences';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SSS from '../../bitcoin/utilities/sss/SSS';
import { decrypt, decrypt1 } from '../../common/encryption';
import LoaderModal from '../../components/LoaderModal';
import TransparentHeaderModal from '../../components/TransparentHeaderModal';
import {
  recoverWalletUsingIcloud,
  checkMSharesHealth,
} from '../../store/actions/sss';
import axios from 'axios';
import {
  calculateExchangeRate,
  startupSync,
} from '../../store/actions/accounts';
import { initializeHealthSetup } from '../../store/actions/health';

interface RestoreWithICloudStateTypes {
  selectedIds: any[];
  listData: any[];
  walletsArray: any[];
  cloudBackup: boolean;
  hideShow: boolean;
  selectedBackup: any;
  exchangeRates: any;
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
      },
      exchangeRates: '',
    };
  }
  // image: require('../../assets/images/icons/icon_contact.png'),
  // image: require('../../assets/images/icons/icon_secondarydevice.png'),

  componentDidMount = async () => {
    this.cloudData();
    const storedExchangeRates = await AsyncStorage.getItem('exchangeRates');
    if (storedExchangeRates) {
      const exchangeRates = JSON.parse(storedExchangeRates);
      if (Date.now() - exchangeRates.lastFetched < 1800000) {
        this.setState({ exchangeRates });
        return;
      } // maintaining a half an hour difference b/w fetches
    }
    const res = await axios.get('https://blockchain.info/ticker');
    if (res.status == 200) {
      const exchangeRates = res.data;
      exchangeRates.lastFetched = Date.now();
      this.setState({ exchangeRates });
      await AsyncStorage.setItem(
        'exchangeRates',
        JSON.stringify(exchangeRates),
      );
    } else {
      console.log('Failed to retrieve exchange rates', res);
    }
  };

  cloudData = async () => {
    CheckCloudDataBackup((result) => this.getData(result));
  };

  componentDidUpdate = async (prevProps) => {
    const {
      walletImageChecked,
      SERVICES,
      calculateExchangeRate,
      startupSync,
      checkMSharesHealth,
      initializeHealthSetup
    } = this.props;
    if (
      prevProps.walletImageChecked != walletImageChecked
    ) {
      await AsyncStorage.setItem('walletExists', 'true');
      await AsyncStorage.setItem('walletRecovered', 'true');
      calculateExchangeRate();
      initializeHealthSetup();
      //checkMSharesHealth();
      setTimeout(() => {
        startupSync(); // delaying as checkMSharesHealth is also a DB inserting saga
      }, 2000);
    }

    if (prevProps.accounts !== this.props.accounts) {
      if (this.props.accounts.accountsSynched) {
        (this.refs.loaderBottomSheet as any).snapTo(0);
        this.props.navigation.navigate('Home', {
          exchangeRates: this.state.exchangeRates,
        });
      }
    }
  };

  getData = (result) => {
    console.log('FILE DATA', result);
    if(result){
      var arr = [];
    var newArray = [];
    try {
      arr = JSON.parse(result);
    } catch (error) {
      console.log('ERROR', error);
    }
    if (arr && arr.length) {
      for (var i = 0; i < arr.length; i++) {
        newArray.push(arr[i]);
      }
    }
    console.log('ARR', newArray);
    this.setState({ selectedBackup: newArray[0], walletsArray: newArray });
    (this.refs.RestoreFromICloud as any).snapTo(1);
  }else{
    (this.refs.BackupNotFound as any).snapTo(1);
  }
  };

  restoreWallet = () => {
    const { selectedBackup } = this.state;
    const { recoverWalletUsingIcloud, accounts } = this.props;
    let key = SSS.strechKey(this.props.security.answer);
    const decryptedCloudDataJson = decrypt(selectedBackup.data, key);
    console.log('decryptedCloudDataJson', decryptedCloudDataJson);
    (this.refs.loaderBottomSheet as any).snapTo(1);
    recoverWalletUsingIcloud(decryptedCloudDataJson);
  };

  render() {
    const {
      listData,
      hideShow,
      cloudBackup,
      walletsArray,
      selectedBackup,
    } = this.state;
    const { navigation } = this.props;
    let name;
    if (Platform.OS == 'ios') name = 'iCloud';
    else name = 'GDrive';
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor1 }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
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
                      Last backup {item.time} ago
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
              (this.refs.BackupNotFound as any).snapTo(1);
            }}
          >
            <Image
              source={require('../../assets/images/icons/qr-code.png')}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Scan Key</Text>
          </TouchableOpacity>
        </View>
        {hideShow ? (
          <View style={styles.dropDownView}>
            {walletsArray.map((value) => {
              return (
                <TouchableOpacity
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
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
                cardSubInfo={name + ' backup'}
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
    overallHealth: idx(state, (_) => _.sss.overallHealth),
    trustedContacts: idx(state, (_) => _.trustedContacts.service),
    walletImageChecked: idx(state, (_) => _.sss.walletImageChecked),
    SERVICES: idx(state, (_) => _.storage.database.SERVICES),
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    fetchEphemeralChannel,
    setCloudBackupStatus,
    recoverWalletUsingIcloud,
    calculateExchangeRate,
    checkMSharesHealth,
    startupSync,
    initializeHealthSetup,
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
    marginTop: wp('2%'),
    marginBottom: wp('2%'),
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
