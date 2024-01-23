import idx from 'idx'
import React from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { ListItem } from 'react-native-elements'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'
import { KeeperInfoInterface, TrustedContactRelationTypes, Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import ImageStyles from '../../common/Styles/ImageStyles'
import { LocalizationContext } from '../../common/content/LocContext'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import {
  ContactRecipientDescribing,
} from '../../common/data/models/interfaces/RecipientDescribing'
import BottomInfoBox from '../../components/BottomInfoBox'
import FriendsAndFamilyContactListItemContent from '../../components/friends-and-family/FriendsAndFamilyContactListItemContent'
import ModalContainer from '../../components/home/ModalContainer'
import Loader from '../../components/loader'
import {
  PermanentChannelsSyncKind,
  syncPermanentChannels,
} from '../../store/actions/trustedContacts'
import { makeContactRecipientDescription } from '../../utils/sending/RecipientFactories'
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
    this.focusListener?.()
  }



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






  onAllGiftClick = () => {
    this.props.navigation.navigate( 'GiftScreen' )
  }

  render() {
    const { syncPermanentChannels, navigation } = this.props
    const {
      keepers,
      keeping,
      otherContacts,
      showLoader,
      showIndicator
    } = this.state
    return (
      <View style={{
        backgroundColor: Colors.blue
      }}>
        <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
        <View style={styles.accountCardsSectionContainer}>
          {showIndicator &&
            <ModalContainer onBackground={()=>this.setState( {
              showIndicator: false
            } )} visible={showIndicator} closeBottomSheet={() => {}}>
              <ActivityIndicator color={Colors.white} size='large'/>
            </ModalContainer>
          }
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
                <BottomInfoBox
                  backgroundColor={Colors.white}
                  title={'Note'}
                  infoText={
                    this.strings[ 'appear' ]
                  }
                />
              )}

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
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
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
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    color: Colors.white
  },
  phoneText: {
    marginTop: 3,
    marginLeft: 10,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
    color: Colors.textColorGrey,
  },
  selectedContactsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.blue,
    borderRadius: wp ( 2 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 )
  },
  pageTitle: {
    color: Colors.THEAM_TEXT_COLOR,
    fontSize: RFValue( 16 ),
    letterSpacing: 0.54,
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
    paddingVertical: hp( 3 ),
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
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Medium,
    color: Colors.THEAM_TEXT_COLOR
  },
  giftDescText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
    color: Colors.THEAM_INFO_TEXT_COLOR,
    marginTop: 4,
    marginEnd: 4
  }
} )
