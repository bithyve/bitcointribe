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
  Modal,
  InteractionManager,
  ActivityIndicator
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
import Header from '../../navigation/stacks/Header'
import ModalContainer from '../../components/home/ModalContainer'
import { v4 as uuid } from 'uuid'

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
  keepers: ContactRecipientDescribing[];
  keeping: ContactRecipientDescribing[];
  otherContacts: ContactRecipientDescribing[];
  onRefresh: boolean;
  isShowingKnowMoreSheet: boolean;
  showLoader: boolean;
  showIndicator: boolean
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
      keepers: [],
      keeping: [],
      otherContacts: [],
      isShowingKnowMoreSheet: false,
      showLoader: false,
      showIndicator: false,
    }
  }

  componentDidMount = async() => {
    const { regularAccount } = this.props
    const { walletId } = regularAccount.hdWallet.getWalletId()
    requestAnimationFrame( () => {
      this.setUpFocusListener( walletId )
      this.props.syncPermanentChannels( {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.EXISTING_CONTACTS,
        metaSync: true,
      } )

    } )

  }

  componentDidUpdate( prevProps, prevState ) {
    requestAnimationFrame( () => {
      if (
        prevProps.trustedContactsService.tc.trustedContacts != this.props.trustedContactsService.tc.trustedContacts
      ) {

        // const { regularAccount } = this.props
        // const { walletId } = regularAccount.hdWallet.getWalletId()
        this.updateAddressBook()
      }

      if (
        prevProps.existingPermanentChannelsSynching !==
        this.props.existingPermanentChannelsSynching
      )
        this.setState( {
          showLoader: this.props.existingPermanentChannelsSynching,
        } )
    } )


  }

  componentWillUnmount() {
    ( this.focusListener )?.remove()
  }

  setUpFocusListener = ( walletId ) => {
    this.focusListener = this.props.navigation.addListener( 'didFocus', () => {

      this.setState( {
        showIndicator: true
      } )
      // this.props.syncPermanentChannels( {
      //   permanentChannelsSyncKind: PermanentChannelsSyncKind.NON_FINALIZED_CONTACTS,
      // } )
      this.updateAddressBook( walletId )
    } )
    this.props.navigation.setParams( {
      toggleKnowMoreSheet: this.toggleKnowMoreSheet,
    } )
  };

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
    const { trustedContactsService } = this.props
    const contacts = trustedContactsService.tc.trustedContacts

    const keepers = []
    const keeping = []
    const otherContacts = []

    for( const channelKey of Object.keys( contacts ) ){
      const contact = contacts[ channelKey ]
      const isGuardian =[ TrustedContactRelationTypes.KEEPER, TrustedContactRelationTypes.KEEPER_WARD ].includes( contact.relationType )
      const isWard = [ TrustedContactRelationTypes.WARD, TrustedContactRelationTypes.KEEPER_WARD ].includes( contact.relationType )

      if( contact.isActive ){
        if( isGuardian || isWard ){
          if( isGuardian ) keepers.push(  makeContactRecipientDescription(
            channelKey,
            contact,
            ContactTrustKind.KEEPER_OF_USER,
          ) )
          if( isWard ) keeping.push( makeContactRecipientDescription(
            channelKey,
            contact,
            ContactTrustKind.USER_IS_KEEPING,
          ) )
        } else otherContacts.push( makeContactRecipientDescription(
          channelKey,
          contact,
          ContactTrustKind.OTHER,
        ) )
      } else {
        // TODO: inject in expired contacts list
      }
    }

    this.setState( {
      keepers,
      keeping,
      otherContacts,
      showIndicator: false
    }
    )
    // } )
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
    contactDescription: ContactRecipientDescribing,
    index: number,
    contactType: string,
  ) {
    this.props.navigation.navigate( 'ContactDetails', {
      contact: contactDescription,
      index,
      contactsType: contactType,
    } )
  }


  renderContactItem = ( {
    contactDescription,
    index,
    contactsType,
  }: {
    contactDescription: ContactRecipientDescribing;
    index: number;
    contactsType: string;
  } ) => {
    return (
      <TouchableOpacity style={{
        alignItems: 'center',
        flex: 1
      }}
      key={index}
      >
        <RecipientAvatar recipient={contactDescription} contentContainerStyle={styles.avatarImage} />
        <Text style={{
          textAlign: 'center', marginTop: hp ( 0.5 )
        }}>{contactDescription.displayedName.split( ' ' )[ 0 ] + ' '} </Text>
      </TouchableOpacity>
    )
  };
  renderContactListItem = ( {
    contactDescription,
    index,
    contactsType,
  }: {
    contactDescription: ContactRecipientDescribing;
    index: number;
    contactsType: string;
  } ) => {
    return (
      <ListItem
        key={String( index )}
        bottomDivider
        onPress={() =>
          this.handleContactSelection( contactDescription, index, contactsType )
        }
        containerStyle={{
          backgroundColor: Colors.backgroundColor
        }}
      >
        <FriendsAndFamilyContactListItemContent contact={contactDescription} />
      </ListItem>
    )
  };

  renderAddContactAddressBookHeader = () => {
    return <ModalHeader />
  };

  render() {
    const { syncPermanentChannels, navigation } = this.props
    const { isLoadContacts } = this.state
    const {
      keepers,
      keeping,
      otherContacts,
      showLoader,
      showIndicator
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
        <Header fromScreen={'F&F'} />

        <View style={styles.accountCardsSectionContainer}>
          {showIndicator &&
            <ModalContainer visible={showIndicator} closeBottomSheet={() => {}}>
              <ActivityIndicator color={Colors.white} size='large'/>
            </ModalContainer>
          }
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
                <Text style={[ styles.contactText, {
                  fontSize: RFValue( 20 ), padding: wp( 0 )
                } ]}>+</Text>
                {/* <Image
                  style={styles.addGrayImage}
                  source={require( '../../assets/images/icons/icon_add_grey.png' )}
                /> */}
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
                {( keepers.length && keepers.map( ( item, index ) => {
                  return this.renderContactListItem( {
                    contactDescription: item,
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
              width: wp ( '95%' ), backgroundColor: Colors.white,  borderRadius: wp ( 3 ), marginTop: hp ( '3%' ), alignSelf: 'center'
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
                flexDirection: 'row',  alignSelf: 'flex-start', flex: 1, marginLeft: wp( 1 )
              }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {otherContacts.map( ( item, index ) => {
                    return this.renderContactItem( {
                      contactDescription: item,
                      index,
                      contactsType: 'Other Contacts',
                    } )
                  } )}
                </ScrollView>

              </View>
            </View>
            }

            <View style={{
              marginTop: wp( '5%' )
            }}>
              <View style={{
                marginBottom: 15
              }}>
                {keepers.length > 0 &&
                  <>
                    {keepers.length && keepers.map( ( item, index ) => {
                      return this.renderContactListItem( {
                        contactDescription: item,
                        index,
                        contactsType: 'My Keepers',
                      } )
                    } ) }
                  </>
                }
                {keeping.length > 0 &&
                  <>
                    {keeping.length && keeping.map( ( item, index ) => {
                      return this.renderContactListItem( {
                        contactDescription: item,
                        index,
                        contactsType: 'I\'m Keeper of',
                      } )
                    } ) }
                  </>
                }
                {otherContacts.length > 0 &&
                  <>
                    {otherContacts.length && otherContacts.map( ( item, index ) => {
                      return this.renderContactListItem( {
                        contactDescription: item,
                        index,
                        contactsType: 'Other Contacts',
                      } )
                    } ) }
                  </>
                }
              </View>
            </View>
            {
              keepers.length == 0 &&
            keeping.length == 0 &&
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
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  avatarImage: {
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: wp( 12 )/2,
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
    // padding: wp( 2 )
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
    backgroundColor: Colors.lightBlue,
    borderRadius: wp ( 2 ),
    // width: wp( 22 )
    padding: wp( 1 )
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
