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
  Keyboard,
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
// import RestoreFromICloud from './RestoreFromICloud';
import DeviceInfo from 'react-native-device-info';
// import RestoreSuccess from './RestoreSuccess';
// import ICloudBackupNotFound from './ICloudBackupNotFound';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { requestTimedout } from '../../store/utils/utilities';
import BottomInfoBox from '../../components/BottomInfoBox';
import RestoreFromICloud from '../RestoreHexaWithKeeper/RestoreFromICloud';
import SetupPrimaryKeeper from '../Keeper/SetupPrimaryKeeper';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import SecurityQuestion from '../Keeper/SecurityQuestion';
// import RestoreWallet from './RestoreWallet';

interface UpgradeBackupStateTypes {
  selectedIds: any[];
  listData: any[];
}

interface UpgradeBackupPropsTypes {
  navigation: any;
}

class UpgradeBackup extends Component<
  UpgradeBackupPropsTypes,
  UpgradeBackupStateTypes
> {
  constructor(props) {
    super(props);
    this.state = {
      selectedIds: [],
      listData: [
        {
          title: 'App Backup',
          info: 'Lorem ipsum dolor sit',
          subTitle: 'Lorem ipsum dolor sit amet',
          type: 'backup',
          image: require('../../assets/images/icons/icon_backup.png'),
        },
        {
          title: 'Primary Keeper',
          info: 'Lorem ipsum dolor sit',
          subTitle: 'Lorem ipsum dolor sit amet',
          type: 'primary',
          image: require('../../assets/images/icons/icon_secondarydevice.png'),
        },
        {
          title: 'Keeper Contacts',
          info: 'Lorem ipsum dolor sit',
          subTitle: 'Lorem ipsum dolor sit amet',
          type: 'contact',
          image: require('../../assets/images/icons/icon_contact.png'),
        },
        {
          title: 'Keeper Device & PDF Keepers',
          info: 'Lorem ipsum dolor sit',
          subTitle: 'Lorem ipsum dolor sit amet',
          type: 'devicePDF',
          image: require('../../assets/images/icons/files-and-folders-2.png'),
        },
        {
          title: 'Security Question',
          info: 'Lorem ipsum dolor sit',
          subTitle: 'Lorem ipsum dolor sit amet',
          type: 'securityQuestion',
          image: require('../../assets/images/icons/icon_question.png'),
        },
      ],
    };
  }

  componentDidMount = () => {};

  render() {
    const { listData, selectedIds } = this.state;
    const { navigation } = this.props;
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
                {'Upgrade Backup'}
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
                Lorem ipsum dolor sit amet consetetur sadipscing
              </Text>
            </View>
          </View>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {listData.map((item) => (
            <View style={styles.greyBox}>
              <ImageBackground
                source={require('../../assets/images/icons/Ellipse.png')}
                style={{ ...styles.cardsImageView }}
              >
                <Image source={item.image} style={styles.cardImage} />
              </ImageBackground>
              <View style={{ flex: 1, marginLeft: 5 }}>
                <View
                  style={{
                    borderRadius: 10,
                    paddingLeft: wp('3%'),
                    paddingRight: wp('3%'),
                    height: 50,
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      ...styles.greyBoxText,
                      fontSize: RFValue(13),
                      marginBottom: 5,
                    }}
                  >
                    Upgrade{' '}
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
                    paddingLeft: wp('3%'),
                    paddingRight: wp('3%'),
                    height: 50,
                    alignItems: 'center',
                    flexDirection: 'row',
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
                  <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                    <View
                      style={{
                        height: wp('6%'),
                        width: 'auto',
                        paddingLeft: 15,
                        paddingRight: 15,
                        backgroundColor: Colors.borderColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontFamily: Fonts.FiraSansRegular,
                          fontSize: RFValue(9),
                        }}
                      >
                        Not Setup
                      </Text>
                    </View>
                    <View
                      style={{
                        height: wp('6%'),
                        width: wp('6%'),
                        borderRadius: wp('6%') / 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: Colors.lightGreen,
                        marginLeft: 5,
                      }}
                    >
                      <AntDesign
                        style={{ marginTop: 1 }}
                        size={RFValue(11)}
                        color={Colors.darkGreen}
                        name={'check'}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        <BottomInfoBox
          backgroundColor={Colors.white}
          title={'Note'}
          infoText={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.'
          }
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'RestoreFromICloud'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('50%')
              : hp('60%'),
          ]}
          renderContent={() => (
            <RestoreFromICloud
              title={'Keeper on iCloud'}
              subText={
                'Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diamnonumy eirmod'
              }
              info={
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore.'
              }
              cardInfo={'Store Backup'}
              cardTitle={'Hexa Wallet Backup'}
              cardSubInfo={'iCloud backup'}
              proceedButtonText={'Open Settings'}
              backButtonText={'Back'}
              modalRef={this.refs.RestoreFromICloud}
              onPressProceed={() => {
                (this.refs.RestoreFromICloud as any).snapTo(0);
              }}
              onPressBack={() => {
                (this.refs.RestoreFromICloud as any).snapTo(0);
              }}
            />
          )}
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
              onPressBack={() => {
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0);
              }}
              onPressContinue={() => {
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0);
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
          ref={'SecurityQuestionBottomSheet'}
          snapPoints={[-30, hp('75%'), hp('90%')]}
          renderContent={() => (
            <SecurityQuestion
              onFocus={() => {
                if (Platform.OS == 'ios')
                  (this.refs.SecurityQuestionBottomSheet as any).snapTo(2);
              }}
              onBlur={() => {
                if (Platform.OS == 'ios')
                  (this.refs.SecurityQuestionBottomSheet as any).snapTo(1);
              }}
              onPressConfirm={async () => {
                Keyboard.dismiss();
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
  })(UpgradeBackup),
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
    width: wp('15%'),
    height: wp('15%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: wp('5%'),
    height: wp('5%'),
    resizeMode: 'contain',
    marginBottom: wp('1%'),
  },
  statusTextView: {
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
    backgroundColor: Colors.backgroundColor1,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    marginTop: wp('2%'),
    marginBottom: wp('2%'),
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
    fontSize: RFValue(10),
  },
  successModalImage: {
    width: wp('30%'),
    height: wp('35%'),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: -5,
  },
});
