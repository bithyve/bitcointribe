import React, { Component, createRef } from 'react'
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
  Keyboard,
  PermissionsAndroid,
  RefreshControl,
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
  trustedChannelsSetupSync,
  updateTrustedContactsInfoLocally
} from '../../store/actions/trustedContacts'
import idx from 'idx'
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter'
import moment from 'moment'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../../components/ModalHeader'
import DeviceInfo from 'react-native-device-info'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Loader from '../../components/loader'
import BottomInfoBox from '../../components/BottomInfoBox'
import RestoreFromICloud from '../RestoreHexaWithKeeper/RestoreFromICloud'
import SecurityQuestion from '../NewBHR/SecurityQuestion'
import UpgradingKeeperContact from './UpgradingKeeperContact'
import UpgradePdfKeeper from './UpgradePdfKeeper'
import Dash from 'react-native-dash'
import S3Service from '../../bitcoin/services/sss/S3Service'
import {
  initializeHealthSetup,
  updateMSharesHealth,
  initLevelTwo,
  generateMetaShare,
  keeperProcessStatus,
  updatedKeeperInfo,
  generateSMMetaShares,
  getPDFData,
  checkMSharesHealth,
} from '../../store/actions/health'
import { REGULAR_ACCOUNT, SECURE_ACCOUNT } from '../../common/constants/wallet-service-types'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import { LevelHealthInterface, MetaShare } from '../../bitcoin/utilities/Interface'
import AccountShell from '../../common/data/models/AccountShell'
import PersonalNode from '../../common/data/models/PersonalNode'
import { initNewBHRFlow } from '../../store/actions/health'
import { setCloudData, updateHealthForCloud, } from '../../store/actions/cloud'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { setCloudDataForLevel, autoUploadSecondaryShare, autoShareContactKeeper, setUpgradeProcessStatus, setAvailableKeeperData, updateLevelToSetup, updateAvailableKeeperData, confirmPDFSharedFromUpgrade } from '../../store/actions/upgradeToNewBhr'
import { addNewSecondarySubAccount } from '../../store/actions/accounts'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import TrustedContactsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TrustedContactsSubAccountInfo'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import config from '../../bitcoin/HexaConfig'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import SecondaryDevice from '../NewBHR/SecondaryDeviceNewBHR'
import PersonalCopyShareModal from '../NewBHR/PersonalCopyShareModal'
import ErrorModalContents from '../../components/ErrorModalContents'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import QRModal from '../Accounts/QRModal'

interface UpgradeBackupStateTypes {
  selectedIds: any[];
  listData: {
    title: String;
    subTitle: String;
    type: String;
    image: any;
    status: String;
  }[];
  selectedContact: any[];
  encryptedCloudDataJson: any;
  isCloudBackupProcessing: Boolean;
  showLoader: boolean;
  totalKeeper: number;
  secondaryQR: string;
  selectedShareId: string[];
  errorMessage: string;
  errorMessageHeader: string;
  hasStoragePermission: boolean;
  contactToShow: any[];
  isGuardianCreationClicked: boolean;
  isRefreshing: boolean;
  pdfProcessStarted: boolean;
  QrBottomSheetsFlag: boolean;
  secondaryMnemonics: string;
  isPdfConfirm: boolean;
  qrScannerText: string;
  isNextStep: boolean;
}

interface UpgradeBackupPropsTypes {
  navigation: any;
  s3Service: S3Service;
  initializeHealthSetup: any;
  walletName: string;
  regularAccount: RegularAccount;
  database: any;
  updateHealthForCloud: any;
  cloudBackupStatus: CloudBackupStatus;
  levelHealth: LevelHealthInterface[];
  currentLevel: number;
  keeperInfo: any[];
  isLevel2Initialized: Boolean;
  isLevel3Initialized: Boolean;
  updateMSharesHealth: any;
  accountShells: AccountShell[];
  activePersonalNode: PersonalNode;
  isBackupProcessing: any;
  initNewBHRFlow: any;
  versionHistory: any;
  setCloudData: any;
  overallHealth: any[];
  generateMetaShare: any;
  metaSharesKeeper: MetaShare[],
  initLevelTwo: any;
  healthCheckInitializedKeeper: boolean;
  setCloudDataForLevel: any;
  addNewSecondarySubAccount: any;
  trustedContacts: TrustedContactsService
  SHARES_TRANSFER_DETAILS: any;
  keeperProcessStatus: any;
  updatedKeeperInfo: any;
  uploadMetaShare: boolean;
  updateEphemeralChannelLoader: boolean;
  keeperProcessStatusFlag: KeeperProcessStatus;
  isSmMetaSharesCreatedFlag: boolean;
  generateSMMetaShares: any;
  autoUploadSecondaryShare: any;
  trustedContactsInfo: any;
  autoShareContactKeeper: any;
  setUpgradeProcessStatus: any;
  upgradeProcessStatus: KeeperProcessStatus;
  setAvailableKeeperData: any;
  availableKeeperData: {shareId: string; type: string; count: number; status?: boolean; contactDetails?: any;}[];
  updateLevelToSetup: any;
  levelToSetup: number;
  updateAvailableKeeperData: any;
  trustedChannelsSetupSync: any;
  confirmPDFSharedFromUpgrade: any;
  getPDFData: any;
  isUpgradeLevelInitialized: boolean;
  checkMSharesHealth: any;
  updateTrustedContactsInfoLocally: any;
  pdfInfo: { publicKey: string; privateKey: string; filePath: string;},
  secureAccount: SecureAccount;
}

class UpgradeBackup extends Component<
  UpgradeBackupPropsTypes,
  UpgradeBackupStateTypes
> {
  RestoreFromICloud = createRef<BottomSheet>()
  UpgradingKeeperContact = createRef<BottomSheet>()
  UpgradePdfKeeper = createRef<BottomSheet>()
  SecurityQuestionBottomSheet = createRef<BottomSheet>()
  secondaryDeviceBottomSheet = createRef<BottomSheet>()
  PersonalCopyShareBottomSheet = createRef<BottomSheet>()
  ErrorBottomSheet = createRef<BottomSheet>()
  storagePermissionBottomSheet = createRef<BottomSheet>()
  QrBottomSheet = createRef<BottomSheet>();
  ProcessInfoBottomSheet = createRef<BottomSheet>();

  constructor( props ) {
    super( props )
    this.RestoreFromICloud
    this.UpgradingKeeperContact
    this.UpgradePdfKeeper
    this.SecurityQuestionBottomSheet
    this.secondaryDeviceBottomSheet
    this.PersonalCopyShareBottomSheet
    this.ErrorBottomSheet
    this.storagePermissionBottomSheet
    this.QrBottomSheet
    this.ProcessInfoBottomSheet

    this.state = {
      isCloudBackupProcessing: false,
      selectedIds: [],
      encryptedCloudDataJson: [],
      listData: [
        {
          title: 'Wallet Backup',
          subTitle: Platform.OS == 'ios' ? 'iCloud Backup' : 'GDrive Backup',
          type: 'cloud',
          image: require( '../../assets/images/icons/icon_backup.png' ),
          status: 'setup'
        },
        {
          title: 'Primary Backup',
          subTitle: 'Backup',
          type: 'primary',
          image: require( '../../assets/images/icons/icon_secondarydevice.png' ),
          status: 'setup'
        },
        {
          title: 'Contacts Backup',
          subTitle: 'Backup upgrade',
          type: 'contact',
          image: require( '../../assets/images/icons/icon_contact.png' ),
          status: 'setup'
        },
        {
          title: 'Upgrade Backup Device and PDF Backup',
          subTitle: 'Device and PDF Backup upgrade',
          type: 'pdf',
          image: require( '../../assets/images/icons/files-and-folders-2.png' ),
          status: 'setup'
        },
        {
          title: 'Security Question',
          subTitle: 'Security Question Upgrade',
          type: 'securityQuestion',
          image: require( '../../assets/images/icons/icon_question.png' ),
          status: 'setup'
        },
      ],
      selectedContact: [],
      contactToShow: [],
      showLoader: false,
      totalKeeper: 0,
      secondaryQR: '',
      selectedShareId: [],
      errorMessage: '',
      errorMessageHeader: '',
      hasStoragePermission: false,
      isGuardianCreationClicked: false,
      isRefreshing: false,
      pdfProcessStarted: false,
      QrBottomSheetsFlag: false,
      secondaryMnemonics: '',
      isPdfConfirm: false,
      qrScannerText: '',
      isNextStep: false,
    }
  }

  componentDidMount = () => {
    this.props.checkMSharesHealth()
    this.props.trustedChannelsSetupSync()
    const { trustedContactsInfo, overallHealth } = this.props
    let TotalKeeper = 1
    let keepersInfo: {shareId: string; type: string; count: number; contactDetails?: any; status?: boolean}[] = [ {
      shareId: '', type: 'cloud', count: 0
    } ]
    let selectedContacts = []
    if( overallHealth && overallHealth.sharesInfo ) {
      for ( let i = 0; i < overallHealth.sharesInfo.length; i++ ) {
        const element = overallHealth.sharesInfo[ i ]
        const type = i == 0 ? 'primary' : i == 1 ? 'contact1' : i == 2 ? 'contact2' : 'pdf'
        if ( ( i == 1 || i == 2 ) && element.updatedAt > 0 && trustedContactsInfo ) {
          if( trustedContactsInfo.slice( 1, 3 )[ 0 ] ) selectedContacts.push( trustedContactsInfo.slice( 1, 3 )[ 0 ] )
          if( trustedContactsInfo.slice( 1, 3 )[ 1 ] ) selectedContacts.push( trustedContactsInfo.slice( 1, 3 )[ 1 ] )
          const setSelectedContacts = new Set( selectedContacts )
          selectedContacts = Array.from( setSelectedContacts )
          this.setState( {
            selectedContact: selectedContacts
          } )
        }
        if( trustedContactsInfo.slice( 1, 3 ).length && element.updatedAt > 0 && ( type == 'contact1' || type == 'contact2' ) ){
          TotalKeeper = TotalKeeper + 1
          keepersInfo.push( {
            shareId: element.shareId, type, count: selectedContacts.length, contactDetails: trustedContactsInfo.slice( 1, 3 )[ i - 1 ]
          } )
        }
        if( ( type != 'contact1' && type != 'contact2' ) && element.updatedAt > 0 && keepersInfo.findIndex( value=>value.type =='pdf' ) == -1 ) {
          TotalKeeper = TotalKeeper + 1
          keepersInfo.push( {
            shareId: element.shareId, type, count: 0
          } )
        }
      }
      if( TotalKeeper > 1 && keepersInfo.findIndex( value=>value.type == 'primary' ) == -1 ) {
        keepersInfo.splice( 0, 0, {
          shareId: '', type: 'primary', count: 0
        } )
      }
    }

    let levelToSetup = TotalKeeper == 1 || TotalKeeper == 2 ? 1 : TotalKeeper == 3 || TotalKeeper <= 4 ? 2 : 3
    if( !this.props.levelToSetup ){
      this.props.updateLevelToSetup( levelToSetup )
    } else levelToSetup = this.props.levelToSetup
    if( !this.props.availableKeeperData.length ){
      this.props.setAvailableKeeperData( keepersInfo )
    } else keepersInfo = this.props.availableKeeperData
    this.setState( {
      totalKeeper: TotalKeeper,
    } )
    if( levelToSetup == this.props.currentLevel && ( this.props.availableKeeperData.length > 0 && this.props.availableKeeperData.findIndex( value => !value.status ) > -1 ) ) {
      this.props.updateLevelToSetup( this.props.currentLevel + 1 )
      this.props.generateMetaShare( this.props.currentLevel + 1 )
      if( !this.props.isSmMetaSharesCreatedFlag ){
        this.props.generateSMMetaShares()
      }
    }
    this.ProcessInfoBottomSheet.current.snapTo( 1 )
    this.setState( {
      isNextStep: true
    } )
    this.updateListData( keepersInfo )
  };

  nextToProcess = ( keepersInfo: {shareId: string; type: string; status?: boolean}[], levelToSetup: number, selectedContact: any[] ) => {
    this.ProcessInfoBottomSheet.current.snapTo( 0 )
    this.setState( {
      showLoader: true
    } )
    const { levelHealth, overallHealth, secureAccount } = this.props
    if( levelHealth[ levelToSetup-1 ] ){
      for ( let i = 0; i < keepersInfo.length; i++ ) {
        const element = keepersInfo[ i ]

        // CLOUD
        if( element.type == 'cloud' && !element.status ){
          console.log( 'CLOUD' )
          this.RestoreFromICloud.current.snapTo( 1 )
          this.secondaryDeviceBottomSheet.current.snapTo( 0 )
          this.UpgradingKeeperContact.current.snapTo( 0 )
          return
        }
        if( overallHealth && overallHealth.sharesInfo ) {
        // SECONDARY
          if( element.type == 'primary' && !element.status && levelHealth[ levelToSetup-1 ].levelInfo[ 2 ] ) {
            console.log( 'PRIMASRY' )
            this.setState( {
              selectedShareId: [ levelHealth[ levelToSetup-1 ].levelInfo[ 2 ].shareId ]
            } )
            if( overallHealth && overallHealth.sharesInfo[ 0 ] && overallHealth.sharesInfo[ 0 ].updatedAt > 0 ) {
              this.setState( {
                showLoader: true,
              } )
              this.props.autoUploadSecondaryShare( levelHealth[ levelToSetup-1 ].levelInfo[ 2 ].shareId )
            } else {
              this.setState( {
                showLoader: false,
              } )
              this.secondaryDeviceBottomSheet.current.snapTo( 1 )
              this.createGuardian( [ levelHealth[ levelToSetup-1 ].levelInfo[ 2 ].shareId ] )
            }
            this.RestoreFromICloud.current.snapTo( 0 )
            this.UpgradingKeeperContact.current.snapTo( 0 )
            return
          }
          // CONTACT
          if( selectedContact.length && selectedContact.length == 2 && this.props.levelToSetup == 3 && this.props.isUpgradeLevelInitialized && ( ( element.type == 'contact1' && !element.status ) && ( keepersInfo[ i + 1 ].type == 'contact2' && !keepersInfo[ i + 1 ].status ) ) ) {
            console.log( 'CONTACT1' )
            if( levelHealth[ levelToSetup-1 ].levelInfo[ 3 ] && levelHealth[ levelToSetup-1 ].levelInfo[ 3 ].status == 'notAccessible' && levelHealth[ levelToSetup-1 ].levelInfo[ 4 ] && levelHealth[ levelToSetup-1 ].levelInfo[ 4 ].status == 'notAccessible' && this.props.isUpgradeLevelInitialized ) {
              this.setState( {
                showLoader: false,
                contactToShow: selectedContact,
                selectedShareId: [ levelHealth[ levelToSetup-1 ].levelInfo[ 3 ].shareId, levelHealth[ levelToSetup-1 ].levelInfo[ 4 ].shareId ]
              } )
            }
            this.RestoreFromICloud.current.snapTo( 0 )
            this.secondaryDeviceBottomSheet.current.snapTo( 0 )
            this.UpgradingKeeperContact.current.snapTo( 1 )
            this.PersonalCopyShareBottomSheet.current.snapTo( 0 )
            return
          } else if( selectedContact.length && ( element.type == 'contact1' || element.type == 'contact2' ) ) {
            console.log( 'CONTACT@' )
            if( element.type == 'contact1' && !element.status && levelHealth[ levelToSetup-1 ].levelInfo[ 3 ] ){
              this.setState( {
                showLoader: false,
                contactToShow: [ selectedContact[ 0 ] ],
                selectedShareId: [ levelHealth[ levelToSetup-1 ].levelInfo[ 3 ].shareId ]
              } )
              this.RestoreFromICloud.current.snapTo( 0 )
              this.secondaryDeviceBottomSheet.current.snapTo( 0 )
              this.UpgradingKeeperContact.current.snapTo( 1 )
              this.PersonalCopyShareBottomSheet.current.snapTo( 0 )
              return
            }
            if( element.type == 'contact2' && !element.status && levelHealth[ levelToSetup-1 ].levelInfo[ 4 ] ){
              this.setState( {
                showLoader: false,
                contactToShow: [ selectedContact[ 1 ] ],
                selectedShareId: [ levelHealth[ levelToSetup-1 ].levelInfo[ 4 ].shareId ]
              } )
              this.RestoreFromICloud.current.snapTo( 0 )
              this.secondaryDeviceBottomSheet.current.snapTo( 0 )
              this.UpgradingKeeperContact.current.snapTo( 1 )
              this.PersonalCopyShareBottomSheet.current.snapTo( 0 )
              return
            }
          // return
          }

          if( element.type == 'pdf' && !element.status ) {
            console.log( 'PDF' )
            this.setState( {
              showLoader: false,
              pdfProcessStarted: true
            } )
            let shareId = []
            if( selectedContact.length == 0 && levelHealth[ levelToSetup-1 ].levelInfo[ 3 ] ) {
              shareId = [ levelHealth[ levelToSetup-1 ].levelInfo[ 3 ].shareId ]
            } else if( selectedContact.length == 1 && levelHealth[ levelToSetup-1 ].levelInfo[ 4 ] ) {
              shareId = [ levelHealth[ levelToSetup-1 ].levelInfo[ 4 ].shareId ]
            } else if( selectedContact.length == 2 && levelHealth[ levelToSetup-1 ].levelInfo[ 5 ] ) {
              shareId = [ levelHealth[ levelToSetup-1 ].levelInfo[ 5 ].shareId ]
            }
            this.setState( {
              selectedShareId: shareId
            } )
            if( this.props.pdfInfo.filePath !=='' ){
              this.setState( {
                showLoader: false
              } )
              this.PersonalCopyShareBottomSheet.current.snapTo( 1 )
            } else {
              if( shareId.length ){
                this.checkStoragePermission()
              }
            }
            this.RestoreFromICloud.current.snapTo( 0 )
            this.secondaryDeviceBottomSheet.current.snapTo( 0 )
            this.UpgradingKeeperContact.current.snapTo( 0 )
            // this.PersonalCopyShareBottomSheet.current.snapTo( 1 )
            return
          }
        }
      }
    } else {
      this.setState( {
        showLoader: false,
        qrScannerText: 'Scan last qr from pdf or scan secondary qr from personal device.'
      } )
      if( !secureAccount.secureHDWallet.secondaryMnemonic )
        ( this.QrBottomSheet as any ).snapTo( 1 )
      else
        this.RestoreFromICloud.current.snapTo( 1 )
      return
    }
  }

  updateListData = ( availableKeeperData ) => {
    const { listData } = this.state
    if( availableKeeperData.length ){
      for ( let i = 0; i < listData.length; i++ ) {
        const element = listData[ i ]
        if( availableKeeperData.findIndex( value=>value.type == 'cloud' && value.status === true ) > -1 &&listData[ i ].type == 'cloud' ){
          listData[ i ].status = 'accessible'
        }
        else if( availableKeeperData.findIndex( value=> value.type == 'contact2' ) > -1 && availableKeeperData.findIndex( value=> value.type == 'contact2' && value.status === true ) > -1 && listData[ i ].type == 'contact' ){
          listData[ i ].status = 'accessible'
        }
        else if( availableKeeperData.findIndex( value=> value.type == 'contact1' ) > -1 && availableKeeperData.findIndex( value=> value.type == 'contact1' && value.status === true ) > -1 && listData[ i ].type == 'contact' ){
          listData[ i ].status = 'accessible'
        }
        else if( availableKeeperData.findIndex( value=>value.type == element.type && value.status === true ) > -1 ){
          listData[ i ].status = 'accessible'
        } else if( availableKeeperData.findIndex( value=>value.type == 'securityQuestion' && value.status === true ) > -1 && listData[ i ].type == 'securityQuestion' ){
          listData[ i ].status = 'accessible'
        }
      }
    }
    this.setState( {
      listData
    } )
  }

  componentDidUpdate = ( prevProps, prevState ) => {
    const { levelHealth, setCloudData, cloudBackupStatus, updateAvailableKeeperData, levelToSetup, isUpgradeLevelInitialized, availableKeeperData, setCloudDataForLevel, SHARES_TRANSFER_DETAILS, trustedContacts, uploadMetaShare, updateEphemeralChannelLoader, upgradeProcessStatus, initNewBHRFlow, currentLevel, updateLevelToSetup, generateMetaShare, generateSMMetaShares, isSmMetaSharesCreatedFlag, setUpgradeProcessStatus, getPDFData } = this.props
    const { selectedContact, isGuardianCreationClicked, hasStoragePermission, selectedShareId } = this.state
    if (
      prevProps.levelHealth !=
        levelHealth &&
        prevProps.levelHealth.length == 0 && levelHealth.length == 1
    ) {
      setCloudData( )
    }

    if( prevProps.cloudBackupStatus != cloudBackupStatus && ( cloudBackupStatus === CloudBackupStatus.COMPLETED || cloudBackupStatus === CloudBackupStatus.PENDING ) ) {
      this.setState( {
        showLoader: false
      } )
      updateAvailableKeeperData( [ {
        type:'cloud'
      } ] )
      this.RestoreFromICloud.current.snapTo( 0 )
    }

    if( prevProps.levelHealth !=
      levelHealth &&
      levelHealth.length > 1 &&
      levelHealth[ levelToSetup - 1 ] &&
      levelHealth[ levelToSetup - 1 ].levelInfo[ 0 ] &&
      levelHealth[ levelToSetup - 1 ].levelInfo[ 0 ].status == 'notAccessible' &&
      isUpgradeLevelInitialized &&
      ( availableKeeperData.length > 0 && availableKeeperData.findIndex( value => value.type == 'cloud' && value.status  != true ) > -1 ) ) {
      setCloudDataForLevel( levelToSetup )
    }
    if( SHARES_TRANSFER_DETAILS[ 0 ] &&
      trustedContacts &&
      !uploadMetaShare &&
      !updateEphemeralChannelLoader &&
      isGuardianCreationClicked
    ) {
      this.setSecondaryDeviceQR()
    }

    if( this.state.isNextStep === true && ( JSON.stringify( prevProps.levelHealth ) != JSON.stringify( levelHealth ) || JSON.stringify( prevProps.availableKeeperData ) != JSON.stringify( availableKeeperData ) ) ) {
      if( levelHealth[ levelToSetup - 1 ] && levelHealth[ levelToSetup - 1 ].levelInfo[ 2 ] && levelHealth[ levelToSetup - 1 ].levelInfo[ 2 ].status == 'accessible' ) {
        updateAvailableKeeperData( [ {
          type:'primary'
        } ] )
        const availableKeeperDataTmp = [ ...availableKeeperData ]
        if( availableKeeperDataTmp.findIndex( value=>value.type == 'primary' )> -1 ){
          availableKeeperDataTmp[ availableKeeperDataTmp.findIndex( value=>value.type == 'primary' ) ].status = true
        }
        this.nextToProcess( availableKeeperDataTmp, levelToSetup, selectedContact )
        this.updateListData( availableKeeperDataTmp )
      } else {
        this.nextToProcess( availableKeeperData, levelToSetup, selectedContact )
        this.updateListData( availableKeeperData )
      }
    }
    if( this.props.upgradeProcessStatus == KeeperProcessStatus.COMPLETED ){
      this.setState( {
        showLoader: false,
      } )
      this.props.initNewBHRFlow( true )
      this.props.navigation.replace( 'ManageBackupNewBHR' )
    }

    if( prevProps.currentLevel != currentLevel && levelToSetup == currentLevel && levelHealth[ levelToSetup - 1 ].levelInfo[ 0 ].status == 'accessible' && ( availableKeeperData.length > 0 && availableKeeperData.findIndex( value => !value.status ) > -1 ) ) {
      updateLevelToSetup( currentLevel + 1 )
      generateMetaShare( currentLevel + 1 )
      if( !isSmMetaSharesCreatedFlag ){
        generateSMMetaShares()
      }
    }

    if( ( availableKeeperData.length > 0 && availableKeeperData.findIndex( value => !value.status ) == -1 ) ) {
      setUpgradeProcessStatus( KeeperProcessStatus.COMPLETED )
    }

    if( prevState.hasStoragePermission != hasStoragePermission ) {
      if( Platform.OS === 'ios' ) {
        this.storagePermissionBottomSheet.current.snapTo( 0 )
        this.setState( {
          hasStoragePermission: true
        } )
      } else {
        hasStoragePermission
          ? this.storagePermissionBottomSheet.current.snapTo( 0 )
          : this.storagePermissionBottomSheet.current.snapTo( 1 )
      }
      if( hasStoragePermission  ){
        getPDFData( selectedShareId[ 0 ] )
      }
    }

    if( JSON.stringify( prevProps.levelHealth ) != JSON.stringify( levelHealth ) ){
      if(
        ( levelHealth[ 2 ] && levelHealth[ 2 ].levelInfo[ 0 ].status == 'notAccessible' &&  levelHealth[ 2 ].levelInfo[ 2 ].status == 'accessible' && levelHealth[ 2 ].levelInfo[ 3 ].status == 'accessible' &&
        levelHealth[ 2 ].levelInfo[ 4 ].status == 'accessible' &&
        levelHealth[ 2 ].levelInfo[ 5 ].status == 'accessible' ) ||
        ( levelHealth[ 1 ] && levelHealth[ 1 ].levelInfo[ 0 ].status == 'notAccessible' &&  levelHealth[ 1 ].levelInfo[ 2 ].status == 'accessible' && levelHealth[ 1 ].levelInfo[ 3 ].status == 'accessible' )
      ) {
        setCloudDataForLevel( levelToSetup )
      }
    }

    if( JSON.stringify( prevProps.pdfInfo ) != JSON.stringify( this.props.pdfInfo ) && this.props.pdfInfo.filePath !=='' && this.state.pdfProcessStarted && availableKeeperData.findIndex( value=> value.type == 'pdf' && !value.status ) > -1 ){
      this.setState( {
        showLoader: false
      } )
      this.PersonalCopyShareBottomSheet.current.snapTo( 1 )
    }
  };

  cloudBackup = () => {
    this.setState( {
      showLoader: true
    } )
    const { levelToSetup } = this.props
    const { initializeHealthSetup, healthCheckInitializedKeeper } = this.props
    this.props.setUpgradeProcessStatus( KeeperProcessStatus.IN_PROGRESS )
    if( levelToSetup == 1 ) {
      if( healthCheckInitializedKeeper == false ) {
        initializeHealthSetup()
      }
    } else {
      this.props.generateMetaShare( levelToSetup, true )
      if( !this.props.isSmMetaSharesCreatedFlag ){
        this.props.generateSMMetaShares( this.state.secondaryMnemonics )
      }
    }
  };

  createGuardian = ( shareId ) => {
    if( !this.state.isGuardianCreationClicked ){
      try {
        this.setState( {
          isGuardianCreationClicked: true
        } )
        const { trustedContacts, updatedKeeperInfo, keeperProcessStatus, accountShells, addNewSecondarySubAccount } = this.props
        const firstName = 'Secondary'
        const lastName = 'Device1'

        const contactName = `${firstName} ${lastName ? lastName : ''}`
          .toLowerCase()
          .trim()

        const trustedContact = trustedContacts.tc.trustedContacts[ contactName ]
        let info = null
        if ( trustedContact && trustedContact.secondaryKey ) info = trustedContact.secondaryKey

        const shareExpired =  !this.props.SHARES_TRANSFER_DETAILS[ 0 ] ||
        Date.now() - this.props.SHARES_TRANSFER_DETAILS[ 0 ].UPLOADED_AT >
        config.TC_REQUEST_EXPIRY
        // Keeper setup started
        keeperProcessStatus( KeeperProcessStatus.IN_PROGRESS )
        updatedKeeperInfo( {
          shareId: shareId,
          name: contactName,
          uuid: '',
          publicKey: '',
          ephemeralAddress: '',
          type: 'device',
          data: {
            name: contactName, index: 0
          }
        } )

        if ( shareExpired ) {
          this.setState( {
            secondaryQR: ''
          } )
          this.updateTrustedContactsInfo( {
            firstName, lastName
          } )
          // dispatch( uploadEncMShareKeeper( index, selectedShareId, contactInfo, data, changeKeeper || isChange ) )
        } else {
          const hasTrustedChannel = trustedContact.symmetricKey ? true : false
          const isEphemeralChannelExpired = trustedContact.ephemeralChannel &&
          trustedContact.ephemeralChannel.initiatedAt &&
          Date.now() - trustedContact.ephemeralChannel.initiatedAt >
          config.TC_REQUEST_EXPIRY? true: false

          if (
            !hasTrustedChannel &&
            isEphemeralChannelExpired
          ) this.setState( {
            secondaryQR: ''
          } )
        }

        const contactInfo = {
          contactName,
          info: info? info.trim(): null,
          isGuardian: true,
          shareIndex: 0,
          shareId: shareId,
          changeContact: false,
        }

        let parentShell: AccountShell
        accountShells.forEach( ( shell: AccountShell ) => {
          if( !shell.primarySubAccount.instanceNumber ){
            if( shell.primarySubAccount.sourceKind === REGULAR_ACCOUNT ) parentShell = shell
          }
        } )
        const newSecondarySubAccount: SubAccountDescribing = new TrustedContactsSubAccountInfo( {
          accountShellID: parentShell.id,
          isTFAEnabled: parentShell.primarySubAccount.sourceKind === SourceAccountKind.SECURE_ACCOUNT? true: false,
        } )
        addNewSecondarySubAccount( newSecondarySubAccount, parentShell, contactInfo )
      } catch ( error ) {
        console.log( 'error', error )
      }
    }
  }

  updateTrustedContactsInfo = async ( contact ) => {
    const tcInfo = this.props.trustedContactsInfo
    if ( tcInfo.length ) {
      tcInfo[ 0 ] = contact
    } else {
      tcInfo[ 0 ] = contact
      tcInfo[ 1 ] = undefined // securing initial 3 positions for Guardians
      tcInfo[ 2 ] = undefined
    }
    this.props.updateTrustedContactsInfoLocally( tcInfo )
  }

  setSecondaryDeviceQR = () => {
    try {
      const { uploadMetaShare, updateEphemeralChannelLoader, trustedContacts, keeperProcessStatus, walletName } = this.props
      const { secondaryQR } = this.state
      const index = 0
      if ( uploadMetaShare || updateEphemeralChannelLoader ) {
        if ( secondaryQR ) this.setState( {
          secondaryQR: ''
        } )
        return
      }

      const firstName = 'Secondary'
      let lastName = 'Device'
      if( index === 0 ) lastName = 'Device1'
      else if( index === 3 ) lastName = 'Device2'
      else lastName = 'Device3'
      const contactName = `${firstName} ${lastName ? lastName : ''}`
        .toLowerCase()
        .trim()

      if (
        trustedContacts.tc.trustedContacts[ contactName ] &&
      trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
      ) {
        const { publicKey, secondaryKey } = trustedContacts.tc.trustedContacts[
          contactName
        ]
        if( publicKey ) {
          keeperProcessStatus( KeeperProcessStatus.COMPLETED )
        }
        if( this.state.isGuardianCreationClicked ){
          this.updateShare()
          console.log( 'secondaryQR', JSON.stringify( {
            isGuardian: true,
            requester: walletName,
            publicKey,
            info: secondaryKey,
            uploadedAt:
            trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
              .initiatedAt,
            type: 'secondaryDeviceGuardian',
            ver: DeviceInfo.getVersion(),
            isFromKeeper: true,
          } ) )
          this.setState( {
            secondaryQR: JSON.stringify( {
              isGuardian: true,
              requester: walletName,
              publicKey,
              info: secondaryKey,
              uploadedAt:
              trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
                .initiatedAt,
              type: 'secondaryDeviceGuardian',
              ver: DeviceInfo.getVersion(),
              isFromKeeper: true,
            } ),
            isGuardianCreationClicked: false
          } )
        }
      }
    } catch ( error ) {
      console.log( 'eerror', error )
    }
  }

  updateShare = () => {
    const index = 0
    if( this.props.levelHealth[ this.props.levelToSetup-1 ] && this.props.levelHealth[ this.props.levelToSetup-1 ].levelInfo[ 2 ].updatedAt > 0 ) return
    let contactName = 'Secondary Device'
    if( index === 0 ) contactName = 'Secondary Device1'
    else if( index === 3 ) contactName = 'Secondary Device2'
    else contactName = 'Secondary Device3'
    const shareArray = [
      {
        walletId: this.props.s3Service.getWalletId().data.walletId,
        shareId: this.state.selectedShareId[ 0 ],
        reshareVersion: 0,
        updatedAt: moment( new Date() ).valueOf(),
        name: contactName,
        shareType: 'device',
      },
    ]
    this.props.updateMSharesHealth( shareArray )
  }

  saveInTransitHistory = async () => {
    const index = 0
    const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
    if ( shareHistory ) {
      const updatedShareHistory = [ ...shareHistory ]
      updatedShareHistory[ index ] = {
        ...updatedShareHistory[ index ],
        inTransit: Date.now(),
      }
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify( updatedShareHistory ),
      )
    }
  }

  renderQrContent = () => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={false}
        QRModalHeader={'QR scanner'}
        title={'Note'}
        infoText={this.state.qrScannerText}
        modalRef={this.QrBottomSheet}
        isOpenedFlag={this.state.QrBottomSheetsFlag}
        onQrScan={async( qrScannedData ) => {
          if( this.state.isPdfConfirm ){
            this.props.confirmPDFSharedFromUpgrade( this.state.selectedShareId[ 0 ], qrScannedData );
            ( this.QrBottomSheet as any ).snapTo( 0 )
            this.setState( {
              showLoader: true
            } )
          } else {
            this.setState( {
              secondaryMnemonics: qrScannedData,
              QrBottomSheetsFlag: false
            } )
            setTimeout( () => {
              ( this.QrBottomSheet as any ).snapTo( 0 )
              this.RestoreFromICloud.current.snapTo( 1 )
            }, 2 )
          }
        }}
        onBackPress={() => {
          this.setState( {
            QrBottomSheetsFlag: false
          } )
          if ( this.QrBottomSheet ) ( this.QrBottomSheet as any ).snapTo( 0 )
        }}
        onPressContinue={async() => {
          // const qrScannedData = '{"requester":"Ty","publicKey":"rWGnbT3BST5nCCIFwNScsRvh","uploadedAt":1617100785380,"type":"ReverseRecoveryQR","ver":"1.5.0"}'
          // try {
          //   if ( qrScannedData ) {
          //     this.props.downloadSmShareForApproval( qrScannedData )
          //     this.setState( {
          //       QrBottomSheetsFlag: false
          //     } )
          //   }
          // } catch ( err ) {
          //   console.log( {
          //     err
          //   } )
          // }
        }}
      />
    )
  }

  renderQrHeader = () => {
    return (
      <ModalHeader
      />
    )
  }


  renderSecondaryDeviceContents = () => {
    return (
      <SecondaryDevice
        secondaryQR={this.state.secondaryQR}
        onPressOk={async () => {
          this.saveInTransitHistory()
          this.secondaryDeviceBottomSheet.current.snapTo( 0 )
        }}
        onPressBack={() => {
          this.secondaryDeviceBottomSheet.current.snapTo( 0 )
        }}
      />
    )
  }

  renderSecondaryDeviceHeader = () => {
    return (
      <ModalHeader/>
    )
  }

  renderPersonalCopyShareModalContent = () => {
    return (
      <PersonalCopyShareModal
        removeHighlightingFromCard={() => {}}
        selectedPersonalCopy={null}
        personalCopyDetails={null}
        onPressBack={() => {
          this.PersonalCopyShareBottomSheet.current.snapTo( 0 )
        }}
        onPressShare={() => {}}
        onPressConfirm={() => {
          try {
            this.setState( {
              pdfProcessStarted: false,
              isPdfConfirm: true,
              qrScannerText: 'Open your PDF copy and scan the first QR for approval.'
            } );
            ( this.QrBottomSheet as any ).snapTo( 1 )
            this.props.keeperProcessStatus( KeeperProcessStatus.IN_PROGRESS )
            this.PersonalCopyShareBottomSheet.current.snapTo( 0 )
          } catch ( err ) {
            this.props.keeperProcessStatus( '' )
          }
        }}
      />
    )
  }

  renderPersonalCopyShareModalHeader = () => {
    return (
      <ModalHeader/>
    )
  }

  getStoragePermission = async () => {
    // await checkStoragePermission()
    if ( Platform.OS === 'android' ) {
      const granted = await this.requestStoragePermission()
      if ( !granted ) {
        this.setState( {
          errorMessage: 'Cannot access files and storage. Permission denied.\nYou can enable files and storage from the phone settings page \n\n Settings > Hexa > Storage',
          hasStoragePermission: false
        } )
        this.storagePermissionBottomSheet.current.snapTo( 0 )
        this.ErrorBottomSheet.current.snapTo( 1 )
        return
      }
      else {
        this.storagePermissionBottomSheet.current.snapTo( 0 )
        this.setState( {
          hasStoragePermission: true
        } )
      }
    }

    if ( Platform.OS === 'ios' ) {
      this.setState( {
        hasStoragePermission: true
      } )
      return
    }
  }

  requestStoragePermission = async () => {
    try {
      const result = await PermissionsAndroid.requestMultiple( [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ] )
      if(
        result[ 'android.permission.READ_EXTERNAL_STORAGE' ] === PermissionsAndroid.RESULTS.GRANTED
        &&
        result[ 'android.permission.WRITE_EXTERNAL_STORAGE' ] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true
      }
      else {
        return false
      }
    } catch ( err ) {
      console.warn( err )
      return false
    }
  }

  renderErrorModalContent = () => {
    return (
      <ErrorModalContents
        modalRef={this.ErrorBottomSheet}
        title={this.state.errorMessageHeader}
        info={this.state.errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          this.ErrorBottomSheet.current.snapTo( 0 )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }

  renderErrorModalHeader = () => {
    return (
      <ModalHeader
      />
    )
  }

  renderProceedModalContent = () => {
    return (
      <ErrorModalContents
        modalRef={this.ProcessInfoBottomSheet}
        title={'Proceed to Upgrade'}
        info={'Your backup will now be upgraded to the new scheme which provides you different levels and more options. This may take some time, please do not close the app.'}
        proceedButtonText={'Proceed'}
        onPressProceed={() => {
          this.nextToProcess( this.props.availableKeeperData, this.props.levelToSetup, this.state.selectedContact )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/cloud_ilustration.png' )}
      />
    )
  }

  renderProceedModalHeader = () => {
    return (
      <ModalHeader
      />
    )
  }

  checkStoragePermission = async () =>  {
    if( Platform.OS==='android' ) {
      const [ read, write ] = [
        await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE ),
        await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE )
      ]
      if( read && write ) {
        this.setState( {
          hasStoragePermission: true
        } )
        return true
      }
      else {
        this.setState( {
          hasStoragePermission: false
        } )
        return false
      }
    }

  }

  renderStoragePermissionModalContent = () => {
    return (
      <ErrorModalContents
        modalRef={this.storagePermissionBottomSheet}
        title={'Why do we need access to your files and storage?'}
        info={'File and Storage access will let Hexa save a pdf with your Recovery Keys. This will also let Hexa attach the pdf to emails, messages and to print in case you want to.\n\n'}
        otherText={'Don’t worry these are only sent to the email address you choose, in the next steps you will be able to choose how the pdf is shared.'}
        proceedButtonText={'Continue'}
        isIgnoreButton={false}
        onPressProceed={() => {
          this.getStoragePermission()
        }}
        onPressIgnore={() => {
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
      />
    )
  }

  renderStoragePermissionModalHeader = () => {
    return (
      <ModalHeader/>
    )
  }

  render() {
    const { listData, contactToShow, isCloudBackupProcessing, showLoader } = this.state
    const { navigation } = this.props
    return (
      <View style={{
        flex: 1, backgroundColor: Colors.backgroundColor1
      }}>
        <SafeAreaView style={{
          flex: 0
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{
            flex: 1, flexDirection: 'row'
          }}>
            <TouchableOpacity
              onPress={() => navigation.replace( 'Home' )}
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
                {'Upgrade Backup'}
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
              Simply follow the steps below to secure your Recovery Keys better
              </Text>
            </View>
          </View>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              onRefresh={()=>this.props.checkMSharesHealth()}
              refreshing={this.state.isRefreshing}
            />
          }
          style={{
            flex: 1
          }}>
          {listData.map( ( item, index ) => (
            <View key={index} style={styles.greyBox}>
              <View>
                <ImageBackground
                  source={require( '../../assets/images/icons/Ellipse.png' )}
                  style={{
                    ...styles.cardsImageView
                  }}
                >
                  <Image source={item.image} style={styles.cardImage} />
                </ImageBackground>
                {index != listData.length - 1 && (
                  <Dash
                    dashStyle={{
                      width: wp( '1%' ),
                      height: wp( '1%' ),
                      borderRadius: wp( '1%' ) / 2,
                      overflow: 'hidden',
                    }}
                    dashColor={Colors.borderColor}
                    style={{
                      height: 75,
                      width: wp( '1%' ),
                      flexDirection: 'column',
                      marginLeft: wp( '7%' ),
                    }}
                    dashThickness={10}
                    dashGap={5}
                  />
                )}
              </View>
              <View style={{
                flex: 1, marginLeft: 5
              }}>
                <View
                  style={{
                    borderRadius: 10,
                    paddingLeft: wp( '3%' ),
                    paddingRight: wp( '3%' ),
                    height: 50,
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      ...styles.greyBoxText,
                      fontSize: RFValue( 13 ),
                      marginBottom: wp( '1.5%' ),
                    }}
                  >
                    Upgrade{' '}
                    <Text style={{
                      fontFamily: Fonts.FiraSansMedium
                    }}>
                      {item.title}
                    </Text>
                  </Text>
                  {/* <Text style={styles.greyBoxText}>{item.info}</Text> */}
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.borderColor,
                    borderRadius: 10,
                    paddingLeft: wp( '3%' ),
                    paddingRight: wp( '3%' ),
                    height: 50,
                    alignItems: 'center',
                    flexDirection: 'row',
                    backgroundColor: Colors.white,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontFamily: Fonts.FiraSansRegular,
                      fontSize: RFValue( 10 ),
                    }}
                  >
                    {item.subTitle}
                  </Text>
                  <View style={{
                    flexDirection: 'row', marginLeft: 'auto'
                  }}>
                    <View
                      style={{
                        height: wp( '6%' ),
                        width: 'auto',
                        paddingLeft: wp( '5%' ),
                        paddingRight: wp( '5%' ),
                        backgroundColor: item.status == 'accessible' ? Colors.lightGreen : Colors.borderColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: item.status == 'accessible' ? Colors.darkGreen : Colors.textColorGrey,
                          fontFamily: Fonts.FiraSansRegular,
                          fontSize: RFValue( 9 ),
                        }}
                      >
                        {item.status == 'accessible' ? 'Complete' : 'Not Setup' }
                      </Text>
                    </View>
                    {item.status != 'setup' &&
                      <View
                        style={{
                          height: wp( '6%' ),
                          width: wp( '6%' ),
                          borderRadius: wp( '6%' ) / 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: Colors.lightGreen,
                          marginLeft: wp( '2.5%' ),
                        }}
                      >
                        <AntDesign
                          style={{
                            marginTop: 1
                          }}
                          size={RFValue( 15 )}
                          color={Colors.darkGreen}
                          name={'check'}
                        />
                      </View>
                    }
                  </View>
                </View>
              </View>
            </View>
          ) )}
        </ScrollView>
        {showLoader ? <Loader isLoading={true} /> : null}

        <BottomInfoBox
          backgroundColor={Colors.white}
          title={'Note'}
          infoText={
            'Once completed, you would have a three tiered backup. Always ensure that you backup your wallet till the highest level called the Multi-Key Backup'
          }
        />
        <BottomSheet
          onOpenEnd={() => {
            this.setState( {
              QrBottomSheetsFlag: true
            } )
          }}
          onCloseEnd={() => {
            this.setState( {
              QrBottomSheetsFlag: false
            } )
          }}
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={( c )=>this.QrBottomSheet=c}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '90%' ) : hp( '89%' ),
          ]}
          renderContent={this.renderQrContent}
          renderHeader={this.renderQrHeader}
        />
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={this.RestoreFromICloud}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '40%' )
              : hp( '50%' ),
          ]}
          renderContent={() => {
            return (
              <RestoreFromICloud
                isLoading={isCloudBackupProcessing}
                title={Platform.OS == 'ios' ? 'Backup on iCloud' : 'Backup on Gdrive'}
                subText={
                  'Completing the steps below secures your wallet at a basic level'
                }
                cardInfo={'Store Backup'}
                cardTitle={'Hexa Wallet Backup'}
                cardSubInfo={Platform.OS == 'ios' ? 'iCloud' : 'GDrive' + ' backup'}
                proceedButtonText={'Backup'}
                backButtonText={'Back'}
                modalRef={this.RestoreFromICloud}
                isUpgradeBackup={true}
                onPressProceed={() => {
                  this.cloudBackup()
                }}
                onPressBack={() => {
                  navigation.replace( 'Home' )
                }}
              />
            )
          }}
          renderHeader={() => (
            <ModalHeader
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.SecurityQuestionBottomSheet}
          snapPoints={[ -30, hp( '75%' ), hp( '90%' ) ]}
          renderContent={() => (
            <SecurityQuestion
              onFocus={() => {
                if ( Platform.OS == 'ios' )
                  this.SecurityQuestionBottomSheet.current.snapTo( 2 )
              }}
              onBlur={() => {
                if ( Platform.OS == 'ios' )
                  this.SecurityQuestionBottomSheet.current.snapTo( 1 )
              }}
              onPressConfirm={async () => {
                Keyboard.dismiss()
                navigation.navigate( 'ConfirmKeys' )
                setTimeout( () => {
                  this.SecurityQuestionBottomSheet.current.snapTo( 0 )
                }, 2 )
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
            />
          )}
        />

        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.UpgradingKeeperContact}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '50%' )
              : hp( '60%' ),
          ]}
          renderContent={() => {
            if( contactToShow.length ){
              return ( <UpgradingKeeperContact
                info=""
                title={'Upgrade backup of Recovery Keys stored with Contacts'}
                subText={
                  'You could retain the Recovery Keys with the same contacts who have them currently'
                }
                selectedContactArray={contactToShow}
                proceedButtonText={'Proceed'}
                onPressProceed={() => {
                  this.setState( {
                    showLoader: true
                  } )
                  this.UpgradingKeeperContact.current.snapTo( 0 )
                  this.props.autoShareContactKeeper( this.state.contactToShow, this.state.selectedShareId )
                }}
              /> )
            }}}
          renderHeader={() => (
            <ModalHeader
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.UpgradePdfKeeper}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '50%' )
              : hp( '60%' ),
          ]}
          renderContent={() => (
            <UpgradePdfKeeper
              title={'Upgrade PDF Backup'}
              subText={
                'Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diamnonumy eirmod'
              }
              info={
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore.'
              }
              modalRef={this.UpgradePdfKeeper}
              onPressSetup={() => {
                this.UpgradePdfKeeper.current.snapTo( 0 )
                this.SecurityQuestionBottomSheet.current.snapTo( 1 )
              }}
              onPressBack={() => {
                this.UpgradePdfKeeper.current.snapTo( 0 )
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
            />
          )}
        />
        <BottomSheet
          onCloseEnd={() => {
            if( this.props.keeperProcessStatusFlag == KeeperProcessStatus.COMPLETED ){
              this.saveInTransitHistory()
              this.secondaryDeviceBottomSheet.current.snapTo( 0 )
            }
          }}
          onCloseStart={() => {
            this.secondaryDeviceBottomSheet.current.snapTo( 0 )
          }}
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.secondaryDeviceBottomSheet}
          snapPoints={[ -30, hp( '85%' ) ]}
          renderContent={this.renderSecondaryDeviceContents}
          renderHeader={this.renderSecondaryDeviceHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.PersonalCopyShareBottomSheet}
          snapPoints={[ -50, hp( '85%' ) ]}
          renderContent={this.renderPersonalCopyShareModalContent}
          renderHeader={this.renderPersonalCopyShareModalHeader}
        />
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={this.ErrorBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
          ]}
          renderContent={this.renderErrorModalContent}
          renderHeader={this.renderErrorModalHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.storagePermissionBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '55%' ) : hp( '60%' ),
          ]}
          renderContent={this.renderStoragePermissionModalContent}
          renderHeader={this.renderStoragePermissionModalHeader}
        />
        <BottomSheet
          onOpenStart={()=>{
            this.RestoreFromICloud.current.snapTo( 0 )
            this.secondaryDeviceBottomSheet.current.snapTo( 0 )
            this.UpgradingKeeperContact.current.snapTo( 0 )
            this.PersonalCopyShareBottomSheet.current.snapTo( 0 )
          }}
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={this.ProcessInfoBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
          ]}
          renderContent={this.renderProceedModalContent}
          renderHeader={this.renderProceedModalHeader}
        />
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    accounts: state.accounts || [],
    walletName:
      idx( state, ( _ ) => _.storage.database.WALLET_SETUP.walletName ) || '',
    overallHealth: idx( state, ( _ ) => _.sss.overallHealth ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
    s3Service: idx( state, ( _ ) => _.health.service ),
    regularAccount: idx( state, ( _ ) => _.accounts[ REGULAR_ACCOUNT ].service ),
    database: idx( state, ( _ ) => _.storage.database ) || {
    },
    cloudBackupStatus:
      idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    levelHealth: idx( state, ( _ ) => _.health.levelHealth ),
    currentLevel: idx( state, ( _ ) => _.health.currentLevel ),
    keeperInfo: idx( state, ( _ ) => _.health.keeperInfo ),
    isLevel2Initialized: idx( state, ( _ ) => _.health.isLevel2Initialized ),
    isLevel3Initialized: idx( state, ( _ ) => _.health.isLevel3Initialized ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    activePersonalNode: idx( state, ( _ ) => _.nodeSettings.activePersonalNode ),
    isBackupProcessing: idx( state, ( _ ) => _.preferences.isBackupProcessing ) || false,
    versionHistory: idx( state, ( _ ) => _.versionHistory.versions ),
    metaSharesKeeper: idx( state, ( _ ) => _.health.service.levelhealth.metaSharesKeeper ),
    healthCheckInitializedKeeper: idx( state, ( _ ) => _.health.service.levelhealth.healthCheckInitializedKeeper ),
    SHARES_TRANSFER_DETAILS:  idx( state, ( _ ) => _.storage.database.DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS ),
    uploadMetaShare: idx( state, ( _ ) => _.health.loading.uploadMetaShare ),
    updateEphemeralChannelLoader: idx( state, ( _ ) => _.trustedContacts.loading.updateEphemeralChannel ),
    keeperProcessStatusFlag: idx( state, ( _ ) => _.state.health.keeperProcessStatus ),
    isSmMetaSharesCreatedFlag: idx( state, ( _ ) => _.health.isSmMetaSharesCreatedFlag ),
    trustedContactsInfo: idx( state, ( _ ) => _.trustedContacts.trustedContactsInfo ),
    upgradeProcessStatus: idx( state, ( _ ) => _.upgradeToNewBhr.upgradeProcessStatus ),
    availableKeeperData: idx( state, ( _ ) => _.upgradeToNewBhr.availableKeeperData ),
    levelToSetup: idx( state, ( _ ) => _.upgradeToNewBhr.levelToSetup ),
    isUpgradeLevelInitialized: idx( state, ( _ ) => _.upgradeToNewBhr.isUpgradeLevelInitialized ),
    pdfInfo: idx( state, ( _ ) => _.health.pdfInfo ),
    secureAccount: idx( state, ( _ ) => _.accounts[ SECURE_ACCOUNT ].service ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    fetchEphemeralChannel,
    initializeHealthSetup,
    updateHealthForCloud,
    updateMSharesHealth,
    initNewBHRFlow,
    setCloudData,
    generateMetaShare,
    initLevelTwo,
    setCloudDataForLevel,
    addNewSecondarySubAccount,
    keeperProcessStatus,
    updatedKeeperInfo,
    generateSMMetaShares,
    autoUploadSecondaryShare,
    autoShareContactKeeper,
    setUpgradeProcessStatus,
    setAvailableKeeperData,
    updateLevelToSetup,
    updateAvailableKeeperData,
    trustedChannelsSetupSync,
    confirmPDFSharedFromUpgrade,
    getPDFData,
    checkMSharesHealth,
    updateTrustedContactsInfoLocally
  } )( UpgradeBackup )
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
    width: wp( '15%' ),
    height: wp( '15%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: wp( '5%' ),
    height: wp( '5%' ),
    resizeMode: 'contain',
    //marginBottom: wp('1%'),
  },
  statusTextView: {
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
    backgroundColor: Colors.backgroundColor1,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    //  marginTop: wp('2%'),
    //  marginBottom: wp('2%'),
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
    fontSize: RFValue( 10 ),
  },
  successModalImage: {
    width: wp( '30%' ),
    height: wp( '35%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: -5,
  },
} )
