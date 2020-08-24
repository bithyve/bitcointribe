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
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import idx from 'idx';
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter';
import moment from 'moment';
import { nameToInitials } from '../../common/CommonFunctions';
import Icons from '../../common/Icons';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface ManageBackupStateTypes {
  selectedId: any;
  securityAtLevel: any;
  pageData: any;
  selectedType: any;
  autoHighlightFlags: any;
}

interface ManageBackupPropsTypes {
  navigation: any;
}

class ManageBackupUpgradeSecurity extends Component<
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
      securityAtLevel: 0,
      selectedId: 0,
      pageData: [
        {
          title: 'Secondary Device',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'secondaryDevice',
          route: 'SecondaryDevice',
        },
        {
          title: 'Trusted Contact 1',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'contact1',
          route: 'TrustedContacts',
          isOTPShared: false,
        },
        {
          title: 'Trusted Contact 2',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'contact2',
          route: 'TrustedContacts',
          isOTPShared: false,
        },
        {
          title: 'Personal Copy 1',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'copy1',
          route: 'PersonalCopy',
        },
        {
          title: 'Personal Copy 2',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'copy2',
          route: 'PersonalCopy',
        },
        {
          title: 'Security Questions',
          personalInfo: null,
          time: 'never',
          status: 'Ugly',
          type: 'security',
          route: 'HealthCheckSecurityAnswer',
        },
      ],
      selectedType: '',
      autoHighlightFlags: {
        secondaryDevice: false,
        trustedContact1: false,
        trustedContact2: false,
        personalCopy1: false,
        personalCopy2: false,
        securityAns: true,
      }
    };
  }

  componentDidMount = () => {};


   getIconByStatus = (status) => {
    if (status == 'Ugly') {
      return require('../../assets/images/icons/icon_error_red.png');
    } else if (status == 'Bad') {
      return require('../../assets/images/icons/icon_error_yellow.png');
    } else if (status == 'Good') {
      return require('../../assets/images/icons/icon_check.png');
    }
  };

  getStatusIcon = (item) => {
      const {autoHighlightFlags} = this.state;
    if (item.type == 'secondaryDevice' && autoHighlightFlags.secondaryDevice) {
      return {
        icon: this.getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      };
    }
    if (item.type == 'contact1' && autoHighlightFlags.trustedContact1) {
      return {
        icon: this.getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      };
    }
    if (item.type == 'contact2' && autoHighlightFlags.trustedContact2) {
      return {
        icon: this.getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      };
    }
    if (item.type == 'copy1' && autoHighlightFlags.personalCopy1) {
      return {
        icon: this.getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      };
    }
    if (item.type == 'copy2' && autoHighlightFlags.personalCopy2) {
      return {
        icon: this.getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      };
    }
    if (item.type == 'security' && autoHighlightFlags.securityAns) {
      return {
        icon: this.getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
              ? Colors.yellow
              : item.status == 'Good'
                ? Colors.green
                : Colors.textColorGrey,
      };
    }
    return {
      icon: require('../../assets/images/icons/icon_error_gray.png'),
      color: Colors.lightTextColor,
    };
  };

  getTime = (item) => {
    return (item.toString() && item.toString() == '0') ||
      item.toString() == 'never'
      ? 'never'
      : timeFormatter(moment(new Date()), item);
  };

  getImageIcon = (item) => {
    if (item.type == 'contact1' || item.type == 'contact2') {
      if (item.personalInfo) {
        if (item.personalInfo.imageAvailable) {
          return (
            <Image
              source={item.personalInfo.image}
              style={{
                width: 35,
                height: 35,
                borderRadius: 35 / 2,
                resizeMode: 'contain',
              }}
            />
          );
        } else {
          return (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.shadowBlue,
                width: 35,
                height: 35,
                borderRadius: 30,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  lineHeight: 13, //... One for top and one for bottom alignment
                }}
              >
                {item.personalInfo
                  ? nameToInitials(
                    item.personalInfo.firstName && item.personalInfo.lastName
                      ? item.personalInfo.firstName +
                      ' ' +
                      item.personalInfo.lastName
                      : item.personalInfo.firstName &&
                        !item.personalInfo.lastName
                        ? item.personalInfo.firstName
                        : !item.personalInfo.firstName &&
                          item.personalInfo.lastName
                          ? item.personalInfo.lastName
                          : '',
                  )
                  : ''}
              </Text>
            </View>
          );
        }
      }
    }
    return <Image style={styles.cardImage} source={this.getImageByType(item)} />;
  };

  getImageByType = (item) => {
    let type = item.type;
    if (type == 'secondaryDevice') {
      return require('../../assets/images/icons/icon_secondarydevice.png');
    } else if (type == 'contact1' || type == 'contact2') {
      return require('../../assets/images/icons/icon_user.png');
    } else if (type == 'copy1' || type == 'copy2') {
      if (
        item.personalInfo &&
        item.personalInfo.flagShare &&
        item.personalInfo.shareDetails.type == 'GoogleDrive'
      ) {
        return Icons.manageBackup.PersonalCopy.icloud;
      } else if (
        item.personalInfo &&
        item.personalInfo.flagShare &&
        item.personalInfo.shareDetails.type == 'Email'
      ) {
        return Icons.manageBackup.PersonalCopy.email;
      } else if (
        item.personalInfo &&
        item.personalInfo.flagShare &&
        item.personalInfo.shareDetails.type == 'Print'
      ) {
        return Icons.manageBackup.PersonalCopy.print;
      } else {
        return require('../../assets/images/icons/note.png');
      }
    }
    if (type == 'print') {
      return require('../../assets/images/icons/print.png');
    } else if (type == 'security') {
      return require('../../assets/images/icons/icon_securityquestion.png');
    }
  }

  getCardTitle = (item) => {
    if (item.type === 'contact1' || item.type === 'contact2') {
      if (item.personalInfo) {
        if (item.personalInfo.firstName && item.personalInfo.lastName) {
          return item.personalInfo.firstName + ' ' + item.personalInfo.lastName;
        }
        if (!item.personalInfo.firstName && item.personalInfo.lastName) {
          return item.personalInfo.lastName;
        }
        if (item.personalInfo.firstName && !item.personalInfo.lastName) {
          return item.personalInfo.firstName;
        }

        return '';
      } else {
        return 'Friends and Family';
      }
    }

    if (item.type === 'copy1' || item.type === 'copy2') {
      return 'Personal Copy';
    }

    if (item.type === 'secondaryDevice') {
      return 'Keeper Device';
    }

    if (item.type === 'security') {
      return 'Security Question';
    }

    return item.title;
  };

  getCardSubText = (item) => {
      const { autoHighlightFlags } = this.state;
    if (item.type == 'secondaryDevice') {
      if (autoHighlightFlags.secondaryDevice) {
        return item.status == 'Ugly' ? 'Confirm by logging on the Keeper Device'
          : item.status == 'Bad' ? 'Confirm by logging on the Keeper Device'
            : item.status == 'Good' ? 'The Recovery Key is accessible'
              : 'Use one of your other device with Hexa';
      } else {
        return 'Use one of your other device with Hexa';
      }
    }
    if (item.type == 'contact1') {
      if (autoHighlightFlags.trustedContact1) {
        return item.status == 'Ugly' ? 'Confirm by asking the contact to go online'
          : item.status == 'Bad' ? 'Confirm by asking the contact to go online'
            : item.status == 'Good' ? 'The Recovery Key is accessible'
              : 'Select a contact as a Keeper';
      } else {
        return 'Select a contact as a Keeper';
      }
    }
    if (item.type == 'contact2') {
      if (autoHighlightFlags.trustedContact2) {
        return item.status == 'Ugly' ? 'Confirm by asking the contact to go online'
          : item.status == 'Bad' ? 'Confirm by asking the contact to go online'
            : item.status == 'Good' ? 'The Recovery Key is accessible'
              : 'Select a contact as a Keeper';
      } else {
        return 'Select a contact as a Keeper';
      }
    }
    if (item.type == 'copy1') {
      if (autoHighlightFlags.personalCopy1) {
        return item.status == 'Ugly' ? 'Confirm by scanning pdf’s first QR'
          : item.status == 'Bad' ? 'Confirm by scanning pdf’s first QR'
            : item.status == 'Good' ? 'The Recovery Key is accessible'
              : 'Secure your Recovery Key as a file (pdf)';
      } else {
        return 'Secure your Recovery Key as a file (pdf)';
      }
    }
    if (item.type == 'copy2') {
      if (autoHighlightFlags.personalCopy2) {
        return item.status == 'Ugly' ? 'Confirm by scanning pdf’s first QR'
          : item.status == 'Bad' ? 'Confirm by scanning pdf’s first QR'
            : item.status == 'Good' ? 'The Recovery Key is accessible'
              : 'Secure your Recovery Key as a file (pdf)';
      } else {
        return 'Secure your Recovery Key as a file (pdf)';
      }
    }
    if (item.type == 'security') {
      if (autoHighlightFlags.securityAns) {
        return item.status == 'Ugly' ? 'Confirm the Security Question and Answer'
          : item.status == 'Bad' ? 'Confirm the Security Question and Answer'
            : item.status == 'Good' ? 'Security Question and Answer are confirmed'
              : 'Last Backup';
      } else {
        return 'Last Backup';
      }
    }
  };


  render() {
    const { selectedType,pageData } = this.state;
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
                onPress={() => {
                    navigation.navigate('UpgradeBackup')
                }}
                style={styles.rightButton}
              >
                <AntDesign
                        name="reload1"
                        color={Colors.blue}
                        size={15}
                        style={{
                          marginLeft: wp('1%'),
                          marginRight: wp('1%'),
                          alignSelf: 'center',
                        }}
                      />
                <Text
                  style={{
                    color: Colors.blue,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                    textAlign: 'center'
                  }}
                >
                  Upgrade
                </Text>
              </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerSettingImageView}
          >
            <Image
              source={require('../../assets/images/icons/setting.png')}
              style={styles.headerSettingImage}
            /> 
          </TouchableOpacity>*/}
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
              <Text style={styles.backupInfoText}>Not Upgraded</Text>
            </View>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.noteText}>
              Lorem ipsum Dolor
              <Text
                style={{
                  ...styles.noteText,
                  fontFamily: Fonts.FiraSansMediumItalic,
                  fontStyle: 'italic',
                }}
              >
                {' Upgrade Security'}
              </Text>
            </Text>
          </View>

          <View style={{ marginBottom: 10, marginTop: 25 }}>
                {pageData.map((item, index) => {
                  return (
                    <View style={{}}>
                      <TouchableOpacity
                        onPress={() => {
                          if (item.type == 'secondaryDevice') {
                            // props.navigation.navigate(
                            //   'SecondaryDeviceHistory',
                            //   {
                            //     selectedStatus: item.status,
                            //     selectedTime: getTime(item.time),
                            //     selectedTitle: getCardTitle(item),
                            //     updateAutoHighlightFlags: () =>
                            //       setAutoHighlightFlags({
                            //         ...autoHighlightFlags,
                            //         secondaryDevice: true,
                            //       }),
                            //   },
                            // );
                          } else if (item.type == 'contact1') {
                            // props.navigation.navigate('TrustedContactHistory', {
                            //   selectedStatus: item.status,
                            //   selectedTime: getTime(item.time),
                            //   selectedTitle: item.title,
                            //   updateAutoHighlightFlags: () =>
                            //     setAutoHighlightFlags({
                            //       ...autoHighlightFlags,
                            //       trustedContact1: true,
                            //     }),
                            //   activateReshare:
                            //     autoHighlightFlags.trustedContact1,
                            // });
                          } else if (item.type == 'contact2') {
                            // props.navigation.navigate('TrustedContactHistory', {
                            //   selectedStatus: item.status,
                            //   selectedTime: getTime(item.time),
                            //   selectedTitle: item.title,
                            //   updateAutoHighlightFlags: () =>
                            //     setAutoHighlightFlags({
                            //       ...autoHighlightFlags,
                            //       trustedContact2: true,
                            //     }),
                            //   activateReshare:
                            //     autoHighlightFlags.trustedContact2,
                            // });
                          } else if (item.type === 'copy1') {
                            // props.navigation.navigate('PersonalCopyHistory', {
                            //   selectedStatus: item.status,
                            //   selectedTime: getTime(item.time),
                            //   selectedTitle: item.title,
                            //   selectedPersonalCopy: item,
                            //   updateAutoHighlightFlags: () =>
                            //     setAutoHighlightFlags({
                            //       ...autoHighlightFlags,
                            //       personalCopy1: true,
                            //     }),
                            // });
                          } else if (item.type == 'copy2') {
                            // props.navigation.navigate('PersonalCopyHistory', {
                            //   selectedStatus: item.status,
                            //   selectedTime: getTime(item.time),
                            //   selectedTitle: item.title,
                            //   selectedPersonalCopy: item,
                            //   updateAutoHighlightFlags: () =>
                            //     setAutoHighlightFlags({
                            //       ...autoHighlightFlags,
                            //       personalCopy2: true,
                            //     }),
                            // });
                          } else if (item.type == 'security') {
                        //     props.navigation.navigate(
                        //       'SecurityQuestionHistory',
                        //       {
                        //         selectedStatus: item.status,
                        //         selectedTime: getTime(item.time),
                        //         selectedTitle: getCardTitle(item),
                        //         updateAutoHighlightFlags: () =>
                        //           setAutoHighlightFlags({
                        //             ...autoHighlightFlags,
                        //             securityAns: true,
                        //           }),
                        //       },
                        //     );
                           }
                        }}
                        style={{
                          ...styles.manageBackupCard,
                          borderColor: this.getStatusIcon(item).color,
                          elevation:
                            selectedType && item.type == selectedType ? 10 : 0,
                          shadowColor:
                            selectedType && item.type == selectedType
                              ? Colors.borderColor
                              : Colors.white,
                          shadowOpacity:
                            selectedType && item.type == selectedType ? 10 : 0,
                          shadowOffset:
                            selectedType && item.type == selectedType
                              ? { width: 0, height: 10 }
                              : { width: 0, height: 0 },
                          shadowRadius:
                            selectedType && item.type == selectedType ? 10 : 0,
                        }}
                      >
                        {this.getImageIcon(item)}
                        <View style={{ flex: 1, marginHorizontal: 15 }}>
                          <Text style={styles.cardTitleText}>
                            {this.getCardTitle(item)}
                          </Text>
                          <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={styles.cardTimeText}>
                              {this.getCardSubText(item)}
                              {(item.type === 'security' || (item.type === 'secondaryDevice' &&
                                item.status !== 'Ugly')) && (
                                  <Text
                                    style={{
                                      color: Colors.textColorGrey,
                                      fontSize: RFValue(10),
                                      fontFamily: Fonts.FiraSansMediumItalic,
                                      fontWeight: 'bold',
                                      fontStyle: 'italic',
                                    }}
                                  >
                                    {' '}{this.getTime(item.time)}
                                  </Text>
                                )}
                            </Text>
                          </View>
                        </View>
                        <Image
                          style={styles.cardIconImage}
                          source={this.getStatusIcon(item).icon}
                        />
                      </TouchableOpacity>
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
  connect(mapStateToProps, {})(ManageBackupUpgradeSecurity),
);

const styles = StyleSheet.create({
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 10,
  },
  cardImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  cardTimeText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(10),
  },
  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: 'contain',
    marginLeft: 'auto',
  },
  headerSettingImageView: {
    height: wp('10%'),
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
  noteText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
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
  manageBackupCard: {
    flex: 1,
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.white,
  },
  cardTitleText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  rightButton:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: Colors.backgroundColor,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.borderColor,
    }
});
