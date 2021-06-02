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
  ActivityIndicator,
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
import {
  clearTransfer,
  addNewSecondarySubAccount
} from '../../store/actions/accounts'
import { REGULAR_ACCOUNT } from '../../common/constants/wallet-service-types'
import BottomSheet from 'reanimated-bottom-sheet'
import SendViaLink from '../../components/SendViaLink'
import ModalHeader from '../../components/ModalHeader'
import DeviceInfo from 'react-native-device-info'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import {
  uploadRequestedShare,
  ErrorSending,
  UploadSuccessfully,
} from '../../store/actions/sss'
import {  uploadRequestedSMShare, UploadSMSuccessfully } from '../../store/actions/health'
import S3Service from '../../bitcoin/services/sss/S3Service'
import ErrorModalContents from '../../components/ErrorModalContents'
import SendViaQR from '../../components/SendViaQR'
import BottomInfoBox from '../../components/BottomInfoBox'
import {
  QRCodeTypes, StreamData, TrustedContact, TrustedContactRelationTypes, Trusted_Contacts,
} from '../../bitcoin/utilities/Interface'
import { removeTrustedContact } from '../../store/actions/trustedContacts'
import AccountShell from '../../common/data/models/AccountShell'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { resetStackToSend } from '../../navigation/actions/NavigationActions'
import { sourceAccountSelectedForSending, addRecipientForSending, recipientSelectedForAmountSetting, amountForRecipientUpdated } from '../../store/actions/sending'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'

const getImageIcon = ( item ) => {
  if ( Object.keys( item ).length ) {
    if ( item.image ) {
      return (
        <View style={styles.headerImageView}>
          <Image source={item.image} style={styles.headerImage} />
        </View>
      )
    } else {
      if (
        item.firstName === 'F&F request' &&
        item.contactsWalletName !== undefined &&
        item.contactsWalletName !== ''
      ) {
        return (
          <View style={styles.headerImageView}>
            <View style={styles.headerImageInitials}>
              <Text style={styles.headerImageInitialsText}>
                {item
                  ? nameToInitials( `${item.contactsWalletName}'s Wallet` )
                  : ''}
              </Text>
            </View>
          </View>
        )
      } else {
        return (
          <View style={styles.headerImageView}>
            <View style={styles.headerImageInitials}>
              <Text style={styles.headerImageInitialsText}>
                {item.contactName
                  ? nameToInitials(
                    item.contactName
                  )
                  : ''}
              </Text>
            </View>
          </View>
        )
      }
    }
  }
}

interface ContactDetailsPropTypes {
  navigation: any;
  trustedContacts: TrustedContactsService;
  trustedContactRecipients: ContactRecipientDescribing[],
  accountShells: AccountShell[];
  uploading: any;
  errorSending: any;
  uploadSuccessfull: any;
  UNDER_CUSTODY: any;
  DECENTRALIZED_BACKUP: any;
  WALLET_SETUP: any;
  uploadMetaShare: any;
  updateEphemeralChannelLoader: any;
  ErrorSending: any;
  clearTransfer: any;
  sourceAccountSelectedForSending: any;
  addRecipientForSending: any;
  recipientSelectedForAmountSetting: any;
  amountForRecipientUpdated: any;
  UploadSuccessfully: any;
  uploadRequestedShare: any;
  addNewSecondarySubAccount: any;
  removeTrustedContact: any;
  uploadRequestedSMShare: any;
  hasSMUploadedSuccessfully: Boolean;
  UploadSMSuccessfully: any;
  uploadingSmShare: any;
  newBHRFlowStarted : any;
  s3Service: S3Service
}
interface ContactDetailsStateTypes {
  isSendDisabled: boolean;
  Loading: boolean;
  contact: any;
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
}

class ContactDetails extends PureComponent<
  ContactDetailsPropTypes,
  ContactDetailsStateTypes
> {
  ReshareBottomSheet: any;
  shareBottomSheet: any;
  SendViaLinkBottomSheet: any;
  SendViaQRBottomSheet: any;
  ExitKeyQRBottomSheet: any;
  ErrorBottomSheet: any;
  Contact: any;
  contactsType: any;
  setIsSendDisabledListener: any;
  ContactName: any;

  constructor( props ) {
    super( props )
    this.ReshareBottomSheet = createRef()
    this.shareBottomSheet = createRef()
    this.SendViaLinkBottomSheet = createRef()
    this.SendViaQRBottomSheet = createRef()
    this.ExitKeyQRBottomSheet = createRef()
    this.ErrorBottomSheet = createRef()
    this.state = {
      Loading: true,
      key: '',
      isSendDisabled: false,
      contact: {
      },
      SelectedOption: 0,
      errorMessage: '',
      buttonText: 'Try again',
      errorMessageHeader: '',
      trustedLink: '',
      trustedQR: '',
      SMShareQR: '',
      encryptedExitKey: '',
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
    }

    this.Contact = this.props.navigation.state.params.contact
    this.contactsType = this.props.navigation.state.params.contactsType
    this.ContactName = `${this.Contact.firstName} ${
      this.Contact.lastName ? this.Contact.lastName : ''
    }`
      .toLowerCase()
      .trim()
  }

  componentDidMount() {
    this.setIsSendDisabledListener = this.props.navigation.addListener(
      'didFocus',
      () => {
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
    this.setState( {
      contact: this.Contact ? this.Contact : {
      },
    } )
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
    this.props.clearTransfer( REGULAR_ACCOUNT )

    // if ( this.contactsType == 'My Keepers' ) {
    //   this.saveInTransitHistory( 'isSent' )
    // }

    const contactName = `${this.Contact.firstName} ${this.Contact.lastName ? this.Contact.lastName : ''
    }`

    const recipient = this.props.trustedContactRecipients.find( recipient => recipient.displayedName ===  contactName )

    this.props.sourceAccountSelectedForSending(
      this.props.accountShells.find( shell => shell.primarySubAccount.kind == SubAccountKind.REGULAR_ACCOUNT )
    )
    this.props.addRecipientForSending( recipient )
    this.props.recipientSelectedForAmountSetting( recipient )
    this.props.amountForRecipientUpdated( {
      recipient,
      amount: 0
    } )

    this.props.navigation.dispatch(
      resetStackToSend( {
        selectedRecipientID: recipient.id,
      } )
    )
  };

  onPressResendRequest = () => {
    if ( this.Contact.isGuardian ) {
      this.createDeepLink( this.Contact )
      setTimeout( () => {
        ( this.ReshareBottomSheet as any ).current.snapTo( 1 )
      }, 2 )
    } else {
      this.props.navigation.navigate( 'AddContactSendRequest', {
        SelectedContact: [ this.Contact ],
      } )
    }
  };

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
          element.selectedContactInfo.selectedContact.id === this.Contact.id
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
    const contacts: TrustedContact = trustedContacts.tc.trustedContactsV2[ this.Contact.channelKey ]
    const instream: StreamData = useStreamFromContact( contacts, this.props.s3Service.levelhealth.walletId, true )
    if ( !this.Contact ) {
      Alert.alert( 'Contact details missing' )
      return
    }

    if (
      !contacts &&
      ( contacts.relationType == TrustedContactRelationTypes.KEEPER_WARD ||
      contacts.relationType == TrustedContactRelationTypes.WARD )
    ) {
      Alert.alert(
        'Restore request failed',
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
        channelKey: this.Contact.channelKey,
        channelKey2: contacts.contactsSecondaryChannelKey,
        version: appVersion
      } )
    } else {
      qrString = JSON.stringify( {
        type: QRCodeTypes.RECOVERY_REQUEST,
        walletName: contacts.unencryptedPermanentChannel[ instream.streamId ].primaryData.walletName,
        channelId: contacts.permanentChannelAddress,
        streamId: instream.streamId,
        channelKey2: contacts.contactsSecondaryChannelKey,
        version: appVersion
      } )
    }
    this.setState( {
      trustedQR: qrString
    } );
    ( this.SendViaQRBottomSheet as any ).current.snapTo( 1 )
  };

  createDeepLink = ( contact ) => {
    const { trustedContacts, WALLET_SETUP } = this.props
    const contacts: Trusted_Contacts = trustedContacts.tc.trustedContacts
    let currentContact: TrustedContact
    let channelKey: string

    if( contacts )
      for( const ck of Object.keys( contacts ) ){
        if ( contacts[ ck ].contactDetails.id === contact.id ){
          currentContact = contacts[ ck ]
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
          walletName: WALLET_SETUP.walletName,
          secondaryChannelKey,
          version: appVersion,
        } )
      } )
    }
  }

  SendShareModalFunction = () => {
    if ( !isEmpty( this.Contact ) ) {
      return (
        <RequestKeyFromContact
          isModal={true}
          headerText={`Send Recovery Key${'\n'}to contact`}
          subHeaderText={'Send Key to Keeper, you can change your Keeper, or their primary mode of contact'}
          contactText={'Sharing Recovery Key with'}
          contact={this.Contact ? this.Contact : null}
          QR={this.state.trustedQR}
          link={this.state.trustedLink}
          contactEmail={''}
          onPressBack={() => {
            ( this.shareBottomSheet as any ).current.snapTo( 0 )
            this.props.navigation.goBack()
          }}
          onPressDone={() => {
            ( this.shareBottomSheet as any ).current.snapTo( 0 )
            this.props.navigation.goBack()
          }}
          onPressShare={() => {
            ( this.shareBottomSheet as any ).current.snapTo( 0 )
            this.props.navigation.goBack()
          }}
        />
      )
    }
  };

  SendModalFunction = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( this.shareBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  };

  renderSendViaLinkContents = () => {
    return (
      <SendViaLink
        contactText={'Send Recovery Secret'}
        contact={this.Contact}
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
        contact={this.Contact}
        QR={this.state.trustedQR}
        contactEmail={''}
        onPressBack={() => {
          if ( this.SendViaQRBottomSheet.current )
            ( this.SendViaQRBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressDone={() => {
          ( this.SendViaQRBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  };

  renderSendViaQRHeader = () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   if (this.SendViaQRBottomSheet.current)
      //     (this.SendViaQRBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  };

  renderExitKeyQRContents = () => {
    return (
      <SendViaQR
        headerText={'Encrypted Exit Key'}
        subHeaderText={'You should scan the QR to restore Personal Copy'}
        contactText={''}
        contact={this.Contact}
        QR={this.state.encryptedExitKey}
        contactEmail={''}
        onPressBack={() => {
          if ( this.ExitKeyQRBottomSheet.current )
            ( this.ExitKeyQRBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressDone={() => {
          ( this.ExitKeyQRBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  };
  renderExitKeyQRHeader = () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   if (this.ExitKeyQRBottomSheet.current)
      //     (this.ExitKeyQRBottomSheet as any).current.snapTo(0);
      // }}
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
        title={'Reshare Recovery Key\nwith Keeper'}
        info={'Did your Keeper not receive the Recovery Key?'}
        note={'You can reshare the Recovery Key with your Keeper'}
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          ( this.shareBottomSheet as any ).current.snapTo( 1 );
          ( this.ReshareBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressIgnore={() => {
          ( this.ReshareBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  };
  renderReshareHeader = () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (this.ReshareBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  };

  render() {
    const { navigation, uploading, uploadingSmShare, newBHRFlowStarted } = this.props
    const {
      contact,
      Loading,
      SelectedOption,
      encryptedExitKey,
      isSendDisabled,
      trustedContactHistory,
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
              {getImageIcon( contact )}
              <View style={{
                flex: 1, marginRight: 5
              }}>
                <Text style={styles.contactTypeText}>{this.contactsType}</Text>
                <Text
                  style={styles.contactText}
                  ellipsizeMode="clip"
                  numberOfLines={1}
                >
                  {this.Contact.firstName === 'F&F request' &&
                  this.Contact.contactsWalletName !== undefined &&
                  this.Contact.contactsWalletName !== ''
                    ? `${this.Contact.contactsWalletName}'s Wallet`
                    : contact.contactName}
                </Text>
                {contact.connectedVia ? (
                  <Text style={styles.phoneText}>
                    {contact.usesOTP
                      ? !contact.hasTrustedChannel
                        ? 'OTP: ' + contact.connectedVia
                        : ''
                      : contact.connectedVia}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                disabled={isSendDisabled}
                onPress={() => {
                  this.setState( {
                    isSendDisabled: true,
                  } )

                  this.Contact.isFinalized
                    ? this.onPressSend()
                    : ![ 'Personal Device', 'Personal Device1', 'Personal Device2', 'Personal Device3' ].includes( this.Contact.contactName )
                      ? this.onPressResendRequest()
                      : null
                }}
                style={styles.resendContainer}
              >
                {this.Contact.isFinalized ? (
                  <Image
                    source={require( '../../assets/images/icons/icon_bitcoin_light.png' )}
                    style={styles.bitcoinIconStyle}
                  />
                ) : null}
                <Text style={styles.sendTextStyle}>
                  {this.Contact.isFinalized
                    ? 'Send'
                    : this.Contact.isGuardian
                      ? 'Reshare'
                      : 'Resend Request'}
                </Text>
              </TouchableOpacity>
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
                disabled={!this.Contact.isWard}
                style={{
                  ...styles.bottomButton,
                  opacity: this.Contact.isWard ? 1 : 0.5,
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
                <View>
                  {uploading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text style={styles.buttonText} numberOfLines={1}>Help Restore</Text>
                  )}
                </View>
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
                <View>
                  {uploadingSmShare ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text style={[ styles.buttonText, {
                      marginLeft: 0, marginRight: 0, width: wp( '30%' ), textAlign: 'center'
                    } ]}>Show Secondary Key</Text>
                  )}
                </View>
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
                      ( this.ExitKeyQRBottomSheet as any ).current.snapTo( 1 )
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
                        {'Help restore PDF'}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
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
                        channelKey: contact.channelKey
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
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.SendViaQRBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '83%' )
              : hp( '85%' ),
          ]}
          renderContent={this.renderSendViaQRContents}
          renderHeader={this.renderSendViaQRHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.ExitKeyQRBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '83%' )
              : hp( '85%' ),
          ]}
          renderContent={this.renderExitKeyQRContents}
          renderHeader={this.renderExitKeyQRHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.ReshareBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '37%' )
              : hp( '45%' ),
          ]}
          renderContent={this.renderReshareContent}
          renderHeader={this.renderReshareHeader}
        />
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
        <BottomSheet
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
        />
      </View>
    )
  }
}
const mapStateToProps = ( state ) => {
  return {
    uploading: idx( state, ( _ ) => _.sss.loading.uploadRequestedShare ),
    uploadingSmShare: idx( state, ( _ ) => _.health.loading.uploadRequestedShare ),
    errorSending: idx( state, ( _ ) => _.sss.errorSending ),
    uploadSuccessfull: idx( state, ( _ ) => _.sss.uploadSuccessfully ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
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
    WALLET_SETUP: idx( state, ( _ ) => _.storage.database.WALLET_SETUP ),
    uploadMetaShare: idx( state, ( _ ) => _.sss.loading.uploadMetaShare ),
    updateEphemeralChannelLoader: idx(
      state,
      ( _ ) => _.trustedContacts.loading.updateEphemeralChannel
    ),
    hasSMUploadedSuccessfully: idx( state, ( _ ) => _.health.hasSMUploadedSuccessfully ),
    newBHRFlowStarted: idx( state, ( _ ) => _.health.newBHRFlowStarted ),
    s3Service: idx( state, ( _ ) => _.health.service )
  }
}
export default connect( mapStateToProps, {
  clearTransfer,
  sourceAccountSelectedForSending,
  addRecipientForSending,
  recipientSelectedForAmountSetting,
  amountForRecipientUpdated,
  UploadSuccessfully,
  addNewSecondarySubAccount,
  uploadRequestedShare,
  ErrorSending,
  removeTrustedContact,
  uploadRequestedSMShare,
  UploadSMSuccessfully
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
