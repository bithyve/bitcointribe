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
  syncPermanentChannels,
  PermanentChannelsSyncKind,
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
import ImageStyles from '../../common/Styles/ImageStyles'
import RecipientAvatar from '../../components/RecipientAvatar'
import HomeHeader from '../../components/home/home-header_update'
import Header from '../../navigation/stacks/Header'
// import { SafeAreaView } from 'react-native-safe-area-context'
import useStreamFromPermanentChannel from '../../utils/hooks/trusted-contacts/UseStreamFromPermanentChannel'
import ModalContainer from '../../components/home/ModalContainer'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'

interface FriendsAndFamilyPropTypes {
  navigation: any;
  isFocused: boolean;
  regularAccount: RegularAccount;
  trustedContactsService: TrustedContactsService;
  syncPermanentChannels: any;
  existingPermanentChannelsSynching: any;
  clearTrustedContactsCache: any;
  containerStyle: {}
}
interface FriendsAndFamilyStateTypes {
  isLoadContacts: boolean;
  showModal: boolean;
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
      loading: true,
      myKeepers: [],
      ImKeeping: [],
      otherContacts: [],
      isShowingKnowMoreSheet: false,
      showLoader: false
    }
  }

  componentDidMount() {
    console.log( '>>>>>>>>>. componentDidMount F&F >>>>>>>>' )
    this.focusListener = this.props.navigation.addListener( 'didFocus', () => {
      // this.props.syncPermanentChannels( {
      //   permanentChannelsSyncKind: PermanentChannelsSyncKind.NON_FINALIZED_CONTACTS,
      // } )
      this.updateAddressBook()
    } )
    this.props.navigation.setParams( {
      toggleKnowMoreSheet: this.toggleKnowMoreSheet,
    } )
  }

  componentDidUpdate( prevProps, prevState ) {
    if (
      prevProps.trustedContactsService.tc.trustedContacts != this.props.trustedContactsService.tc.trustedContacts
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
        // this.helpBottomSheetRef.current?.snapTo( 1 )
      } else {
        this.helpBottomSheetRef.current?.snapTo( 0 )
      }
    } )
  };

  updateAddressBook = async () => {
    const { trustedContactsService, regularAccount } = this.props
    const contacts = trustedContactsService.tc.trustedContacts
    const { walletId } = regularAccount.hdWallet.getWalletId()

    const myKeepers = []
    const ImKeeping = []
    const otherContacts = []

    for( const channelKey of Object.keys( contacts ) ){
      const contact = contacts[ channelKey ]
      const { contactDetails, relationType } = contact
      const stream: UnecryptedStreamData = useStreamFromContact( contact, walletId, true )

      const fnf = {
        id: contactDetails.id,
        isActive: contact.isActive,
        channelKey,
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
      //  feature/2.0

      if( fnf.isActive ){
        if( fnf.isGuardian || fnf.isWard ){
          if( fnf.isGuardian ) myKeepers.push( fnf )
          if( fnf.isWard ) ImKeeping.push( fnf )
        } else otherContacts.push( fnf )
      } else {
        // TODO: inject in expired contacts list
      }
    }

    this.setState( {
      myKeepers,
      ImKeeping,
      otherContacts
    }
    )
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
          backgroundColor: Colors.backgroundColor
        }}
      >
        <FriendsAndFamilyContactListItemContent contact={contactDescription} />
      </ListItem>
    )
  };


  render() {
    const { syncPermanentChannels, navigation } = this.props
    const { isLoadContacts } = this.state
    const {
      myKeepers,
      ImKeeping,
      otherContacts,
      showLoader,
      showModal
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
        <View style={styles.accountCardsSectionContainer}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={showLoader}
                onRefresh={() => {
                  syncPermanentChannels( {
                    permanentChannelsSyncKind: PermanentChannelsSyncKind.EXISTING_CONTACTS,
                  } )
                }}
              />
            }
            style={{
              flex: 1
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
                  }, () => {
                    navigation.navigate( 'AddContact' )
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
            </View> */}
            </View>
            {otherContacts.length > 0 &&
            <View style={{
              width: wp ( '95%' ), height: hp ( '15%' ), backgroundColor: Colors.white,  borderRadius: wp ( 3 ), marginTop: hp ( '3%' ), alignSelf: 'center'
            }}>
              <View style={{
                flexDirection: 'row',  justifyContent: 'space-between'
              }}>
                <Text
                  style={styles.cardTitle}
                >
            Recently Sent
                </Text>
                <TouchableOpacity>
                  <Image
                    style={styles.moreImage}
                    source={require( '../../assets/images/icons/icon_more.png' )}
                  />
                </TouchableOpacity>
              </View>


              <View style={{
                flexDirection: 'row',  alignSelf: 'flex-start', marginTop: hp ( '1%' )
              }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {otherContacts.map( ( item, index ) => {
                    return this.renderContactItem( {
                      backendContactInfo: item,
                      contactDescription: makeContactRecipientDescription(
                        item,
                        ContactTrustKind.OTHER,
                      ),
                      index,
                      contactsType: 'Other Contacts',
                    } )
                  } ) || <View style={{
                    height: wp( '22%' ) + 30
                  }} />}
                </ScrollView>

              </View>
            </View>
            }
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
                {( ImKeeping.length && ImKeeping.map( ( item, index ) => {
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

                  {myKeepers.length > 0 &&
                  <>
                    {myKeepers.map( ( item, index ) => {
                      return this.renderContactListItem( {
                        backendContactInfo: item,
                        contactDescription: makeContactRecipientDescription(
                          item,
                          ContactTrustKind.KEEPER_OF_USER,
                        ),
                        index,
                        contactsType: 'My Keepers',
                      } )
                    } )}
                  </>
                  }
                  {ImKeeping.length > 0 &&
                  <>
                    {ImKeeping.map( ( item, index ) => {
                      return this.renderContactListItem( {
                        backendContactInfo: item,
                        contactDescription: makeContactRecipientDescription(
                          item,
                          ContactTrustKind.USER_IS_KEEPING,
                        ),
                        index,
                        contactsType: 'I\'m Keeper of',
                      } )
                    } )}
                  </>
                  }
                  {otherContacts.length > 0 &&
                  <>
                    {otherContacts.map( ( item, index ) => {
                      return this.renderContactListItem( {
                        backendContactInfo: item,
                        contactDescription: makeContactRecipientDescription(
                          item,
                          ContactTrustKind.OTHER,
                        ),
                        index,
                        contactsType: 'Other Contacts',
                      } )
                    } )}
                  </>
                  }
                  {/* <TouchableOpacity
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
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
            {/* <View style={{
              flex: 1,
              // alignSelf: 'flex-end'
            }}> */}
            {
              myKeepers.length == 0 &&
            ImKeeping.length == 0 &&
            otherContacts.length == 0 && (
                // feature/2.0
                <BottomInfoBox
                  title={'Note'}
                  infoText={
                    'All your contacts appear here when added to Hexa wallet'
                  }
                />
              )}
            {/* </View> */}

          </ScrollView>
        </View>
        {showLoader ? <Loader /> : null}
        {/* <ModalContainer visible={showModal} closeBottomSheet={() => this.setState( {
          showModal: false,
        } )} >
          <AddContactAddressBook
            isLoadContacts={isLoadContacts}
            proceedButtonText={'Confirm & Proceed'}
          />
        </ModalContainer> */}
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
      </ImageBackground>
    /* feature/2.0 */
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
  syncPermanentChannels,
} )( FriendsAndFamilyScreen )

const styles = StyleSheet.create( {
  avatarImage: {
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: wp( 14 )/2,
    marginHorizontal: wp ( 1 )
  },
  accountCardsSectionContainer: {
    flex: 16,
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
  moreImage: {
    width: wp( '10%' ),
    height: wp( '10%' ),
  }
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
