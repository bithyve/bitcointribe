import React, { PureComponent } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Platform,
  ImageBackground,
  StatusBar,
  Modal
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import idx from 'idx'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  clearTrustedContactsCache,
  trustedChannelsSetupSync,
  removeTrustedContact,
  updateAddressBookLocally,
} from '../../store/actions/trustedContacts'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import {
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/wallet-service-types'
import { TrustedContactDerivativeAccountElements } from '../../bitcoin/utilities/Interface'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import BottomInfoBox from '../../components/BottomInfoBox'
import AddContactAddressBook from '../Contacts/AddContactAddressBook'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import ModalHeader from '../../components/ModalHeader'
import config from '../../bitcoin/HexaConfig'
import KnowMoreButton from '../../components/KnowMoreButton'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import AddressBookHelpContents from '../../components/Helper/AddressBookHelpContents'
import { NavigationScreenConfig } from 'react-navigation'
import { NavigationStackOptions } from 'react-navigation-stack'
import defaultStackScreenNavigationOptions from '../../navigation/options/DefaultStackScreenNavigationOptions'
import { ListItem } from 'react-native-elements'
import FriendsAndFamilyContactListItemContent from '../../components/friends-and-family/FriendsAndFamilyContactListItemContent'
import {
  ContactRecipientDescribing,
} from '../../common/data/models/interfaces/RecipientDescribing'
import { makeContactRecipientDescription } from '../../utils/sending/RecipientFactories'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import Loader from '../../components/loader'
import ImageStyles from '../../common/Styles/ImageStyles'
import RecipientAvatar from '../../components/RecipientAvatar'
import HomeHeader from '../../components/home/home-header_update'
import Header from '../../navigation/stacks/Header'
// import { SafeAreaView } from 'react-native-safe-area-context'

interface FriendsAndFamilyPropTypes {
  navigation: any;
  isFocused: boolean;
  regularAccount: RegularAccount;
  trustedContactsService: TrustedContactsService;
  trustedChannelsSetupSync: any;
  trustedChannelsSetupSyncing: any;
  updateAddressBookLocally: any;
  addressBookData: any;
  trustedContactsInfo: any;
  removeTrustedContact: any;
  clearTrustedContactsCache: any;
  containerStyle: {}
}
interface FriendsAndFamilyStateTypes {
  isLoadContacts: boolean;
  showModal: boolean;
  selectedContact: any[];
  loading: boolean;
  myKeepers: ContactRecipientDescribing[];
  contactsKeptByUser: ContactRecipientDescribing[];
  trustedContacts: ContactRecipientDescribing[];
  otherTrustedContacts: ContactRecipientDescribing[];
  onRefresh: boolean;
  isShowingKnowMoreSheet: boolean;
  showLoader: boolean;
}

class FriendsAndFamilyScreen extends PureComponent<
  FriendsAndFamilyPropTypes,
  FriendsAndFamilyStateTypes
> {
  // static navigationOptions = makeNavigationOptions;

  addContactAddressBookBottomSheetRef: React.RefObject<BottomSheet>;
  helpBottomSheetRef: React.RefObject<BottomSheet>;
  focusListener: any;

  constructor( props ) {
    super( props )

    this.focusListener = null
    this.addContactAddressBookBottomSheetRef = React.createRef<BottomSheet>()
    this.helpBottomSheetRef = React.createRef<BottomSheet>()

    this.state = {
      onRefresh: false,
      isLoadContacts: false,
      showModal: false,
      selectedContact: [],
      loading: true,
      trustedContacts: idx( props, ( _ ) => _.addressBookData.trustedContacts ) || [],
      myKeepers: idx( props, ( _ ) => _.addressBookData.MyKeeper ) || [],
      contactsKeptByUser: idx( props, ( _ ) => _.addressBookData.contactsKeptByUser ) || [],
      otherTrustedContacts:
        idx( props, ( _ ) => _.addressBookData.otherTrustedContacts ) || [],
      isShowingKnowMoreSheet: false,
      showLoader: false
    }
  }

  componentDidMount() {
    // console.log( '>>>>>>>>>. componentDidMount F&F >>>>>>>>' )
    this.focusListener = this.props.navigation.addListener( 'didFocus', () => {
      // console.log( 'F&F >>>' )

      this.props.trustedChannelsSetupSync()
      this.updateAddressBook()
    } )
    this.props.clearTrustedContactsCache()
    this.props.navigation.setParams( {
      toggleKnowMoreSheet: this.toggleKnowMoreSheet,
    } )
  }

  componentDidUpdate( prevProps, prevState ) {
    const oldDerivativeAccounts = idx(
      prevProps,
      ( _ ) => _.regularAccount.hdWallet.derivativeAccounts,
    )
    const newDerivativeAccounts = idx(
      this.props,
      ( _ ) => _.regularAccount.hdWallet.derivativeAccounts,
    )
    if (
      oldDerivativeAccounts !== newDerivativeAccounts ||
      prevProps.trustedContactsService != this.props.trustedContactsService
    ) {
      this.updateAddressBook()
    }
    if ( this.state.trustedContacts ) {
      this.setState( {
        loading: false,
      } )
    }
    if (
      prevProps.trustedChannelsSetupSyncing !==
      this.props.trustedChannelsSetupSyncing
    ) {
      this.setState( {
        showLoader: this.props.trustedChannelsSetupSyncing,
      } )
    }
  }

  componentWillUnmount() {
    this.focusListener.remove()
  }

  toggleKnowMoreSheet = () => {
    const shouldShow = !this.state.isShowingKnowMoreSheet

    this.setState( {
      isShowingKnowMoreSheet: shouldShow
    }, () => {
      if ( shouldShow ) {
        // this.helpBottomSheetRef.current?.snapTo( 1 )
      } else {
        this.helpBottomSheetRef.current?.snapTo( 0 )
      }
    } )
  };

  updateAddressBook = async () => {
    const { regularAccount, trustedContactsService } = this.props

    const { trustedContactsInfo } = this.props
    const myKeepers = []
    const contactsKeptByUser = []
    const otherTrustedContacts = []
    // console.log( 'trustedContactsInfo', trustedContactsInfo )
    if ( trustedContactsInfo ) {
      if ( trustedContactsInfo.length ) {
        const trustedContacts = []
        for ( let index = 0; index < trustedContactsInfo.length; index++ ) {
          const contactInfo = trustedContactsInfo[ index ]
          if ( !contactInfo ) continue
          const contactName = `${contactInfo.firstName} ${
            contactInfo.lastName ? contactInfo.lastName : ''
          }`
          let connectedVia
          if ( contactInfo.phoneNumbers && contactInfo.phoneNumbers.length ) {
            connectedVia = contactInfo.phoneNumbers[ 0 ].number
          } else if ( contactInfo.emails && contactInfo.emails.length ) {
            connectedVia = contactInfo.emails[ 0 ].email
          }

          let hasXpub = false
          const {
            trustedContactToDA,
            derivativeAccounts,
          } = regularAccount.hdWallet
          const accountNumber =
            trustedContactToDA[ contactName.toLowerCase().trim() ]
          if ( accountNumber ) {
            const trustedContact: TrustedContactDerivativeAccountElements =
              derivativeAccounts[ TRUSTED_CONTACTS ][ accountNumber ]
            if (
              trustedContact.contactDetails &&
              trustedContact.contactDetails.xpub
            ) {
              hasXpub = true
            }
          }

          const {
            isWard,
            trustedAddress,
            contactsWalletName,
            otp,
            lastSeen,
          } = trustedContactsService.tc.trustedContacts[
            contactName.toLowerCase().trim()
          ]

          let usesOTP = false
          if ( !connectedVia && otp ) {
            usesOTP = true
            connectedVia = otp
          }

          const hasTrustedAddress = !!trustedAddress

          const isGuardian = index < 3 ? true : false
          let shareIndex
          if ( isGuardian ) {
            shareIndex = index
          }

          const initiatedAt =
            trustedContactsService.tc.trustedContacts[
              contactName.toLowerCase().trim()
            ].ephemeralChannel.initiatedAt

          const hasTrustedChannel = trustedContactsService.tc.trustedContacts[
            contactName.toLowerCase().trim()
          ].symmetricKey
            ? true
            : false

          const element = {
            contactName:
              contactInfo.firstName === 'F&F request' && contactsWalletName
                ? contactsWalletName
                : contactName,
            connectedVia,
            usesOTP,
            hasXpub,
            hasTrustedAddress,
            isGuardian,
            isWard,
            initiatedAt,
            shareIndex,
            hasTrustedChannel,
            contactsWalletName,
            lastSeen,
            ...contactInfo,
          }
          trustedContacts.push( element )
          if ( element.isGuardian ) {
            const isRemovable = !element.hasTrustedChannel ? true : false // un-confirmed guardians are removable
            myKeepers.push( {
              ...element, isRemovable
            } )
          }
          if ( element.isWard ) {
            contactsKeptByUser.push( element )
          }
          if ( !element.isWard && !element.isGuardian ) {
            otherTrustedContacts.push( {
              ...element, isRemovable: true
            } )
          }
        }

        this.setState(
          {
            myKeepers: myKeepers,
            contactsKeptByUser,
            otherTrustedContacts,
            trustedContacts,
          },
          () =>
            this.props.updateAddressBookLocally( {
              MyKeeper: myKeepers,
              contactsKeptByUser,
              otherTrustedContacts,
              trustedContacts,
            } ),
        )
      }
    }
  };

  renderHelpHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          this.helpBottomSheetRef.current?.snapTo( 0 )
        }}
      />
    )
  };

  renderHelpContent = () => {
    return (
      <AddressBookHelpContents
        titleClicked={() => {
          this.helpBottomSheetRef.current?.snapTo( 0 )
        }}
      />
    )
  };

  handleContactSelection(
    backendContactInfo: unknown,
    index: number,
    contactType: string,
  ) {
    this.props.navigation.navigate( 'ContactDetails', {
      contact: backendContactInfo,
      index,
      contactsType: contactType,

      // TODO: Figure out what this is
      shareIndex: backendContactInfo.shareIndex,
    } )
  }


  renderContactItem = ( {
    backendContactInfo,
    contactDescription,
    index,
    contactsType,
  }: {
    backendContactInfo: unknown;
    contactDescription: ContactRecipientDescribing;
    index: number;
    contactsType: string;
  } ) => {
    return (
      <View style={{
        alignItems: 'center'
      }}>
        <RecipientAvatar recipient={contactDescription} contentContainerStyle={styles.avatarImage} />
        <Text style={{
          textAlign: 'center', marginTop: hp ( 0.5 )
        }}>{contactDescription.displayedName.split( ' ' )[ 0 ] + ' '} </Text>
      </View>
    )
  };
  renderContactListItem = ( {
    backendContactInfo,
    contactDescription,
    index,
    contactsType,
  }: {
    backendContactInfo: unknown;
    contactDescription: ContactRecipientDescribing;
    index: number;
    contactsType: string;
  } ) => {
    return (
      <ListItem
        key={String( index )}
        bottomDivider
        onPress={() =>
          this.handleContactSelection( backendContactInfo, index, contactsType )
        }
        containerStyle={{
          backgroundColor: 'transparent'
        }}
      >
        <FriendsAndFamilyContactListItemContent contact={contactDescription} />
      </ListItem>
    )
  };

  renderAddContactFriendsAndFamily = () => {
    const { navigation } = this.props
    const { isLoadContacts, selectedContact } = this.state
    if( !isLoadContacts ) return
    return (
      <AddContactAddressBook
        isLoadContacts={isLoadContacts}
        proceedButtonText={'Confirm & Proceed'}
        onPressContinue={() => {
          if ( selectedContact && selectedContact.length ) {
            navigation.navigate( 'AddContactSendRequest', {
              SelectedContact: selectedContact,
            } )
            this.addContactAddressBookBottomSheetRef.current?.snapTo( 0 )
            this.setState( {
              showModal: false,
            } )
          }
        }}
        onSelectContact={( selectedData ) => {
          this.setState( {
            selectedContact: selectedData,
          } )
        }}
        onPressBack={() => {
          this.addContactAddressBookBottomSheetRef.current?.snapTo( 0 )
          this.setState( {
            showModal: false,
          } )
        }}
        onSkipContinue={() => {
          let { skippedContactsCount } = this.props.trustedContactsService.tc
          let data
          if ( !skippedContactsCount ) {
            skippedContactsCount = 1
            data = {
              firstName: 'F&F request',
              lastName: `awaiting ${skippedContactsCount}`,
              name: `F&F request awaiting ${skippedContactsCount}`,
            }
          } else {
            data = {
              firstName: 'F&F request',
              lastName: `awaiting ${skippedContactsCount + 1}`,
              name: `F&F request awaiting ${skippedContactsCount + 1}`,
            }
          }

          navigation.navigate( 'AddContactSendRequest', {
            SelectedContact: [ data ],
          } )
          this.addContactAddressBookBottomSheetRef.current?.snapTo( 0 )
          this.setState( {
            showModal: false,
          } )
        }}
      />
    )
  };

  renderAddContactAddressBookHeader = () => {
    return <ModalHeader />
  };

  render() {
    const { trustedChannelsSetupSync } = this.props

    const {
      myKeepers: contactsKeepingUser,
      contactsKeptByUser: contactsKeptByUser,
      otherTrustedContacts: otherTrustedContacts,
      onRefresh,
      showLoader
    } = this.state
    return (
      <ImageBackground
        source={require( '../../assets/images/home-bg.png' )}
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
        }}
        imageStyle={{
          resizeMode: 'stretch',
        }}
      >
        <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
        <Header />
        {/* <View
          style={{
            flex: 3.8,
            paddingTop:
                Platform.OS == 'ios' && DeviceInfo.hasNotch
                  ? hp( '5%' )
                  : 0,
          }}
        >
          <HomeHeader
            onPressNotifications={this.onPressNotifications}
            navigateToQRScreen={this.navigateToQRScreen}
            notificationData={notificationData}
            walletName={walletName}
            getCurrencyImageByRegion={getCurrencyImageByRegion}
            netBalance={netBalance}
            exchangeRates={exchangeRates}
            CurrencyCode={currencyCode}
            navigation={navigation}
            currentLevel={currentLevel}
            //  onSwitchToggle={this.onSwitchToggle}
            // setCurrencyToggleValue={this.setCurrencyToggleValue}
            // navigation={this.props.navigation}
            // overallHealth={overallHealth}
          />
        </View> */}
        <View style={styles.accountCardsSectionContainer}>

          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={showLoader}
                onRefresh={() => {
                  trustedChannelsSetupSync()
                }}
              />
            }
            style={{
              flex: 1, marginBottom: hp( '6%' )
            }}
          >
            <View style={{
              marginTop: wp( '4%' ),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginHorizontal: wp ( 6 ),
            }}>
              <Text
                style={styles.pageTitle}
              >
              Friends & Family
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.setState( {
                    isLoadContacts: true,
                    showModal: true
                  }, () => {
                    this.addContactAddressBookBottomSheetRef.current.snapTo( 1 )
                  } )
                }}
                style={{
                  ...styles.selectedContactsView,
                }}
              >
                <Image
                  style={styles.addGrayImage}
                  source={require( '../../assets/images/icons/icon_add_grey.png' )}
                />
                <View>
                  <Text style={styles.contactText}>Add New</Text>
                </View>
              </TouchableOpacity>
              {/* <Text style={styles.pageTitle}>My Keepers</Text>
            <Text style={styles.pageInfoText}>
              Contacts who can help me restore my wallet
            </Text>

            <View style={{
              marginBottom: 15
            }}>
              <View style={{
                height: 'auto'
              }}>
                {( contactsKeepingUser.length > 0 &&
                  contactsKeepingUser.map( ( item, index ) => {
                    return this.renderContactListItem( {
                      backendContactInfo: item,
                      contactDescription: makeContactRecipientDescription(
                        item,
                        ContactTrustKind.KEEPER_OF_USER,
                      ),
                      index,
                      contactsType: 'My Keepers',
                    } )
                  } ) ) || <View style={{
                  height: wp( '22%' ) + 30
                }} />}
              </View>
            </View> */}
            </View>
            <View style={{
              width: wp ( '95%' ), height: hp ( '15%' ), backgroundColor: Colors.white,  borderRadius: wp ( 3 ), marginTop: hp ( '3%' ), alignSelf: 'center'
            }}>
              <Text
                style={styles.cardTitle}
              >
              Recently Sent
              </Text>
              <View style={{
                flexDirection: 'row',  alignSelf: 'flex-start', marginHorizontal: wp( 3 ), marginTop: hp ( '1%' )
              }}>
                {( otherTrustedContacts.length > 0 &&
                    otherTrustedContacts.map( ( item, index ) => {
                      return this.renderContactItem( {
                        backendContactInfo: item,
                        contactDescription: makeContactRecipientDescription(
                          item,
                          ContactTrustKind.OTHER,
                        ),
                        index,
                        contactsType: 'Other Contacts',
                      } )
                    } ) ) || <View style={{
                  height: wp( '22%' ) + 30
                }} />}
              </View>
            </View>


            <View >

            </View>

            {/* <View style={{
            marginTop: wp( '5%' )
          }}>
            <Text style={styles.pageTitle}>I am the Keeper of</Text>
            <Text style={styles.pageInfoText}>
              Contacts whose wallets I can help restore
            </Text>

            <View style={{
              marginBottom: 15
            }}>
              <View style={{
                height: 'auto'
              }}>
                {( contactsKeptByUser.length > 0 &&
                  contactsKeptByUser.map( ( item, index ) => {
                    return this.renderContactListItem( {
                      backendContactInfo: item,
                      contactDescription: makeContactRecipientDescription(
                        item,
                        ContactTrustKind.USER_IS_KEEPING,
                      ),
                      index,
                      contactsType: 'I\'m Keeper of',
                    } )
                  } ) ) || <View style={{
                  height: wp( '22%' ) + 30
                }} />}
              </View>
            </View>
          </View> */}

            <View style={{
              marginTop: wp( '5%' )
            }}>
              <View style={{
                marginBottom: 15
              }}>
                <View style={{
                  height: 'auto'
                }}>
                  {( otherTrustedContacts.length > 0 &&
                  otherTrustedContacts.map( ( item, index ) => {
                    return this.renderContactListItem( {
                      backendContactInfo: item,
                      contactDescription: makeContactRecipientDescription(
                        item,
                        ContactTrustKind.OTHER,
                      ),
                      index,
                      contactsType: 'Other Contacts',
                    } )
                  } ) ) || <View style={{
                    height: wp( '22%' ) + 30
                  }} />}
                </View>
              </View>
            </View>
            {otherTrustedContacts.length == 0 &&
            contactsKeepingUser.length == 0 &&
            contactsKeptByUser.length == 0 && (
              <BottomInfoBox
                title={'Note'}
                infoText={
                  'All your contacts appear here when added to Hexa wallet'
                }
              />
            )}
          </ScrollView>
          {showLoader ? <Loader /> : null}
          <Modal
            visible={this.state.showModal}
            onRequestClose={() => { this.setState( {
              showModal: false
            } ) }}
            transparent={true}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                // margin: 10
              }}
              activeOpacity={1}
              onPressOut={() => { this.setState( {
                showModal: false
              } ) }}
            >
              <BottomSheet
                enabledGestureInteraction={false}
                enabledInnerScrolling={true}
                ref={this.addContactAddressBookBottomSheetRef}
                snapPoints={[
                  -50,
                  Platform.OS == 'ios' && DeviceInfo.hasNotch()
                    ? hp( '82%' )
                    : hp( '82%' ),
                ]}
                renderContent={this.renderAddContactFriendsAndFamily}
                renderHeader={this.renderAddContactAddressBookHeader}
              />
            </TouchableOpacity>
          </Modal>
          <BottomSheet
            enabledInnerScrolling={true}
            enabledGestureInteraction={false}
            ref={this.helpBottomSheetRef}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp( '87%' )
                : hp( '89%' ),
            ]}
            renderContent={this.renderHelpContent}
            renderHeader={this.renderHelpHeader}
            onCloseEnd={() => {
              this.setState( {
                isShowingKnowMoreSheet: false
              } )
            }}
          />
        </View>
      </ImageBackground>
    )
  }
}

const mapStateToProps = ( state ) => {
  const addressBookData = idx( state, ( _ ) => _.trustedContacts.addressBook )
  const trustedContactsInfo = idx(
    state,
    ( _ ) => _.trustedContacts.trustedContactsInfo,
  )

  return {
    regularAccount: idx( state, ( _ ) => _.accounts[ REGULAR_ACCOUNT ].service ),
    trustedContactsService: idx( state, ( _ ) => _.trustedContacts.service ),
    trustedChannelsSetupSyncing: idx(
      state,
      ( _ ) => _.trustedContacts.loading.trustedChannelsSetupSync,
    ),
    addressBookData,
    trustedContactsInfo,
  }
}

export default connect( mapStateToProps, {
  trustedChannelsSetupSync,
  updateAddressBookLocally,
  removeTrustedContact,
  clearTrustedContactsCache
} )( FriendsAndFamilyScreen )

const styles = StyleSheet.create( {
  avatarImage: {
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: wp( 14 )/2,
    marginHorizontal: wp ( 1 )
  },
  accountCardsSectionContainer: {
    flex: 13,
    // marginTop: 30,
    backgroundColor: Colors.backgroundColor,
    borderTopLeftRadius: 25,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 2,
      height: -1,
    },
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  contactText: {
    // marginLeft: 10,
    marginHorizontal: wp ( 1 ),
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  phoneText: {
    marginTop: 3,
    marginLeft: 10,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  selectedContactsView: {
    // marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // marginRight: 20,
    // marginTop: 5,
    // paddingBottom: 15,
    // paddingTop: 15,
    // borderBottomWidth: 1,
    // borderColor: Colors.borderColor,
    backgroundColor: Colors.blue,
    borderRadius: wp ( 2 )
  },
  pageTitle: {
    color: Colors.blue,
    fontSize: RFValue( 16 ),
    // fontFamily: Fonts.FiraSansRegular,
    fontFamily: Fonts.FiraSansMedium,
  },
  cardTitle: {
    color: Colors.blue,
    fontSize: RFValue( 12 ),
    // fontFamily: Fonts.FiraSansRegular,
    fontFamily: Fonts.FiraSansMedium,
    marginVertical: wp( 2 ),
    marginHorizontal: wp( 4 )
  },
  pageInfoText: {
    marginLeft: 30,
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 3,
  },
  imageIconStyle: {
    width: wp( '12%' ),
    height: wp( '12%' ),
    borderRadius: wp( '12%' ) / 2,
    resizeMode: 'contain',
  },
  imageIconViewStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.shadowBlue,
    width: wp( '12%' ),
    height: wp( '12%' ),
    borderRadius: wp( '12%' ) / 2,
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
  xpubIconView: {
    width: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 10,
  },
  addGrayImage: {
    width: wp( '10%' ),
    height: wp( '10%' ),
    marginLeft: 5,
  },
} )

function makeNavigationOptions( { navigation, } ): NavigationScreenConfig<NavigationStackOptions, any> {
  return {
    ...defaultStackScreenNavigationOptions,

    title: 'Friends and Family',

    headerRight: () => {
      return (
        <KnowMoreButton onpress={navigation.getParam( 'toggleKnowMoreSheet' )} />
      )
    },
  }
}
