import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  Image
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
import {
  REGULAR_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import { KeeperInfoInterface, TrustedContactRelationTypes, Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import BottomInfoBox from '../../components/BottomInfoBox'
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
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { LocalizationContext } from '../../common/content/LocContext'
import ArrowRight from '../../assets/images/svgs/icon_arrow_right.svg'
import GiftIcon from '../../assets/images/svgs/gift_icon.svg'

import LinearGradient from 'react-native-linear-gradient'
interface FriendsAndFamilyPropTypes {
  navigation: any;
  isFocused: boolean;
  trustedContacts: Trusted_Contacts;
  syncPermanentChannels: any;
  existingPermanentChannelsSynching: any;
  clearTrustedContactsCache: any;
  containerStyle: {},
  keeperInfo: KeeperInfoInterface[]
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
  showIndicator: boolean;
  addFnF: boolean;
  activeIndex: number | null;
}

class FriendsAndFamilyScreen extends React.Component<
  FriendsAndFamilyPropTypes,
  FriendsAndFamilyStateTypes
> {
  // static navigationOptions = makeNavigationOptions;
  static contextType = LocalizationContext

  addContactAddressBookBottomSheetRef: React.RefObject<BottomSheet>;
  helpBottomSheetRef: React.RefObject<BottomSheet>;
  focusListener: any;
  strings: object;

  constructor( props, context ) {
    super( props, context )

    this.focusListener = null
    this.addContactAddressBookBottomSheetRef = React.createRef<BottomSheet>()
    this.helpBottomSheetRef = React.createRef<BottomSheet>()
    this.strings = this.context.translations[ 'f&f' ]
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
      addFnF: false,
      activeIndex: null
    }
  }

  componentDidMount = async() => {
    requestAnimationFrame( () => {
      this.props.syncPermanentChannels( {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.EXISTING_CONTACTS,
        metaSync: true,
      } )
    } )
  }

  componentDidUpdate( prevProps, prevState ) {
    requestAnimationFrame( () => {
      if (
        prevProps.trustedContacts != this.props.trustedContacts
      ) {
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

  setUpFocusListener = ( ) => {
    this.focusListener = this.props.navigation.addListener( 'didFocus', () => {

      this.setState( {
        showIndicator: true
      } )
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
    const { trustedContacts, keeperInfo } = this.props

    const keepers = []
    const keeping = []
    const otherContacts = []

    for( const channelKey of Object.keys( trustedContacts ) ){
      const contact = trustedContacts[ channelKey ]

      const isGuardian =[ TrustedContactRelationTypes.KEEPER, TrustedContactRelationTypes.KEEPER_WARD, TrustedContactRelationTypes.PRIMARY_KEEPER ].includes( contact.relationType )
      const isWard = [ TrustedContactRelationTypes.WARD, TrustedContactRelationTypes.KEEPER_WARD ].includes( contact.relationType )
      if( contact.isActive ){
        if( isGuardian || isWard ){
          if( isGuardian && ( contact.contactDetails.contactName != 'Personal Copy' && contact.contactDetails.contactName != 'Personal Device 1' && contact.contactDetails.contactName != 'Personal Device 2' && contact.contactDetails.contactName != 'Personal Device 3' ) ) keepers.push(  makeContactRecipientDescription(
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
        onPress={() =>
          this.handleContactSelection( contactDescription, index, contactsType )
        }
        containerStyle={{
          backgroundColor: Colors.backgroundColor1,
          paddingHorizontal: wp( 3 )
        }}
      >
        <FriendsAndFamilyContactListItemContent contact={contactDescription} index={index} />
      </ListItem>
    )
  };

  renderAddContactAddressBookHeader = () => {
    return <ModalHeader />
  };
  renderAddFnFModal = () => {
    const { activeIndex } = this.state
    return(
      <View style={{
        ...styles.modalContentContainer,
      }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {this.setState( {
            addFnF: false
          } )}}
          style={styles.closeButton}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
          }} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Friends & Family</Text>
        <Text style={styles.subTitle}>Add a new contact, or invite a ward Lorem ipsum dolor sit amet, consectetur adipiscing elit</Text>
        <TouchableOpacity
          onPress={() => this.setState( {
            activeIndex: 0
          } )}
          style={[ styles.cardView, {
            backgroundColor: activeIndex === 0 ?  Colors.lightBlue: Colors.backgroundColor1
          } ]}>
          <View style={styles.cardSubView}>
            <View style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              // borderWidth: 0.3,
              // borderColor: Colors.borderColor,
              backgroundColor: Colors.white,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 10,
              // shadowColor: Colors.gray,
              shadowOpacity: 0.1,
              shadowOffset: {
                width: 1, height: 1
              },
            }}>
              {activeIndex === 0 &&
                    <Image
                      style={{
                        width: '100%', height: '100%'
                      }}
                      source={require( '../../assets/images/icons/checkmark.png' )}
                    />
              }
            </View>
            {activeIndex === 0 ?
              <Image
                style={styles.icon}
                source={require( '../../assets/images/icons/phone-bookFnF.png' )}
              />
              :
              <Image
                style={styles.icon}
                source={require( '../../assets/images/icons/phone-book_white.png' )}
              />
            }

            <View style={{
              // width: '70%',
              flex: 1,
            }} >
              <Text style={{
                fontSize: RFValue( 13 ), fontFamily: activeIndex === 0 ? Fonts.Medium : Fonts.Regular, color: activeIndex === 0 ? Colors.white : Colors.black
              }}>
                   Add Contacts
              </Text>
              <Text style={[ styles.cardSubText, {
                color: activeIndex === 0 ? Colors.white : Colors.textColorGrey,
              } ]}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              </Text>
            </View>
          </View>
          {/* {isSelected && ( */}


          {/* )} */}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.setState( {
            activeIndex: 1
          } )}
          style={[ styles.cardView, {
            backgroundColor: activeIndex === 1 ?  Colors.lightBlue: Colors.backgroundColor1,
            marginTop: 0
          } ]}>
          <View style={styles.cardSubView}>
            <View style={styles.imageView}>
              {activeIndex === 1 &&
                    <Image
                      style={{
                        width: '100%', height: '100%'
                      }}
                      source={require( '../../assets/images/icons/checkmark.png' )}
                    />
              }
            </View>
            <Image
              style={styles.icon}
              source={require( '../../assets/images/icons/icon_f&F_white.png' )}
            />
            <View style={{
              // width: '70%',
              flex: 1
            }} >

              <Text style={{
                fontSize: RFValue( 13 ), fontFamily: activeIndex === 1 ? Fonts.Medium : Fonts.Regular, color:  activeIndex === 1 ? Colors.white : Colors.black
              }}>
                    Add a Ward
              </Text>
              <Text style={[ styles.cardSubText, {
                color: activeIndex === 1 ? Colors.white : Colors.textColorGrey,
              } ]}>
                    Need text to be replaced
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => this.setState( {
            activeIndex: 2
          } )}
          style={{
            marginTop: hp( 3 ),
            width: '95%',  height: hp( '12%' ),
            alignSelf: 'center', justifyContent: 'center',
            borderRadius: wp( '4' ),
            // marginVertical: hp( '3%' )
          }}>
          <View style={{
            flexDirection:'row',
            // alignItems: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: wp( '5%' ),
          }}>
            <View style={styles.imageView}>
              {activeIndex === 2 &&
                    <Image
                      style={{
                        width: '100%', height: '100%'
                      }}
                      source={require( '../../assets/images/icons/checkmark.png' )}
                    />
              }
            </View>

            <Text style={{
              fontSize: RFValue( 11 ), fontFamily: Fonts.Regular, color: Colors.textColorGrey,
              marginHorizontal: wp( 3 ),
              width: '95%', flex: 1
            }}>
                    Gift Sats when sending invite Gift Sats when sending invite Gift Sats when sending invite
            </Text>
          </View>
          {/* {isSelected && ( */}


          {/* )} */}
        </TouchableOpacity>
        {this.setButtonVisible()}
      </View>
    )
  }

  setButtonVisible = () => {
    return (
      <TouchableOpacity
        onPress={async () => {
          if ( this.state.activeIndex === 0 ) {
            this.setState( {
              isLoadContacts: true,
              addFnF: false
            }, () => {
              this.props.navigation.navigate( 'AddContact' )
            } )
          } else {
            // showEncryptionPswd( false )
          }
        }}
        style={{
          ...styles.buttonView, elevation: 5
        }}
      >
        {/* {!loading.initializing ? ( */}
        <Text style={styles.buttonText}>Proceed</Text>
        {/* ) : (
          <ActivityIndicator size="small" />
        )} */}
      </TouchableOpacity>
    )
  }

  onAllGiftClick = () => {
    this.props.navigation.navigate('GiftStack')
  }

  render() {
    const { syncPermanentChannels, navigation } = this.props
    const { isLoadContacts, addFnF } = this.state
    const {
      keepers,
      keeping,
      otherContacts,
      showLoader,
      showIndicator
    } = this.state
    return (
      <View style={{
        backgroundColor: Colors.darkBlue
      }}>
        <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
        {/* <Header fromScreen={'F&F'} /> */}
        {/* {addFnF && */}
        {/* <ModalContainer visible={addFnF} closeBottomSheet={() => {}}>
          {this.renderAddFnFModal()}
        </ModalContainer> */}
        {/* } */}
        <View style={styles.accountCardsSectionContainer}>
          {showIndicator &&
            <ModalContainer onBackground={()=>this.setState( {
              showIndicator: false
            } )} visible={showIndicator} closeBottomSheet={() => {}}>
              <ActivityIndicator color={Colors.white} size='large'/>
            </ModalContainer>
          }

          {/* <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: wp( 4 ),
              paddingHorizontal: wp( 4 ),
              alignItems: 'center'
            }}>
              <Text style={{
                color: Colors.blue,
                fontSize: RFValue( 16 ),
                marginLeft: 2,
                fontFamily: Fonts.Medium,

              }}>
              My Accounts
              </Text>
              <ToggleContainer />
            </View> */}
           <TouchableOpacity onPress={this.onAllGiftClick} style={styles.giftContainer}>
            {/* <Image style={styles.giftImage}
            source={require( '../../assets/images/svgs/icon_gift.svg' )} /> */}
            <GiftIcon/>
            <View style={{flex:1, paddingLeft: 10}}>
              <Text style={styles.giftText}>All Gifts</Text>
              <Text numberOfLines={2} style={styles.giftDescText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
            </View>
            <ArrowRight />
          </TouchableOpacity>
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: hp( 3.5 ), marginRight: wp( 6 )
          }}>
            <Text
              style={[ styles.pageTitle, {

              } ]}
            >
              {this.strings[ 'f&f' ]}
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.setState( {
                  isLoadContacts: true,
                // addFnF: true
                }, () => {
                  navigation.navigate( 'AddContact', {
                    fromScreen: 'Invitation'
                  } )
                } )
              }}
            >
              <LinearGradient colors={[ Colors.blue, Colors.blue ]}
                start={{
                  x: 0, y: 0
                }} end={{
                  x: 1, y: 0
                }}
                locations={[ 0.2, 1 ]}
                style={{
                  ...styles.selectedContactsView, backgroundColor: Colors.lightBlue,
                }}
              >
                <Text style={[ styles.contactText, {
                  fontSize: RFValue( 18 ), lineHeight:30
                } ]}>+</Text>
                <Text style={styles.contactText}>{this.strings[ 'AddNew' ]}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={showLoader}
                onRefresh={() => {
                  syncPermanentChannels( {
                    permanentChannelsSyncKind: PermanentChannelsSyncKind.EXISTING_CONTACTS,
                    metaSync: true
                  } )
                }}
              />
            }
            style={{
              flex: 1,
            }}
          >
            {/* <TouchableOpacity
              onPress={() => this.props.navigation.navigate( 'ManageGifts' )}
              style={{
                width: '90%',
                // height: '54%',
                backgroundColor: Colors.gray7,
                shadowOpacity: 0.06,
                shadowOffset: {
                  width: 10, height: 10
                },
                shadowRadius: 10,
                elevation: 2,
                alignSelf: 'center',
                borderRadius: wp( 2 ),
                marginTop: hp( 3 ),
                marginBottom: hp( 1 ),
                paddingVertical: hp( 4 ),
                paddingHorizontal: wp( 4.5 )
              }}>
              <View style={[ styles.subInfo, {
              } ]}>
                <CheckingAcc />
                <View style={{
                  flex: 1, marginHorizontal: wp( 2 )
                }}>
                  <Text style={[ styles.pageTitle, {
                    fontSize: RFValue( 11 ),
                    marginHorizontal: wp ( 0 ),
                  } ]}>
                    {this.strings[
                      'giftsats'
                    ]}
                  </Text>
                  <Text style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.Regular,
                    marginTop: 3,
                    width: '85%',
                  }}>
                    {this.strings[ 'giftSubTextF&F' ]}
                  </Text>

                </View>
                <RightArrow />
              </View>
            </TouchableOpacity> */}
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
                        contactsType: 'Keeper',
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
                        contactsType: 'I am the Keeper of',
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
                        contactsType: 'Contact',
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
                  backgroundColor={Colors.white}
                  title={'Note'}
                  infoText={
                    this.strings[ 'appear' ]
                  }
                />
              )}
            {/* </View> */}

          </ScrollView>
        </View>
        {showLoader ? <Loader /> : null}
      </View>
    /* feature/2.0 */
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.contacts ),
    existingPermanentChannelsSynching: idx(
      state,
      ( _ ) => _.trustedContacts.loading.existingPermanentChannelsSynching,
    ),
    keeperInfo: idx( state, ( _ ) => _.bhr.keeperInfo )
  }
}

export default connect( mapStateToProps, {
  syncPermanentChannels,
} )( FriendsAndFamilyScreen )

const styles = StyleSheet.create( {
  cardSubText: {
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
  },
  icon:{
    width: 27, height: 27, resizeMode: 'contain', marginHorizontal: wp( 3 )
  },
  imageView: {
    width: 18,
    height: 18,
    borderRadius: 9,
    // borderWidth: 0.3,
    // borderColor: Colors.borderColor,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    // shadowColor: Colors.gray,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 1, height: 1
    },
  },
  cardSubView: {
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: wp( '4%' )
  },
  cardView: {
    width: '95%', height: hp( '12%' ),
    alignSelf: 'center', justifyContent: 'center',
    borderRadius: wp( '4' ),
    marginVertical: hp( '1%' ),
    marginTop: hp( 5 )
  },
  closeButton: {
    width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
    alignSelf: 'flex-end',
    backgroundColor: Colors.CLOSE_ICON_COLOR, alignItems: 'center', justifyContent: 'center',
    marginTop: wp( 3 ), marginRight: wp( 3 )
  },
  buttonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    margin: wp( 7 )
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  title: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 18 ),
    marginHorizontal: wp( 7 ),
    color: Colors.blue,
    marginVertical: hp( 1 )
  },
  subTitle: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
    marginHorizontal: wp( 7 ),
    marginRight: wp( 9 ),
    color: Colors.textColorGrey,
    letterSpacing: 0.6
  },
  modalContentContainer: {
    backgroundColor: Colors.backgroundColor,
  },
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
    height: hp( '71.46%' ),
    // marginTop: 30,
    backgroundColor: Colors.backgroundColor1,
    opacity: 1,
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
    // marginHorizontal: wp ( 1 ),
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    color: Colors.white,
    // padding: wp( 2 )
  },
  phoneText: {
    marginTop: 3,
    marginLeft: 10,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
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
    borderRadius: wp ( 2 ),
    // width: wp( 22 )
    // padding: wp( 1 ),
    //width: wp( 24 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 )
  },
  pageTitle: {
    color: Colors.THEAM_TEXT_COLOR,
    fontSize: RFValue( 16 ),
    letterSpacing: 0.54,
    // fontFamily: Fonts.Regular,
    fontFamily: Fonts.SemiBold,
    alignItems: 'center',
    marginHorizontal: wp ( 4 ),
  },
  subInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: wp ( 3 ),
    flex: 1,
    marginBottom: 2
  },
  cardTitle: {
    color: Colors.blue,
    fontSize: RFValue( 12 ),
    // fontFamily: Fonts.Regular,
    fontFamily: Fonts.Medium,
    marginVertical: wp( 2 ),
    marginHorizontal: wp( 4 )
  },
  pageInfoText: {
    marginLeft: 30,
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
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
    width: wp( 3 ),
    height: wp( 4 ),
    marginLeft: 5,
    color: Colors.white
  },
  moreImage: {
    width: wp( '10%' ),
    height: wp( '10%' ),
  },
  giftContainer:{
      width: '90%',
      // height: hp( '15%' ),
      backgroundColor: Colors.gray7,
      shadowOpacity: 0.06,
      shadowOffset: {
        width: 10, height: 10
      },
      shadowRadius: 10,
      elevation: 2,
      alignSelf: 'center',
      borderRadius: wp( 2 ),
      marginTop: hp( 3 ),
      paddingHorizontal: wp( 8 ),
      paddingVertical: hp(3),
      justifyContent:'center',
      flexDirection:'row',
      alignItems:'center'
  },
  giftImage:{
    width: 40,
    height: 40,
    marginEnd: 16,
    // backgroundColor:'red'
  },
  giftText:{
    fontSize: RFValue(12),
    fontFamily: Fonts.Medium,
    color: Colors.THEAM_TEXT_COLOR
  },
  giftDescText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.Regular,
    color: Colors.THEAM_INFO_TEXT_COLOR,
    marginTop: 4,
    marginEnd: 4
  }
} )

function makeNavigationOptions( { navigation, } ): NavigationScreenConfig<NavigationStackOptions, any> {
  return {
    ...defaultStackScreenNavigationOptions,

    title: 'Friends & Family',

    headerRight: () => {
      return (
        <KnowMoreButton onpress={navigation.getParam( 'toggleKnowMoreSheet' )} />
      )
    },
  }
}
