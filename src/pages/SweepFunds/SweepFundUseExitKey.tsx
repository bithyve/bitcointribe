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
import QRCodeThumbnail from '../../pages/Accounts/QRCodeThumbnail';
import idx from 'idx';
import BottomSheet from 'reanimated-bottom-sheet';
import ModalHeader from '../../components/ModalHeader';
import DeviceInfo from 'react-native-device-info';
import ConfirmSweepFunds from './ConfirmSweepFunds';
import { REGULAR_ACCOUNT, SECURE_ACCOUNT } from '../../common/constants/serviceTypes';

interface SweepFundUseExitKeyStateTypes {
  listData: any[];
  selectedIds: any[];
  openCameraFlag: boolean;
  accountData: any;
}

interface SweepFundUseExitKeyPropsTypes {
  navigation: any;
}

class SweepFundUseExitKey extends Component<
SweepFundUseExitKeyPropsTypes,
  SweepFundUseExitKeyStateTypes
> {
  constructor(props) {
    super(props);
    this.state = {
      selectedIds: [],
      listData: [
        {
          type: 'device',
          title: 'Harvey’s iMac',
          deviceName: 'iMac Pro',
          info: 'Last backup 2 weeks ago',
          id: 1,
          image: require('../../assets/images/icons/icon_iMac.png'),
        },
        {
          type: 'device',
          title: 'Louis’ iPad',
          deviceName: 'iMac Pro',
          info: 'Last backup 2 weeks ago',
          id: 2,
          image: require('../../assets/images/icons/icon_ipad.png'),
        },
        {
          type: 'device',
          title: 'Kate’s S2',
          deviceName: 'Samsung S2',
          info: 'Last backup 2 weeks ago',
          id: 3,
          image: require('../../assets/images/icons/icon_phone.png'),
        },
      ],
      accountData: [
        {
          id: 1,
          account_name: 'Checking Account',
          balance: 2000,
          type: REGULAR_ACCOUNT,
          checked: false,
          image: require('../../assets/images/icons/icon_regular_account.png'),
        },
        {
          id: 2,
          account_name: 'Savings Account',
          balance: 3000,
          type: SECURE_ACCOUNT,
          checked: false,
          image: require('../../assets/images/icons/icon_secureaccount_white.png'),
        },
      ],
      openCameraFlag: false,

    };
  }

  barcodeRecognized = async (barcodes) => {
    //console.log('barcodes', barcodes);
    if (barcodes.data) {

    }
  }

  render() {
    const { listData, openCameraFlag, accountData } = this.state;
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
                {'Use Exit Key'}
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
                Lorem ipsum dolor sit amet, consetetur Lorem ipsum dolor sit
                amet, consetetur Lorem ipsum dolor sit amet, consetetur
              </Text>
            </View>
          </View>
        </View>
        <ScrollView style={{ flex: 1 }}>
        <QRCodeThumbnail
                  isOpenCameraFlag={openCameraFlag}
                  onQrScan={(qrData) => this.barcodeRecognized(qrData)}
        />
        
          {listData.map((item, index) => {
            return (
              <TouchableOpacity
                style={{
                  ...styles.cardsView,
                  borderBottomWidth: index == 2 ? 0 : 4,
                }}
                onPress={() => {
                    (this.refs.ConfirmSweepFunds as any).snapTo(1);
                }}
              >
                <ImageBackground
                  source={require('../../assets/images/icons/Ellipse.png')}
                  style={styles.cardsImageView}
                >
                  <Image source={item.image} style={styles.cardImage} />
                </ImageBackground>
                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={{
                      ...styles.cardsInfoText,
                      fontSize: RFValue(18),
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.cardsInfoText}>{item.title}</Text>
                  <Text style={styles.cardsInfoText}>{item.info}</Text>
                </View>
                <View style={styles.statusTextView}>
                  <Text style={styles.statusText}>Waiting for Key</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={'ConfirmSweepFunds'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('80%')
              : hp('80%'),
          ]}
          renderContent={() => {
            return (
                <ConfirmSweepFunds
                  selectedAccount={accountData}
                  onPressBack={() => {
                    if (this.refs.ConfirmSweepFunds)
                      (this.refs.ConfirmSweepFunds as any).snapTo(0);
                  }}
                  onPressDone={() => {
                    (this.refs.ConfirmSweepFunds as any).snapTo(0);
                    navigation.navigate('SweepConfirmation', {accountData});
                  }}
                />
              );
            }}
          renderHeader={() => {
              return (
                <ModalHeader
                onPressHeader={() => {
                  if (this.refs.RemoveBottomSheet)
                    (this.refs.RemoveBottomSheet as any).snapTo(0);
                }}
                />
              );
            }
        }
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
  })(SweepFundUseExitKey),
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
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp('0.7%'),
    marginBottom: hp('1.5%'),
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
    padding: 5,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 'auto',
    paddingLeft: 10,
    paddingRight: 10
  },
  statusText: {
    fontSize: RFValue(9),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
});
