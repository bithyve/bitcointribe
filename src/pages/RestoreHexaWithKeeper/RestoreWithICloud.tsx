import React, { Component } from 'react'
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
  ImageBackground,
  Alert,
  RefreshControl,
  Modal,
  Keyboard,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { withNavigationFocus } from 'react-navigation'
import { connect } from 'react-redux'
import {
  fetchEphemeralChannel,
  clearPaymentDetails,
  walletCheckIn,
} from '../../store/actions/trustedContacts'
import idx from 'idx'
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter'
import moment from 'moment'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../../components/ModalHeader'
import RestoreFromICloud from './RestoreFromICloud'
import DeviceInfo from 'react-native-device-info'
import RestoreSuccess from './RestoreSuccess'
import ICloudBackupNotFound from './ICloudBackupNotFound'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { requestTimedout } from '../../store/utils/utilities'
import RestoreWallet from './RestoreWallet'
import { REGULAR_ACCOUNT } from '../../common/constants/wallet-service-types'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import { deviceText, isEmpty } from '../../common/CommonFunctions'
import CloudBackup from '../../common/CommonFunctions/CloudBackup'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import SSS from '../../bitcoin/utilities/sss/SSS'
import { decrypt, decrypt1 } from '../../common/encryption'
import LoaderModal from '../../components/LoaderModal'
import TransparentHeaderModal from '../../components/TransparentHeaderModal'
import Loader from '../../components/loader'
import {
  checkMSharesHealth,
  recoverWalletUsingIcloud,
  downloadMShare,
  recoverWallet,
  updateCloudMShare,
  downloadPdfShare,
} from '../../store/actions/health'
import axios from 'axios'
import { initializeHealthSetup, initNewBHRFlow } from '../../store/actions/health'
import ErrorModalContents from '../../components/ErrorModalContents'
import { MetaShare } from '../../bitcoin/utilities/Interface'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import config from '../../bitcoin/HexaConfig'
import { textWithoutEncoding, email } from 'react-native-communications'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { requestShare } from '../../store/actions/sss'
import ContactListForRestore from './ContactListForRestore'
import SendViaLink from '../../components/SendViaLink'
import LevelHealth from '../../bitcoin/utilities/LevelHealth/LevelHealth'
import ShareOtpWithTrustedContact from '../ManageBackup/ShareOtpWithTrustedContact'
import { getCloudDataRecovery, clearCloudCache, setCloudBackupStatus } from '../../store/actions/cloud'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { setVersion } from '../../store/actions/versionHistory'
import QuestionList from '../../common/QuestionList'
import SecurityQuestion from './SecurityQuestion'
import { initializeRecovery } from '../../store/actions/setupAndAuth'



const LOADER_MESSAGE_TIME = 2000
let messageIndex = 0
const loaderMessages = [
  {
    heading: 'Bootstrapping Accounts',
    text: 'Hexa has a multi-account model which lets you better manage your bitcoin (sats)',
    subText: '',
  },
  {
    heading: 'Filling Test Account with test sats',
    text:
      'Preloaded Test Account is the best place to start your Bitcoin journey',
    subText: '',
  },
  {
    heading: 'Generating Recovery Keys',
    text: 'Recovery Keys help you restore your Hexa wallet in case your phone is lost',
    subText: '',
  },
  {
    heading: 'Manage Backup',
    text:
      'You can backup your wallet at 3 different levels of security\nAutomated cloud backup | Double backup | Multi-key backup',
    subText: '',
  },
  {
    heading: 'Level 1 - Automated Cloud Backup',
    text: 'Allow Hexa to automatically backup your wallet to your cloud storage and we’ll ensure you easily recover your wallet in case your phone gets lost',
    subText: '',
  },
  {
    heading: 'Level 2 - Double Backup',
    text: 'Starting to hodl sats and bitcoin? Ensure that you backup your wallet atleast to Level 2 backup called Double Backup',
    subText: '',
  },
  {
    heading: 'Level 3 - Multi-key Backup',
    text: 'For hardcore Bitcoiners who understand Bitcoin, stack large amounts of sats or bitcoin and care for utmost security of their wallet',
    subText: '',
  }
]
interface RestoreWithICloudStateTypes {
  selectedIds: any[];
  listData: any[];
  walletsArray: any[];
  cloudBackup: boolean;
  hideShow: boolean;
  selectedBackup: any;
  metaShares: any[];
  showLoader: boolean;
  refreshControlLoader: boolean;
  selectedContact: any;
  linkToRequest: string;
  contactList: any[];
  isOtpType: boolean;
  otp: string;
  renderTimer: boolean;
  isLinkCreated: boolean;
  loaderMessage: {heading:string; text: string; subText?: string;};
  walletName: string;
  question: string;
  answer: string;
}

interface RestoreWithICloudPropsTypes {
  navigation: any;
  regularAccount: RegularAccount;
  s3Service: any;
  cloudBackupStatus: any;
  database: any;
  security: any;
  recoverWalletUsingIcloud: any;
  accounts: any;
  walletImageChecked: any;
  SERVICES: any;
  checkMSharesHealth: any;
  calculateExchangeRate: any;
  initializeHealthSetup: any;
  downloadMShare: any;
  downloadPdfShare: any;
  metaShare: any;
  DECENTRALIZED_BACKUP: any;
  recoverWallet: any;
  updateCloudMShare: any;
  walletRecoveryFailed: boolean;
  requestShare: any;
  downloadMetaShare: Boolean;
  errorReceiving: Boolean;
  getCloudDataRecovery: any;
  cloudData: any;
  clearCloudCache: any;
  initNewBHRFlow: any;
  walletCheckIn: any;
  setVersion: any;
  initializeRecovery: any;
  setCloudBackupStatus: any;
}

class RestoreWithICloud extends Component<
  RestoreWithICloudPropsTypes,
  RestoreWithICloudStateTypes
> {
    RestoreFromICloud: any;
    ContactListForRestore: any;
    RestoreSuccess: any;
    BackupNotFound: any;
    RestoreWallet: any;
    loaderBottomSheet: any;
    ErrorBottomSheet: any;
    SendViaLinkBottomSheet: any;
    shareOtpWithTrustedContactBottomSheet: any;
    SecurityQuestionBottomSheet: any;

    constructor( props ) {
      super( props )
      this.RestoreFromICloud = React.createRef()
      this.ContactListForRestore = React.createRef()
      this.RestoreSuccess = React.createRef()
      this.BackupNotFound = React.createRef()
      this.RestoreWallet = React.createRef()
      this.loaderBottomSheet = React.createRef()
      this.ErrorBottomSheet = React.createRef()
      this.SecurityQuestionBottomSheet = React.createRef()
      this.SendViaLinkBottomSheet = React.createRef()
      this.shareOtpWithTrustedContactBottomSheet = React.createRef()

      this.state = {
        selectedIds: [],
        listData: [],
        walletsArray: [],
        cloudBackup: false,
        hideShow: false,
        selectedBackup: {
          data: '',
          dateTime: '',
          walletId: '',
          walletName: '',
          levelStatus: '',
          shares: '',
          keeperData: '',
        },
        metaShares: [],
        showLoader: false,
        refreshControlLoader: false,
        selectedContact: {
        },
        linkToRequest: '',
        contactList: [],
        isOtpType: false,
        otp: '',
        renderTimer: false,
        isLinkCreated: false,
        walletName: '',
        loaderMessage:  {
          heading:'Creating your wallet', text: 'This may take some time while Hexa is using the Recovery Keys to recreate your wallet'
        },
        question: '',
        answer: ''
      }
    }

  componentDidMount = () => {
    this.cloudData()
  };

  cloudData = () => {
    //console.log("INSIDE cloudData componentDidMount");
    this.setState( {
      showLoader: true
    } )
    this.props.getCloudDataRecovery()
  };

  componentDidUpdate = async ( prevProps, prevState ) => {
    const {
      walletImageChecked,
      SERVICES,
      checkMSharesHealth,
      walletRecoveryFailed,
      cloudData,
      walletCheckIn,
      initNewBHRFlow,
      setVersion,
      cloudBackupStatus
    } = this.props
    if( prevProps.cloudData !== cloudData && cloudData ){
      this.getData( cloudData )
    }

    if( prevProps.cloudBackupStatus !== cloudBackupStatus && cloudBackupStatus === CloudBackupStatus.FAILED ){
      this.setState( ( state ) => ( {
        showLoader: false,
      } ) )
      this.props.setCloudBackupStatus( CloudBackupStatus.PENDING );
      ( this.BackupNotFound as any ).current.snapTo( 1 )
    }

    if ( SERVICES && prevProps.walletImageChecked !== walletImageChecked ) {
      await AsyncStorage.setItem( 'walletExists', 'true' )
      await AsyncStorage.setItem( 'walletRecovered', 'true' )
      setVersion( 'Restored' )
      initNewBHRFlow( true )
      checkMSharesHealth()
      walletCheckIn()
      if ( this.loaderBottomSheet as any )
        ( this.loaderBottomSheet as any ).current.snapTo( 0 )
      this.props.navigation.navigate( 'HomeNav' )
    }

    if (
      JSON.stringify( prevProps.DECENTRALIZED_BACKUP.RECOVERY_SHARES ) !==
      JSON.stringify( this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES )
    ) {
      //console.log("INSIDE prevProps.DECENTRALIZED_BACKUP.RECOVERY_SHARES");
      if ( !isEmpty( this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES ) ) {
        this.updateList()
      }
    }

    if ( prevProps.walletRecoveryFailed !== walletRecoveryFailed ) {
      if ( this.loaderBottomSheet as any )
        ( this.loaderBottomSheet as any ).current.snapTo( 0 )
    }

    if( prevProps.errorReceiving !== this.props.errorReceiving && this.props.errorReceiving === true ){
      this.setState( {
        showLoader: false
      } );
      ( this.BackupNotFound as any ).current.snapTo( 1 )
      if ( this.loaderBottomSheet as any )
        ( this.loaderBottomSheet as any ).current.snapTo( 0 )
    }

    if (
      !this.state.isLinkCreated &&
      this.state.contactList.length &&
      this.props.database.DECENTRALIZED_BACKUP.RECOVERY_SHARES[ 0 ] &&
      this.props.database.DECENTRALIZED_BACKUP.RECOVERY_SHARES[ 0 ].META_SHARE
    ) {
      this.setState( {
        isLinkCreated: true
      } )
      this.onCreatLink()
    }
  };

  componentWillUnmount = () =>{
    console.log( 'Inside componentWillUnmount' )
    this.props.clearCloudCache()
  }

  updateList = () => {
    //console.log("INSIDE updateList");
    const { listData, selectedBackup } = this.state

    let updatedListData = []
    const shares: MetaShare[] = []
    updatedListData = [ ...listData ]
    //console.log("this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES", this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES);
    //console.log("type of", typeof this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES)
    shares.push( this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES[ 0 ].META_SHARE )
    Object.keys( this.props.DECENTRALIZED_BACKUP.RECOVERY_SHARES ).forEach(
      ( key ) => {
        const META_SHARE: MetaShare = this.props.DECENTRALIZED_BACKUP
          .RECOVERY_SHARES[ key ].META_SHARE
        if ( META_SHARE ) {
          let insert = true
          shares.forEach( ( share ) => {
            if ( share.shareId === META_SHARE.shareId ) insert = false
          }, [] )

          if ( insert ) {
            for ( let i = 0; i < updatedListData.length; i++ ) {
              if ( META_SHARE.shareId === updatedListData[ i ].shareId ) {
                updatedListData[ i ].status = 'received'
                shares.push( META_SHARE )
                break
              }
            }
          }
        }
      }
    )
    this.setState( {
      listData: updatedListData, showLoader: false
    }, () => {
      console.log(
        'listData inside setState',
        this.state.listData,
        this.state.showLoader
      )
    } )
    //console.log("updatedListData shares", shares);
    if ( shares.length === 2 || shares.length === 3 ) {
      this.checkForRecoverWallet( shares, selectedBackup )
    }
    //console.log("updatedListData sefsgsg", updatedListData);
  };

  checkForRecoverWallet = ( shares, selectedBackup ) => {
    const key = SSS.strechKey( this.state.answer )
    const KeeperData = JSON.parse( selectedBackup.keeperData )
    const decryptedCloudDataJson = decrypt( selectedBackup.data, key )
    //console.log('decryptedCloudDataJson checkForRecoverWallet', decryptedCloudDataJson);

    if ( shares.length === 2 && selectedBackup.levelStatus === 2 ) {
      //console.log("INSIDE IF SHARES", shares.length, selectedBackup.levelStatus);
      this.showLoaderModal()
      this.recoverWallet(
        selectedBackup.levelStatus,
        KeeperData,
        decryptedCloudDataJson
      )
    } else if ( shares.length === 3 && selectedBackup.levelStatus === 3 ) {
      // console.log("INSIDE IF SHARES ### 3", shares.length, selectedBackup.levelStatus);
      this.showLoaderModal()
      this.recoverWallet(
        selectedBackup.levelStatus,
        KeeperData,
        decryptedCloudDataJson
      )
    }
  };

  recoverWallet = ( levelStatus, KeeperData, decryptedCloudDataJson ) => {
    setTimeout( () => {
      this.props.recoverWallet( levelStatus, KeeperData, decryptedCloudDataJson )
    }, 2 )
  };

  getData = ( result ) => {
    console.log( 'FILE DATA', result )
    if ( result ) {
      let arr = []
      const newArray = []
      try {
        arr = JSON.parse( result )
      } catch ( error ) {
        //console.log('ERROR', error);
      }
      if ( arr && arr.length ) {
        for ( let i = 0; i < arr.length; i++ ) {
          newArray.push( arr[ i ] )
        }
      }
      console.log( 'ARR', newArray )
      this.setState( ( state ) => ( {
        selectedBackup: newArray[ 0 ],
        walletsArray: newArray,
        showLoader: false,
      } ) );
      ( this.RestoreFromICloud as any ).current.snapTo( 1 )
    } else {
      this.setState( ( state ) => ( {
        showLoader: false,
      } ) );
      ( this.BackupNotFound as any ).current.snapTo( 1 )
    }
  };

  getQuestion = ( questionId ) => {
    return QuestionList.filter( item => {
      if( item.id === questionId ) return item.question
    } )
  }

  restoreWallet = () => {
    const { selectedBackup } = this.state
    console.log( 'selectedBackup', selectedBackup )
    this.setState( {
      walletName: selectedBackup.walletName
    } )
    this.getSecurityQuestion( selectedBackup.questionId, selectedBackup.question )

  };

  getSecurityQuestion = ( questionId, question1 ) =>{
    if( Number( questionId ) > 0 ){
      const question = this.getQuestion( questionId )
      console.log( 'Question', question )
      this.setState( {
        question : question[ 0 ].question
      } )
    } else if( questionId === '0' ){
      this.setState( {
        question: question1
      } )
    }
    ( this.SecurityQuestionBottomSheet as any ).current.snapTo( 1 )
  }

  setSecurityQuestionAndName = async () =>{
    const { answer, question, walletName,  } = this.state
    console.log( 'answer, question, walletName', answer, question, walletName )
    if( answer && question && walletName ){
      const security = {
        question,
        answer,
      }
      this.props.initializeRecovery( walletName, security )}

  }

  decryptCloudJson = () =>{
    const listDataArray = []
    const { recoverWalletUsingIcloud, accounts } = this.props
    const { answer, selectedBackup } = this.state
    try{
      const key = SSS.strechKey( answer )
      const decryptedCloudDataJson = decrypt( selectedBackup.data, key )
      console.log( 'decryptedCloudDataJson', decryptedCloudDataJson )
      if( decryptedCloudDataJson ) this.setSecurityQuestionAndName()

      if (
        decryptedCloudDataJson &&
      selectedBackup.shares &&
      selectedBackup.keeperData
      ) {
        this.setState( {
          cloudBackup: true
        } )
        this.props.updateCloudMShare( JSON.parse( selectedBackup.shares ), 0 )
        let KeeperData = JSON.parse( selectedBackup.keeperData )
        const levelStatus = selectedBackup.levelStatus
        if ( levelStatus === 2 ) KeeperData = KeeperData.slice( 0, 2 )
        if ( levelStatus === 3 ) KeeperData = KeeperData.slice( 2, 6 )
        let obj
        const list = []
        //console.log("KEEPERDATA slice", KeeperData)
        for ( let i = 0; i < KeeperData.length; i++ ) {
          obj = {
            type: KeeperData[ i ].type,
            title: KeeperData[ i ].name,
            info: '',
            time: timeFormatter(
              moment( new Date() ),
              moment( selectedBackup.dateTime ).valueOf()
            ),
            status: 'waiting',
            image: null,
            shareId: KeeperData[ i ].shareId,
            data: KeeperData[ i ].data,
          }
          console.log( 'KeeperData[i].type', KeeperData[ i ].type )
          if ( KeeperData[ i ].type == 'contact' ) {
            list.push( KeeperData[ i ] )
          }
          listDataArray.push( obj )
        }
        console.log( 'list', list )
        this.setState( {
          contactList: list
        } )
        this.setState( {
          listData: listDataArray
        } );
        // if(selectedBackup.type == "device"){
        ( this.RestoreFromICloud as any ).current.snapTo( 0 )
      } else if ( decryptedCloudDataJson && !selectedBackup.shares ) {
        this.showLoaderModal()
        recoverWalletUsingIcloud( decryptedCloudDataJson )
      } else {
        ( this.ErrorBottomSheet as any ).current.snapTo( 1 )
      }
    }
    catch ( error ) {
      console.log( 'ERROR', error )
    }
  }

  handleScannedData = async ( scannedData ) => {
    const { DECENTRALIZED_BACKUP } = this.props
    const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP
    console.log( 'scannedData', scannedData )
    if ( scannedData && scannedData.type === 'pdf' ) {
      console.log( 'isndie if', scannedData.type )

      this.props.downloadPdfShare( {
        encryptedKey: scannedData.encryptedData,
        otp: this.state.answer,
        downloadType: 'recovery',
        replaceIndex: Object.keys( RECOVERY_SHARES ).length,
      } )
    } else if (
      scannedData &&
      scannedData.type &&
      scannedData.type === 'ReverseRecoveryQR'
    ) {
      const recoveryRequest = {
        requester: scannedData.requester,
        publicKey: scannedData.publicKey,
        uploadedAt: scannedData.UPLOADED_AT,
        isQR: true,
      }

      if ( Date.now() - recoveryRequest.uploadedAt > config.TC_REQUEST_EXPIRY ) {
        Alert.alert(
          `${recoveryRequest.isQR ? 'QR' : 'Link'} expired!`,
          `Please ask your Guardian to initiate a new ${recoveryRequest.isQR ? 'QR' : 'Link'
          }`
        )
      }
      this.props.downloadMShare( {
        encryptedKey: recoveryRequest.publicKey,
        downloadType: 'recovery',
        replaceIndex: Object.keys( RECOVERY_SHARES ).length,
      } )
    } else {
      this.props.downloadMShare( {
        encryptedKey: scannedData.encryptedKey,
        otp: scannedData.otp,
        downloadType: 'recovery',
        replaceIndex: Object.keys( RECOVERY_SHARES ).length,
      } )
    }
    this.setState( {
      showLoader: true
    } )
  };

  onCreatLink = () => {
    const { database, requestShare } = this.props
    const { RECOVERY_SHARES } = database.DECENTRALIZED_BACKUP
    if ( this.state.contactList.length && this.state.contactList.length == 1 ) {
      if (
        ( RECOVERY_SHARES[ 1 ] && !RECOVERY_SHARES[ 1 ].REQUEST_DETAILS ) ||
        !RECOVERY_SHARES[ 1 ]
      ) {
        requestShare( 1 )
      }
    } else if (
      this.state.contactList.length &&
      this.state.contactList.length == 2
    ) {
      if (
        ( RECOVERY_SHARES[ 1 ] && !RECOVERY_SHARES[ 1 ].REQUEST_DETAILS ) ||
        !RECOVERY_SHARES[ 1 ]
      ) {
        requestShare( 1 )
      }
      if (
        ( RECOVERY_SHARES[ 2 ] && !RECOVERY_SHARES[ 2 ].REQUEST_DETAILS ) ||
        !RECOVERY_SHARES[ 2 ]
      ) {
        requestShare( 2 )
      }
    }
  };

  createLink = ( selectedContact, index ) => {
    const { database } = this.props
    const requester = this.state.walletName //database.WALLET_SETUP.walletName
    console.log( 'index', index )
    const { REQUEST_DETAILS } = database.DECENTRALIZED_BACKUP.RECOVERY_SHARES[
      index == 0 ? 1 : 2
    ]
    console.log(
      'database.DECENTRALIZED_BACKUP.RECOVERY_SHARES',
      database.DECENTRALIZED_BACKUP.RECOVERY_SHARES
    )
    const appVersion = DeviceInfo.getVersion()
    if (
      selectedContact.data.phoneNumbers &&
      selectedContact.data.phoneNumbers.length
    ) {
      console.log( 'selectedContact.data', selectedContact.data )
      let number = selectedContact.data.phoneNumbers.length
        ? selectedContact.data.phoneNumbers[ 0 ].number
        : ''
      number = number.slice( number.length - 10 ) // last 10 digits only
      const numHintType = 'num'
      const numHint = number[ 0 ] + number.slice( number.length - 2 )
      const numberEncKey = TrustedContactsService.encryptPub(
        // using TCs encryption mech
        REQUEST_DETAILS.KEY,
        number
      ).encryptedPub
      const numberDL =
        `https://hexawallet.io/${config.APP_STAGE}/rk` +
        `/${requester}` +
        `/${numberEncKey}` +
        `/${numHintType}` +
        `/${numHint}` +
        `/v${appVersion}`
      this.setState( {
        linkToRequest: numberDL
      } )
    } else if (
      selectedContact.data.emails &&
      selectedContact.data.emails.length
    ) {
      const email = selectedContact.data.emails.length
        ? selectedContact.data.emails[ 0 ].email
        : ''
      const Email = email.replace( '.com', '' )
      const emailHintType = 'eml'
      const emailHint = email[ 0 ] + Email.slice( Email.length - 2 )
      const emailEncPubKey = TrustedContactsService.encryptPub(
        REQUEST_DETAILS.KEY,
        email
      ).encryptedPub
      const emailDL =
        `https://hexawallet.io/${config.APP_STAGE}/rk` +
        `/${requester}` +
        `/${emailEncPubKey}` +
        `/${emailHintType}` +
        `/${emailHint}` +
        `/v${appVersion}`
      this.setState( {
        linkToRequest: emailDL
      } )
    } else {
      const otp = LevelHealth.generateOTP( parseInt( config.SSS_OTP_LENGTH, 10 ) )
      const otpHintType = 'otp'
      const otpHint = 'xxx'
      const otpEncPubKey = TrustedContactsService.encryptPub(
        REQUEST_DETAILS.KEY,
        otp
      ).encryptedPub
      const otpDL =
        `https://hexawallet.io/${config.APP_STAGE}/rk` +
        `/${requester}` +
        `/${otpEncPubKey}` +
        `/${otpHintType}` +
        `/${otpHint}` +
        `/v${appVersion}`
      this.setState( {
        linkToRequest: otpDL, isOtpType: true, otp: otp
      } )
    }
  };

  downloadSecret = ( ) => {
    this.setState( {
      refreshControlLoader: true
    } )
    const { database } = this.props
    const { RECOVERY_SHARES } = database.DECENTRALIZED_BACKUP
    if ( RECOVERY_SHARES ) {
      for( let shareIndex=0;shareIndex<Object.keys( RECOVERY_SHARES ).length;shareIndex++ ){
        if (
          RECOVERY_SHARES[ shareIndex ] &&
        !RECOVERY_SHARES[ shareIndex ].META_SHARE && RECOVERY_SHARES[ shareIndex ].REQUEST_DETAILS && RECOVERY_SHARES[ shareIndex ].REQUEST_DETAILS.KEY
        ) {
          const { KEY } = RECOVERY_SHARES[ shareIndex ].REQUEST_DETAILS
          console.log( {
            KEY,
          } )

          this.props.downloadMShare( {
            encryptedKey: KEY,
            downloadType: 'recovery',
            replaceIndex: shareIndex,
          } )
        }
      }
      this.setState( {
        refreshControlLoader: false
      } )
    }
  };

  onRefresh = () => {
    console.log( 'gggg' )
    this.downloadSecret( )
  };

  setLoaderMessages = () => {
    setTimeout( () => {
      const newMessage = this.getNextMessage()
      this.setState( {
        loaderMessage: newMessage
      } )
      setTimeout( () => {
        const newMessage = this.getNextMessage()
        this.setState( {
          loaderMessage: newMessage
        } )
        setTimeout( () => {
          const newMessage = this.getNextMessage()
          this.setState( {
            loaderMessage: newMessage
          } )
          setTimeout( () => {
            const newMessage = this.getNextMessage()
            this.setState( {
              loaderMessage: newMessage
            } )
            setTimeout( () => {
              const newMessage = this.getNextMessage()
              this.setState( {
                loaderMessage: newMessage
              } )
              setTimeout( () => {
                const newMessage = this.getNextMessage()
                this.setState( {
                  loaderMessage: newMessage
                } )
              }, LOADER_MESSAGE_TIME )
            }, LOADER_MESSAGE_TIME )
          }, LOADER_MESSAGE_TIME )
        }, LOADER_MESSAGE_TIME )
      }, LOADER_MESSAGE_TIME )
    }, LOADER_MESSAGE_TIME )
  }

  showLoaderModal = () => {
    this.loaderBottomSheet.current.snapTo( 1 )
    this.setLoaderMessages()
  }
  getNextMessage = () => {
    if ( messageIndex == ( loaderMessages.length ) ) messageIndex = 0
    return loaderMessages[ messageIndex++ ]
  }

  render() {
    const {
      hideShow,
      cloudBackup,
      walletsArray,
      selectedBackup,
      showLoader,
      refreshControlLoader,
      selectedContact,
      linkToRequest,
      listData,
      contactList,
      renderTimer,
      otp,
      isOtpType,
    } = this.state
    const { navigation, database } = this.props
    let name
    if ( Platform.OS == 'ios' ) name = 'iCloud'
    else name = 'GDrive'
    return (
      <View
        style={{
          flex:1,
          backgroundColor: Colors.backgroundColor1,
          position: 'relative',
        }}
      >
        <SafeAreaView style={{
          flex: 0
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{
            flex: 1, flexDirection: 'row'
          }}>
            <TouchableOpacity
              onPress={() => {
                this.props.clearCloudCache()
                navigation.navigate( 'WalletInitialization' )
              }}
              style={styles.headerBackArrowView}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View style={{
              justifyContent: 'center', width: wp( '80%' )
            }}>
              <Text numberOfLines={2} style={styles.modalHeaderTitleText}>
                {'Recover using keys'}
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
              The status of your Recovery Key request is visible below
              </Text>
            </View>
          </View>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshControlLoader}
              onRefresh={() => this.onRefresh()}
            />
          }
          style={{
            flex: 1,
            marginBottom: hp( '2%' ),
          }}
        >
          {cloudBackup &&
            listData.map( ( item, index ) => {
              return (
                <View
                  key={index}
                  style={{
                    ...styles.cardsView,
                    borderBottomWidth: index == 2 ? 0 : 4,
                  }}
                >
                  {item.type == 'contact' && item.image ? (
                    <View
                      style={{
                        borderRadius: wp( '15%' ) / 2,
                        borderColor: Colors.white,
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowOffset: {
                          width: 2,
                          height: 2,
                        },
                        shadowOpacity: 0.8,
                        shadowColor: Colors.textColorGrey,
                        shadowRadius: 5,
                        elevation: 10,
                        marginRight: 15,
                        marginLeft: 5,
                      }}
                    >
                      <Image
                        source={item.image}
                        style={{
                          width: wp( '15%' ),
                          height: wp( '15%' ),
                          borderRadius: wp( '15%' ) / 2,
                        }}
                      />
                    </View>
                  ) : (
                    <ImageBackground
                      source={require( '../../assets/images/icons/Ellipse.png' )}
                      style={{
                        ...styles.cardsImageView, marginRight: 10
                      }}
                    >
                      <Image
                        source={
                          item.type == 'contact'
                            ? require( '../../assets/images/icons/icon_contact.png' )
                            : item.type == 'device'
                              ? require( '../../assets/images/icons/icon_secondarydevice.png' )
                              : require( '../../assets/images/icons/icon_contact.png' )
                        }
                        style={styles.cardImage}
                      />
                    </ImageBackground>
                  )}
                  <View style={{
                  }}>
                    <Text
                      style={{
                        ...styles.cardsInfoText,
                        fontSize: RFValue( 18 ),
                      }}
                    >
                      {deviceText( item.title )}
                    </Text>
                    <Text style={styles.cardsInfoText}>{item.info}</Text>
                    <Text style={styles.cardsInfoText}>
                      Last backup {item.time}
                    </Text>
                  </View>
                  {item.status == 'received' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 'auto',
                      }}
                    >
                      <View
                        style={{
                          ...styles.statusTextView,
                          backgroundColor: Colors.lightGreen,
                        }}
                      >
                        <Text style={styles.statusText}>Key Received</Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: Colors.lightGreen,
                          width: wp( '5%' ),
                          height: wp( '5%' ),
                          borderRadius: wp( '5%' ) / 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginLeft: 5,
                        }}
                      >
                        <AntDesign
                          name={'check'}
                          size={RFValue( 10 )}
                          color={Colors.darkGreen}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.statusTextView}>
                      <Text style={styles.statusText}>Waiting for Key</Text>
                    </View>
                  )}
                </View>
              )
            } )}
        </ScrollView>
        <View
          style={{
            flexDirection: 'row',
            marginLeft: 25,
            marginRight: 25,
            marginTop: 'auto',
            marginBottom: hp( '1%' ),
            alignItems: 'center',
          }}
        >
          <Text style={styles.modalHeaderInfoText}>
        Use Send Request to share a link with a contact. If the person you wish to backup your Recovery Key with, is with you in person, use Scan Key. Or they could also send you a screenshot of the QR for you to scan
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: Colors.blue,
            height: 60,
            borderRadius: 10,
            marginLeft: 25,
            marginRight: 25,
            marginTop: 'auto',
            marginBottom: hp( '4%' ),
            justifyContent: 'space-evenly',
            alignItems: 'center',
            shadowColor: Colors.shadowBlue,
            shadowOpacity: 1,
            shadowOffset: {
              width: 15, height: 15
            },
          }}
        >
          <TouchableOpacity
            onPress={() => {
              // alert("test");
              ( this.ContactListForRestore as any ).current.snapTo( 1 )
              // this.onCreatLink();
            }}
            style={styles.buttonInnerView}
            disabled={contactList.length ? false : true}
          >
            <Image
              source={require( '../../assets/images/icons/openlink.png' )}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Send Request</Text>
          </TouchableOpacity>
          <View
            style={{
              width: 1, height: 30, backgroundColor: Colors.white
            }}
          />
          <TouchableOpacity
            style={styles.buttonInnerView}
            onPress={() => {
              navigation.navigate( 'ScanRecoveryKey', {
                scannedData: ( scannedData ) =>
                  this.handleScannedData( scannedData ),
              } )
            }}
          >
            <Image
              source={require( '../../assets/images/icons/qr-code.png' )}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Scan Key</Text>
          </TouchableOpacity>
        </View>
        {showLoader ? <Loader isLoading={true} /> : null}
        {hideShow ? (
          <Modal
            animationType='fade'
            transparent={true}
            visible={hideShow}
            onRequestClose={() => {
              console.log( 'onRequestClose' )
              this.setState( {
                hideShow: false
              } ) }}>
            <TouchableOpacity style={{
              flex:1,
              alignItems: 'center',
              justifyContent: 'center',
            }} onPress={() => {
              console.log( 'onRequestClose' )
              this.setState( {
                hideShow: false
              } ) }}>

              <View style={styles.dropDownView}>
                <ScrollView>
                  {walletsArray.map( ( value, index ) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={10}
                        onPress={() => {
                          console.log( 'onPress' )
                          this.setState( {
                            hideShow: false
                          } )
                          this.setState( {
                            selectedBackup: value
                          } )
                        }}
                        style={styles.dropDownElement}
                      >
                        {value.data && (
                          <View style={styles.greyBox}>
                            <View style={styles.greyBoxImage}>
                              <MaterialCommunityIcons
                                name={'restore'}
                                size={RFValue( 25 )}
                                color={Colors.blue}
                              />
                            </View>
                            <View style={{
                              marginLeft: 10
                            }}>
                              <Text style={styles.greyBoxText}>
                                {'Restoring Wallet from'}
                              </Text>
                              <Text
                                style={{
                                  ...styles.greyBoxText,
                                  fontSize: RFValue( 20 ),
                                }}
                              >
                                {value.walletName}
                              </Text>
                              <Text
                                style={{
                                  ...styles.greyBoxText,
                                  fontSize: RFValue( 10 ),
                                }}
                              >
                                {'Last backup : ' +
                                  timeFormatter(
                                    moment( new Date() ),
                                    moment( value.dateTime ).valueOf()
                                  )}
                              </Text>

                              <Text
                                style={{
                                  ...styles.greyBoxText,
                                  fontSize: RFValue( 10 ),
                                }}
                              >
                                {'Backup at Level : ' + value.levelStatus}
                              </Text>
                            </View>
                          </View>
                        )}
                      </TouchableOpacity>
                    )
                  } )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : null}
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={this.RestoreFromICloud}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '50%' )
              : hp( '60%' ),
          ]}
          renderContent={() => {
            let name
            if ( Platform.OS == 'ios' ) name = 'iCloud'
            else name = 'GDrive'
            return (
              <RestoreFromICloud
                title={'Restore from ' + name}
                subText={
                  'Clicking on Restore would source your Recovery Key from iCloud'
                }
                cardInfo={'Restoring Wallet from'}
                cardTitle={selectedBackup.walletName}
                levelStatus={
                  selectedBackup.levelStatus
                    ? name + ' backup at Level ' + selectedBackup.levelStatus
                    : ''
                }
                proceedButtonText={'Restore'}
                backButtonText={'Back'}
                modalRef={this.RestoreFromICloud}
                onPressProceed={() => {
                  //(this.RestoreFromICloud as any).current.snapTo(0);
                  this.restoreWallet()
                }}
                onPressBack={() => {
                  this.props.clearCloudCache();
                  ( this.RestoreFromICloud as any ).current.snapTo( 0 )
                  navigation.navigate( 'WalletInitialization' )

                }}
                onPressCard={() => {
                  console.log( 'ajfjkh asd', hideShow )
                  this.setState( {
                    hideShow: !hideShow
                  } )
                }}
              />
            )
          }}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() =>
                ( this.RestoreFromICloud as any ).current.snapTo( 0 )
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.ContactListForRestore}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '50%' )
              : hp( '60%' ),
          ]}
          renderContent={() => {
            return (
              <ContactListForRestore
                title={'Select Contact'}
                subText={
                  'Select contact to send a Wallet Restore request link'
                }
                contactList={contactList}
                modalRef={this.ContactListForRestore}
                onPressCard={( contact, index ) => {
                  this.setState( {
                    selectedContact: contact
                  } );
                  ( this.ContactListForRestore as any ).current.snapTo( 0 );
                  ( this.SendViaLinkBottomSheet as any ).current.snapTo( 1 )
                  this.createLink( contact, index )
                }}
              />
            )
          }}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() =>
                ( this.ContactListForRestore as any ).current.snapTo( 0 )
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.RestoreSuccess}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '50%' )
              : hp( '60%' ),
          ]}
          renderContent={() => (
            <RestoreSuccess
              modalRef={this.RestoreSuccess}
              onPressProceed={() => {
                ( this.RestoreSuccess as any ).current.snapTo( 0 )
              }}
              onPressBack={() => {
                ( this.RestoreSuccess as any ).current.snapTo( 0 )
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => ( this.RestoreSuccess as any ).current.snapTo( 0 )}
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.BackupNotFound}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '40%' )
              : hp( '50%' ),
          ]}
          renderContent={() => (
            <ICloudBackupNotFound
              modalRef={this.BackupNotFound}
              onPressProceed={() => {
                ( this.BackupNotFound as any ).current.snapTo( 0 )
                // navigation.replace( 'WalletNameRecovery' )
              }}
              onPressBack={() => {
                ( this.BackupNotFound as any ).current.snapTo( 0 )
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => ( this.BackupNotFound as any ).current.snapTo( 0 )}
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.RestoreWallet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '60%' )
              : hp( '70%' ),
          ]}
          renderContent={() => (
            <RestoreWallet
              modalRef={this.RestoreWallet}
              onPressProceed={() => {
                ( this.RestoreWallet as any ).current.snapTo( 0 )
              }}
              onPressBack={() => {
                ( this.RestoreWallet as any ).current.snapTo( 0 )
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => ( this.RestoreWallet as any ).current.snapTo( 0 )}
            />
          )}
        />
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={this.loaderBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '100%' )
              : hp( '100%' ),
          ]}
          renderContent={() => (
            <LoaderModal headerText={this.state.loaderMessage.heading} messageText={this.state.loaderMessage.text} />
          )}
          renderHeader={() => (
            <View
              style={{
                marginTop: 'auto',
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                height: hp( '75%' ),
                zIndex: 9999,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.SecurityQuestionBottomSheet}
          snapPoints={[ -30, hp( '80%' ) ]}
          renderContent={()=>(
            <SecurityQuestion
              question={this.state.question}
              // onFocus={() => {
              //   if ( Platform.OS == 'ios' ){
              //     if( this.SecurityQuestionBottomSheet as any )
              //       ( this.SecurityQuestionBottomSheet as any ).current.snapTo( 2 )}
              // }}
              // onBlur={() => {
              //   if ( Platform.OS == 'ios' ){
              //     if( this.SecurityQuestionBottomSheet as any )
              //       ( this.SecurityQuestionBottomSheet as any ).current.snapTo( 1 )}
              // }}
              onPressConfirm={( answer ) => {
                Keyboard.dismiss()
                if( this.SecurityQuestionBottomSheet as any )
                  ( this.SecurityQuestionBottomSheet as any ).current.snapTo( 0 )
                this.setState( ( state ) => ( {
                  answer: answer
                } ) )
                this.decryptCloudJson()
              }}
            /> )
          }
          renderHeader={()=>( <ModalHeader
            onPressHeader={() => {
              ( this.SecurityQuestionBottomSheet as any ).current.snapTo( 0 )
            }}
          /> )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.ErrorBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '35%' )
              : hp( '40%' ),
          ]}
          renderContent={() => (
            <ErrorModalContents
              modalRef={this.ErrorBottomSheet}
              title={'Error receiving Recovery Key'}
              info={
                'There was an error while receiving your Recovery Key, please try again'
              }
              proceedButtonText={'Try again'}
              onPressProceed={() => {
                ( this.ErrorBottomSheet as any ).current.snapTo( 0 )
              }}
              isBottomImage={true}
              bottomImage={require( '../../assets/images/icons/errorImage.png' )}
            />
          )}
          renderHeader={() => (
            <ModalHeader
            // onPressHeader={() => {
            //   (this.ErrorBottomSheet as any).current.snapTo(0);
            // }}
            />
          )}
        />
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={this.SendViaLinkBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '83%' )
              : hp( '85%' ),
          ]}
          renderContent={() => ( selectedContact.data && <SendViaLink
            headerText={'Send Request'}
            subHeaderText={'Send a recovery request link'}
            contactText={'Requesting for recovery:'}
            contact={selectedContact.data ? selectedContact.data : null}
            contactEmail={''}//database.WALLET_SETUP.walletName
            infoText={`Click here to accept Keeper request for ${this.state.walletName
            } Hexa wallet- link will expire in ${config.TC_REQUEST_EXPIRY / ( 60000 * 60 )
            } hours`}
            link={linkToRequest}
            onPressBack={() => {
              if ( this.SendViaLinkBottomSheet )
                ( this.SendViaLinkBottomSheet as any ).current.snapTo( 0 )
            }}
            onPressDone={() => {
              if ( isOtpType ) {
                this.setState( {
                  renderTimer: true
                } );
                ( this.shareOtpWithTrustedContactBottomSheet as any ).current.snapTo( 1 )
              }
              ( this.SendViaLinkBottomSheet as any ).current.snapTo( 0 )
            }}
          />
          )}
          renderHeader={() => <ModalHeader />}
        />
        <BottomSheet
          onCloseEnd={() => { }}
          enabledInnerScrolling={true}
          ref={this.shareOtpWithTrustedContactBottomSheet}
          snapPoints={[ -50, hp( '65%' ) ]}
          renderContent={() => (
            <ShareOtpWithTrustedContact
              renderTimer={renderTimer}
              onPressOk={() => {
                this.setState( {
                  renderTimer: false
                } );
                ( this.shareOtpWithTrustedContactBottomSheet as any ).current.snapTo(
                  0
                )
              }}
              onPressBack={() => {
                this.setState( {
                  renderTimer: false
                } );
                ( this.shareOtpWithTrustedContactBottomSheet as any ).current.snapTo(
                  0
                )
              }}
              OTP={otp}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                this.setState( {
                  renderTimer: false
                } );
                ( this.shareOtpWithTrustedContactBottomSheet as any ).current.snapTo(
                  0
                )
              }}
            />
          )}
        />
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    accounts: state.accounts || [],
    s3Service: idx( state, ( _ ) => _.sss.service ),
    regularAccount: idx( state, ( _ ) => _.accounts[ REGULAR_ACCOUNT ].service ),
    cloudBackupStatus:
      idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    database: idx( state, ( _ ) => _.storage.database ) || {
    },
    security: idx( state, ( _ ) => _.storage.database.WALLET_SETUP.security ),
    overallHealth: idx( state, ( _ ) => _.health.overallHealth ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
    walletImageChecked: idx( state, ( _ ) => _.health.walletImageChecked ),
    SERVICES: idx( state, ( _ ) => _.storage.database.SERVICES ),
    metaShare: idx( state, ( _ ) => _.health.metaShare ),
    walletRecoveryFailed: idx( state, ( _ ) => _.health.walletRecoveryFailed ),
    DECENTRALIZED_BACKUP:
      idx( state, ( _ ) => _.storage.database.DECENTRALIZED_BACKUP ) || {
      },
    errorReceiving:
      idx( state, ( _ ) => _.health.errorReceiving ) || {
      },
    downloadMetaShare: idx( state, ( _ ) => _.health.loading.downloadMetaShare ),
    cloudData: idx( state, ( _ ) => _.cloud.cloudData )
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    fetchEphemeralChannel,
    recoverWalletUsingIcloud,
    checkMSharesHealth,
    initializeHealthSetup,
    downloadMShare,
    recoverWallet,
    downloadPdfShare,
    updateCloudMShare,
    requestShare,
    getCloudDataRecovery,
    clearCloudCache,
    initNewBHRFlow,
    walletCheckIn,
    setVersion,
    initializeRecovery,
    setCloudBackupStatus
  } )( RestoreWithICloud )
)

const styles = StyleSheet.create( {
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  dropDownView: {
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
    backgroundColor: Colors.white,
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
    width: '80%',
    height: '80%',
    marginTop: wp( '15%' ),
    marginBottom: wp( '25%' ),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    overflow: 'hidden',
  },
  dropDownElement: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp( '0.7%' ),
    marginBottom: hp( '0.7%' ),
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '30%' ),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
  cardsInfoText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  cardsView: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: Colors.backgroundColor,
  },
  cardsImageView: {
    width: wp( '20%' ),
    height: wp( '20%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    resizeMode: 'contain',
    marginBottom: wp( '1%' ),
  },
  statusTextView: {
    // padding: 5,
    height: wp( '5%' ),
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 'auto',
    paddingLeft: 10,
    paddingRight: 10,
  },
  statusText: {
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  greyBox: {
    width: wp( '90%' ),
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greyBoxImage: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: wp( '15%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 1,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowColor: Colors.textColorGrey,
    shadowRadius: 5,
    elevation: 10,
  },
  greyBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
  },
} )
