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
  AsyncStorage,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
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
  addTransferDetails,
  clearTransfer,
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
  uploadEncMShare,
} from '../../store/actions/sss'
import S3Service from '../../bitcoin/services/sss/S3Service'
import ErrorModalContents from '../../components/ErrorModalContents'
import config from '../../bitcoin/HexaConfig'
import SendViaQR from '../../components/SendViaQR'
import BottomInfoBox from '../../components/BottomInfoBox'
import SendShareModal from '../ManageBackup/SendShareModal'
import {
  EphemeralDataElements,
  MetaShare,
} from '../../bitcoin/utilities/Interface'
import { removeTrustedContact } from '../../store/actions/trustedContacts'
import AccountShell from '../../common/data/models/AccountShell'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { resetStackToSend } from '../../navigation/actions/NavigationActions'

const getImageIcon = ( item ) => {
  if ( item ) {
    if ( item.imageAvailable ) {
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
                {item
                  ? nameToInitials(
                    item.firstName && item.lastName
                      ? item.firstName + ' ' + item.lastName
                      : item.firstName && !item.lastName
                        ? item.firstName
                        : !item.firstName && item.lastName
                          ? item.lastName
                          : ''
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
  addTransferDetails: any;
  UploadSuccessfully: any;
  uploadRequestedShare: any;
  uploadEncMShare: any;
  updateEphemeralChannel: any;
  removeTrustedContact: any;
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
  itemIndex: any;
  index: any;
  setIsSendDisabledListener: any;

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
    }

    this.Contact = this.props.navigation.state.params.contact
    this.contactsType = this.props.navigation.state.params.contactsType
    this.itemIndex = this.props.navigation.state.params.index
    this.index = this.props.navigation.state.params.shareIndex
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

    this.setContactData()

    if ( this.contactsType == 'My Keepers' ) {
      this.saveInTransitHistory( 'inTransit' )
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
    if ( prevProps.uploadSuccessfull !== this.props.uploadSuccessfull ) {
      this.generateHelpRestoreQR()
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
    this.updateContactDetailsUI()
  }

  updateContactDetailsUI = () => {
    const { SHARES_TRANSFER_DETAILS } = this.props.DECENTRALIZED_BACKUP
    const { trustedContacts, WALLET_SETUP } = this.props
    if ( this.Contact.firstName && SHARES_TRANSFER_DETAILS[ this.index ] ) {
      const contactName = `${this.Contact.firstName} ${
        this.Contact.lastName ? this.Contact.lastName : ''
      }`
        .toLowerCase()
        .trim()

      if ( contactName === 'secondary device' ) return

      if ( !trustedContacts.tc.trustedContacts[ contactName ] ) return

      this.createDeepLink()

      const { publicKey, otp } = trustedContacts.tc.trustedContacts[
        contactName
      ]

      let info = ''
      if ( this.Contact.phoneNumbers && this.Contact.phoneNumbers.length ) {
        const phoneNumber = this.Contact.phoneNumbers[ 0 ].number
        let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
        number = number.slice( number.length - 10 ) // last 10 digits only
        info = number
      } else if ( this.Contact.emails && this.Contact.emails.length ) {
        info = this.Contact.emails[ 0 ].email
      } else if ( otp ) {
        info = otp
      }

      this.setState( {
        trustedQR: JSON.stringify( {
          isGuardian: true,
          requester: WALLET_SETUP.walletName,
          publicKey,
          info,
          uploadedAt:
            trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
              .initiatedAt,
          type: 'trustedGuardian',
          ver: DeviceInfo.getVersion(),
        } ),
      } )
    }
  };

  onPressSend = () => {
    this.props.clearTransfer( REGULAR_ACCOUNT )

    if ( this.contactsType == 'My Keepers' ) {
      this.saveInTransitHistory( 'isSent' )
    }
    this.props.addTransferDetails( REGULAR_ACCOUNT, {
      selectedContact: this.Contact,
    } )

    let defaultAccountShell: AccountShell
    const { accountShells } = this.props
    accountShells.forEach( ( shell: AccountShell ) => {
      if (
        shell.primarySubAccount.kind === SubAccountKind.REGULAR_ACCOUNT &&
        !shell.primarySubAccount.instanceNumber
      )
        defaultAccountShell = shell
    } )

    this.props.navigation.navigate( 'SendToContact', {
      accountShellID: defaultAccountShell.id,
      spendableBalance: AccountShell.getSpendableBalance( defaultAccountShell ),
      selectedContact: this.Contact,
      serviceType: REGULAR_ACCOUNT,
      isFromAddressBook: true,
    } )

  };

  onPressResendRequest = () => {
    if ( this.index < 3 ) {
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

  updateHistory = ( shareHistory ) => {
    const updatedTrustedContactHistory = [ ...this.state.trustedContactHistory ]
    if ( shareHistory[ this.index ].createdAt )
      updatedTrustedContactHistory[ 0 ].date = shareHistory[ this.index ].createdAt
    if ( shareHistory[ this.index ].inTransit )
      updatedTrustedContactHistory[ 1 ].date = shareHistory[ this.index ].inTransit
    if ( shareHistory[ this.index ].accessible )
      updatedTrustedContactHistory[ 2 ].date =
        shareHistory[ this.index ].accessible
    if ( shareHistory[ this.index ].notAccessible )
      updatedTrustedContactHistory[ 3 ].date =
        shareHistory[ this.index ].notAccessible
    if ( shareHistory[ this.index ].inSent )
      updatedTrustedContactHistory[ 4 ].date = shareHistory[ this.index ].inSent
    this.setState( {
      trustedContactHistory: updatedTrustedContactHistory,
    } )
  };

  saveInTransitHistory = async ( type ) => {
    const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
    if ( shareHistory ) {
      const updatedShareHistory = [ ...shareHistory ]
      if ( type == 'inTransit' ) {
        updatedShareHistory[ this.index ] = {
          ...updatedShareHistory[ this.index ],
          inTransit: Date.now(),
        }
      }
      if ( type == 'isSent' ) {
        updatedShareHistory[ this.index ] = {
          ...updatedShareHistory[ this.index ],
          inSent: Date.now(),
        }
      }
      this.updateHistory( updatedShareHistory )
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify( updatedShareHistory )
      )
    }
  };

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

  generateHelpRestoreQR = () => {
    const { trustedContacts, UNDER_CUSTODY, UploadSuccessfully } = this.props
    if ( !this.Contact ) {
      Alert.alert( 'Contact details missing' )
      return
    }

    const contactName = `${this.Contact.firstName} ${
      this.Contact.lastName ? this.Contact.lastName : ''
    }`
      .toLowerCase()
      .trim()

    if (
      !trustedContacts.tc.trustedContacts[ contactName ] &&
      !trustedContacts.tc.trustedContacts[ contactName ].isWard
    ) {
      Alert.alert(
        'Restore request failed',
        'You are not a keeper of the selected contact'
      )
      return
    }

    const requester =
      trustedContacts.tc.trustedContacts[ contactName ].contactsWalletName
    const appVersion = DeviceInfo.getVersion()
    if (
      UNDER_CUSTODY[ requester ] &&
      UNDER_CUSTODY[ requester ].TRANSFER_DETAILS &&
      Date.now() - UNDER_CUSTODY[ requester ].TRANSFER_DETAILS.UPLOADED_AT <
        config.TC_REQUEST_EXPIRY
    ) {
      const { KEY, UPLOADED_AT } = UNDER_CUSTODY[ requester ].TRANSFER_DETAILS

      this.setState( {
        trustedQR: JSON.stringify( {
          requester: requester,
          publicKey: KEY,
          uploadedAt: UPLOADED_AT,
          type: 'ReverseRecoveryQR',
          ver: appVersion,
        } ),
      } )

      setTimeout( () => {
        ( this.SendViaQRBottomSheet as any ).current.snapTo( 1 )
      }, 2 )

      UploadSuccessfully( null )
    }
  };

  setContactData = () => {
    const { trustedContacts, UNDER_CUSTODY } = this.props
    if ( !this.Contact || !this.Contact.isWard ) {
      return
    }

    const contactName = `${this.Contact.firstName} ${
      this.Contact.lastName ? this.Contact.lastName : ''
    }`
      .toLowerCase()
      .trim()

    if (
      !trustedContacts.tc.trustedContacts[ contactName ] &&
      !trustedContacts.tc.trustedContacts[ contactName ].isWard
    ) {
      return
    }
    const requester =
      trustedContacts.tc.trustedContacts[ contactName ].contactsWalletName

    const metaShare: MetaShare = UNDER_CUSTODY[ requester ].META_SHARE
    if ( metaShare.meta.index === 0 ) {
      const encryptedExitKey = metaShare.encryptedStaticNonPMDD
      this.setState( {
        encryptedExitKey: JSON.stringify( {
          type: 'encryptedExitKey',
          encryptedExitKey,
        } ),
      } )
    }
  };

  onHelpRestore = () => {
    const { trustedContacts, UNDER_CUSTODY, uploadRequestedShare } = this.props
    if ( !this.Contact ) {
      console.log( 'Err: Contact missing' )
      return
    }

    const contactName = `${this.Contact.firstName} ${
      this.Contact.lastName ? this.Contact.lastName : ''
    }`
      .toLowerCase()
      .trim()

    if (
      !trustedContacts.tc.trustedContacts[ contactName ] &&
      !trustedContacts.tc.trustedContacts[ contactName ].isWard
    ) {
      Alert.alert(
        'Restore request failed',
        'You are not a keeper of the selected contact'
      )
      return
    }
    const requester =
      trustedContacts.tc.trustedContacts[ contactName ].contactsWalletName
    const encryptionKey = S3Service.generateRequestCreds().key

    if (
      !UNDER_CUSTODY[ requester ] ||
      !UNDER_CUSTODY[ requester ].TRANSFER_DETAILS
    ) {
      uploadRequestedShare( requester, encryptionKey )
    } else if (
      Date.now() - UNDER_CUSTODY[ requester ].TRANSFER_DETAILS.UPLOADED_AT >
      config.TC_REQUEST_EXPIRY
    ) {
      uploadRequestedShare( requester, encryptionKey )
    } else {
      this.generateHelpRestoreQR()
    }
  };

  createGuardian = async () => {
    const {
      trustedContacts,
      uploadEncMShare,
      updateEphemeralChannel,
      DECENTRALIZED_BACKUP,
    } = this.props
    const { SHARES_TRANSFER_DETAILS } = DECENTRALIZED_BACKUP
    if ( !Object.keys( this.Contact ).length ) return
    if (
      this.Contact.firstName &&
      ( ( this.Contact.phoneNumbers && this.Contact.phoneNumbers.length ) ||
        ( this.Contact.emails && this.Contact.emails.length ) )
    ) {
      const walletID = await AsyncStorage.getItem( 'walletID' )
      const FCM = await AsyncStorage.getItem( 'fcmToken' )
      console.log( {
        walletID, FCM
      } )

      const contactName = `${this.Contact.firstName} ${
        this.Contact.lastName ? this.Contact.lastName : ''
      }`
        .toLowerCase()
        .trim()
      const data: EphemeralDataElements = {
        walletID,
        FCM,
      }
      const trustedContact = trustedContacts.tc.trustedContacts[ contactName ]

      if (
        !SHARES_TRANSFER_DETAILS[ this.index ] ||
        Date.now() - SHARES_TRANSFER_DETAILS[ this.index ].UPLOADED_AT >
          config.TC_REQUEST_EXPIRY
      ) {
        this.setState( {
          trustedLink: '',
          trustedQR: '',
        } )
        uploadEncMShare( this.index, contactName, data )
      } else if (
        trustedContact &&
        !trustedContact.symmetricKey &&
        trustedContact.ephemeralChannel &&
        trustedContact.ephemeralChannel.initiatedAt &&
        Date.now() - trustedContact.ephemeralChannel.initiatedAt >
          config.TC_REQUEST_EXPIRY
      ) {
        this.setState( {
          trustedLink: '',
          trustedQR: '',
        } )
        updateEphemeralChannel(
          contactName,
          trustedContact.ephemeralChannel.data[ 0 ]
        )
      }
    } else {
      // case: OTP
      // Alert.alert(
      //   'Invalid Contact',
      //   'Cannot add a contact without phone-num/email as a entity',
      // );
    }
  };

  createDeepLink = () => {
    const {
      uploadMetaShare,
      updateEphemeralChannelLoader,
      trustedContacts,
      WALLET_SETUP,
      DECENTRALIZED_BACKUP,
    } = this.props
    const { SHARES_TRANSFER_DETAILS } = DECENTRALIZED_BACKUP
    if ( uploadMetaShare || updateEphemeralChannelLoader ) {
      if ( this.state.trustedLink ) {
        this.setState( {
          trustedLink: '',
        } )
      }
      if ( this.state.trustedQR ) {
        this.setState( {
          trustedQR: '',
        } )
      }
      return
    }
    if ( !SHARES_TRANSFER_DETAILS[ this.index ] ) {
      this.setState( {
        errorMessageHeader: 'Failed to share',
        errorMessage:
          'There was some error while sharing the Recovery Key, please try again',
      } );
      ( this.ErrorBottomSheet as any ).current.snapTo( 1 )
      return
    }
    if ( !this.Contact ) {
      return
    }

    const contactName = `${this.Contact.firstName} ${
      this.Contact.lastName ? this.Contact.lastName : ''
    }`
      .toLowerCase()
      .trim()

    if (
      !trustedContacts.tc.trustedContacts[ contactName ] &&
      !trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
    ) {
      console.log(
        'Err: Contact/Ephemeral Channel does not exists for contact: ',
        contactName
      )
      return
    }

    const { publicKey, otp } = trustedContacts.tc.trustedContacts[ contactName ]
    const requester = WALLET_SETUP.walletName
    const appVersion = DeviceInfo.getVersion()
    if ( this.Contact.phoneNumbers && this.Contact.phoneNumbers.length ) {
      const phoneNumber = this.Contact.phoneNumbers[ 0 ].number
      console.log( {
        phoneNumber
      } )
      let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
      number = number.slice( number.length - 10 ) // last 10 digits only
      const numHintType = 'num'
      const numHint = number[ 0 ] + number.slice( number.length - 2 )
      const numberEncPubKey = TrustedContactsService.encryptPub(
        publicKey,
        number
      ).encryptedPub
      const numberDL =
        `https://hexawallet.io/${config.APP_STAGE}/tcg` +
        `/${requester}` +
        `/${numberEncPubKey}` +
        `/${numHintType}` +
        `/${numHint}` +
        `/${trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel.initiatedAt}` +
        `/v${appVersion}`
      this.setState( {
        trustedLink: numberDL,
      } )
    } else if ( this.Contact.emails && this.Contact.emails.length ) {
      const email = this.Contact.emails[ 0 ].email
      const emailHintType = 'eml'
      const trucatedEmail = email.replace( '.com', '' )
      const emailHint =
        email[ 0 ] + trucatedEmail.slice( trucatedEmail.length - 2 )
      const emailEncPubKey = TrustedContactsService.encryptPub( publicKey, email )
        .encryptedPub
      const emailDL =
        `https://hexawallet.io/${config.APP_STAGE}/tcg` +
        `/${requester}` +
        `/${emailEncPubKey}` +
        `/${emailHintType}` +
        `/${emailHint}` +
        `/${trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel.initiatedAt}` +
        `/v${appVersion}`
      this.setState( {
        trustedLink: emailDL,
      } )
    } else if ( otp ) {
      const otpHintType = 'otp'
      const otpHint = 'xxx'
      const otpEncPubKey = TrustedContactsService.encryptPub( publicKey, otp )
        .encryptedPub
      const otpDL =
        `https://hexawallet.io/${config.APP_STAGE}/tc` +
        `/${requester}` +
        `/${otpEncPubKey}` +
        `/${otpHintType}` +
        `/${otpHint}` +
        `/${trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel.initiatedAt}` +
        `/v${appVersion}`

      console.log( {
        otpDL
      } )
      this.setState( {
        trustedLink: otpDL,
      } )
    } else {
      Alert.alert( 'Invalid Contact', 'Something went wrong.' )
      return
    }
  };

  SendShareModalFunction = () => {
    if ( !isEmpty( this.Contact ) ) {
      return (
        <SendShareModal
          contact={this.Contact ? this.Contact : null}
          textHeader={'Sharing Key with'}
          onPressViaQr={() => {
            this.createGuardian()
            if ( this.SendViaQRBottomSheet.current )
              ( this.SendViaQRBottomSheet as any ).current.snapTo( 1 );
            ( this.shareBottomSheet as any ).current.snapTo( 0 )
          }}
          onPressViaLink={() => {
            this.createGuardian()
            if ( this.SendViaLinkBottomSheet.current )
              ( this.SendViaLinkBottomSheet as any ).current.snapTo( 1 );
            ( this.shareBottomSheet as any ).current.snapTo( 0 )
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
        headerText={'Send Recovery Secret'}
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
    const { navigation, uploading } = this.props
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
                    : this.Contact.contactName == 'Secondary Device'
                      ? 'Keeper Device'
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
              {this.Contact.hasTrustedChannel &&
              !(
                this.Contact.hasXpub || this.Contact.hasTrustedAddress
              ) ? null : this.Contact.contactName === 'Secondary Device' &&
                !(
                  this.Contact.hasXpub || this.Contact.hasTrustedAddress
                ) ? null : (
                    <TouchableOpacity
                      disabled={isSendDisabled}
                      onPress={() => {
                        this.setState( {
                          isSendDisabled: true,
                        } )

                        this.Contact.hasXpub || this.Contact.hasTrustedAddress
                          ? this.onPressSend()
                          : this.Contact.contactName != 'Secondary Device'
                            ? this.onPressResendRequest()
                            : null
                      }}
                      style={styles.resendContainer}
                    >
                      {this.Contact.hasXpub || this.Contact.hasTrustedAddress ? (
                        <Image
                          source={require( '../../assets/images/icons/icon_bitcoin_light.png' )}
                          style={styles.bitcoinIconStyle}
                        />
                      ) : null}
                      <Text style={styles.sendTextStyle}>
                        {this.Contact.hasXpub || this.Contact.hasTrustedAddress
                          ? 'Send'
                          : this.index < 3
                            ? 'Reshare'
                            : 'Resend Request'}
                      </Text>
                    </TouchableOpacity>
                  )}
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
                onPress={this.onHelpRestore}
              >
                <Image
                  source={require( '../../assets/images/icons/icon_restore.png' )}
                  style={styles.buttonImage}
                />
                <View>
                  {uploading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Help Restore</Text>
                  )}
                  {/* <Text numberOfLines={1} style={styles.buttonInfo}>
                    Lorem ipsum dolor
                  </Text> */}
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
                    <Text style={styles.buttonText}>
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
          {this.Contact.isRemovable ? (
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
                        this.props.removeTrustedContact(
                          contact.contactName,
                          contact.shareIndex
                        )
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
                <Text style={styles.buttonText}>Remove</Text>
              </View>
            </TouchableOpacity>
          ) : null}
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
              ? hp( '50%' )
              : hp( '65%' ),
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
    errorSending: idx( state, ( _ ) => _.sss.errorSending ),
    uploadSuccessfull: idx( state, ( _ ) => _.sss.uploadSuccessfully ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
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
  }
}
export default connect( mapStateToProps, {
  addTransferDetails,
  clearTransfer,
  UploadSuccessfully,
  uploadEncMShare,
  uploadRequestedShare,
  ErrorSending,
  removeTrustedContact,
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
