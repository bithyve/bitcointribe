import React, { PureComponent, createRef } from 'react'
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
  Alert,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NavStyles from '../../common/Styles/NavStyles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import idx from 'idx'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { nameToInitials, isEmpty } from '../../common/CommonFunctions'
import _ from 'underscore'
import moment from 'moment'
import BottomSheet from 'reanimated-bottom-sheet'
import SendViaLink from '../../components/SendViaLink'
import ModalHeader from '../../components/ModalHeader'
import DeviceInfo from 'react-native-device-info'
import {
  ErrorSending,
} from '../../store/actions/BHR'
import { UploadSMSuccessfully } from '../../store/actions/BHR'
import ErrorModalContents from '../../components/ErrorModalContents'
import SendViaQR from '../../components/SendViaQR'
import BottomInfoBox from '../../components/BottomInfoBox'
import {
  AccountType,
  QRCodeTypes, StreamData, TrustedContact, TrustedContactRelationTypes, Trusted_Contacts, Wallet,
} from '../../bitcoin/utilities/Interface'
import { PermanentChannelsSyncKind, removeTrustedContact, syncPermanentChannels } from '../../store/actions/trustedContacts'
import AccountShell from '../../common/data/models/AccountShell'
import { sourceAccountSelectedForSending, addRecipientForSending, recipientSelectedForAmountSetting, amountForRecipientUpdated } from '../../store/actions/sending'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import ModalContainer from '../../components/home/ModalContainer'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'
import { resetStackToSend } from '../../navigation/actions/NavigationActions'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import EditContactScreen from './EditContact'

const getImageIcon = ( item: ContactRecipientDescribing ) => {
  if ( Object.keys( item ).length ) {
    if ( item.avatarImageSource ) {
      return (
        <View style={styles.headerImageView}>
          <Image source={item.avatarImageSource} style={styles.headerImage} />
        </View>
      )
    } else {
      return (
        <View style={styles.headerImageView}>
          <View style={styles.headerImageInitials}>
            <Text style={styles.headerImageInitialsText}>
              {item.displayedName
                ? nameToInitials(
                  item.displayedName
                )
                : ''}
            </Text>
          </View>
        </View>
      )
    }
  }
}

interface ContactDetailsPropTypes {
  navigation: any;
  trustedContacts: Trusted_Contacts;
  trustedContactRecipients: ContactRecipientDescribing[],
  accountShells: AccountShell[];
  errorSending: any;
  UNDER_CUSTODY: any;
  DECENTRALIZED_BACKUP: any;
  wallet: Wallet;
  updateEphemeralChannelLoader: any;
  ErrorSending: any;
  sourceAccountSelectedForSending: any;
  addRecipientForSending: any;
  recipientSelectedForAmountSetting: any;
  amountForRecipientUpdated: any;
  removeTrustedContact: any;
  syncPermanentChannels: any;
  uploadRequestedSMShare: any;
  hasSMUploadedSuccessfully: Boolean;
  UploadSMSuccessfully: any;
  newBHRFlowStarted : any;
}
interface ContactDetailsStateTypes {
  isSendDisabled: boolean;
  Loading: boolean;
  SelectedOption: number;
  errorMessage: string;
  buttonText: string;
  errorMessageHeader: string;
  trustedLink: string;
  trustedQR: string;
  encryptedExitKey: string;
  key: string;
  trustedContactHistory: any;
  SMShareQR: string;
  qrModalTitle: string;
  reshareModal: boolean;
  showQRCode: boolean;
  edit: boolean;
  sendViaQRModel: boolean;
  exitKeyModel: boolean;
}

class ContactDetails extends PureComponent<
  ContactDetailsPropTypes,
  ContactDetailsStateTypes
> {
  ReshareBottomSheet: any;
  shareBottomSheet: any;
  SendViaLinkBottomSheet: any;
  ErrorBottomSheet: any;
  contact: ContactRecipientDescribing;
  contactsType: any;
  setIsSendDisabledListener: any;

  constructor( props ) {
    super( props )
    this.ReshareBottomSheet = createRef()
    this.shareBottomSheet = createRef()
    this.SendViaLinkBottomSheet = createRef()
    this.ErrorBottomSheet = createRef()
    this.state = {
      Loading: true,
      key: '',
      isSendDisabled: false,
      SelectedOption: 0,
      errorMessage: '',
      buttonText: 'Try again',
      errorMessageHeader: '',
      trustedLink: '',
      trustedQR: '',
      SMShareQR: '',
      encryptedExitKey: '',
      showQRCode: false,
      trustedContactHistory: [
        {
          id: 1,
          title: 'Recovery Key created',
          date: null,
          // info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
        },
        {
          id: 2,
          title: 'Recovery Key in-transit',
          date: null,
          // info: 'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
        },
        {
          id: 3,
          title: 'Recovery Key accessible',
          date: null,
          // info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
        },
        {
          id: 4,
          title: 'Recovery Key not accessible',
          date: null,
          // info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
        },
        {
          id: 5,
          title: 'Sent Amount',
          date: null,
          // info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
        },
      ],
      qrModalTitle: '',
      reshareModal: false,
      edit: false,
      sendViaQRModel: false,
      exitKeyModel: false
    }

    this.contact = this.props.navigation.state.params.contact
    this.contactsType = this.props.navigation.state.params.contactsType
  }

  componentDidMount() {
    this.setIsSendDisabledListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this.contact = this.props.navigation.state.params.contact
        this.forceUpdate()
        this.setState( {
          isSendDisabled: false,
        } )

      }
    )

    // this.setExitKey()

    if ( this.contactsType == 'My Keepers' ) {
      // this.saveInTransitHistory( 'inTransit' )
    } else {
      this.getHistoryForTrustedContacts()
    }

    this.syncContact()
  }

  componentWillUnmount() {
    this.setIsSendDisabledListener.remove()
  }

  componentDidUpdate( prevProps, prevState ) {
    if ( prevState.trustedContactHistory !== this.state.trustedContactHistory ) {
      this.setState( {
        Loading: false,
      } )
    }
    if ( prevProps.errorSending !== this.props.errorSending ) {
      this.setState( {
        errorMessageHeader: 'Error sending Recovery Secret',
        errorMessage:
          'There was an error while sending your Recovery Secret, please try again in a little while',
        buttonText: 'Try again',
      } );
      ( this.ErrorBottomSheet as any ).current.snapTo( 1 )
      this.props.ErrorSending( null )
    }

    // this.updateContactDetailsUI()
  }

  // updateContactDetailsUI = () => {
  //   const { SHARES_TRANSFER_DETAILS } = this.props.DECENTRALIZED_BACKUP
  //   const { trustedContacts, WALLET_SETUP } = this.props
  //   if ( this.Contact.firstName && SHARES_TRANSFER_DETAILS[ this.index ] ) {
  //     const contactName = `${this.Contact.firstName} ${
  //       this.Contact.lastName ? this.Contact.lastName : ''
  //     }`
  //       .toLowerCase()
  //       .trim()

  //     if ( contactName === 'secondary device' ) return

  //     if ( !trustedContacts.tc.trustedContacts[ contactName ] ) return

  //     this.createDeepLink()

  //     const { publicKey, otp } = trustedContacts.tc.trustedContacts[
  //       contactName
  //     ]

  //     let info = ''
  //     if ( this.Contact.phoneNumbers && this.Contact.phoneNumbers.length ) {
  //       const phoneNumber = this.Contact.phoneNumbers[ 0 ].number
  //       let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
  //       number = number.slice( number.length - 10 ) // last 10 digits only
  //       info = number
  //     } else if ( this.Contact.emails && this.Contact.emails.length ) {
  //       info = this.Contact.emails[ 0 ].email
  //     } else if ( otp ) {
  //       info = otp
  //     }

  //     this.setState( {
  //       trustedQR: JSON.stringify( {
  //         isGuardian: true,
  //         requester: WALLET_SETUP.walletName,
  //         publicKey,
  //         info,
  //         uploadedAt:
  //           trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
  //             .initiatedAt,
  //         type: 'trustedGuardian',
  //         ver: DeviceInfo.getVersion(),
  //       } ),
  //     } )
  //   }
  // };

  onPressSend = () => {
    const recipient = this.props.trustedContactRecipients.find( recipient => recipient.id ===  this.contact.id )
    this.props.sourceAccountSelectedForSending(
      this.props.accountShells.find( shell => shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT && shell.primarySubAccount.instanceNumber === 0 )
    )
    this.props.addRecipientForSending( recipient )
    this.props.recipientSelectedForAmountSetting( recipient )


    this.props.navigation.dispatch(
      resetStackToSend( {
        selectedRecipientID: recipient.id,
      } )
    )
  };

  onPressResendRequest = () => {
    if ( this.contact.trustKind === ContactTrustKind.KEEPER_OF_USER ) {
      this.createDeepLink( this.contact )
      setTimeout( () => {
        // ( this.ReshareBottomSheet as any ).current.snapTo( 1 )
        this.setState( {
          reshareModal: true
        } )
      }, 2 )
    } else {
      this.props.navigation.navigate( 'AddContactSendRequest', {
        SelectedContact: [ this.contact ],
        headerText:'Add a contact',
        subHeaderText:'Send a Friends and Family request',
        contactText:'Adding to Friends and Family:',
        showDone:true,
      } )
    }
  };

  syncContact = ( hardSync?: boolean ) => {
    if( this.contact ){
      const contactInfo = {
        channelKey: this.contact.channelKey,
      }
      const channelUpdate =  {
        contactInfo
      }
      this.props.syncPermanentChannels( {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
        channelUpdates: [ channelUpdate ],
        hardSync,
      } )
    }
  }

  getHistoryForTrustedContacts = async () => {
    let OtherTrustedContactsHistory = []
    if ( this.contactsType === 'Other Contacts' ) {
      OtherTrustedContactsHistory = JSON.parse(
        await AsyncStorage.getItem( 'OtherTrustedContactsHistory' )
      )
    } else {
      OtherTrustedContactsHistory = JSON.parse(
        await AsyncStorage.getItem( 'IMKeeperOfHistory' )
      )
    }
    if ( OtherTrustedContactsHistory ) {
      OtherTrustedContactsHistory = this.getHistoryByContactId(
        OtherTrustedContactsHistory
      )
    }
    if ( OtherTrustedContactsHistory && OtherTrustedContactsHistory.length > 0 ) {
      this.setState( {
        trustedContactHistory: this.sortedHistory( OtherTrustedContactsHistory ),
      } )
    } else {
      this.setState( {
        trustedContactHistory: [],
      } )
    }
  };

  getHistoryByContactId = ( history ) => {
    const array = []
    if ( history && history.length > 0 ) {
      for ( let i = 0; i < history.length; i++ ) {
        const element = history[ i ]
        if (
          element.selectedContactInfo &&
          element.selectedContactInfo.selectedContact.id === this.contact.id
        ) {
          array.push( element )
        }
      }
    }
    return array
  };

  sortedHistory = ( history ) => {
    const currentHistory = history.filter( ( element ) => {
      if ( element.date ) return element
    } )
    const sortedHistory = _.sortBy( currentHistory, 'date' )
    sortedHistory.forEach( ( element ) => {
      element.date = moment( element.date )
        .utc()
        .local()
        .format( 'DD MMMM YYYY HH:mm' )
    } )
    return sortedHistory
  };

  // TODO: have index independent history
  // updateHistory = ( shareHistory ) => {
  //   const updatedTrustedContactHistory = [ ...this.state.trustedContactHistory ]
  //   if ( shareHistory[ this.index ].createdAt )
  //     updatedTrustedContactHistory[ 0 ].date = shareHistory[ this.index ].createdAt
  //   if ( shareHistory[ this.index ].inTransit )
  //     updatedTrustedContactHistory[ 1 ].date = shareHistory[ this.index ].inTransit
  //   if ( shareHistory[ this.index ].accessible )
  //     updatedTrustedContactHistory[ 2 ].date =
  //       shareHistory[ this.index ].accessible
  //   if ( shareHistory[ this.index ].notAccessible )
  //     updatedTrustedContactHistory[ 3 ].date =
  //       shareHistory[ this.index ].notAccessible
  //   if ( shareHistory[ this.index ].inSent )
  //     updatedTrustedContactHistory[ 4 ].date = shareHistory[ this.index ].inSent
  //   this.setState( {
  //     trustedContactHistory: updatedTrustedContactHistory,
  //   } )
  // };

  // saveInTransitHistory = async ( type ) => {
  //   const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
  //   if ( shareHistory ) {
  //     const updatedShareHistory = [ ...shareHistory ]
  //     if ( type == 'inTransit' ) {
  //       updatedShareHistory[ this.index ] = {
  //         ...updatedShareHistory[ this.index ],
  //         inTransit: Date.now(),
  //       }
  //     }
  //     if ( type == 'isSent' ) {
  //       updatedShareHistory[ this.index ] = {
  //         ...updatedShareHistory[ this.index ],
  //         inSent: Date.now(),
  //       }
  //     }
  //     this.updateHistory( updatedShareHistory )
  //     await AsyncStorage.setItem(
  //       'shareHistory',
  //       JSON.stringify( updatedShareHistory )
  //     )
  //   }
  // };

  SelectOption = ( Id ) => {
    if ( Id === this.state.SelectedOption ) {
      this.setState( {
        SelectedOption: 0,
      } )
    } else {
      this.setState( {
        SelectedOption: Id,
      } )
    }
  };

  generateQR = ( type ) => {
    const appVersion = DeviceInfo.getVersion()
    const { trustedContacts } = this.props
    const contacts: TrustedContact = trustedContacts[ this.contact.channelKey ]
    const instream: StreamData = useStreamFromContact( contacts, this.props.wallet.walletId, true )
    if ( !this.contact ) {
      Alert.alert( 'contact details missing' )
      return
    }

    if (
      !contacts &&
      ( contacts.relationType == TrustedContactRelationTypes.KEEPER_WARD ||
      contacts.relationType == TrustedContactRelationTypes.WARD )
    ) {
      Alert.alert(
        'Recover request failed',
        'You are not a keeper of the selected contact'
      )
      return
    }
    let qrString = ''
    if( type == 'recovery' ){
      qrString = JSON.stringify( {
        type: QRCodeTypes.RECOVERY_REQUEST,
        walletName: contacts.unencryptedPermanentChannel[ instream.streamId ].primaryData.walletName,
        channelId: contacts.permanentChannelAddress,
        streamId: instream.streamId,
        channelKey: this.contact.channelKey,
        secondaryChannelKey: contacts.contactsSecondaryChannelKey,
        version: appVersion,
        walletId: contacts.unencryptedPermanentChannel[ instream.streamId ].primaryData.walletID
      } )
    } else {
      qrString = JSON.stringify( {
        type: QRCodeTypes.RECOVERY_REQUEST,
        walletName: contacts.unencryptedPermanentChannel[ instream.streamId ].primaryData.walletName,
        channelId: contacts.permanentChannelAddress,
        streamId: instream.streamId,
        secondaryChannelKey: contacts.contactsSecondaryChannelKey,
        version: appVersion,
        walletId: contacts.unencryptedPermanentChannel[ instream.streamId ].primaryData.walletID
      } )
    }
    console.log( 'Secondarey QR', qrString )
    this.setState( {
      trustedQR: qrString,
      sendViaQRModel: true
    } )

  };

  createDeepLink = ( contact ) => {
    const { trustedContacts, wallet } = this.props
    let currentContact: TrustedContact
    let channelKey: string

    if( trustedContacts )
      for( const ck of Object.keys( trustedContacts ) ){
        if ( trustedContacts[ ck ].contactDetails.id === contact.id ){
          currentContact = trustedContacts[ ck ]
          channelKey = ck
          break
        }
      }

    if ( currentContact ) {
      const { secondaryChannelKey } = currentContact
      const appVersion = DeviceInfo.getVersion()

      this.setState( {
        trustedQR: JSON.stringify( {
          type: QRCodeTypes.CONTACT_REQUEST,
          channelKey,
          walletName: wallet.walletName,
          secondaryChannelKey,
          version: appVersion,
        } )
      } )
    }
  }

  SendShareModalFunction = () => {
    if ( !isEmpty( this.contact ) ) {
      return (
        <RequestKeyFromContact
          isModal={true}
          headerText={`Send Recovery Key${'\n'}to contact`}
          subHeaderText={'Send Key to Keeper, you can change your Keeper, or their primary mode of contact'}
          contactText={'Sharing Recovery Key with'}
          contact={this.contact ? this.contact : null}
          QR={this.state.trustedQR}
          link={this.state.trustedLink}
          contactEmail={''}
          onPressBack={() => {
            // ( this.shareBottomSheet as any ).current.snapTo( 0 )
            // this.setState( {
            //   showQRCode: false
            // } )
            this.props.navigation.goBack()
          }}
          onPressDone={() => {
            // ( this.shareBottomSheet as any ).current.snapTo( 0 )
            // this.setState( {
            //   showQRCode: false
            // } )
            this.props.navigation.goBack()
          }}
          onPressShare={() => {
            // ( this.shareBottomSheet as any ).current.snapTo( 0 )
            this.setState( {
              showQRCode: false
            } )
            this.props.navigation.goBack()
          }}
        />
      )
    }
  };

  // SendModalFunction = () => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         ( this.shareBottomSheet as any ).current.snapTo( 0 )
  //       }}
  //     />
  //   )
  // };

  renderSendViaLinkContents = () => {
    return (
      <SendViaLink
        contactText={'Send Recovery Secret'}
        contact={this.contact}
        link={this.state.trustedLink}
        contactEmail={''}
        onPressBack={() => {
          if ( this.SendViaLinkBottomSheet.current )
            ( this.SendViaLinkBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressDone={() => {
          ( this.SendViaLinkBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  };
  renderSendViaLinkHeader = () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   if (this.SendViaLinkBottomSheet.current)
      //     (this.SendViaLinkBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  };

  renderSendViaQRContents = () => {
    return (
      <SendViaQR
        headerText={this.state.qrModalTitle}
        subHeaderText={'You should scan the QR to restore'}
        contactText={''}
        contact={this.contact}
        QR={this.state.trustedQR}
        contactEmail={''}
        onPressBack={() => {
          if ( !this.state.sendViaQRModel )
            this.setState( {
              sendViaQRModel: false
            } )
        }}
        onPressDone={() => {
          this.setState( {
            sendViaQRModel: false
          } )
        }}
      />
    )
  };


  renderExitKeyQRContents = () => {
    return (
      <SendViaQR
        headerText={'Encrypted Exit Key'}
        subHeaderText={'You should scan the QR to recover Personal Copy'}
        contactText={''}
        contact={this.contact}
        QR={this.state.encryptedExitKey}
        contactEmail={''}
        onPressBack={() => {
          if ( !this.state.exitKeyModel )
            this.setState( {
              exitKeyModel: false
            } )
        }}
        onPressDone={() => {
          this.setState( {
            exitKeyModel: false
          } )
        }}
      />
    )
  };
  renderErrorModalContent = () => {
    return (
      <ErrorModalContents
        modalRef={this.ErrorBottomSheet}
        title={this.state.errorMessageHeader}
        info={this.state.errorMessage}
        proceedButtonText={this.state.buttonText}
        onPressProceed={() => {
          ( this.ErrorBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  };
  renderErrorModalHeader = () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (this.ErrorBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  };
  renderReshareContent = () => {
    return (
      <ErrorModalContents
        modalRef={this.ReshareBottomSheet}
        title={'Reshare Recovery Ke \nwith Keeper'}
        info={'Did your Keeper not receive the Recovery Key?'}
        note={'You can reshare the Recovery Key with your Keeper'}
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          ( this.ReshareBottomSheet as any ).current.snapTo( 0 )
          // ( this.shareBottomSheet as any ).current.snapTo( 1 );
          // this.setState( {
          //   showQRCode: true
          // } )
          // this.props.navigation.navigate( 'RequestKeyFromContact' )
          this.props.navigation.navigate( 'AddContactSendRequest', {
            SelectedContact: [ this.contact ],
          } )
        }}
        onPressIgnore={() => {
          ( this.ReshareBottomSheet as any ).current.snapTo( 0 )
          this.setState( {
            showQRCode: false
          } )
        }}
        isBottomImage={false}
      />
    )
  };

  render() {
    const { navigation } = this.props
    const {
      Loading,
      SelectedOption,
      encryptedExitKey,
      isSendDisabled,
      trustedContactHistory,
      reshareModal,
      edit,
      sendViaQRModel,
      exitKeyModel
    } = this.state
    return (
      <View style={{
        flex: 1
      }}>
        <SafeAreaView
          style={{
            flex: 0, backgroundColor: Colors.backgroundColor
          }}
        />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeaderTitleView}>
            <View style={styles.headerRowContainer}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backArrowView}
                hitSlop={{
                  top: 20, left: 20, bottom: 20, right: 20
                }}
              >
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.blue}
                  size={17}
                />
              </TouchableOpacity>
              {getImageIcon( this.contact )}
              <View style={{
                flex: 1, marginRight: 5
              }}>
                <Text style={styles.contactTypeText}>{this.contactsType}</Text>
                <Text
                  style={styles.contactText}
                  ellipsizeMode="clip"
                  numberOfLines={1}
                >
                  {this.contact.displayedName}
                </Text>
                {/* {this.contact.connectedVia ? (
                  <Text style={styles.phoneText}>
                    {this.contact.usesOTP
                      ? !contact.hasTrustedChannel
                        ? 'OTP: ' + contact.connectedVia
                        : ''
                      : this.contact.connectedVia}
                  </Text>
                ) : null} */}
              </View>
              <View style={{
                alignSelf: 'center'
              }}>
                <TouchableOpacity
                  disabled={isSendDisabled}
                  onPress={() => {
                    this.setState( {
                      isSendDisabled: true,
                    } )

                    this.contact.lastSeenActive
                      ? this.onPressSend()
                      : ![ 'Personal Device', 'Personal Device1', 'Personal Device2', 'Personal Device3' ].includes( this.contact.displayedName )
                        ? this.onPressResendRequest()
                        : null
                  }}
                  style={styles.resendContainer}
                >
                  {this.contact.lastSeenActive ? (
                    <Image
                      source={require( '../../assets/images/icons/icon_bitcoin_light.png' )}
                      style={styles.bitcoinIconStyle}
                    />
                  ) : null}
                  <Text style={styles.sendTextStyle}>
                    {this.contact.lastSeenActive
                      ? 'Send'
                      : this.contact.trustKind === ContactTrustKind.KEEPER_OF_USER
                        ? 'Reshare'
                        : 'Resend Request'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={isSendDisabled}
                  onPress={() => {
                    this.setState( {
                      edit: true
                    } )
                  }}
                  style={[ styles.resendContainer, {
                    alignSelf: 'center',
                    marginTop: 10
                  } ]}
                >
                  {this.contact.lastSeenActive ? (
                    <Image
                      source={require( '../../assets/images/icons/icon_bitcoin_light.png' )}
                      style={styles.bitcoinIconStyle}
                    />
                  ) : null}
                  <Text style={styles.sendTextStyle}>
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {Loading ? (
            <View style={{
              flex: 1
            }}>
              <ScrollView style={{
                flex: 1
              }}>
                {[ 1, 2, 3, 4, 5 ].map( ( value, index ) => {
                  return (
                    <View key={index} style={styles.scrollViewContainer}>
                      <View>
                        <View
                          style={{
                            backgroundColor: Colors.backgroundColor,
                            height: wp( '4%' ),
                            width: wp( '40%' ),
                            borderRadius: 10,
                          }}
                        />
                        <View
                          style={{
                            backgroundColor: Colors.backgroundColor,
                            height: wp( '4%' ),
                            width: wp( '30%' ),
                            marginTop: 5,
                            borderRadius: 10,
                          }}
                        />
                      </View>
                    </View>
                  )
                } )}
              </ScrollView>
              <BottomInfoBox
                backgroundColor={Colors.white}
                title={'Note'}
                infoText={'The details of your contact will appear here.'}
              />
            </View>
          ) : (
            <View style={{
              flex: 1
            }}>
              <ScrollView style={{
                flex: 1
              }}>
                {this.sortedHistory( trustedContactHistory ).map( ( value ) => {
                  if ( SelectedOption == value.id ) {
                    return (
                      <TouchableOpacity
                        key={value.id}
                        onPress={() => this.SelectOption( value.id )}
                        style={styles.selectOptionContainer}
                      >
                        <Text
                          style={{
                            color: Colors.blue,
                            fontSize: RFValue( 13 ),
                            fontFamily: Fonts.FiraSansRegular,
                          }}
                        >
                          {value.title}
                        </Text>
                        {/* <Text
                          style={{
                            color: Colors.textColorGrey,
                            fontSize: RFValue(10),
                            fontFamily: Fonts.FiraSansRegular,
                            marginTop: 5,
                          }}
                        >
                          {value.info}
                        </Text> */}
                        <Text style={styles.dateTextStyle}>{value.date}</Text>
                      </TouchableOpacity>
                    )
                  } else {
                    return (
                      <TouchableOpacity
                        key={value.id}
                        onPress={() => this.SelectOption( value.id )}
                        style={styles.selectOptionSecond}
                      >
                        <View
                          style={{
                            flexDirection: 'row', alignItems: 'center'
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.textColorGrey,
                              fontSize: RFValue( 10 ),
                              fontFamily: Fonts.FiraSansRegular,
                            }}
                          >
                            {value.title}
                          </Text>
                          <Text style={styles.dateTextSecondStyle}>
                            {value.date}
                          </Text>
                        </View>
                        {/* <Text
                          style={{
                            color: Colors.textColorGrey,
                            fontSize: RFValue(8),
                            fontFamily: Fonts.FiraSansRegular,
                            marginTop: 5,
                          }}
                        >
                          {value.info}
                        </Text> */}
                      </TouchableOpacity>
                    )
                  }
                } )}
              </ScrollView>
              {this.sortedHistory( trustedContactHistory ).length <= 1 && (
                <BottomInfoBox
                  backgroundColor={Colors.white}
                  title={'Note'}
                  infoText={'The details of your contact will appear here.'}
                />
              )}
            </View>
          )}
          {this.contactsType == 'I\'m Keeper of' && (
            <View style={styles.keeperViewStyle}>
              <TouchableOpacity
                disabled={!( this.contact.trustKind === ContactTrustKind.USER_IS_KEEPING ) }
                style={{
                  ...styles.bottomButton,
                  opacity: this.contact.trustKind === ContactTrustKind.USER_IS_KEEPING ? 1 : 0.5,
                }}
                onPress={()=>
                {
                  this.generateQR( 'recovery' )
                }
                }
              >
                <Image
                  source={require( '../../assets/images/icons/icon_restore.png' )}
                  style={styles.buttonImage}
                />
                <Text style={styles.buttonText} numberOfLines={1}>Help Restore</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  ...styles.bottomButton,
                  justifyContent: 'space-around',
                }}
                onPress={() => {
                  this.generateQR( 'approval' )
                }}
              >
                <Image
                  source={require( '../../assets/images/icons/icon_restore.png' )}
                  style={styles.buttonImage}
                />
                <Text style={[ styles.buttonText, {
                  marginLeft: 0, marginRight: 0, width: wp( '30%' ), textAlign: 'center'
                } ]}>Show Secondary Key</Text>
              </TouchableOpacity>

              {encryptedExitKey ? (
                <TouchableOpacity
                  style={{
                    ...styles.bottomButton,
                    opacity: encryptedExitKey ? 1 : 0.5,
                  }}
                  disabled={encryptedExitKey ? false : true}
                  onPress={() => {
                    if ( encryptedExitKey ) {
                      this.setState( {
                        exitKeyModel: true
                      } )
                    }
                  }}
                >
                  <Image
                    source={require( '../../assets/images/icons/icon_request.png' )}
                    style={styles.buttonImage}
                  />
                  <View>
                    <Text style={styles.buttonText} numberOfLines={1}>
                      {encryptedExitKey ? 'Show Secondary Key' : 'Request Key'}
                    </Text>
                    {encryptedExitKey ? (
                      <Text numberOfLines={1} style={styles.buttonInfo}>
                        {'Help recover PDF'}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
          {
            this.contact.trustKind !== ContactTrustKind.OTHER && this.contact.lastSeenActive ? null: (
              <TouchableOpacity
                style={{
                  ...styles.bottomButton,
                }}
                onPress={() => {
                  Alert.alert(
                    'Remove Contact',
                    'Are you sure about removing the contact?',
                    [
                      {
                        text: 'Yes',
                        onPress: () => {
                          this.props.removeTrustedContact( {
                            channelKey: this.contact.channelKey
                          } )
                          this.props.navigation.goBack()
                        },
                      },
                      {
                        text: 'Cancel',
                        onPress: () => {},
                        style: 'cancel',
                      },
                    ],
                    {
                      cancelable: false
                    }
                  )
                }}
              >
                <View>
                  <Text style={styles.buttonText} numberOfLines={1}>Remove</Text>
                </View>
              </TouchableOpacity>
            )
          }

        </View>
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.SendViaLinkBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '83%' )
              : hp( '85%' ),
          ]}
          renderContent={this.renderSendViaLinkContents}
          renderHeader={this.renderSendViaLinkHeader}
        />
        <ModalContainer visible={sendViaQRModel} closeBottomSheet={() => {}}>
          {this.renderSendViaQRContents()}
        </ModalContainer>
        <ModalContainer visible={exitKeyModel} closeBottomSheet={() => {}}>
          {this.renderExitKeyQRContents()}
        </ModalContainer>
        <ModalContainer visible={edit} closeBottomSheet={() => this.setState( {
          edit: false
        } )}>
          <EditContactScreen navigation={navigation} contact={this.contact} closeModal={( name ) => {
            if ( name !== '' ) {
              this.contact.displayedName = name
            }
            this.setState( {
              edit: false
            } )
          } } />
        </ModalContainer>
        <ModalContainer visible={reshareModal} closeBottomSheet={() => this.setState( {
          reshareModal: false
        } )}>
          <ErrorModalContents
            modalRef={this.ReshareBottomSheet}
            title={'Reshare Recovery Key\nwith Keeper'}
            info={'Did your Keeper not receive the Recovery Key?'}
            note={'You can reshare the Recovery Key with your Keeper'}
            proceedButtonText={'Reshare'}
            cancelButtonText={'Back'}
            isIgnoreButton={true}
            onPressProceed={() => {
              // ( this.shareBottomSheet as any ).current.snapTo( 1 )
              this.props.navigation.navigate( 'AddContactSendRequest', {
                SelectedContact: [ this.contact ],
                headerText:`Send Recovery Key${'\n'}to contact`,
                subHeaderText:'Send Key to Keeper, you can change your Keeper, or their primary mode of contact',
                contactText:'Sharing Recovery Key with',
                showDone:false,
              } )

              // ( this.ReshareBottomSheet as any ).current.snapTo( 0 )
              this.setState( {
                reshareModal: false
              }, () => {
                // this.setState( {
                //   showQRCode: true
                // } )
              } )
            }}
            onPressIgnore={() => {
              // ( this.ReshareBottomSheet as any ).current.snapTo( 0 )
              this.setState( {
                reshareModal: false
              } )
            }}
            isBottomImage={false}
          />
        </ModalContainer>
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.ErrorBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '35%' )
              : hp( '40%' ),
          ]}
          renderContent={this.renderErrorModalContent}
          renderHeader={this.renderErrorModalHeader}
        />
        <ModalContainer visible={this.state.showQRCode} closeBottomSheet={() => this.setState( {
          showQRCode: false
        } )}>
          {this.SendShareModalFunction}
        </ModalContainer>
        {/* <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.shareBottomSheet as any}
          snapPoints={[
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '90%' )
              : hp( '85%' ),
          ]}
          renderContent={this.SendShareModalFunction}
          renderHeader={this.SendModalFunction}
        /> */}
      </View>
    )
  }
}
const mapStateToProps = ( state ) => {
  return {
    errorSending: idx( state, ( _ ) => _.bhr.errorSending ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.contacts ),
    trustedContactRecipients: idx( state, ( _ ) => _.trustedContacts.trustedContactRecipients ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    UNDER_CUSTODY: idx(
      state,
      ( _ ) => _.storage.database.DECENTRALIZED_BACKUP.UNDER_CUSTODY
    ),
    DECENTRALIZED_BACKUP: idx(
      state,
      ( _ ) => _.storage.database.DECENTRALIZED_BACKUP
    ),
    wallet: idx( state, ( _ ) => _.storage.wallet ),
    updateEphemeralChannelLoader: idx(
      state,
      ( _ ) => _.trustedContacts.loading.updateEphemeralChannel
    ),
    hasSMUploadedSuccessfully: idx( state, ( _ ) => _.bhr.hasSMUploadedSuccessfully ),
    newBHRFlowStarted: idx( state, ( _ ) => _.bhr.newBHRFlowStarted ),
  }
}
export default connect( mapStateToProps, {
  sourceAccountSelectedForSending,
  addRecipientForSending,
  recipientSelectedForAmountSetting,
  amountForRecipientUpdated,
  ErrorSending,
  removeTrustedContact,
  syncPermanentChannels,
  UploadSMSuccessfully,
} )( ContactDetails )

const styles = StyleSheet.create( {
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: wp( '15%' ),
  },

  modalHeaderTitleView: {
    ...NavStyles.modalHeaderTitleView,
    paddingRight: 0,
  },

  contactText: {
    marginLeft: 10,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.black,
  },
  phoneText: {
    marginTop: 3,
    marginLeft: 10,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  filterButton: {
    height: wp( '8%' ),
    width: wp( '12%' ),
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerImageView: {
    width: wp( '17%' ),
    height: wp( '17%' ),
    borderColor: 'red',
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp( '17%' ) / 2,
  },
  headerImage: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    borderRadius: wp( '15%' ) / 2,
  },
  headerImageInitials: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.shadowBlue,
    width: wp( '15%' ),
    height: wp( '15%' ),
    borderRadius: wp( '15%' ) / 2,
  },
  headerImageInitialsText: {
    textAlign: 'center',
    fontSize: RFValue( 17 ),
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '30%' ),
  },
  buttonImage: {
    width: wp( '10%' ),
    height: wp( '10%' ),
    resizeMode: 'contain',
  },
  buttonText: {
    color: Colors.black,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansMedium,
    marginLeft: 10,
    marginRight: 10,
  },
  buttonInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 5,
    marginLeft: 10,
  },
  bottomButton: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    height: wp( '17%' ),
    width: wp( '40%' ),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderColor,
    alignSelf: 'center',
  },
  backArrowView: {
    height: 30, width: 30, justifyContent: 'center'
  },
  headerRowContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center'
  },
  contactTypeText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
    marginLeft: 10,
  },
  resendContainer: {
    height: wp( '6%' ),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    marginLeft: 'auto',
    // marginBottom: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignSelf: 'flex-end',
    paddingLeft: wp( '1.5%' ),
    paddingRight: wp( '1.5%' ),
  },
  bitcoinIconStyle: {
    height: wp( '4%' ),
    width: wp( '4%' ),
    resizeMode: 'contain',
  },
  sendTextStyle: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 10 ),
    marginLeft: 2,
  },
  scrollViewContainer: {
    margin: wp( '3%' ),
    backgroundColor: Colors.white,
    borderRadius: 10,
    height: wp( '20%' ),
    width: wp( '90%' ),
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectOptionContainer: {
    margin: wp( '3%' ),
    backgroundColor: Colors.white,
    borderRadius: 10,
    height: wp( '20%' ),
    width: wp( '90%' ),
    justifyContent: 'center',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
  },
  dateTextStyle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp( '0.3%' ),
  },
  selectOptionSecond: {
    margin: wp( '3%' ),
    backgroundColor: Colors.white,
    borderRadius: 10,
    height: wp( '15%' ),
    width: wp( '85%' ),
    justifyContent: 'center',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
  },
  dateTextSecondStyle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 'auto',
  },
  keeperViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: Colors.white,
    paddingTop: wp( '3%' ),
    paddingBottom: wp( '4%' ),
    height: wp( '30' ),
  },
} )
