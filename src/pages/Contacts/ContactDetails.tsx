import React, { PureComponent, createRef, useMemo } from 'react'
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
  ErrorSending, updateSecondaryShard, getApprovalFromKeepers, setOpenToApproval
} from '../../store/actions/BHR'
import { UploadSMSuccessfully, setSecondaryDataInfoStatus } from '../../store/actions/BHR'
import ErrorModalContents from '../../components/ErrorModalContents'
import SendViaQR from '../../components/SendViaQR'
import BottomInfoBox from '../../components/BottomInfoBox'
import {
  AccountType,
  KeeperInfoInterface,
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
import { agoTextForLastSeen } from '../../components/send/LastSeenActiveUtils'
import BackIconTitle from '../../utils/BackIconTitle'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import CardWithArrow from '../../components/CardWithArrow'
import More from '../../assets/images/svgs/icon_more.svg'
import { translations } from '../../common/content/LocContext'
import QRModal from '../Accounts/QRModal'
import Loader from '../../components/loader'

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
  newBHRFlowStarted: any;
  keeperInfo: KeeperInfoInterface[];
  availableKeepers: KeeperInfoInterface[];
  openApproval: any;
  approvalContactData: ContactRecipientDescribing;
  updateSecondaryShard: any;
  getApprovalFromKeepers: any;
  setOpenToApproval: any;
  updateSecondaryShardStatus: boolean;
  getSecondaryDataInfoStatus: boolean;
  setSecondaryDataInfoStatus: any;
  IsCurrentLevel0: boolean;
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
  qrSubTitle: string;
  reshareModal: boolean;
  showQRCode: boolean;
  edit: boolean;
  sendViaQRModel: boolean;
  exitKeyModel: boolean;
  showContactDetails: boolean;
  availableKeepersName: string;
  showQRScanner: boolean;
  showQRClicked: boolean;
  showLoader: boolean;
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
  isExistingContact: boolean;
  strings: object;
  common: object;
  isFromApproval: boolean;

  constructor( props ) {
    super( props )
    this.ReshareBottomSheet = createRef()
    this.shareBottomSheet = createRef()
    this.SendViaLinkBottomSheet = createRef()
    this.ErrorBottomSheet = createRef()
    this.isExistingContact = false
    this.strings = translations[ 'f&f' ]
    this.common = translations[ 'common' ]
    this.state = {
      Loading: true,
      key: '',
      isSendDisabled: false,
      SelectedOption: 0,
      errorMessage: '',
      buttonText: this.common[ 'tryAgain' ],
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
      qrSubTitle: '',
      reshareModal: false,
      edit: false,
      sendViaQRModel: false,
      exitKeyModel: false,
      showContactDetails: false,
      availableKeepersName: '',
      showQRScanner: false,
      showQRClicked: false,
      showLoader: false,
    }

    this.contact = this.props.navigation.state.params.contact
    this.contactsType = this.props.navigation.state.params.contactsType
    this.isFromApproval = this.props.navigation.state.params.isFromApproval ? this.props.navigation.state.params.isFromApproval : false
    if ( this.contactsType == 'Keeper' ) {
      this.isExistingContact = this.contact.channelKey && this.props.keeperInfo.find( value => value.channelKey == this.contact.channelKey ) ? true : false
    }
  }

  componentDidMount() {
    this.props.setSecondaryDataInfoStatus( false )
    this.setState( {
      showLoader: false
    } )
    const { trustedContacts } = this.props
    this.setState( {
      showQRClicked: true
    } )
    if( this.props.navigation.state.params.contactsType == 'I am the Keeper of' ) this.props.getApprovalFromKeepers( true, trustedContacts[ this.contact.channelKey ] )
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

    if ( this.contactsType == 'Keeper' ) {
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
    const { availableKeepers } = this.props
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
        buttonText: this.common[ 'tryAgain' ],
      } );
      ( this.ErrorBottomSheet as any ).current.snapTo( 1 )
      this.props.ErrorSending( null )
    }
    console.log( 'openApproval', this.props.openApproval )
    if( prevProps.availableKeepers != this.props.availableKeepers && this.contactsType == 'I am the Keeper of' ) {
      if( availableKeepers.length ) {
        const availableKeepersName = ( ()=>{
          if( availableKeepers.length > 3 ) {
            return availableKeepers.slice( 2, availableKeepers.length-1 ).map( ( value )=> {
              if( value.name != 'iCloud' && value.name != 'Encryption Password' ) return ' '+value.name
            } ).join()
          } else if( availableKeepers.length == 3 ) {
            return availableKeepers.slice( 2, availableKeepers.length ).map( ( value )=> {
              if( value.name != 'iCloud' && value.name != 'Encryption Password' ) return ' '+value.name
            } ).join()
          } else return ''
        } )()
        this.setState( {
          availableKeepersName: availableKeepersName
        } )
      }
      else this.setState( {
        availableKeepersName: ''
      } )
    }

    console.log( 'this.props.getSecondaryDataInfoStatus', this.props.getSecondaryDataInfoStatus )
    console.log( 'this.props.openApproval', this.props.openApproval )
    if( prevProps.getSecondaryDataInfoStatus != this.props.getSecondaryDataInfoStatus ){
      if( this.props.getSecondaryDataInfoStatus ) this.setState( {
        showLoader: true
      } )
      else {
        this.setState( {
          showLoader: false
        } )
      }
    }

    if( prevProps.openApproval != this.props.openApproval || prevState.showQRClicked != this.state.showQRClicked ){
      if( this.props.openApproval && this.state.showQRClicked ) this.setState( {
        showQRScanner: true
      } )
      else this.setState( {
        showQRScanner: false, showQRClicked: false
      } )
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
    const recipient = this.props.trustedContactRecipients.find( recipient => recipient.id === this.contact.id )
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

  onPressResendRequest = ( payload?: { isKeeper?: boolean, isPrimary?: boolean } ) => {
    if ( this.contact.trustKind === ContactTrustKind.KEEPER_OF_USER ) {
      this.createDeepLink( this.contact )
      setTimeout( () => {
        // ( this.ReshareBottomSheet as any ).current.snapTo( 1 )
        this.setState( {
          reshareModal: true
        } )
      }, 2 )
    } else {
      const navigationParams = {
        SelectedContact: [ this.contact ],
        headerText: 'Add a contact',
        subHeaderText: 'Send a Friends & Family request',
        contactText: 'Adding to Friends & Family:',
        showDone: true,
        isKeeper: payload && payload.isKeeper ? payload.isKeeper : false,
        isPrimary: payload && payload.isPrimary ? payload.isPrimary : false,
        existingContact: this.isExistingContact
      }
      this.props.navigation.navigate( 'AddContactSendRequest', navigationParams )
    }
  };

  syncContact = ( hardSync?: boolean ) => {
    if ( this.contact ) {
      const contactInfo = {
        channelKey: this.contact.channelKey,
      }
      const channelUpdate = {
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
    if ( this.contactsType === 'Contact' ) {
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
        'Recovery request failed',
        'You are not a keeper of the selected contact'
      )
      return
    }
    let qrString = '', qrTitle= '', qrSubTitleText=''
    if ( type == 'recovery' ) {
      qrTitle = 'Recovery Key'
      qrSubTitleText = 'help restore'
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
      qrTitle = 'Approval Key'
      qrSubTitleText = 'approve'
      qrString = JSON.stringify( {
        type: QRCodeTypes.APPROVE_KEEPER,
        walletName: contacts.unencryptedPermanentChannel[ instream.streamId ].primaryData.walletName,
        channelId: contacts.permanentChannelAddress,
        streamId: instream.streamId,
        secondaryChannelKey: contacts.contactsSecondaryChannelKey,
        version: appVersion,
        walletId: contacts.unencryptedPermanentChannel[ instream.streamId ].primaryData.walletID
      } )
    }
    console.log( 'qrString', qrString )
    setTimeout( () => {
      this.setState( {
        qrModalTitle: qrTitle,
        qrSubTitle: qrSubTitleText,
        trustedQR: qrString,
        sendViaQRModel: true
      } )
    }, 1000 )
  };

  createDeepLink = ( contact ) => {
    const { trustedContacts, wallet } = this.props
    let currentContact: TrustedContact
    let channelKey: string

    if ( trustedContacts )
      for ( const ck of Object.keys( trustedContacts ) ) {
        if ( trustedContacts[ ck ].contactDetails.id === contact.id ) {
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
        headerText={`Scan ${this.state.qrModalTitle}`}
        subHeaderText={`Scan the QR to ${this.state.qrSubTitle}`}
        contactText={''}
        contact={this.contact}
        qrTitle={this.state.qrSubTitle}
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

  firstNamePieceText = () => {
    return this.contact.displayedName.split( ' ' )[ 0 ] + ' '
  }

  secondNamePieceText = () => {
    return this.contact.displayedName.split( ' ' ).slice( 1 ).join( ' ' )
  }

  showDetails = () => {
    this.setState( {
      showContactDetails: true
    } )
  }

  renderContactDetailsModal = () => {
    const createdDate = moment( this.props.trustedContacts[ this.contact.channelKey ].timestamps.created ).utc().local().format( 'DD MMMM YYYY HH:mm' )
    return (
      <View style={{
        backgroundColor: Colors.bgColor
      }}>
        <AppBottomSheetTouchableWrapper
          onPress={() => this.setState( {
            showContactDetails: false
          } )}
          style={{
            width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
            marginTop: wp( 3 ), marginRight: wp( 3 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
          }} />
        </AppBottomSheetTouchableWrapper>
        <View style={styles.headerRowContainer}>
          {getImageIcon( this.contact )}
          <Text
            style={styles.contactText}
            ellipsizeMode="clip"
            numberOfLines={1}
          >{this.firstNamePieceText()}
            <Text style={styles.contactTextBold}>{this.secondNamePieceText()}</Text>
          </Text>
        </View>
        <View style={styles.detailsView}>
          <Text style={styles.titleText}>
            {this.common[ 'relationship' ]}
          </Text>
          <Text style={styles.titleSubText}>
            {this.contactsType}
          </Text>
          <Text style={styles.titleText}>
            {this.common[ 'status' ]}
          </Text>
          <Text style={styles.titleSubText}>
            {!this.contact.isActive && !this.contact.streamId ? 'Rejected' : this.contact.streamId ? 'Approved' :  'Pending'}
          </Text>
          {/* <Text style={styles.titleText}>
            Contact Created
            </Text>
            <Text style={styles.titleSubText}>
            18 June ‘21
            </Text> */}
          {this.contact.walletName &&
          <>
            <Text style={styles.titleText}>
              {this.common[ 'walletName' ]}
            </Text>
            <Text style={styles.titleSubText}>
              {this.contact.walletName}
            </Text>
          </>
          }
          {this.contact.walletId &&
          <>
            <Text style={styles.titleText}>
              {this.common[ 'walletID' ]}
            </Text>
            <Text style={styles.titleSubText}>
              {this.contact.walletId}
            </Text>
          </>
          }
          {createdDate &&
          <>
            <Text style={styles.titleText}>
              {this.common[ 'contactCreated' ]}
            </Text>
            <Text style={styles.titleSubText}>
              {createdDate}
            </Text>
          </>
          }
        </View>
        <View style={styles.CTAView}>
          {this.contact.lastSeenActive &&
          <CardWithArrow
            onPress={() => this.setState( {
              showContactDetails: false,
              edit: true
            } )}
            icon={'Edit'}
            mainText={this.strings[ 'editName' ]}
            subText={this.strings[ 'editNameSub' ]}
          />
          }
          {this.contact.lastSeenActive &&
          <CardWithArrow
            onPress={() => {
              this.setState( {
                showContactDetails: false,
              } )
              this.props.navigation.navigate( 'AddContact', {
                fromScreen: 'Edit', contactToEdit: this.contact
              } )
            }
            }
            icon={'Associate'}
            mainText={this.strings[ 'Associateanother' ]}
            subText={this.strings[ 'AssociateanotherSub' ]}
          />
          }
          {
            this.contact.trustKind !== ContactTrustKind.OTHER && this.contact.lastSeenActive ? null : (
              <CardWithArrow
                onPress={() => {
                  Alert.alert(
                    this.strings[ 'RemoveContact' ],
                    this.strings[ 'sure' ],
                    [
                      {
                        text: this.common[ 'yes' ],
                        onPress: () => {
                          this.props.removeTrustedContact( {
                            channelKey: this.contact.channelKey
                          } )
                          this.setState( {
                            showContactDetails: false
                          } )
                          this.props.navigation.goBack()
                        },
                      },
                      {
                        text: this.common[ 'cancel' ],
                        onPress: () => { },
                        style: 'cancel',
                      },
                    ],
                    {
                      cancelable: false
                    }
                  )
                }}
                icon={'Remove'}
                mainText={this.strings[ 'RemoveContact' ]}
                subText={this.strings[ 'Removefrom' ]}
              />
            )}
        </View>

      </View>
    )
  }

  render() {
    const {
      Loading,
      SelectedOption,
      encryptedExitKey,
      isSendDisabled,
      trustedContactHistory,
      reshareModal,
      edit,
      sendViaQRModel,
      exitKeyModel,
      showContactDetails
    } = this.state
    return (
      <View style={{
        flex: 1, backgroundColor: Colors.backgroundColor
      }}>
        <SafeAreaView
          style={{
            backgroundColor: Colors.backgroundColor
          }}
        />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={{
          flexDirection: 'row'
        }}>
          <BackIconTitle />
          <TouchableOpacity
            disabled={isSendDisabled}
            onPress={() => {
              this.setState( {
                isSendDisabled: true,
              } )
              this.contact.lastSeenActive ? this.onPressSend() : ![ 'Personal Device', 'Personal Device 1', 'Personal Device 2', 'Personal Device 3' ].includes( this.contact.displayedName ) ? this.onPressResendRequest() : this.onPressResendRequest( {
                isKeeper: true, isPrimary: this.contact.displayedName == 'Personal Device 1' ? true : false
              } )
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
                ? this.common[ 'send' ]
                : this.contact.trustKind === ContactTrustKind.KEEPER_OF_USER
                  ? 'Reshare'
                  : this.strings[ 'ResendRequest' ]}
            </Text>
          </TouchableOpacity>
        </View>

        {showContactDetails &&
          <ModalContainer onBackground={()=>this.setState( {
            showContactDetails:false
          } )} visible={showContactDetails} closeBottomSheet={() => {
            this.setState( {
              showContactDetails: false
            } )
          }} >
            {this.renderContactDetailsModal()}
          </ModalContainer>
        }
        {/* <View style={styles.modalContainer}> */}
        <TouchableOpacity
          onPress={this.showDetails}
          style={styles.modalHeaderTitleView}>
          <View style={styles.headerRowContainer}>
            {getImageIcon( this.contact )}
            <View style={{
              flex: 1, marginRight: 5
            }}>
              <View style={{
                flexDirection: 'row', marginLeft: 10, alignItems: 'flex-end'
              }}>
                <Text style={styles.lastSeenText}>{`${this.strings[ 'lastSeen' ]} `}</Text>
                {Number.isFinite( this.contact.lastSeenActive ) ? (
                  <Text style={[ styles.lastSeenText, {
                    fontFamily: Fonts.FiraSansMediumItalic,
                  } ]}>
                    {agoTextForLastSeen( this.contact.lastSeenActive ) === 'today' ? this.common[ 'today' ] : agoTextForLastSeen( this.contact.lastSeenActive )}
                  </Text>
                ) : (
                  <Text style={[ styles.lastSeenText, {
                    fontFamily: Fonts.FiraSansMediumItalic,
                    // fontSize: RFValue( 9 )
                  } ]}>
                    {this.common[ 'unknown' ]}
                  </Text>
                )}
              </View>
              <Text
                style={styles.contactText}
                ellipsizeMode="clip"
                numberOfLines={1}
              >{this.firstNamePieceText()}
                <Text style={styles.contactTextBold}>{this.secondNamePieceText()}</Text>
              </Text>
              <Text style={styles.contactTypeText}>{this.contactsType}</Text>


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
            <More width={14} height={4} />
          </View>
        </TouchableOpacity>
        {Loading ? (
          <View style={{
            flex: 1
          }}>
            {/* <ScrollView style={{
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
            </ScrollView> */}
            <BottomInfoBox
              backgroundColor={Colors.white}
              title={this.common[
                'note'
              ]}
              infoText={this.strings[ 'detailsOf' ]}
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
                title={this.common[
                  'note'
                ]}
                infoText={this.strings[ 'detailsOf' ]}
              />
            )}
          </View>
        )}
        {this.contactsType == 'I am the Keeper of' && (
          <View style={styles.keeperViewStyle}>
            <TouchableOpacity
              disabled={!( this.contact.trustKind === ContactTrustKind.USER_IS_KEEPING )}
              style={{
                ...styles.bottomButton,
                opacity: this.contact.trustKind === ContactTrustKind.USER_IS_KEEPING ? 1 : 0.5,
              }}
              onPress={() => this.generateQR( 'recovery' )}
            >
              <Text style={styles.buttonText}>Show Recovery Key</Text>
              <Text style={styles.buttonSubText}>During wallet recovery process</Text>
            </TouchableOpacity>
            {this.props.openApproval && this.props.openApproval != null && this.props.availableKeepers.length && !this.props.IsCurrentLevel0 ? <TouchableOpacity
              style={styles.bottomButton}
              onPress={() => {
                this.setState( {
                  showQRClicked: true
                } )
                this.props.getApprovalFromKeepers( true, this.props.trustedContacts[ this.contact.channelKey ] )
              }}
            >
              <Text style={styles.buttonText}>Scan Approval Key</Text>
              <Text style={styles.buttonSubText}>Get Approval from other Keepers</Text>
            </TouchableOpacity>: <TouchableOpacity
              style={styles.bottomButton}
              onPress={() => {
                this.generateQR( 'approval' )
              }}
            >
              <Text style={styles.buttonText}>Show Approval Key</Text>
              <Text style={styles.buttonSubText}>Approve changes for the contact</Text>
            </TouchableOpacity> }
            {!this.props.openApproval && this.props.openApproval != null && encryptedExitKey ? (
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
                <View>
                  <Text style={styles.buttonText} numberOfLines={1}>
                    {encryptedExitKey ? 'Show Secondary Key' : 'Request Key'}
                  </Text>
                  {encryptedExitKey ? (
                    <Text numberOfLines={1} style={styles.buttonSubText}>
                      {'Help recover PDF'}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        {/* </View> */}
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
        <ModalContainer onBackground={()=>this.setState( {
          sendViaQRModel: false
        } )} visible={sendViaQRModel} closeBottomSheet={() => { }}>
          {this.renderSendViaQRContents()}
        </ModalContainer>
        <ModalContainer onBackground={()=>this.setState( {
          exitKeyModel: false
        } )} visible={exitKeyModel} closeBottomSheet={() => { }}>
          {this.renderExitKeyQRContents()}
        </ModalContainer>
        <ModalContainer onBackground={()=>this.setState( {
          edit: false
        } )} visible={edit} closeBottomSheet={() => this.setState( {
          edit: false
        } )}>
          <EditContactScreen contact={this.contact} closeModal={( name ) => {
            if ( name !== '' ) {
              this.contact.displayedName = name
            }
            this.setState( {
              edit: false,
              showContactDetails: true
            } )
          }} />
        </ModalContainer>
        <ModalContainer onBackground={()=>this.setState( {
          reshareModal: false
        } )} visible={reshareModal} closeBottomSheet={() => this.setState( {
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
                headerText: `Send Recovery Key${'\n'}to contact`,
                subHeaderText: 'Send Key to Keeper, you can change your Keeper, or their primary mode of contact',
                contactText: 'Sharing Recovery Key with',
                showDone: false,
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
        <ModalContainer onBackground={()=>this.setState( {
          showQRCode: false
        } )} visible={this.state.showQRCode} closeBottomSheet={() => this.setState( {
          showQRCode: false
        } )}>
          {this.SendShareModalFunction}
        </ModalContainer>
        <ModalContainer onBackground={()=>this.setState( {
          showQRScanner: false
        } )} visible={this.state.showQRScanner} closeBottomSheet={() => this.setState( {
          showQRScanner: false, showQRClicked: false
        } )}>
          <QRModal
            isFromKeeperDeviceHistory={false}
            QRModalHeader={'QR scanner'}
            title={'Note'}
            infoText={
              this.state.availableKeepersName ? 'To proceed please scan the Approval Key stored on your '+ this.state.availableKeepersName : 'Please approve this request by scanning the Approval Key stored with any of the other backups'
            }
            isOpenedFlag={this.state.showQRScanner}
            onQrScan={async( qrScannedData ) => {
              this.props.updateSecondaryShard( qrScannedData )
            }}
            onBackPress={() => {
              this.setState( {
                showQRScanner: false, showQRClicked: false
              } )
            }}
            onPressContinue={async() => {
              const qrScannedData = '{"type":"RECOVERY_REQUEST","walletName":"ShivaniNew","channelId":"016eb4ac3b68d312ac8301e5cedeececdc4b8e42a56e49fd849048ff3642da86","streamId":"65bf22a7c","channelKey":"0BvnLFWTJfNP3hFy43qYk136","secondaryChannelKey":"upToEzzuNHJ75QYqyRz9Q6Lc","version":"2.0.7","walletId":"2ca1d6a049f75ec5c693d76a896745e12438941d97921dfabfa6c3a4a1ac258d"}'
              this.props.updateSecondaryShard( qrScannedData )
            }}
          />
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
        {this.state.showLoader ? <Loader /> : null}
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
    keeperInfo: idx( state, ( _ ) => _.bhr.keeperInfo ),
    availableKeepers: idx( state, ( _ ) => _.bhr.availableKeepers ),
    openApproval: idx( state, ( _ ) => _.bhr.openApproval ),
    approvalContactData: idx( state, ( _ ) => _.bhr.approvalContactData ),
    updateSecondaryShardStatus: idx( state, ( _ ) => _.bhr.loading.updateSecondaryShardStatus ),
    getSecondaryDataInfoStatus: idx( state, ( _ ) => _.bhr.loading.getSecondaryDataInfoStatus ),
    IsCurrentLevel0: idx( state, ( _ ) => _.bhr.IsCurrentLevel0 ),
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
  updateSecondaryShard,
  getApprovalFromKeepers,
  setOpenToApproval,
  setSecondaryDataInfoStatus,
} )( ContactDetails )

const styles = StyleSheet.create( {
  CTAView: {
    // paddingHorizontal: wp( 2 ),
    paddingVertical: hp( 2 )
  },
  detailsView: {
    paddingHorizontal: wp( 8 ),
    paddingVertical: hp( 2 )
  },
  titleText: {
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 12 ),
    letterSpacing: 0.24,
    color: Colors.textColorGrey,
    marginTop: hp( 2 )
  },
  titleSubText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    marginRight: wp( 3 )
  },
  lastSeenText: {
    // marginBottom: 3,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  headerTitleText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 14 ),
    // marginBottom: wp( '1%' ),
    alignSelf: 'center',
    marginHorizontal: wp( 2 )
  },
  modalContainer: {
    backgroundColor: Colors.backgroundColor,
    alignSelf: 'center',
    paddingBottom: wp( '15%' ),
  },

  modalHeaderTitleView: {
    marginHorizontal: wp( 5 ),
    backgroundColor: Colors.backgroundColor1,
    borderRadius: wp( 2 ),
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 15,
    paddingTop: 10,
    // marginHorizontal: 20,
    marginBottom: 15,
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 10,
    elevation: 6,
  },
  contactTextBold: {
    marginLeft: 10,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.blue,
    letterSpacing: 0.01,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue( 20 ),
    letterSpacing: 0.01,
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
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
    width: wp( '16%' ),
    height: wp( '16%' ),
    borderRadius: wp( '16%' ) / 2,
  },
  headerImageInitials: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.shadowBlue,
    width: wp( '16%' ),
    height: wp( '16%' ),
    borderRadius: wp( '16%' ) / 2,
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
  buttonSubText: {
    marginTop: hp( 0.4 ),
    color: Colors.white,
    fontSize: RFValue( 11 ),
    letterSpacing: 0.5,
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    width: wp( '46%' )
  },
  buttonText: {
    color: Colors.backgroundColor1,
    fontSize: RFValue( 15 ),
    letterSpacing: 0.01,
    fontFamily: Fonts.FiraSansMedium,
    // marginLeft: 10,
    // marginRight: 10,
    marginLeft: 0,
    marginRight: 0,
    width: wp( '46%' ),
    textAlign: 'center'
  },
  buttonInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 5,
    marginLeft: 10,
  },
  bottomButton: {
    backgroundColor: Colors.lightBlue,
    height: wp( '18%' ),
    width: wp( '47%' ),
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
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp( 3 )
  },
  contactTypeText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 10 ),
    marginLeft: 10,
  },
  resendContainer: {
    height: wp( '6%' ),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    marginLeft: 'auto',
    marginTop: hp( 1 ),
    borderRadius: 4,
    flexDirection: 'row',
    alignSelf: 'center',
    paddingLeft: wp( '1.5%' ),
    paddingRight: wp( '1.5%' ),
    marginRight: wp( 5 )
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
    backgroundColor: Colors.backgroundColor,
    paddingTop: wp( '3%' ),
    paddingBottom: wp( '4%' ),
    height: wp( '30' ),
  },
} )
