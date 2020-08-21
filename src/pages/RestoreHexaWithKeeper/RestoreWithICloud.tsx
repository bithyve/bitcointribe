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

interface RestoreWithICloudStateTypes {
  selectedIds: any[];
  listData: any[];
}

interface RestoreWithICloudPropsTypes {
  navigation: any;
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
    };
  }
  // image: require('../../assets/images/icons/icon_contact.png'),
  // image: require('../../assets/images/icons/icon_secondarydevice.png'),

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
          {listData.map((item, index) => {
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
});
