import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { KeeperInfoInterface, TrustedContactRelationTypes, Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import {
  PermanentChannelsSyncKind,
  syncPermanentChannels,
} from '../../store/actions/trustedContacts'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'

import Add_gifts from '../../assets/images/satCards/Add_gifts.svg'
import AddressBookHelpContents from '../../components/Helper/AddressBookHelpContents'
import AlertModalContents from '../../components/AlertModalContents'
import BottomInfoBox from '../../components/BottomInfoBox'
import BottomSheet from 'reanimated-bottom-sheet'
import { CKTapCard } from 'cktap-protocol-react-native'
import CheckingAcc from '../../assets/images/svgs/gift_icon_new.svg'
import ClaimSatComponent from './ClaimSatComponent'
import Colors from '../../common/Colors'
import {
  ContactRecipientDescribing,
} from '../../common/data/models/interfaces/RecipientDescribing'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import DeviceInfo from 'react-native-device-info'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fonts from '../../common/Fonts'
import FriendsAndFamilyContactListItemContent from '../../components/friends-and-family/FriendsAndFamilyContactListItemContent'
import Gift from '../../assets/images/svgs/icon_gift.svg'
import GiftBoxComponent from './GiftBoxCmponent'
import GiftUnwrappedComponent from './GiftUnwrappedComponent'
import Gifts from '../../assets/images/satCards/gifts.svg'
import Header from '../../navigation/stacks/Header'
import ImageStyles from '../../common/Styles/ImageStyles'
import KnowMoreButton from '../../components/KnowMoreButton'
import { ListItem } from 'react-native-elements'
import Loader from '../../components/loader'
import { LocalizationContext } from '../../common/content/LocContext'
import ModalContainer from '../../components/home/ModalContainer'
import ModalHeader from '../../components/ModalHeader'
import { NavigationScreenConfig } from 'react-navigation'
import { NavigationStackOptions } from 'react-navigation-stack'
import NfcPrompt from './NfcPromptAndroid'
import {
  REGULAR_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import { RFValue } from 'react-native-responsive-fontsize'
import React from 'react'
import RecipientAvatar from '../../components/RecipientAvatar'
import RightArrow from '../../assets/images/svgs/icon_arrow.svg'
import Sat_card from '../../assets/images/satCards/sats_card.svg'
import SeedBacupModalContents from '../NewBHR/SeedBacupModalContents'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import ToggleContainer from '../FriendsAndFamily/CurrencyToggle'
import VerifySatModalContents from './VerifySatModalContents'
import axios from 'axios'
import { connect } from 'react-redux'
import defaultStackScreenNavigationOptions from '../../navigation/options/DefaultStackScreenNavigationOptions'
import idx from 'idx'
import { makeContactRecipientDescription } from '../../utils/sending/RecipientFactories'

interface GiftPropTypes {
  navigation: any;
  isFocused: boolean;
  trustedContacts: Trusted_Contacts;
  syncPermanentChannels: any;
  existingPermanentChannelsSynching: any;
  clearTrustedContactsCache: any;
  containerStyle: {},
  keeperInfo: KeeperInfoInterface[]
}
interface GiftStateTypes {
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
  showVerification: boolean;
  claimVerification: boolean;
  showGiftModal: boolean;
  showGiftFailureModal: boolean;
  cardDetails: CKTapCard | null;
  showNFCModal: boolean;
  satCardBalance: number | null;
  showAlertModal: boolean,
  errorMessage: string,
}

class GiftScreen extends React.Component<
  GiftPropTypes,
  GiftStateTypes
> {
  // static navigationOptions = makeNavigationOptions;
  static contextType = LocalizationContext

  addContactAddressBookBottomSheetRef: React.RefObject<BottomSheet>;
  helpBottomSheetRef: React.RefObject<BottomSheet>;
  focusListener: any;
  card: CKTapCard;
  strings: object;

  // card = useRef( new CKTapCard() ).current
  constructor( props, context ) {
    super( props, context )

    this.card = new CKTapCard()
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
      activeIndex: null,
      showVerification: false,
      claimVerification: false,
      showGiftModal: false,
      showGiftFailureModal: false,
      cardDetails: null,
      showNFCModal: false,
      satCardBalance: 0,
      showAlertModal: false,
      errorMessage: '',
    }
  }

  componentDidMount = async () => {
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

  setUpFocusListener = () => {
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

    for ( const channelKey of Object.keys( trustedContacts ) ) {
      const contact = trustedContacts[ channelKey ]

      const isGuardian = [ TrustedContactRelationTypes.KEEPER, TrustedContactRelationTypes.KEEPER_WARD, TrustedContactRelationTypes.PRIMARY_KEEPER ].includes( contact.relationType )
      const isWard = [ TrustedContactRelationTypes.WARD, TrustedContactRelationTypes.KEEPER_WARD ].includes( contact.relationType )
      if ( contact.isActive ) {
        if ( isGuardian || isWard ) {
          if ( isGuardian && ( contact.contactDetails.contactName != 'Personal Copy' && contact.contactDetails.contactName != 'Personal Device 1' && contact.contactDetails.contactName != 'Personal Device 2' && contact.contactDetails.contactName != 'Personal Device 3' ) ) keepers.push( makeContactRecipientDescription(
            channelKey,
            contact,
            ContactTrustKind.KEEPER_OF_USER,
          ) )
          if ( isWard ) keeping.push( makeContactRecipientDescription(
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
          textAlign: 'center', marginTop: hp( 0.5 )
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
    return (
      <View style={{
        ...styles.modalContentContainer,
      }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            this.setState( {
              addFnF: false
            } )
          }}
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
            backgroundColor: activeIndex === 0 ? Colors.lightBlue : Colors.backgroundColor1
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
                fontSize: RFValue( 13 ), fontFamily: activeIndex === 0 ? Fonts.FiraSansMedium : Fonts.FiraSansRegular, color: activeIndex === 0 ? Colors.white : Colors.black
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
            backgroundColor: activeIndex === 1 ? Colors.lightBlue : Colors.backgroundColor1,
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
                fontSize: RFValue( 13 ), fontFamily: activeIndex === 1 ? Fonts.FiraSansMedium : Fonts.FiraSansRegular, color: activeIndex === 1 ? Colors.white : Colors.black
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
            width: '95%', height: hp( '12%' ),
            alignSelf: 'center', justifyContent: 'center',
            borderRadius: wp( '4' ),
            // marginVertical: hp( '3%' )
          }}>
          <View style={{
            flexDirection: 'row',
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
              fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, color: Colors.textColorGrey,
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
  onCloseClick = () =>{
    this.setState( {
      showVerification:false
    } )
  }

  onClaimClose=() => {
    this.setState( {
      claimVerification:false
    } )
  }

  onClaimClick=()=>{
    this.setState( {
      claimVerification: false
    }, ()=>{
      this.setState( {
        showGiftModal:true
      } )
    } )
  }

  onGiftClose=() => {
    this.setState( {
      showGiftModal:false
    } )
  }

  onGiftFailureClose=() => {
    this.setState( {
      showGiftFailureModal:false
    } )
  }

  onViewHealthClick=async()=>{
    this.setState( {
      showVerification: false
    }, async()=>{
      // this.props.navigation.navigate( 'ClaimSats', {
      //   fromClaimFlow: 1
      // } )
      const { response, error } = await this.withModal( async ()=>{
        const cardData = await this.card.first_look()
        const { addr:address } = await this.card.address( true, false, 0 )
        const { data } = await axios.get( `https://api.blockcypher.com/v1/btc/main/addrs/${address}` )
        const { balance } = data
        console.log( {
          num_slots:cardData.num_slots,
          active_slot:cardData.active_slot,
          balance
        } )
        return{
          num_slots:cardData.num_slots,
          active_slot:cardData.active_slot,
          balance
        }
      } )
      if( error ){
        console.log( error )
        return
      }
      const { num_slots, active_slot,  balance } = response
      this.props.navigation.navigate( 'GiftCreated', {
        numSlots: num_slots,
        activeSlot: active_slot,
        slotFromIndex: !balance?3:4,
        slotBalance: balance,
      } )
    } )
  }

  withModal = async ( callback ) => {
    try {
      console.log( 'scanning...1' )
      if( Platform.OS == 'android' )
        this.setState( {
          showNFCModal: true
        } )
      const resp = await this.card.nfcWrapper( callback )
      await this.card.endNfcSession()
      this.setState( {
        showNFCModal: false
      } )
      return {
        response: resp, error: null
      }
    } catch ( error: any ) {
      console.log( error.toString() )
      this.setState( {
        showNFCModal: false,
        errorMessage: error.toString(),
        showAlertModal: true
      } )
      return {
        response: null, error: error.toString()
      }
    }
  }

  onGiftSuccessClick=()=>{
    this.setState( {
      showGiftModal: false
    }, ()=>{
      this.setState( {
        showGiftFailureModal:true
      } )
    } )
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
        backgroundColor: Colors.blue
      }}>
        <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
        <View style={styles.accountCardsSectionContainer}>
          {showIndicator &&
            <ModalContainer onBackground={() => this.setState( {
              showIndicator: false
            } )} visible={showIndicator} closeBottomSheet={() => { }}>
              <ActivityIndicator color={Colors.white} size='large' />
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
                fontFamily: Fonts.FiraSansMedium,

              }}>
              My Accounts
              </Text>
              <ToggleContainer />
            </View> */}
          <View style={{
            flexDirection: 'row', marginHorizontal: 35, marginTop: 6, alignItems: 'flex-end'
          }}>
            <CheckingAcc height={57} width={53} />
            <Text style={[ styles.pageTitle, {
              fontSize: RFValue( 24 ),
              marginStart: 13,
              marginBottom: 5,
            } ]}>
              {this.strings[ 'giftsats' ]}
            </Text>
            <ToggleContainer />
          </View>
          <Text style={{
            marginHorizontal: 39, fontSize: RFValue( 11 ), color: '#525252', fontFamily: Fonts.FiraSansLight, marginTop: 18
          }}>{'Give sats as gifts to your friends and family, view and manage created gifts.'}</Text>
          <ScrollView
            // refreshControl={
            //   <RefreshControl
            //     refreshing={showLoader}
            //     onRefresh={() => {
            //       syncPermanentChannels( {
            //         permanentChannelsSyncKind: PermanentChannelsSyncKind.EXISTING_CONTACTS,
            //         metaSync: true
            //       } )
            //     }}
            //   />
            // }
            contentContainerStyle={{
              flex: 1, paddingHorizontal: 38, paddingBottom: 20
            }}
          >
            <GiftBoxComponent
              titleText={'Create New Gift'}
              subTitleText={this.strings[ 'giftSubTextF&F' ]}
              onPress={() => this.props.navigation.navigate( 'CreateGift', {
                // setActiveTab: buttonPress
              } )}
              image={<Add_gifts />}
            />
            <GiftBoxComponent
              titleText={'Available Gifts'}
              subTitleText={'All the gifts you have created, not sent, and gifts you have received are shown here'}
              onPress={() => this.props.navigation.navigate( 'ManageGifts' )}
              image={<Gifts />}
            />
            <GiftBoxComponent
              titleText={'Claim SATSCARD'}
              scTitleText={'TM'}
              subTitleText={'Move sats from your SATSCARD'}
              scSubText={'TM'}
              pendingSubText={' into your account.'}
              onPress={() => this.setState( {
                showVerification:true
              } )}
              image={<Sat_card/>}
            />
          </ScrollView>
        </View>
        {showLoader ? <Loader /> : null}
        <ModalContainer onBackground={() => { this.setState( {
          showAlertModal: false
        } ) }} visible={this.state.showAlertModal} closeBottomSheet={() => { }}>
          <AlertModalContents
            info={this.state.errorMessage != '' ? this.state.errorMessage : 'SatCards not detected'}
            proceedButtonText={ this.state.errorMessage == 'Sorry, this device doesn\'t support NFC' ?'Ok' : 'Try again'}
            onPressProceed={() => {
              this.setState( {
                showAlertModal: false
              } )
            }}
            isBottomImage={true}
            bottomImage={require( '../../assets/images/icons/errorImage.png' )}
          />
        </ModalContainer>
        <ModalContainer onBackground={this.onCloseClick} visible={this.state.showVerification} closeBottomSheet={this.onCloseClick}  >
          <VerifySatModalContents
            title={'Tap SATSCARD'}
            scTitleText={'TM'}
            info={'Get your SATSCARD'}
            info1={'TM'}
            info2={' ready for verification'}
            proceedButtonText={'Detect SATSCARD'}
            proceedButtonSubText={'TM'}
            subPoints={'Touch your SATSCARD™ on your phone after clicking \'Detect SATSCARD™'}
            bottomImage={require( '../../assets/images/satCards/illustration.png' )}
            onCloseClick={this.onCloseClick}
            onPressProceed={this.onViewHealthClick}
            closeModal
          />
        </ModalContainer>
        <NfcPrompt visible={this.state.showNFCModal} />
        <ModalContainer onBackground={this.onClaimClose} visible={this.state.claimVerification} closeBottomSheet={this.onClaimClose}  >
          <ClaimSatComponent
            title={'Claim SATSCARD™'}
            info={'Note that this transfers the available sats in the card to your Checking Account.'}
            proceedButtonText={'Claim sats'}
            onCloseClick={this.onClaimClose}
            onPressProceed={this.onClaimClick}
            closeModal
            firstHalfLbl={'Enter the '}
            secondHalfLbl={'Spend code'}
            cancelText={'Cancel'}
            onCancelClick={this.onClaimClose}
          />
        </ModalContainer>
        <ModalContainer onBackground={this.onGiftClose} visible={this.state.showGiftModal} closeBottomSheet={this.onGiftClose}  >
          <GiftUnwrappedComponent
            title={'Your Gift is unwrapped!'}
            info={'Gifts sats received transferred to '}
            infoSelected={'Checking Account.'}
            info2={'Your checking account balance is '}
            info2Selected={'100,000 sats'}
            proceedButtonText={'Back to Home'}
            onCloseClick={this.onGiftClose}
            onPressProceed={this.onGiftSuccessClick}
            closeModal
            isBottomImage
          />
        </ModalContainer>
        <ModalContainer onBackground={this.onGiftFailureClose} visible={this.state.showGiftFailureModal} closeBottomSheet={this.onGiftFailureClose}  >
          <GiftUnwrappedComponent
            title={'Claim Unsuccessful'}
            info={'Sats were not transferred from your\nSATSCARD™. Please try again.'}
            proceedButtonText={'Try again'}
            onCloseClick={this.onGiftFailureClose}
            onPressProceed={this.onGiftSuccessClick}
            isIgnoreButton
            cancelButtonText={'Back'}
            closeModal
            isBottomImage
            bottomImage={require( '../../assets/images/icons/errorImage.png' )}
          />
        </ModalContainer>
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
} )( GiftScreen )

const styles = StyleSheet.create( {
  cardSubText: {
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  icon: {
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
    flexDirection: 'row',
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
    width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
    alignSelf: 'flex-end',
    backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
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
    fontFamily: Fonts.FiraSansMedium,
  },
  title: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 18 ),
    marginHorizontal: wp( 7 ),
    color: Colors.blue,
    marginVertical: hp( 1 )
  },
  subTitle: {
    fontFamily: Fonts.FiraSansRegular,
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
    borderRadius: wp( 12 ) / 2,
    marginHorizontal: wp( 1 )
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
    justifyContent: 'space-around',
  },
  contactText: {
    // marginLeft: 10,
    // marginHorizontal: wp ( 1 ),
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
    backgroundColor: Colors.blue,
    borderRadius: wp( 2 ),
    // width: wp( 22 )
    // padding: wp( 1 ),
    //width: wp( 24 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 )
  },
  pageTitle: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    letterSpacing: 0.7,
    // fontFamily: Fonts.FiraSansRegular,
    fontFamily: Fonts.FiraSansMedium,
    alignItems: 'center',
    marginHorizontal: wp( 4 ),
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
    width: wp( 3 ),
    height: wp( 4 ),
    marginLeft: 5,
    color: Colors.white
  },
  moreImage: {
    width: wp( '10%' ),
    height: wp( '10%' ),
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
