import React, { PureComponent } from 'react';
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
  RefreshControl,
  AsyncStorage,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { connect } from 'react-redux';
import idx from 'idx';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import Styles from '../common/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  trustedChannelsSync,
  removeTrustedContact,
  updateAddressBookLocally,
} from '../store/actions/trustedContacts';
import RegularAccount from '../bitcoin/services/accounts/RegularAccount';
import {
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../common/constants/serviceTypes';
import { TrustedContactDerivativeAccountElements } from '../bitcoin/utilities/Interface';
import { nameToInitials } from '../common/CommonFunctions';
import TrustedContactsService from '../bitcoin/services/TrustedContactsService';
import BottomInfoBox from '../components/BottomInfoBox';
import AddContactAddressBook from './Contacts/AddContactAddressBook';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../components/ModalHeader';
import config from '../bitcoin/HexaConfig';
import KnowMoreButton from '../components/KnowMoreButton';
import SmallHeaderModal from '../components/SmallHeaderModal';
import AddressBookHelpContents from '../components/Helper/AddressBookHelpContents';
// import CountDown from 'react-native-countdown-component';
import CountDown from '../components/CountDown';
import Config from '../bitcoin/HexaConfig';
import { ContactTypes } from 'expo-contacts';

interface AddressBookContentsPropTypes {
  navigation: any;
  isFocused: boolean;
  regularAccount: RegularAccount;
  trustedContactsService: TrustedContactsService;
  trustedChannelsSync: any;
  trustedChannelsSyncing: any;
  updateAddressBookLocally: any;
  addressBookData: any;
  trustedContactsInfo: any;
  removeTrustedContact: any;
}
interface AddressBookContentsStateTypes {
  isLoadContacts: boolean;
  selectedContact: any[];
  loading: boolean;
  MyKeeper: any[];
  IMKeeper: any[];
  trustedContact: any[];
  OtherTrustedContact: any[];
  onRefresh: boolean;
  updateList: boolean;
}

const getImageIcon = (item) => {
  if (item) {
    if (item.image && item.image.uri) {
      return <Image source={item.image} style={styles.imageIconStyle} />;
    } else {
      return (
        <View style={styles.imageIconViewStyle}>
          <Text style={styles.imageIconText}>
            {item
              ? nameToInitials(
                item.firstName == 'Secondary' && item.lastName == 'Device'
                  ? 'Keeper Device'
                  : item.firstName && item.lastName
                    ? item.firstName + ' ' + item.lastName
                    : item.firstName && !item.lastName
                      ? item.firstName
                      : !item.firstName && item.lastName
                        ? item.lastName
                        : '',
              )
              : ''}
          </Text>
        </View>
      );
    }
  }
};

class AddressBookContents extends PureComponent<
  AddressBookContentsPropTypes,
  AddressBookContentsStateTypes
  > {
  AddContactAddressBookBottomSheet: any;
  HelpBottomSheet: any;
  focusListener: any;

  constructor(props) {
    super(props);
    this.focusListener = null;
    this.AddContactAddressBookBottomSheet = React.createRef();
    this.HelpBottomSheet = React.createRef();
    this.state = {
      onRefresh: false,
      isLoadContacts: false,
      selectedContact: [],
      loading: true,
      trustedContact: idx(props, (_) => _.addressBookData.trustedContact) || [],
      MyKeeper: idx(props, (_) => _.addressBookData.MyKeeper) || [],
      IMKeeper: idx(props, (_) => _.addressBookData.IMKeeper) || [],
      OtherTrustedContact:
        idx(props, (_) => _.addressBookData.OtherTrustedContact) || [],
      updateList: false,
    };
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.props.trustedChannelsSync();
      this.updateAddressBook();
    });
  }

  componentDidUpdate(prevProps) {
    const oldDerivativeAccounts = idx(
      prevProps,
      (_) => _.regularAccount.hdWallet.derivativeAccounts,
    );
    const newDerivativeAccounts = idx(
      this.props,
      (_) => _.regularAccount.hdWallet.derivativeAccounts,
    );
    if (
      oldDerivativeAccounts !== newDerivativeAccounts ||
      prevProps.trustedContactsService != this.props.trustedContactsService
    ) {
      this.updateAddressBook();
    }
    if (this.state.trustedContact) {
      this.setState({
        loading: false,
      });
    }
    if (
      prevProps.trustedChannelsSyncing !== this.props.trustedChannelsSyncing
    ) {
      this.setState({
        loading: this.props.trustedChannelsSyncing,
      });
    }
  }

  componentWillUnmount() {
    this.focusListener.remove();
  }

  updateAddressBook = async () => {
    const { regularAccount, trustedContactsService } = this.props;
    let { trustedContactsInfo } = this.props;
    if (!trustedContactsInfo) {
      let TrustedContactsInfo = await AsyncStorage.getItem("TrustedContactsInfo")
      trustedContactsInfo = JSON.stringify(JSON.parse(TrustedContactsInfo))
    }
    let myKeepers = [];
    let imKeepers = [];
    let otherTrustedContact = [];
    if (trustedContactsInfo) {
      if (trustedContactsInfo.length) {
        const trustedContacts = [];
        for (let index = 0; index < trustedContactsInfo.length; index++) {
          const contactInfo = trustedContactsInfo[index];
          if (!contactInfo) continue;
          const contactName = `${contactInfo.firstName} ${
            contactInfo.lastName ? contactInfo.lastName : ''
            }`;
          let connectedVia;
          if (contactInfo.phoneNumbers && contactInfo.phoneNumbers.length) {
            connectedVia = contactInfo.phoneNumbers[0].number;
          } else if (contactInfo.emails && contactInfo.emails.length) {
            connectedVia = contactInfo.emails[0].email;
          }

          let hasXpub = false;
          const {
            trustedContactToDA,
            derivativeAccounts,
          } = regularAccount.hdWallet;
          const accountNumber =
            trustedContactToDA[contactName.toLowerCase().trim()];
          if (accountNumber) {
            const trustedContact: TrustedContactDerivativeAccountElements =
              derivativeAccounts[TRUSTED_CONTACTS][accountNumber];
            if (
              trustedContact.contactDetails &&
              trustedContact.contactDetails.xpub
            ) {
              hasXpub = true;
            }
          }

          const {
            isWard,
            trustedAddress,
          } = trustedContactsService.tc.trustedContacts[
            contactName.toLowerCase().trim()
            ];

          const hasTrustedAddress = !!trustedAddress;

          const isGuardian = index < 3 ? true : false;
          let shareIndex;
          if (isGuardian) {
            shareIndex = index;
          }

          const initiatedAt =
            trustedContactsService.tc.trustedContacts[
              contactName.toLowerCase().trim()
            ].ephemeralChannel.initiatedAt;

          const hasTrustedChannel = trustedContactsService.tc.trustedContacts[
            contactName.toLowerCase().trim()
          ].symmetricKey
            ? true
            : false;

          const element = {
            contactName,
            connectedVia,
            hasXpub,
            hasTrustedAddress,
            isGuardian,
            isWard,
            initiatedAt,
            shareIndex,
            hasTrustedChannel,
            ...contactInfo,
          };
          trustedContacts.push(element);
          if (element.isGuardian) {
            myKeepers.push(element);
          }
          if (element.isWard) {
            imKeepers.push(element);
          }
          if (!element.isWard && !element.isGuardian) {
            otherTrustedContact.push({ ...element, isRemovable: true });
          }
        }
        this.setState(
          {
            MyKeeper: myKeepers,
            IMKeeper: imKeepers,
            OtherTrustedContact: otherTrustedContact,
            trustedContact: trustedContacts,
          },
          () =>
            this.props.updateAddressBookLocally({
              MyKeeper: myKeepers,
              IMKeeper: imKeepers,
              OtherTrustedContact: otherTrustedContact,
              trustedContact: trustedContacts,
            }),
        );
      }
    }
  };

  renderHelpHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if (this.HelpBottomSheet.current)
            (this.HelpBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  renderHelpContent = () => {
    return (
      <AddressBookHelpContents
        titleClicked={() => {
          if (this.HelpBottomSheet.current)
            (this.HelpBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  getImageIcon = (item) => {
    if (item) {
      if (item.image && item.image.uri) {
        return (
          <Image
            source={item.image}
            style={{
              width: wp('12%'),
              height: wp('12%'),
              borderRadius: wp('12%') / 2,
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
              width: wp('12%'),
              height: wp('12%'),
              borderRadius: wp('12%') / 2,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 13,
                lineHeight: 13,
              }}
            >
              {item
                ? nameToInitials(
                  item.firstName == 'Secondary' && item.lastName == 'Device'
                    ? 'Keeper Device'
                    : item.firstName && item.lastName
                      ? item.firstName + ' ' + item.lastName
                      : item.firstName && !item.lastName
                        ? item.firstName
                        : !item.firstName && item.lastName
                          ? item.lastName
                          : '',
                )
                : ''}
            </Text>
          </View>
        );
      }
    }
  };

  getElement = (contact, index, contactsType) => {
    const { navigation } = this.props;
    var minute =
      config.TC_REQUEST_EXPIRY / 1000 -
      (Date.now() - contact.initiatedAt) / 1000;
    return (
      <TouchableOpacity
        key={contact.id}
        onPress={() => {
          // navigation.navigate('ContactDetails', {
          //   contactsType,
          //   contact,
          //   index,
          //   shareIndex: contact.shareIndex,
          // });
          navigation.navigate('ContactDetailsNew', {
            contactsType,
            contact,
            index,
            shareIndex: contact.shareIndex,
          });
        }}
        // onLongPress={() => {
        //   this.props.removeTrustedContact(contact.contactName);
        // }}
        style={styles.selectedContactsView}
      >
        {getImageIcon(contact)}
        <View>
          <Text style={styles.contactText}>
            {contact.firstName && contact.firstName != 'Secondary'
              ? contact.firstName + ' '
              : contact.firstName && contact.firstName == 'Secondary'
                ? 'Keeper '
                : ''}
            <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
              {contact.lastName && contact.lastName != 'Device'
                ? contact.lastName + ' '
                : contact.lastName && contact.lastName == 'Device'
                  ? 'Device '
                  : ''}
            </Text>
          </Text>
          {contact.connectedVia ? (
            <Text style={styles.phoneText}>{contact.connectedVia}</Text>
          ) : null}
        </View>
        <View style={styles.getImageView}>
          {contactsType !== "I'm Keeper of" ? <View>
            {!(contact.hasXpub || contact.hasTrustedAddress) &&
              (Date.now() - contact.initiatedAt > config.TC_REQUEST_EXPIRY &&
                !contact.hasTrustedChannel ? (
                  <View
                    style={{
                      width: wp('15%'),
                      height: wp('6%'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: Colors.borderColor,
                      marginRight: 10,
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(10),
                        fontFamily: Fonts.FiraSansRegular,
                      }}
                    >
                      Expired
                </Text>
                  </View>
                ) : (
                  <CountDown
                    onFinish={() =>
                      this.setState({ updateList: !this.state.updateList })
                    }
                    id={index}
                    size={12}
                    until={minute}
                    digitStyle={{
                      backgroundColor: '#FFF',
                      borderWidth: 0,
                      borderColor: '#FFF',
                      margin: -10,
                    }}
                    digitTxtStyle={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(12),
                      fontFamily: Fonts.FiraSansRegular,
                    }}
                    separatorStyle={{ color: Colors.textColorGrey }}
                    timeToShow={['H', 'M', 'S']}
                    timeLabels={{ h: null, m: null, s: null }}
                    showSeparator
                  />
                ))}

          </View> : null}
          <View style={styles.xpubIconView}>
            <Ionicons
              name="ios-arrow-forward"
              color={Colors.borderColor}
              size={RFValue(15)}
              style={{
                marginLeft: 'auto',
                alignSelf: 'center',
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderAddContactAddressBookContents = () => {
    const { navigation } = this.props;
    const { isLoadContacts, selectedContact } = this.state;
    return (
      <AddContactAddressBook
        isLoadContacts={isLoadContacts}
        modalRef={this.AddContactAddressBookBottomSheet}
        proceedButtonText={'Confirm & Proceed'}
        onPressContinue={() => {
          navigation.navigate('AddContactSendRequest', {
            SelectedContact: selectedContact,
          });
          (this.AddContactAddressBookBottomSheet as any).current.snapTo(0);
        }}
        onSelectContact={(selectedData) => {
          this.setState({
            selectedContact: selectedData,
          });
        }}
        onPressBack={() => {
          (this.AddContactAddressBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  renderAddContactAddressBookHeader = () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (AddContactAddressBookBookBottomSheet as any).current.snapTo(0);
      // }}
      />
    );
  };

  render() {
    const { navigation, trustedChannelsSync } = this.props;
    const { MyKeeper, IMKeeper, OtherTrustedContact, onRefresh } = this.state;
    return (
      <View style={Styles.rootView}>
        <SafeAreaView style={Styles.statusBarStyle} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeaderTitleView}>
            <View style={Styles.backIconRootContainer}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={Styles.backIconTouchContainer}
              >
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.blue}
                  size={17}
                />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitleText}>
                {'Friends and Family'}
              </Text>
            </View>
            <KnowMoreButton
              onpress={() => {
                (this.HelpBottomSheet as any).current.snapTo(1);
              }}
              containerStyle={{
                marginTop: 'auto',
                marginBottom: 'auto',
                marginRight: 10,
              }}
              textStyle={{}}
            />
          </View>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={onRefresh}
                onRefresh={() => {
                  trustedChannelsSync();
                }}
              />
            }
            style={{ flex: 1 }}
          >
            <View style={{ marginTop: wp('2%') }}>
              <Text style={styles.pageTitle}>My Keepers</Text>
              <Text style={styles.pageInfoText}>
                Contacts who can help me restore my wallet
              </Text>
              <View style={{ marginBottom: 15 }}>
                <View style={{ height: 'auto' }}>
                  {MyKeeper.length > 0 ? (
                    MyKeeper.map((item, index) => {
                      return this.getElement(item, index, 'My Keepers');
                    })
                  ) : (
                      <View style={{ height: wp('22%') + 30 }} />
                    )}
                </View>
              </View>
            </View>
            <View style={{ marginTop: wp('5%') }}>
              <Text style={styles.pageTitle}>I am the Keeper of</Text>
              <Text style={styles.pageInfoText}>
                Contacts who I can help restore their wallets
              </Text>
              <View style={{ marginBottom: 15 }}>
                <View style={{ height: 'auto' }}>
                  {IMKeeper.length > 0 ? (
                    IMKeeper.map((item, index) => {
                      return this.getElement(item, index, "I'm Keeper of");
                    })
                  ) : (
                      <View style={{ height: wp('22%') + 30 }} />
                    )}
                </View>
              </View>
            </View>
            <View style={{ marginTop: wp('5%') }}>
              <Text style={styles.pageTitle}>Other Contacts</Text>
              <Text style={styles.pageInfoText}>
                Contacts who I can pay directly
              </Text>

              <View style={{ marginBottom: 15 }}>
                <View style={{ height: 'auto' }}>
                  {OtherTrustedContact.length > 0 ? (
                    OtherTrustedContact.map((item, index) => {
                      return this.getElement(item, index, 'Other Contacts');
                    })
                  ) : (
                      <View style={{ height: wp('22%') + 30 }} />
                    )}
                  <TouchableOpacity
                    onPress={() => {
                      setTimeout(() => {
                        this.setState({
                          isLoadContacts: true,
                        });
                      }, 2);
                      this.AddContactAddressBookBottomSheet.current.snapTo(1);
                    }}
                    style={{
                      ...styles.selectedContactsView,
                      paddingBottom: 7,
                      paddingTop: 7,
                      marginTop: 0,
                    }}
                  >
                    <Image
                      style={styles.addGrayImage}
                      source={require('../assets/images/icons/icon_add_grey.png')}
                    />
                    <View>
                      <Text style={styles.contactText}>Add Contact</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {OtherTrustedContact.length == 0 &&
              IMKeeper.length == 0 &&
              MyKeeper.length == 0 && (
                <BottomInfoBox
                  title={'Note'}
                  infoText={
                    'All your contacts appear here when added to Hexa wallet'
                  }
                />
              )}
          </ScrollView>
        </View>
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={this.AddContactAddressBookBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('82%')
              : hp('82%'),
          ]}
          renderContent={this.renderAddContactAddressBookContents}
          renderHeader={this.renderAddContactAddressBookHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.HelpBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('87%')
              : hp('89%'),
          ]}
          renderContent={this.renderHelpContent}
          renderHeader={this.renderHelpHeader}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  let addressBookData = idx(state, (_) => _.trustedContacts.addressBook);
  let trustedContactsInfo = idx(
    state,
    (_) => _.trustedContacts.trustedContactsInfo,
  );
  return {
    regularAccount: idx(state, (_) => _.accounts[REGULAR_ACCOUNT].service),
    trustedContactsService: idx(state, (_) => _.trustedContacts.service),
    trustedChannelsSyncing: idx(
      state,
      (_) => _.trustedContacts.loading.trustedChannelsSync,
    ),
    addressBookData,
    trustedContactsInfo,
  };
};
export default connect(mapStateToProps, {
  trustedChannelsSync,
  updateAddressBookLocally,
  removeTrustedContact,
})(AddressBookContents);
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  phoneText: {
    marginTop: 3,
    marginLeft: 10,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginTop: 5,
    paddingBottom: 15,
    paddingTop: 15,
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
  },
  pageTitle: {
    marginLeft: 30,
    color: Colors.blue,
    fontSize: RFValue(14),
    fontFamily: Fonts.FiraSansRegular,
  },
  pageInfoText: {
    marginLeft: 30,
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 3,
  },
  watermarkViewBigText: {
    backgroundColor: Colors.backgroundColor,
    height: wp('5%'),
    width: wp('35%'),
    borderRadius: 10,
  },
  watermarkViewSmallText: {
    backgroundColor: Colors.backgroundColor,
    height: wp('3%'),
    width: wp('25%'),
    marginTop: 3,
    borderRadius: 10,
  },
  watermarkViewButton: {
    marginLeft: 'auto',
    backgroundColor: Colors.backgroundColor,
    height: wp('7%'),
    width: wp('18%'),
    borderRadius: 10,
  },
  watermarkViewArrow: {
    marginLeft: 20,
    backgroundColor: Colors.backgroundColor,
    height: wp('3%'),
    width: wp('3%'),
    borderRadius: wp('3%') / 2,
  },
  imageIconStyle: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('12%') / 2,
    resizeMode: 'contain',
  },
  imageIconViewStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.shadowBlue,
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('12%') / 2,
  },
  imageIconText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 13,
  },
  getImageView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  xpubViewStyle: {
    width: wp('15%'),
    height: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    marginRight: 10,
    borderRadius: 5,
  },
  xpubTextStyle: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  xpubIconView: {
    width: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 10,
  },
  waterMarkView: {
    marginBottom: 15,
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
  },
  waterMarkInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  waterMarkBigView: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  addGrayImage: {
    width: wp('10%'),
    height: wp('10%'),
    marginLeft: 5,
  },
});
