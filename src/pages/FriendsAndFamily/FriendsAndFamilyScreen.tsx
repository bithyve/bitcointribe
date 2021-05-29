import React, { PureComponent } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  RefreshControl,
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
  syncExistingPermanentChannels,
  removeTrustedContact,
} from '../../store/actions/trustedContacts'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import {
  REGULAR_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import { TrustedContactRelationTypes, UnecryptedStreamData } from '../../bitcoin/utilities/Interface'
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
import useStreamFromPermanentChannel from '../../utils/hooks/trusted-contacts/UseStreamFromPermanentChannel'

interface FriendsAndFamilyPropTypes {
  navigation: any;
  isFocused: boolean;
  regularAccount: RegularAccount;
  trustedContactsService: TrustedContactsService;
  syncExistingPermanentChannels: any;
  existingPermanentChannelsSynching: any;
  removeTrustedContact: any;
  clearTrustedContactsCache: any;
}
interface FriendsAndFamilyStateTypes {
  isLoadContacts: boolean;
  selectedContact: any[];
  loading: boolean;
  myKeepers: any[];
  ImKeeping: any[];
  otherContacts: any[];
  onRefresh: boolean;
  isShowingKnowMoreSheet: boolean;
  showLoader: boolean;
}

class FriendsAndFamilyScreen extends PureComponent<
  FriendsAndFamilyPropTypes,
  FriendsAndFamilyStateTypes
> {
  static navigationOptions = makeNavigationOptions;

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
      selectedContact: [],
      loading: true,
      myKeepers: [],
      ImKeeping: [],
      otherContacts: [],
      isShowingKnowMoreSheet: false,
      showLoader: false
    }
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener( 'didFocus', () => {
      this.props.syncExistingPermanentChannels( {
        inProgressChannelsOnly: true
      } )
      this.updateAddressBook()
    } )
    this.props.clearTrustedContactsCache()
    this.props.navigation.setParams( {
      toggleKnowMoreSheet: this.toggleKnowMoreSheet,
    } )
  }

  componentDidUpdate( prevProps, prevState ) {
    if (
      prevProps.trustedContactsService.tc.trustedContactsV2 != this.props.trustedContactsService.tc.trustedContactsV2
    ) this.updateAddressBook()

    if (
      prevProps.existingPermanentChannelsSynching !==
      this.props.existingPermanentChannelsSynching
    )
      this.setState( {
        showLoader: this.props.existingPermanentChannelsSynching,
      } )

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
        this.helpBottomSheetRef.current?.snapTo( 1 )
      } else {
        this.helpBottomSheetRef.current?.snapTo( 0 )
      }
    } )
  };

  updateAddressBook = async () => {
    const { trustedContactsService, regularAccount } = this.props
    const contacts = trustedContactsService.tc.trustedContactsV2
    const { walletId } = regularAccount.hdWallet.getWalletId()

    const myKeepers = []
    const ImKeeping = []
    const otherContacts = []

    for( const contact of Object.values( contacts ) ){
      const { contactDetails, relationType, unencryptedPermanentChannel } = contact
      const stream: UnecryptedStreamData = useStreamFromPermanentChannel( walletId, unencryptedPermanentChannel, true )

      const fnf = {
        id: contactDetails.id,
        contactName: contactDetails.contactName,
        connectedVia: contactDetails.info,
        image: contactDetails.image,
        // usesOTP,
        // hasXpub,
        // hasTrustedAddress,
        relationType,
        isGuardian: [ TrustedContactRelationTypes.KEEPER, TrustedContactRelationTypes.KEEPER_WARD ].includes( relationType ),
        isWard: [ TrustedContactRelationTypes.WARD, TrustedContactRelationTypes.KEEPER_WARD ].includes( relationType ),
        contactsWalletName: idx( stream, ( _ ) => _.primaryData.walletName ),
        lastSeen: idx( stream, ( _ ) => _.metaData.flags.lastSeen ),
        isFinalized: stream? true: false,
      }

      if( fnf.isGuardian || fnf.isWard ){
        if( fnf.isGuardian ) myKeepers.push( fnf )
        if( fnf.isWard ) ImKeeping.push( fnf )
      } else otherContacts.push( fnf )
    }

    this.setState( {
      myKeepers,
      ImKeeping,
      otherContacts
    }
    )

    // if ( trustedContactsInfo ) {
    //   if ( trustedContactsInfo.length ) {
    //     const trustedContacts = []
    //     for ( let index = 0; index < trustedContactsInfo.length; index++ ) {
    //       const contactInfo = trustedContactsInfo[ index ]
    //       if ( !contactInfo ) continue
    //       const contactName = `${contactInfo.firstName} ${
    //         contactInfo.lastName ? contactInfo.lastName : ''
    //       }`
    //       let connectedVia
    //       if ( contactInfo.phoneNumbers && contactInfo.phoneNumbers.length ) {
    //         connectedVia = contactInfo.phoneNumbers[ 0 ].number
    //       } else if ( contactInfo.emails && contactInfo.emails.length ) {
    //         connectedVia = contactInfo.emails[ 0 ].email
    //       }

    //       let hasXpub = false
    //       const {
    //         trustedContactToDA,
    //         derivativeAccounts,
    //       } = regularAccount.hdWallet
    //       const accountNumber =
    //         trustedContactToDA[ contactName.toLowerCase().trim() ]
    //       if ( accountNumber ) {
    //         const trustedContact: TrustedContactDerivativeAccountElements =
    //           derivativeAccounts[ TRUSTED_CONTACTS ][ accountNumber ]
    //         if (
    //           trustedContact.contactDetails &&
    //           trustedContact.contactDetails.xpub
    //         ) {
    //           hasXpub = true
    //         }
    //       }

    //       const {
    //         isWard,
    //         trustedAddress,
    //         contactsWalletName,
    //         otp,
    //         lastSeen,
    //       } = trustedContactsService.tc.trustedContacts[
    //         contactName.toLowerCase().trim()
    //       ]

    //       let usesOTP = false
    //       if ( !connectedVia && otp ) {
    //         usesOTP = true
    //         connectedVia = otp
    //       }

    //       const hasTrustedAddress = !!trustedAddress

    //       const isGuardian = index < 3 ? true : false
    //       let shareIndex
    //       if ( isGuardian ) {
    //         shareIndex = index
    //       }

    //       const initiatedAt =
    //         trustedContactsService.tc.trustedContacts[
    //           contactName.toLowerCase().trim()
    //         ].ephemeralChannel.initiatedAt

    //       const hasTrustedChannel = trustedContactsService.tc.trustedContacts[
    //         contactName.toLowerCase().trim()
    //       ].symmetricKey
    //         ? true
    //         : false

    //       const element = {
    //         contactName:
    //           contactInfo.firstName === 'F&F request' && contactsWalletName
    //             ? contactsWalletName
    //             : contactName,
    //         connectedVia,
    //         usesOTP,
    //         hasXpub,
    //         hasTrustedAddress,
    //         isGuardian,
    //         isWard,
    //         initiatedAt,
    //         shareIndex,
    //         hasTrustedChannel,
    //         contactsWalletName,
    //         lastSeen,
    //         ...contactInfo,
    //       }
    //       trustedContacts.push( element )
    //       if ( element.isGuardian ) {
    //         const isRemovable = !element.hasTrustedChannel ? true : false // un-confirmed guardians are removable
    //         myKeepers.push( {
    //           ...element, isRemovable
    //         } )
    //       }
    //       if ( element.isWard ) {
    //         contactsKeptByUser.push( element )
    //       }
    //       if ( !element.isWard && !element.isGuardian ) {
    //         otherTrustedContacts.push( {
    //           ...element, isRemovable: true
    //         } )
    //       }
    //     }

    //     this.setState(
    //       {
    //         myKeepers: myKeepers,
    //         contactsKeptByUser,
    //         otherTrustedContacts,
    //         trustedContacts,
    //       },
    //       () =>
    //         this.props.updateAddressBookLocally( {
    //           MyKeeper: myKeepers,
    //           contactsKeptByUser,
    //           otherTrustedContacts,
    //           trustedContacts,
    //         } ),
    //     )
    //   }
    // }
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
    } )
  }

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
          }
        }}
        onSelectContact={( selectedData ) => {
          this.setState( {
            selectedContact: selectedData,
          } )
        }}
        onPressBack={() => {
          this.addContactAddressBookBottomSheetRef.current?.snapTo( 0 )
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
        }}
      />
    )
  };

  renderAddContactAddressBookHeader = () => {
    return <ModalHeader />
  };

  render() {
    const { syncExistingPermanentChannels } = this.props

    const {
      myKeepers,
      ImKeeping,
      otherContacts,
      showLoader
    } = this.state
    return (
      <>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={showLoader}
              onRefresh={() => {
                syncExistingPermanentChannels( {
                  inProgressChannelsOnly: true
                } )
              }}
            />
          }
          style={{
            flex: 1, marginBottom: hp( '6%' )
          }}
        >
          <View style={{
            marginTop: wp( '2%' )
          }}>
            <Text style={styles.pageTitle}>My Keepers</Text>
            <Text style={styles.pageInfoText}>
              Contacts who can help me restore my wallet
            </Text>

            <View style={{
              marginBottom: 15
            }}>
              <View style={{
                height: 'auto'
              }}>
                {( myKeepers.length && myKeepers.map( ( item, index ) => {
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
            </View>
          </View>

          <View style={{
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
                {( ImKeeping.length && ImKeeping.filter( ( item, index ) => {
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
          </View>

          <View style={{
            marginTop: wp( '5%' )
          }}>
            <Text style={styles.pageTitle}>Other Contacts</Text>
            <Text style={styles.pageInfoText}>
              Contacts who I can pay directly
            </Text>

            <View style={{
              marginBottom: 15
            }}>
              <View style={{
                height: 'auto'
              }}>
                {( otherContacts.length && otherContacts.map( ( item, index ) => {
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

                <TouchableOpacity
                  onPress={() => {
                    this.setState( {
                      isLoadContacts: true,
                    } )
                    this.addContactAddressBookBottomSheetRef.current.snapTo( 1 )
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
                    source={require( '../../assets/images/icons/icon_add_grey.png' )}
                  />
                  <View>
                    <Text style={styles.contactText}>Add a Contact</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {
            myKeepers.length == 0 &&
            ImKeeping.length == 0 &&
            otherContacts.length == 0 && (
              <BottomInfoBox
                title={'Note'}
                infoText={
                  'All your contacts appear here when added to Hexa wallet'
                }
              />
            )}
        </ScrollView>
        {showLoader ? <Loader /> : null}

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
      </>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    regularAccount: idx( state, ( _ ) => _.accounts[ REGULAR_ACCOUNT ].service ),
    trustedContactsService: idx( state, ( _ ) => _.trustedContacts.service ),
    existingPermanentChannelsSynching: idx(
      state,
      ( _ ) => _.trustedContacts.loading.existingPermanentChannelsSynching,
    ),
  }
}

export default connect( mapStateToProps, {
  syncExistingPermanentChannels,
  removeTrustedContact,
  clearTrustedContactsCache
} )( FriendsAndFamilyScreen )

const styles = StyleSheet.create( {
  contactText: {
    marginLeft: 10,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  phoneText: {
    marginTop: 3,
    marginLeft: 10,
    fontSize: RFValue( 10 ),
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
    fontSize: RFValue( 14 ),
    fontFamily: Fonts.FiraSansRegular,
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
