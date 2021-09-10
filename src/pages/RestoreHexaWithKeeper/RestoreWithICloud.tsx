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
import { isEmpty } from '../../common/CommonFunctions'
import CloudBackup from '../../common/CommonFunctions/CloudBackup'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { decrypt, decrypt1 } from '../../common/encryption'
import LoaderModal from '../../components/LoaderModal'
import TransparentHeaderModal from '../../components/TransparentHeaderModal'
import Loader from '../../components/loader'
import {
  recoverWalletUsingIcloud,
  recoverWallet,
  updateCloudMShare,
  downloadBackupData,
  putKeeperInfo,
  setupHealth
} from '../../store/actions/BHR'
import axios from 'axios'
import { initializeHealthSetup, initNewBHRFlow } from '../../store/actions/BHR'
import ErrorModalContents from '../../components/ErrorModalContents'
import { BackupStreamData, KeeperInfoInterface, MetaShare, PrimaryStreamData, SecondaryStreamData, Wallet } from '../../bitcoin/utilities/Interface'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import config from '../../bitcoin/HexaConfig'
import { textWithoutEncoding, email } from 'react-native-communications'
import ContactListForRestore from './ContactListForRestore'
import SendViaLink from '../../components/SendViaLink'
import ShareOtpWithTrustedContact from '../NewBHR/ShareOtpWithTrustedContact'
import { getCloudDataRecovery, clearCloudCache, setCloudBackupStatus, setCloudErrorMessage } from '../../store/actions/cloud'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { setVersion } from '../../store/actions/versionHistory'
import QuestionList from '../../common/QuestionList'
import SecurityQuestion from './SecurityQuestion'
import { completedWalletSetup, initializeRecovery } from '../../store/actions/setupAndAuth'
import ModalContainer from '../../components/home/ModalContainer'

import semver from 'semver'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'


const LOADER_MESSAGE_TIME = 2000
let messageIndex = 0
const loaderMessages = [
  // {
  //   heading: 'Manage Backup',
  //   text: 'You can backup your wallet at 3 different levels of security\nAutomated cloud backup | Double backup | Multi-key backup',
  //   subText: '',
  // },
  {
    heading: 'Level 1 - Automated Cloud Backup',
    text:
      'Allow Hexa to automatically backup your wallet to your cloud storage and we’ll ensure you easily recover your wallet in case your phone gets lost',
    subText: '',
  },
  {
    heading: 'Level 2 - Double Backup',
    text: 'Starting to hodl sats and bitcoin? Ensure that you backup your wallet atleast to Level 2 backup called Double Backup',
    subText: '',
  },
  {
    heading: 'Level 3 - Multi-key Backup',
    text:
      'For hardcore Bitcoiners who understand Bitcoin, stack large amounts of sats or bitcoin and care for utmost security of their wallet',
    subText: '',
  },
  {
    heading: 'Recovery Keys',
    text: 'Make sure you only share your Recovery Keys with trustable contacts',
    subText: '',
  },
  // {
  //   heading: 'Level 2 - Double Backup',
  //   text: 'Starting to hodl sats and bitcoin? Ensure that you backup your wallet atleast to Level 2 backup called Double Backup',
  //   subText: '',
  // },
  // {
  //   heading: 'Level 3 - Multi-key Backup',
  //   text: 'For hardcore Bitcoiners who understand Bitcoin, stack large amounts of sats or bitcoin and care for utmost security of their wallet',
  //   subText: '',
  // }
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
  loaderMessage: { heading: string; text: string; subText?: string; };
  walletName: string;
  question: string;
  answer: string;
  restoreModal: boolean;
  securityQuestionModal: boolean;
  errorModal: boolean;
  sendViaLinkModal: boolean;
  loaderModal: boolean;
  shareOTPModal: boolean;
  restoreWallet: boolean;
  contactListModal: boolean;
  backupModal: boolean;
  restoreSuccess: boolean;
  currentLevel: number;
  errorModalTitle: string,
  errorModalInfo: string,
}

interface RestoreWithICloudPropsTypes {
  navigation: any;
  cloudBackupStatus: any;
  database: any;
  security: any;
  recoverWalletUsingIcloud: any;
  accounts: any;
  walletImageChecked: any;
  SERVICES: any;
  calculateExchangeRate: any;
  initializeHealthSetup: any;
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
  completedWalletSetup: any;
  setVersion: any;
  initializeRecovery: any;
  setCloudBackupStatus: any;
  downloadBackupData: any;
  downloadedBackupData: {
    primaryData?: PrimaryStreamData;
    backupData?: BackupStreamData;
    secondaryData?: SecondaryStreamData;
    isCloud?: boolean;
  }[];
  putKeeperInfo: any;
  keeperInfo: KeeperInfoInterface[];
  setupHealth: any;
  wallet: Wallet;
  cloudErrorMessage: string,
  setCloudErrorMessage: any,
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
  bottomTextMessage: string
  subPoints: string[]

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
        seed: '',
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
      loaderMessage: {
        heading: 'Creating your wallet', text: 'This may take a short time, while the app sets it all up for you:'
      },
      question: '',
      answer: '',
      restoreModal: false,
      securityQuestionModal: false,
      errorModal: false,
      sendViaLinkModal: false,
      loaderModal: false,
      shareOTPModal: false,
      restoreWallet: false,
      contactListModal: false,
      restoreSuccess: false,
      currentLevel: 0,
      backupModal: false,
      errorModalTitle: '',
      errorModalInfo: '',
    }
    this.bottomTextMessage = 'Hexa encrypts and secures all the data on the app and any communication that goes out'
    this.subPoints = [
      'Setting up multi-accounts',
      'Automatically creating backup on the cloud',
      'Preloading the Test Account with test sats',
    ]
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
      walletRecoveryFailed,
      cloudData,
      walletCheckIn,
      completedWalletSetup,
      initNewBHRFlow,
      setVersion,
      cloudBackupStatus
    } = this.props
    if ( prevProps.cloudData !== cloudData && cloudData ) {
      this.getData( cloudData )
    }

    // if ( prevProps.cloudBackupStatus !== cloudBackupStatus && cloudBackupStatus === CloudBackupStatus.FAILED ) {
    //   this.setState( ( state ) => ( {
    //     showLoader: false,
    //   } ) )
    //   this.props.setCloudBackupStatus( CloudBackupStatus.PENDING )
    //   // ( this.BackupNotFound as any ).current.snapTo( 1 )
    //   this.setState( {
    //     backupModal: true
    //   } )
    // }
    if ( prevProps.cloudErrorMessage !==  this.props.cloudErrorMessage ) {
      this.setState( ( state ) => ( {
        showLoader: false,
        backupModal: false
      } ) )
      this.showCloudRestoreError( )
      this.props.setCloudBackupStatus( CloudBackupStatus.PENDING )
    }
    if ( SERVICES && prevProps.walletImageChecked !== walletImageChecked ) {
      completedWalletSetup()
      await AsyncStorage.setItem( 'walletRecovered', 'true' )
      setVersion( 'Restored' )
      initNewBHRFlow( true )
      walletCheckIn()
      // if ( this.loaderBottomSheet as any )
      //   ( this.loaderBottomSheet as any ).current.snapTo( 0 )
      this.setState( {
        loaderModal: false
      } )
      this.props.navigation.navigate( 'HomeNav' )
    }

    if( prevProps.wallet != this.props.wallet ){
      completedWalletSetup()
      await AsyncStorage.setItem( 'walletRecovered', 'true' )
      setVersion( 'Restored' )
      initNewBHRFlow( true )
      this.setState( {
        loaderModal: false
      } )
      this.props.navigation.navigate( 'HomeNav' )
    }

    if ( JSON.stringify( prevProps.downloadedBackupData ) != JSON.stringify( this.props.downloadedBackupData ) ) {
      if ( this.props.downloadedBackupData.length ) {
        this.updateList()
      }
    }

    if ( prevProps.walletRecoveryFailed !== walletRecoveryFailed ) {
      // if ( this.loaderBottomSheet as any )
      //   ( this.loaderBottomSheet as any ).current.snapTo( 0 )
      this.setState( {
        loaderModal: false
      } )
    }

    if ( prevProps.errorReceiving !== this.props.errorReceiving && this.props.errorReceiving === true ) {
      this.setState( {
        showLoader: false
      } )
      // ( this.BackupNotFound as any ).current.snapTo( 1 )
      this.setState( {
        backupModal: true
      } )
      // if ( this.loaderBottomSheet as any )
      //   ( this.loaderBottomSheet as any ).current.snapTo( 0 )
      this.setState( {
        loaderModal: false
      } )
    }

    // if (
    //   !this.state.isLinkCreated &&
    //   this.state.contactList.length &&
    //   this.props.database.DECENTRALIZED_BACKUP.RECOVERY_SHARES[ 0 ] &&
    //   this.props.database.DECENTRALIZED_BACKUP.RECOVERY_SHARES[ 0 ].META_SHARE
    // ) {
    //   this.setState( {
    //     isLinkCreated: true
    //   } )
    //   this.onCreatLink()
    // }

    if ( prevProps.downloadedBackupData.length == 0 && prevProps.downloadedBackupData != this.props.downloadedBackupData && this.props.downloadedBackupData.length == 1 ) {
      if ( this.props.keeperInfo.length == 0 ) {
        this.setKeeperInfoList( 0, this.props.downloadedBackupData[ 0 ].backupData.keeperInfo )
      }
    }

    // if ( prevProps.s3Service != this.props.s3Service && this.props.s3Service.levelhealth ) {
    //   this.props.setupHealth( this.state.currentLevel )
    // }
  };

  componentWillUnmount = () => {
    this.props.clearCloudCache()
  }

  updateList = () => {
    const { listData, selectedBackup } = this.state
    const { downloadedBackupData } = this.props
    let updatedListData = []
    const shares: {
      primaryData?: PrimaryStreamData;
      backupData?: BackupStreamData;
      secondaryData?: SecondaryStreamData;
    }[] = []
    updatedListData = [ ...listData ]
    for ( let i = 0; i < updatedListData.length; i++ ) {
      if ( downloadedBackupData.find( value => value.backupData.primaryMnemonicShard.shareId == updatedListData[ i ].shareId ) ) {
        updatedListData[ i ].status = 'received'
        shares.push( downloadedBackupData.find( value => value.backupData.primaryMnemonicShard.shareId == updatedListData[ i ].shareId ) )
      }
    }
    this.setState( {
      listData: updatedListData, showLoader: false
    }, () => {
    } )
    if ( shares.length === 2 || shares.length === 3 ) {
      this.checkForRecoverWallet( shares, selectedBackup )
    }
  };

  checkForRecoverWallet = ( shares, selectedBackup ) => {
    const key = BHROperations.strechKey( this.state.answer )
    const decryptedCloudDataJson = decrypt( selectedBackup.data, key )
    if ( ( shares.length >= 2 && selectedBackup.levelStatus === 2 ) || ( shares.length >= 3 && selectedBackup.levelStatus === 3 ) ) {
      this.showLoaderModal()
      this.recoverWallet(
        selectedBackup.levelStatus,
        decryptedCloudDataJson,
        shares
      )
    }
  };

  recoverWallet = ( level, image, shares ) => {
    setTimeout( () => {
      this.props.recoverWallet( {
        level, answer: this.state.answer, selectedBackup: this.state.selectedBackup, image, shares
      } )
    }, 2 )
  };

  getData = ( result ) => {
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
      this.setState( ( state ) => ( {
        selectedBackup: newArray[ 0 ],
        walletsArray: newArray,
        showLoader: false,
      } ) )
      // ( this.RestoreFromICloud as any ).current.snapTo( 1 )
      this.setState( {
        restoreModal: true
      } )
    } else {
      this.setState( ( state ) => ( {
        showLoader: false,
      } ) )
      // ( this.BackupNotFound as any ).current.snapTo( 1 )
      // this.setState({
      //   backupModal: true
      // })
      this.props.navigation.navigate( 'ScanRecoveryKey', {
        walletName: 'newArray[ 0 ].walletName',
        scannedData: ( scannedData ) => {
          if ( semver.lte( JSON.parse( scannedData ).version, '1.4.6' ) ) {
            this.props.navigation.navigate( 'RestoreSelectedContactsList' )
          } else {
            this.handleScannedData( scannedData )
          }
        }
      } )
      // ( this.BackupNotFound as any ).current.snapTo( 1 )
    }
  };

  getQuestion = ( questionId ) => {
    return QuestionList.filter( item => {
      if ( item.id === questionId ) return item.question
    } )
  }

  restoreWallet = () => {
    const { selectedBackup } = this.state
    this.setState( {
      walletName: selectedBackup.walletName
    } )
    this.getSecurityQuestion( selectedBackup.questionId, selectedBackup.question )

  };

  getSecurityQuestion = ( questionId, question1 ) => {
    if ( questionId > 0 ) {
      const question = this.getQuestion( questionId )
      this.setState( {
        question: question[ 0 ].question
      } )
    } else if ( questionId === 0 ) {
      this.setState( {
        question: question1
      } )
    }
    // ( this.SecurityQuestionBottomSheet as any ).current.snapTo( 1 )
    this.setState( {
      securityQuestionModal: true
    } )
  }

  setSecurityQuestionAndName = async () => {
    const { answer, question, walletName, } = this.state
    if ( answer && question && walletName ) {
      const security = {
        question,
        answer,
      }
      this.props.initializeRecovery( walletName, security )
    }

  }

  showCloudRestoreError = () => {
    if( this.props.cloudErrorMessage !== '' ) {
      setTimeout( () => {
        this.setState( {
          errorModal: true,
          errorModalTitle: 'Cloud Restore failed',
          errorModalInfo: this.props.cloudErrorMessage,
        }, () => {
          this.props.setCloudErrorMessage( '' )
        } )
      }, 500 )
    }
  }

  decryptCloudJson = () => {
    const { recoverWalletUsingIcloud, accounts } = this.props
    const { answer, selectedBackup }: {answer: string, selectedBackup:any} = this.state
    try {
      const key = BHROperations.strechKey( answer )
      const decryptedCloudDataJson = decrypt( selectedBackup.data, key )
      if ( decryptedCloudDataJson ) this.setSecurityQuestionAndName()
      const KeeperData: KeeperInfoInterface[] = JSON.parse( selectedBackup.keeperData )
      if ( this.props.keeperInfo.length == 0 ) {
        this.setKeeperInfoList( selectedBackup.levelStatus, KeeperData, selectedBackup.dateTime )
      }
      if (
        decryptedCloudDataJson && ( selectedBackup.levelStatus == 2 || selectedBackup.levelStatus == 3 )
      ) {
        this.setState( {
          cloudBackup: true
        } )
        const backupData: BackupStreamData = {
        }
        const secondaryData: SecondaryStreamData = {
        }
        const downloadedBackupDataTmp: {
          primaryData?: PrimaryStreamData;
          backupData?: BackupStreamData;
          secondaryData?: SecondaryStreamData;
          isCloud?: boolean;
        } = {
          backupData, secondaryData
        }
        downloadedBackupDataTmp.backupData.primaryMnemonicShard = JSON.parse( selectedBackup.shares )
        downloadedBackupDataTmp.backupData.keeperInfo = KeeperData
        downloadedBackupDataTmp.secondaryData.secondaryMnemonicShard = selectedBackup.secondaryShare
        downloadedBackupDataTmp.secondaryData.bhXpub = selectedBackup.bhXpub
        downloadedBackupDataTmp.isCloud = true

        this.props.downloadBackupData( {
          backupData: downloadedBackupDataTmp
        } )
        // this.props.updateCloudMShare( JSON.parse( selectedBackup.shares ), 0 );
        // if(selectedBackup.type == "device"){
        // ( this.RestoreFromICloud as any ).current.snapTo( 0 )
        this.setState( {
          restoreModal: false
        } )
        this.setState( {
          securityQuestionModal: false
        } )
      } else if ( decryptedCloudDataJson && selectedBackup.levelStatus == 1 ) {
        this.showLoaderModal()
        recoverWalletUsingIcloud( decryptedCloudDataJson, answer, selectedBackup )
      } else {
        // ( this.ErrorBottomSheet as any ).current.snapTo( 1 )
        this.setState( {
          errorModal: true,
          errorModalTitle: 'Error receiving Recovery Key',
          errorModalInfo: 'There was an error while receiving your Recovery Key, please try again',
        } )
      }
    }
    catch ( error ) {
      console.log( 'ERROR', error )
    }
  }

  setKeeperInfoList = ( levelStatus, KeeperInfo: KeeperInfoInterface[], time? ) => {
    const listDataArray = []
    let KeeperData: KeeperInfoInterface[] = [ ...KeeperInfo ]
    const tempCL = Math.max.apply( Math, KeeperData.map( function ( value ) { return value.currentLevel } ) )
    if ( levelStatus === 2 ) KeeperData = KeeperData.filter( word => word.scheme == '2of3' )
    if ( levelStatus === 3 ) KeeperData = KeeperData.filter( word => word.scheme == '3of5' )
    if ( levelStatus == 0 ) {
      levelStatus = tempCL
      if ( tempCL === 2 ) KeeperData = KeeperData.filter( word => word.scheme == '2of3' )
      if ( tempCL === 3 ) KeeperData = KeeperData.filter( word => word.scheme == '3of5' )
    }
    this.setState( {
      currentLevel: levelStatus
    } )
    let obj
    const list = []
    for ( let i = 0; i < KeeperData.length; i++ ) {
      obj = {
        type: KeeperData[ i ].type,
        title: KeeperData[ i ].data && Object.keys( KeeperData[ i ].data ).length && KeeperData[ i ].data.name ? KeeperData[ i ].data.name : KeeperData[ i ].name,
        info: '',
        time: time ? timeFormatter(
          moment( new Date() ),
          moment( time ).valueOf()
        ) : '',
        status: 'waiting',
        image: null,
        shareId: KeeperData[ i ].shareId,
        data: KeeperData[ i ].data,
      }
      if ( KeeperData[ i ].type == 'contact' ) {
        list.push( KeeperData[ i ] )
      }
      listDataArray.push( obj )
    }
    this.setState( {
      contactList: list,
      listData: listDataArray
    } )
    this.props.putKeeperInfo( KeeperInfo )
  }

  handleScannedData = async ( scannedData ) => {
    const { downloadedBackupData } = this.props
    this.props.downloadBackupData( {
      scannedData: scannedData
    } )
  };

  onCreatLink = () => {
    // const { database } = this.props
    // const { RECOVERY_SHARES } = database.DECENTRALIZED_BACKUP
    // if ( this.state.contactList.length && this.state.contactList.length == 1 ) {
    //   if (
    //     ( RECOVERY_SHARES[ 1 ] && !RECOVERY_SHARES[ 1 ].REQUEST_DETAILS ) ||
    //     !RECOVERY_SHARES[ 1 ]
    //   ) {
    //     // Removed sss file
    //     // requestShare( 1 )
    //   }
    // } else if (
    //   this.state.contactList.length &&
    //   this.state.contactList.length == 2
    // ) {
    //   if (
    //     ( RECOVERY_SHARES[ 1 ] && !RECOVERY_SHARES[ 1 ].REQUEST_DETAILS ) ||
    //     !RECOVERY_SHARES[ 1 ]
    //   ) {
    //     // Removed sss file
    //     // requestShare( 1 )
    //   }
    //   if (
    //     ( RECOVERY_SHARES[ 2 ] && !RECOVERY_SHARES[ 2 ].REQUEST_DETAILS ) ||
    //     !RECOVERY_SHARES[ 2 ]
    //   ) {
    //     // Removed sss file
    //     // requestShare( 2 )
    //   }
    // }
  };

  createLink = ( selectedContact, index ) => {
    // const { database } = this.props
    // const requester = this.state.walletName //database.WALLET_SETUP.walletName
    // const { REQUEST_DETAILS } = database.DECENTRALIZED_BACKUP.RECOVERY_SHARES[
    //   index == 0 ? 1 : 2
    // ]
    // const appVersion = DeviceInfo.getVersion()
    // if (
    //   selectedContact.data.phoneNumbers &&
    //   selectedContact.data.phoneNumbers.length
    // ) {
    //   let number = selectedContact.data.phoneNumbers.length
    //     ? selectedContact.data.phoneNumbers[ 0 ].number
    //     : ''
    //   number = number.slice( number.length - 10 ) // last 10 digits only
    //   const numHintType = 'num'
    //   const numHint = number[ 0 ] + number.slice( number.length - 2 )
    //   const numberEncKey = TrustedContactsOperations.encryptData(
    //     // using TCs encryption mech
    //     REQUEST_DETAILS.KEY,
    //     number
    //   ).encryptedData
    //   const numberDL =
    //     `https://hexawallet.io/${config.APP_STAGE}/rk` +
    //     `/${requester}` +
    //     `/${numberEncKey}` +
    //     `/${numHintType}` +
    //     `/${numHint}` +
    //     `/v${appVersion}`
    //   this.setState( {
    //     linkToRequest: numberDL
    //   } )
    // } else if (
    //   selectedContact.data.emails &&
    //   selectedContact.data.emails.length
    // ) {
    //   const email = selectedContact.data.emails.length
    //     ? selectedContact.data.emails[ 0 ].email
    //     : ''
    //   const Email = email.replace( '.com', '' )
    //   const emailHintType = 'eml'
    //   const emailHint = email[ 0 ] + Email.slice( Email.length - 2 )
    //   const emailEncPubKey = TrustedContactsOperations.encryptData(
    //     REQUEST_DETAILS.KEY,
    //     email
    //   ).encryptedData
    //   const emailDL =
    //     `https://hexawallet.io/${config.APP_STAGE}/rk` +
    //     `/${requester}` +
    //     `/${emailEncPubKey}` +
    //     `/${emailHintType}` +
    //     `/${emailHint}` +
    //     `/v${appVersion}`
    //   this.setState( {
    //     linkToRequest: emailDL
    //   } )
    // } else {
    //   const otp = BHROperations.generateOTP( parseInt( config.SSS_OTP_LENGTH, 10 ) )
    //   const otpHintType = 'otp'
    //   const otpHint = 'xxx'
    //   const otpEncPubKey = TrustedContactsOperations.encryptData(
    //     REQUEST_DETAILS.KEY,
    //     otp
    //   ).encryptedData
    //   const otpDL =
    //     `https://hexawallet.io/${config.APP_STAGE}/rk` +
    //     `/${requester}` +
    //     `/${otpEncPubKey}` +
    //     `/${otpHintType}` +
    //     `/${otpHint}` +
    //     `/v${appVersion}`
    //   this.setState( {
    //     linkToRequest: otpDL, isOtpType: true, otp: otp
    //   } )
    // }
  };

  downloadSecret = () => {
    // this.setState( {
    //   refreshControlLoader: true
    // } )
    // const { database } = this.props
    // const { RECOVERY_SHARES } = database.DECENTRALIZED_BACKUP
    // if ( RECOVERY_SHARES ) {
    //   for ( let shareIndex = 0; shareIndex < Object.keys( RECOVERY_SHARES ).length; shareIndex++ ) {
    //     if (
    //       RECOVERY_SHARES[ shareIndex ] &&
    //       !RECOVERY_SHARES[ shareIndex ].META_SHARE && RECOVERY_SHARES[ shareIndex ].REQUEST_DETAILS && RECOVERY_SHARES[ shareIndex ].REQUEST_DETAILS.KEY
    //     ) {
    //       const { KEY } = RECOVERY_SHARES[ shareIndex ].REQUEST_DETAILS
    //       // Removed this method
    //       // this.props.downloadMShare( {
    //       //   encryptedKey: KEY,
    //       //   downloadType: 'recovery',
    //       //   replaceIndex: shareIndex,
    //       // } )
    //     }
    //   }
    //   this.setState( {
    //     refreshControlLoader: false
    //   } )
    // }
  };

  onRefresh = () => {
    // this.downloadSecret()
  };

  // setLoaderMessages = () => {
  //   setTimeout( () => {
  //     const newMessage = this.getNextMessage()
  //     this.setState( {
  //       loaderMessage: newMessage
  //     } )
  //     setTimeout( () => {
  //       const newMessage = this.getNextMessage()
  //       this.setState( {
  //         loaderMessage: newMessage
  //       } )
  //       setTimeout( () => {
  //         const newMessage = this.getNextMessage()
  //         this.setState( {
  //           loaderMessage: newMessage
  //         } )
  //         setTimeout( () => {
  //           const newMessage = this.getNextMessage()
  //           this.setState( {
  //             loaderMessage: newMessage
  //           } )
  //           setTimeout( () => {
  //             const newMessage = this.getNextMessage()
  //             this.setState( {
  //               loaderMessage: newMessage
  //             } )
  //             setTimeout( () => {
  //               const newMessage = this.getNextMessage()
  //               this.setState( {
  //                 loaderMessage: newMessage
  //               } )
  //             }, LOADER_MESSAGE_TIME )
  //           }, LOADER_MESSAGE_TIME )
  //         }, LOADER_MESSAGE_TIME )
  //       }, LOADER_MESSAGE_TIME )
  //     }, LOADER_MESSAGE_TIME )
  //   }, LOADER_MESSAGE_TIME )
  // }

  showLoaderModal = () => {
    // this.loaderBottomSheet.current.snapTo( 1 )
    this.setState( {
      loaderModal: true
    } )
    // this.setLoaderMessages()
  }
  getNextMessage = () => {
    if ( messageIndex == ( loaderMessages.length ) ) messageIndex = 0
    return loaderMessages[ messageIndex++ ]
  }

  renderContent = () => {
    const { selectedBackup, hideShow } = this.state
    const { navigation } = this.props
    return (
      <RestoreFromICloud
        title={`Recover from ${Platform.OS == 'ios'  ? 'iCloud' : 'GDrive'}`}
        subText={
          'Clicking on Recover would source your Recovery Key from iCloud'
        }
        cardInfo={'Restoring Wallet from'}
        cardTitle={selectedBackup && selectedBackup.walletName ? selectedBackup.walletName : ''}
        levelStatus={
          `${selectedBackup &&selectedBackup.levelStatus
            ? `${Platform.OS == 'ios'  ? 'iCloud' : 'GDrive'} backup at Level ${selectedBackup.levelStatus}`
            : ''}`
        }
        proceedButtonText={'Recover'}
        backButtonText={'Back'}
        modalRef={this.RestoreFromICloud}
        onPressProceed={() => {
          //(this.RestoreFromICloud as any).current.snapTo(0);
          this.setState( {
            restoreModal: false
          } )
          this.restoreWallet()
        }}
        onPressBack={() => {
          this.props.clearCloudCache()
          // ( this.RestoreFromICloud as any ).current.snapTo( 0 )
          this.setState( {
            restoreModal: false
          } )
          navigation.navigate( 'WalletInitialization' )

        }}
        hideShow={this.state.hideShow}
        walletsArray={this.state.walletsArray}
        onPressSelectValue={( value )=>{
          this.setState( {
            hideShow: false
          } )
          this.setState( {
            selectedBackup: value
          } )
        }}
        onPressCard={() => {
          console.log( 'ajfjkh asd', hideShow )
          this.setState( {
            hideShow: !hideShow
          } )
        }}
      />
    )
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
      restoreModal,
      securityQuestionModal,
      errorModal,
      sendViaLinkModal,
      loaderModal,
      shareOTPModal,
      restoreWallet,
      contactListModal,
      backupModal
    } = this.state
    const { navigation, database } = this.props
    return (
      <View
        style={{
          flex: 1,
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
                    <View style={styles.keeperImageView} >
                      <Image
                        source={item.image}
                        style={styles.keeperImage}
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
                  <View>
                    <Text
                      style={{
                        ...styles.cardsInfoText,
                        fontSize: RFValue( 18 ),
                      }}
                    >
                      {item.title}
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
              // ( this.ContactListForRestore as any ).current.snapTo( 1 )
              this.setState( {
                contactListModal: true
              } )
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
                walletName: selectedBackup.walletName,
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

        <ModalContainer visible={restoreModal} closeBottomSheet={() => {
          this.setState( {
            restoreModal: false
          } )
        }} >
          {this.renderContent()}
        </ModalContainer>
        <ModalContainer visible={contactListModal} closeBottomSheet={() => { }} >
          <ContactListForRestore
            title={'Select Contact'}
            subText={
              'Select contact to send a Wallet Recovery request link'
            }
            contactList={contactList}
            modalRef={this.ContactListForRestore}
            onPressCard={( contact, index ) => {
              this.setState( {
                selectedContact: contact,
                contactListModal: false
              }, () => {
                this.setState( {
                  sendViaLinkModal: true
                } )
              } )
              // ( this.ContactListForRestore as any ).current.snapTo( 0 )
              // ( this.SendViaLinkBottomSheet as any ).current.snapTo( 1 )

              this.createLink( contact, index )
            }}
          />
        </ModalContainer>
        <ModalContainer visible={this.state.restoreSuccess} closeBottomSheet={() => { this.setState( {
          restoreSuccess: false
        } )}} >
          <RestoreSuccess
            modalRef={this.RestoreSuccess}
            onPressProceed={() => {
              this.setState( {
                restoreSuccess: false
              } )
              this.props.navigation.navigate( 'HomeNav' )
            }}
            onPressBack={() => {
              this.setState( {
                restoreSuccess: false
              } )
              this.props.navigation.navigate( 'HomeNav' )
            }}
          />
        </ModalContainer>
        <ModalContainer visible={backupModal} closeBottomSheet={() => { }} >
          <ICloudBackupNotFound
            modalRef={this.BackupNotFound}
            onPressProceed={() => {
              // ( this.BackupNotFound as any ).current.snapTo( 0 )
              // navigation.replace( 'WalletNameRecovery' )
              this.setState( {
                backupModal: false
              } )
            }}
            onPressBack={() => {
              // ( this.BackupNotFound as any ).current.snapTo( 0 )
              this.setState( {
                backupModal: false
              } )
            }}
          />
        </ModalContainer>
        <ModalContainer visible={restoreWallet} closeBottomSheet={() => { }} >
          <RestoreWallet
            modalRef={this.RestoreWallet}
            onPressProceed={() => {
              // ( this.RestoreWallet as any ).current.snapTo( 0 )
              this.setState( {
                restoreWallet: false
              } )
            }}
            onPressBack={() => {
              // ( this.RestoreWallet as any ).current.snapTo( 0 )
              this.setState( {
                restoreWallet: false
              } )
            }}
          />
        </ModalContainer>
        <ModalContainer visible={loaderModal} closeBottomSheet={() => { }} >
          <LoaderModal
            headerText={this.state.loaderMessage.heading}
            messageText={this.state.loaderMessage.text}
            subPoints={this.subPoints}
            bottomText={this.bottomTextMessage} />
        </ModalContainer>
        {/* <BottomSheet
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
        /> */}
        <ModalContainer visible={securityQuestionModal} closeBottomSheet={() => { this.setState( {
          securityQuestionModal: false
        } ) }} >
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
              // if( this.SecurityQuestionBottomSheet as any )
              //   ( this.SecurityQuestionBottomSheet as any ).current.snapTo( 0 )
              this.setState( {
                securityQuestionModal: false
              } )
              this.setState( ( state ) => ( {
                answer: answer
              } ) )
              this.decryptCloudJson()
            }}
          />
          {/* )
         }
          renderHeader={()=>( <ModalHeader
            onPressHeader={() => {
              ( this.SecurityQuestionBottomSheet as any ).current.snapTo( 0 )
            }}
          /> )}
        /> */}
        </ModalContainer>
        <ModalContainer visible={errorModal} closeBottomSheet={() => { }}>
          <ErrorModalContents
            modalRef={this.ErrorBottomSheet}
            title={this.state.errorModalTitle}
            info={this.state.errorModalInfo}
            proceedButtonText={'Try again'}
            onPressProceed={() => {
              // ( this.ErrorBottomSheet as any ).current.snapTo( 0 )
              if( this.state.errorModalTitle === 'Cloud Restore failed' ) {
                this.cloudData()
              }
              this.setState( {
                errorModal: false
              } )
            }}
            isBottomImage={true}
            bottomImage={require( '../../assets/images/icons/errorImage.png' )}
          />
        </ModalContainer>
        <ModalContainer visible={sendViaLinkModal} closeBottomSheet={() => { }} >
          {selectedContact.data && <SendViaLink
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
              // if ( this.SendViaLinkBottomSheet )
              //   ( this.SendViaLinkBottomSheet as any ).current.snapTo( 0 )
              this.setState( {
                sendViaLinkModal: false
              } )
            }}

            onPressDone={() => {
              if ( isOtpType ) {
                this.setState( {
                  renderTimer: true,
                  sendViaLinkModal: false

                }, () => {
                  this.setState( {
                    shareOTPModal: true
                  } )
                } )
                // ( this.shareOtpWithTrustedContactBottomSheet as any ).current.snapTo( 1 )
                // this.setState( {
                //   shareOTPModal: false
                // } )
              } else {
                this.setState( {
                  sendViaLinkModal: false
                } )
              }
              // ( this.SendViaLinkBottomSheet as any ).current.snapTo( 0 )

            }}
          />}
        </ModalContainer>
        <ModalContainer visible={shareOTPModal} closeBottomSheet={() => { }} >
          <ShareOtpWithTrustedContact
            renderTimer={renderTimer}
            onPressOk={() => {
              this.setState( {
                renderTimer: false,
                shareOTPModal: false
              } )
              // ( this.shareOtpWithTrustedContactBottomSheet as any ).current.snapTo(
              //   0
              // )
            }}
            onPressBack={() => {
              this.setState( {
                renderTimer: false,
                shareOTPModal: false
              } )
              // ( this.shareOtpWithTrustedContactBottomSheet as any ).current.snapTo(
              //   0
              // )
            }}
            OTP={otp}
          />
        </ModalContainer>
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    accounts: state.accounts || [],
    cloudBackupStatus:
      idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    database: idx( state, ( _ ) => _.storage.database ) || {
    },
    security: idx( state, ( _ ) => _.storage.wallet.security ),
    overallHealth: idx( state, ( _ ) => _.bhr.overallHealth ),
    walletImageChecked: idx( state, ( _ ) => _.bhr.walletImageChecked ),
    SERVICES: idx( state, ( _ ) => _.storage.database.SERVICES ),
    walletRecoveryFailed: idx( state, ( _ ) => _.bhr.walletRecoveryFailed ),
    errorReceiving:
      idx( state, ( _ ) => _.bhr.errorReceiving ) || {
      },
    downloadMetaShare: idx( state, ( _ ) => _.bhr.loading.downloadMetaShare ),
    cloudData: idx( state, ( _ ) => _.cloud.cloudData ),
    downloadedBackupData: idx( state, ( _ ) => _.bhr.downloadedBackupData ),
    keeperInfo: idx( state, ( _ ) => _.bhr.keeperInfo ),
    wallet: idx( state, ( _ ) => _.storage.wallet ),
    cloudErrorMessage: idx( state, ( _ ) => _.cloud.cloudErrorMessage ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    recoverWalletUsingIcloud,
    initializeHealthSetup,
    recoverWallet,
    updateCloudMShare,
    getCloudDataRecovery,
    clearCloudCache,
    initNewBHRFlow,
    walletCheckIn,
    completedWalletSetup,
    setVersion,
    initializeRecovery,
    setCloudBackupStatus,
    downloadBackupData,
    putKeeperInfo,
    setupHealth,
    setCloudErrorMessage
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
  keeperImage: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    borderRadius: wp( '15%' ) / 2,
  },
  keeperImageView: {
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
  }
} )
