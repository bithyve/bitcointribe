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
  RefreshControl,
  ImageBackground,
  Platform
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
import AntDesign from 'react-native-vector-icons/AntDesign'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import { withNavigationFocus } from 'react-navigation'
import { connect } from 'react-redux'
import { fetchEphemeralChannel } from '../../store/actions/trustedContacts'
import idx from 'idx'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter'
import moment from 'moment'
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import {
  getLevelInfo,
} from '../../common/CommonFunctions'
import { trustedChannelsSetupSync } from '../../store/actions/trustedContacts'
import {
  generateMetaShare,
  checkMSharesHealth,
  initLevelTwo,
  sendApprovalRequest,
  onApprovalStatusChange,
  reShareWithSameKeeper,
  autoShareContact,
  generateSMMetaShares,
  deletePrivateData,
  updateKeeperInfoToTrustedChannel,
  secondaryShareDownloaded,
  autoShareToLevel2Keepers,
  downloadSmShareForApproval,
  updateLevelData,
  keeperProcessStatus,
  setLevelToNotSetupStatus,
  setHealthStatus,
} from '../../store/actions/health'
import { modifyLevelStatus } from './ManageBackupFunction'
import {
  LevelHealthInterface,
  MetaShare,
  notificationType,
} from '../../bitcoin/utilities/Interface'
import {
  fetchKeeperTrustedChannel,
  trustedContactInitialized,
  updateNewFcm,
} from '../../store/actions/keeper'
import { nameToInitials } from '../../common/CommonFunctions'
import S3Service from '../../bitcoin/services/sss/S3Service'
import ModalHeader from '../../components/ModalHeader'
import ErrorModalContents from '../../components/ErrorModalContents'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import AccountShell from '../../common/data/models/AccountShell'
import PersonalNode from '../../common/data/models/PersonalNode'
import { setCloudData, updateHealthForCloud } from '../../store/actions/cloud'
import ApproveSetup from './ApproveSetup'
import QRModal from '../Accounts/QRModal'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import LoaderModal from '../../components/LoaderModal'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import Loader from '../../components/loader'
import MBNewBhrKnowMoreSheetContents from '../../components/know-more-sheets/MBNewBhrKnowMoreSheetContents'
import MBKeeperButton from './MBKeeperButton'
import debounce from 'lodash.debounce'
import { onPressKeeper, setLevelCompletionError, setIsKeeperTypeBottomSheetOpen } from '../../store/actions/newBHR'
import LevelStatus from '../../common/data/enums/LevelStatus'

interface ManageBackupNewBHRStateTypes {
  levelData: any[];
  selectedId: any;
  encryptedCloudDataJson: any;
  isError: boolean;
  selectedKeeper: {
    shareType: string;
    updatedAt: number;
    status: string;
    shareId: string;
    reshareVersion: number;
    name: string;
    data: any;
  };
  selectedLevelId: number;
  selectedKeeperType: string;
  selectedKeeperName: string;
  errorTitle: string;
  errorInfo: string;
  refreshControlLoader: boolean;
  QrBottomSheetsFlag: boolean;
  secondaryShare: MetaShare;
  showLoader: boolean;
  knowMoreType: string;
}

interface ManageBackupNewBHRPropsTypes {
  navigation: any;
  containerStyle: {};
  updateHealthForCloud: any;
  cloudBackupStatus: CloudBackupStatus;
  walletName: string;
  regularAccount: RegularAccount;
  database: any;
  levelHealth: LevelHealthInterface[];
  currentLevel: any;
  healthLoading: any;
  generateMetaShare: any;
  checkMSharesHealth: any;
  isLevelTwoMetaShareCreated: Boolean;
  isLevel2Initialized: Boolean;
  isLevel3Initialized: Boolean;
  initLevelTwo: any;
  s3Service: S3Service;
  keeperInfo: any[];
  sendApprovalRequest: any;
  service: any;
  isLevelThreeMetaShareCreated: Boolean;
  onApprovalStatusChange: any;
  secureAccount: SecureAccount;
  fetchKeeperTrustedChannel: any;
  keeperApproveStatus: any;
  metaSharesKeeper: MetaShare[];
  reShareWithSameKeeper: any;
  autoShareContact: any;
  trustedChannelsSetupSync: any;
  trustedChannelsSetupSyncing: any;
  accountShells: AccountShell[];
  activePersonalNode: PersonalNode;
  versionHistory: any;
  updateNewFcm: any;
  isNewFCMUpdated: Boolean;
  setCloudData: any;
  isSmMetaSharesCreatedFlag: boolean;
  generateSMMetaShares: any;
  deletePrivateData: any;
  updateKeeperInfoToTrustedChannel: any;
  secondaryShareDownloaded: any
  autoShareToLevel2Keepers: any;
  downloadSmShareForApproval: any;
  downloadSmShare: boolean;
  secondaryShareDownloadedStatus: any;
  cloudPermissionGranted: boolean;
  updateLevelData: any;
  keeperProcessStatusFlag: string;
  keeperProcessStatus: any;
  setLevelToNotSetupStatus: any;
  isLevelToNotSetupStatus: boolean;
  initLoading: boolean;
  setHealthStatus: any;
  onPressKeeper: any;
  navigationObj: any;
  status: any;
  errorTitle: any;
  errorInfo: any;
  isTypeBottomSheetOpen: any;
  setLevelCompletionError: any;
  setIsKeeperTypeBottomSheetOpen: any;
}

class ManageBackupNewBHR extends Component<
  ManageBackupNewBHRPropsTypes,
  ManageBackupNewBHRStateTypes
> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;
  NoInternetBottomSheet: any;
  unsubscribe: any;
  ErrorBottomSheet: any;
  keeperTypeBottomSheet: any;
  QrBottomSheet: any;
  ApprovePrimaryKeeperBottomSheet: any
  loaderBottomSheet: any
  knowMoreBottomSheet: any

  constructor( props ) {
    super( props )
    this.focusListener = null
    this.appStateListener = null
    this.NoInternetBottomSheet = React.createRef()
    this.unsubscribe = null
    this.ErrorBottomSheet
    this.keeperTypeBottomSheet
    this.QrBottomSheet
    this.ApprovePrimaryKeeperBottomSheet
    this.loaderBottomSheet
    this.knowMoreBottomSheet = React.createRef( )

    const obj = {
      shareType: '',
      updatedAt: 0,
      status: 'notAccessible',
      shareId: '',
      reshareVersion: 0,
      name: '',
      data: {
      },
      uuid: '',
    }
    this.state = {
      selectedKeeper: obj,
      selectedId: 0,
      isError: false,
      levelData: [
        {
          levelName: 'Level 1',
          status: 'notSetup',
          keeper1ButtonText: Platform.OS == 'ios' ? 'Backup on iCloud' : 'Backup on GoogleDrive',
          keeper2ButtonText: 'Security Question',
          keeper1: obj,
          keeper2: obj,
          note:'',
          info:'Automated Cloud Backup',
          id: 1,
        },
        {
          levelName: 'Level 2',
          status: 'notSetup',
          keeper1ButtonText: 'Share Recovery Key 1',
          keeper2ButtonText: 'Share Recovery Key 2',
          keeper1: obj,
          keeper2: obj,
          note:'',
          info:'Double Backup',
          id: 2,
        },
        {
          levelName: 'Level 3',
          status: 'notSetup',
          keeper1ButtonText: 'Share Recovery Key 1',
          keeper2ButtonText: 'Share Recovery Key 2',
          keeper1: obj,
          keeper2: obj,
          note:'',
          info:'Multi Key Backup',
          id: 3,
        },
      ],
      encryptedCloudDataJson: [],
      selectedLevelId: 0,
      selectedKeeperType: '',
      selectedKeeperName: '',
      errorTitle: '',
      errorInfo: '',
      refreshControlLoader: false,
      QrBottomSheetsFlag: false,
      secondaryShare: null,
      showLoader: false,
      knowMoreType: 'manageBackup'
    }
  }

  componentDidMount = async () => {
    this.onPressKeeperButton= debounce( this.onPressKeeperButton.bind( this ), 1500 )
    await AsyncStorage.getItem( 'walletRecovered' ).then( async( recovered ) => {

      if( !this.props.isLevelToNotSetupStatus && JSON.parse( recovered ) ) {
        this.setState( {
          showLoader: true
        } )
        this.props.setLevelToNotSetupStatus()
        this.modifyLevelData()
      } else {
        await this.onRefresh()
        this.modifyLevelData()
      }
      // updates the new FCM token to channels post recovery
      if ( JSON.parse( recovered ) && !this.props.isNewFCMUpdated ) {
        this.props.updateNewFcm()
      }
    } )
  };

  modifyLevelData = () => {
    const { levelHealth, currentLevel, keeperInfo } = this.props
    const levelHealthObject = [ ...levelHealth ]
    const levelData = modifyLevelStatus(
      this.state.levelData,
      levelHealthObject,
      currentLevel,
      keeperInfo,
      this.updateLevelDataToReducer
    )
    this.setState( {
      levelData: levelData.levelData,
      isError: levelData.isError,
    } )
    //this.setSelectedCards()
  };

  setSelectedCards = () => {
    const { levelData } = this.state
    for ( let a = 0; a < levelData.length; a++ ) {
      if ( levelData[ a ].status == 'notSetup' ) {
        this.setState( {
          selectedId: levelData[ a ].id
        } )
        break
      }
    }
    let level = 1
    if (
      levelData.findIndex(
        ( value ) => value.status == 'bad' || value.status == 'notSetup'
      )
    ) {
      const index = levelData.findIndex(
        ( value ) => value.status == 'bad' || value.status == 'notSetup'
      )
      level = levelData[ index > -1 ? index - 1 : 2 ].id
    }
    let value = 1
    if ( this.state.levelData[ 0 ].status == 'notSetup' || this.state.levelData[ 0 ].status == 'bad' ) value = 1
    else if ( level === 3 ) value = 0
    else if ( level ) value = level + 1
    this.setState( {
      selectedId: value
    } )
  };

  selectId = ( value ) => {
    if ( value != this.state.selectedId ) this.setState( {
      selectedId: value
    } )
    else this.setState( {
      selectedId: 0
    } )
  };

  getTime = ( item ) => {
    return ( item.toString() && item.toString() == '0' ) ||
      item.toString() == 'never'
      ? 'never'
      : timeFormatter( moment( new Date() ), item )
  };

  updateLevelDataToReducer = ( levelData ) =>{
    this.props.updateLevelData( levelData )
  }

  componentDidUpdate = ( prevProps, prevState ) => {
    const {
      healthLoading,
      cloudBackupStatus,
      levelHealth
    } = this.props
    if (
      prevProps.healthLoading !== this.props.healthLoading ||
      prevProps.cloudBackupStatus !==
      this.props.cloudBackupStatus
    ) {
      console.log( 'cloudBackupStatus', cloudBackupStatus )
      if ( healthLoading || cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) {
        this.setState( {
          refreshControlLoader: true,
          showLoader: true
        } )
      } else if ( !healthLoading && ( cloudBackupStatus === CloudBackupStatus.COMPLETED || cloudBackupStatus === CloudBackupStatus.PENDING || cloudBackupStatus === CloudBackupStatus.FAILED ) ) {
        this.setState( {
          refreshControlLoader: false,
          showLoader: false
        } )
      }
    }

    if( prevProps.isLevelToNotSetupStatus != this.props.isLevelToNotSetupStatus && this.props.isLevelToNotSetupStatus ){
      this.setState( {
        showLoader: false
      } )
    }

    if( prevProps.levelHealth != this.props.levelHealth ){
      this.modifyLevelData( )
    }

    if ( JSON.stringify( prevProps.levelHealth ) !==
      JSON.stringify( this.props.levelHealth ) ) {


      if(
        ( levelHealth[ 2 ] && levelHealth[ 2 ].levelInfo[ 4 ].status == 'accessible' &&
        levelHealth[ 2 ].levelInfo[ 5 ].status == 'accessible' )
      ) {
        this.loaderBottomSheet.snapTo( 1 )
      }
      if (
        this.props.levelHealth.length > 0 &&
        this.props.levelHealth.length == 1 &&
        prevProps.levelHealth.length == 0 && cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS && this.props.cloudPermissionGranted === true
      ) {
        this.props.setCloudData( )
      } else if(
        ( levelHealth[ 1 ] && levelHealth[ 1 ].levelInfo[ 0 ].status == 'notAccessible' &&  levelHealth[ 1 ].levelInfo[ 2 ].status == 'accessible' && levelHealth[ 1 ].levelInfo[ 3 ].status == 'accessible' )
      ) {
        this.props.deletePrivateData()
      }
      else if(
        ( levelHealth[ 2 ] && levelHealth[ 2 ].levelInfo[ 0 ].status == 'notAccessible' &&  levelHealth[ 2 ].levelInfo[ 2 ].status == 'accessible' && levelHealth[ 2 ].levelInfo[ 3 ].status == 'accessible' &&
      levelHealth[ 2 ].levelInfo[ 4 ].status == 'accessible' &&
      levelHealth[ 2 ].levelInfo[ 5 ].status == 'accessible' )
      ) {
        this.updateCloudData()
      }
    }

    if( prevProps.levelHealth != this.props.levelHealth ){
      this.autoUploadShare()
      if (
        this.props.levelHealth.findIndex(
          ( value ) =>
            value.levelInfo.findIndex( ( item ) => item.shareType == 'contact' || item.shareType == 'device' ) >
            -1
        ) > -1
      ) {
        this.props.trustedChannelsSetupSync()
      }
    }

    if( this.props.s3Service.levelhealth.SMMetaSharesKeeper.length == 0 && levelHealth[ 1 ] && levelHealth[ 1 ].levelInfo[ 0 ].status == 'notAccessible' &&  levelHealth[ 1 ].levelInfo[ 2 ].status == 'accessible' && levelHealth[ 1 ].levelInfo[ 3 ].status == 'accessible' && this.props.cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ) {
      this.updateCloudData()
    }

    if( this.props.currentLevel == 3 ) {
      this.loaderBottomSheet.snapTo( 0 )
    }

    if (
      prevProps.initLoading !== this.props.initLoading && this.props.isSmMetaSharesCreatedFlag && this.props.metaSharesKeeper.length == 3
    ) {
      const obj = {
        id: 2,
        selectedKeeper: {
          shareType: 'device',
          name: 'Secondary Device1',
          reshareVersion: 0,
          status: 'notAccessible',
          updatedAt: 0,
          shareId: this.props.s3Service.levelhealth.metaSharesKeeper[ 1 ]
            .shareId,
          data: {
          },
        },
        isSetup: true,
      }
      this.setState( {
        selectedKeeper: obj.selectedKeeper,
      } )
      this.goToHistory( obj )
      this.loaderBottomSheet.snapTo( 0 )
    }
    if (
      JSON.stringify( prevProps.metaSharesKeeper ) !==
      JSON.stringify( this.props.metaSharesKeeper ) && this.props.isSmMetaSharesCreatedFlag && prevProps.metaSharesKeeper.length == 3 && this.props.metaSharesKeeper.length == 5
    ) {
      const obj = {
        id: 2,
        selectedKeeper: {
          shareType: this.state.selectedKeeperType,
          name: this.state.selectedKeeperName,
          reshareVersion: 0,
          status: 'notAccessible',
          updatedAt: 0,
          shareId: this.props.s3Service.levelhealth.metaSharesKeeper[ 3 ]
            .shareId,
          data: {
          },
        },
        isSetup: true,
      }
      this.setState( {
        selectedKeeper: obj.selectedKeeper,
      } )
      this.sendApprovalRequestToPK( )
    }

    if( prevProps.keeperProcessStatusFlag != this.props.keeperProcessStatusFlag && this.props.keeperProcessStatusFlag == KeeperProcessStatus.COMPLETED ) {
      this.props.updateKeeperInfoToTrustedChannel()
      this.props.keeperProcessStatus( '' )
    }

    if (
      ( prevProps.secondaryShareDownloadedStatus !== this.props.secondaryShareDownloadedStatus ||
      prevProps.downloadSmShare !==
      this.props.downloadSmShare ) && !this.props.downloadSmShare && this.props.secondaryShareDownloadedStatus
    ) {
      ( this.ApprovePrimaryKeeperBottomSheet as any ).snapTo( 1 );
      ( this.QrBottomSheet as any ).snapTo( 0 )
    }

    if( prevProps.status !== this.props.status && this.props.status === LevelStatus.FAILED ){
      this.setState( {
        errorTitle: this.props.errorTitle,
        errorInfo: this.props.errorInfo,
        showLoader: false
      } )
      this.props.setLevelCompletionError( null, null, LevelStatus.PENDING );
      ( this.ErrorBottomSheet as any ).snapTo( 1 )
    }

    if( prevProps.navigationObj !== this.props.navigationObj ){
      this.goToHistory( this.props.navigationObj )
    }

    if( prevProps.isTypeBottomSheetOpen !== this.props.isTypeBottomSheetOpen && this.props.isTypeBottomSheetOpen === true ){
      this.setState( {
        showLoader: false
      } )
      this.props.setIsKeeperTypeBottomSheetOpen( false );
      ( this.keeperTypeBottomSheet as any ).snapTo( 1 )
    }


  };

  updateCloudData = () => {
    if( this.props.cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) return
    // if( this.props.cloudPermissionGranted === false ) return
    const { currentLevel, keeperInfo, levelHealth, s3Service } = this.props
    let secretShare = {
    }
    if ( levelHealth.length > 0 ) {
      const levelInfo = getLevelInfo( levelHealth, currentLevel )

      if ( levelInfo ) {
        if (
          levelInfo[ 2 ] &&
          levelInfo[ 3 ] &&
          levelInfo[ 2 ].status == 'accessible' &&
          levelInfo[ 3 ].status == 'accessible'
        ) {
          for (
            let i = 0;
            i < s3Service.levelhealth.metaSharesKeeper.length;
            i++
          ) {
            const element = s3Service.levelhealth.metaSharesKeeper[ i ]

            if ( levelInfo[ 0 ].shareId == element.shareId ) {
              secretShare = element
              break
            }
          }
        }
      }
    }
    this.props.setCloudData(
      keeperInfo,
      currentLevel == 3 ? 3 : currentLevel + 1,
      secretShare
    )
  };

  autoUploadShare = () => {
    const {
      levelHealth,
      currentLevel,
      autoShareToLevel2Keepers
    } = this.props
    if (
      levelHealth[ 2 ] &&
      currentLevel == 2 &&
      levelHealth[ 2 ].levelInfo[ 4 ].status == 'accessible' &&
      levelHealth[ 2 ].levelInfo[ 5 ].status == 'accessible'
    ) {
      console.log( 'autoUploadShare levelHealth', levelHealth )
      autoShareToLevel2Keepers( [ ...levelHealth ] )
    }
  };

  goToHistory = ( value ) => {
    //console.log( 'VALUE', value )
    const { id, selectedKeeper, isSetup, isPrimaryKeeper, isChangeKeeperAllow } = value
    //console.log( 'selectedKeeper', selectedKeeper )

    this.setState( {
      showLoader: false
    } )
    const navigationParams = {
      selectedTime: selectedKeeper.updatedAt
        ? this.getTime( selectedKeeper.updatedAt )
        : 'never',
      selectedStatus: selectedKeeper.status,
      selectedTitle: selectedKeeper.name,
      selectedLevelId: id,
      selectedContact: selectedKeeper.data,
      selectedKeeper,
    }
    if ( selectedKeeper.shareType == 'device' ) {
      let index = 0
      let count = 0
      for ( let i = 0; i < this.state.levelData.length; i++ ) {
        const element = this.state.levelData[ i ]
        if ( element.keeper1.shareType == 'device' ) count++
        if ( element.keeper2.shareType == 'device' ) count++
      }
      if( selectedKeeper.data && ( selectedKeeper.data.index == 0 || selectedKeeper.data.index > 0 ) ){
        index = selectedKeeper.data.index
      }
      else if ( count == 0 && isSetup ) index = 0
      else if ( count == 1 && isSetup ) index = 3
      else if ( count == 2 && isSetup ) index = 4
      else {
        index = 0
      }
      console.log( 'device index', index );
      ( this.keeperTypeBottomSheet as any ).snapTo( 0 );
      ( this.QrBottomSheet as any ).snapTo( 0 );
      ( this.ApprovePrimaryKeeperBottomSheet as any ).snapTo( 0 )
      this.props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...navigationParams,
        isPrimaryKeeper,
        isChangeKeeperAllow,
        index,
      } )
    } else if ( selectedKeeper.shareType == 'contact' ) {
      console.log( 'inside selectedKeeper.shareType', selectedKeeper.shareType )
      let index = 1
      let count = 0
      for ( let i = 0; i < this.state.levelData.length; i++ ) {
        const element = this.state.levelData[ i ]
        if ( element.keeper1.shareType == 'contact' ) count++
        if ( element.keeper2.shareType == 'contact' ) count++
      }
      if ( count == 1 && isSetup ) index = 2
      else if ( count == 0 && isSetup ) index = 1
      else {
        index = selectedKeeper.data.index
      }
      console.log( 'contact index', index );
      ( this.keeperTypeBottomSheet as any ).snapTo( 0 );
      ( this.QrBottomSheet as any ).snapTo( 0 );
      ( this.ApprovePrimaryKeeperBottomSheet as any ).snapTo( 0 )
      this.props.navigation.navigate( 'TrustedContactHistoryNewBHR', {
        ...navigationParams,
        index,
        isChangeKeeperAllow
      } )
    } else if ( selectedKeeper.shareType == 'pdf' ) {
      ( this.keeperTypeBottomSheet as any ).snapTo( 0 );
      ( this.QrBottomSheet as any ).snapTo( 0 );
      ( this.ApprovePrimaryKeeperBottomSheet as any ).snapTo( 0 )
      this.props.navigation.navigate(
        'PersonalCopyHistoryNewBHR',
        navigationParams,
        isChangeKeeperAllow
      )
    }
  };

  onPressKeeperButton = ( value, number ) => {
    console.log( 'ONPress Keeper Button', value, number )
    this.props.onPressKeeper( value, number )
  };

  onRefresh = async () => {
    this.props.checkMSharesHealth()
    this.props.setHealthStatus()
  };

  closeErrorModal = () => {
    ( this.ErrorBottomSheet as any ).snapTo( 0 )
  };

  sendApprovalRequestToPK = ( ) => {
    this.setState( {
      QrBottomSheetsFlag: true
    } );
    ( this.QrBottomSheet as any ).snapTo( 1 );
    ( this.keeperTypeBottomSheet as any ).snapTo( 0 )
  };

  renderQrContent = () => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={false}
        QRModalHeader={'QR scanner'}
        title={'Note'}
        infoText={
          'Please approve this request by scanning the Secondary Key stored with any of the other backups'
        }
        modalRef={this.QrBottomSheet}
        isOpenedFlag={this.state.QrBottomSheetsFlag}
        onQrScan={async( qrScannedData ) => {
          this.props.downloadSmShareForApproval( qrScannedData )
          this.setState( {
            QrBottomSheetsFlag: false
          } )
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
        onPressHeader={() => {
          this.setState( {
            QrBottomSheetsFlag: false
          } );
          ( this.QrBottomSheet as any ).snapTo( 0 )
        }}
      />
    )
  }

  renderLoaderModalContent = () => {
    return (
      <LoaderModal
        headerText={'Generating your Recovery Keys'}
        messageText={'It may take a little while as the wallet creates Recovery Keys. Do not close the app or go back'}
        messageText2={''}
        showGif={false}
      />
    )
  }

  renderLoaderModalHeader = () => {
    return (
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
    )
  }

  renderKnowMoreModalContent = () => {
    return ( <MBNewBhrKnowMoreSheetContents
      type={this.state.knowMoreType}
      titleClicked={()=>{this.knowMoreBottomSheet.snapTo( 0 )}}
      containerStyle={{
        shadowOpacity: 0,
      }}
    /> )
  }

  renderKnowMoreModalHeader = () => {
    return (
      <ModalHeader
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          this.knowMoreBottomSheet.snapTo( 0 )
        }}
      />
    )
  }

  keeperButtonText = ( buttonText, number ) =>{
    console.log( 'buttonText', buttonText, number )
    if( !buttonText ) return 'Share Recovery Key ' + number
    switch ( buttonText ) {
        case 'Secondary Device1': return 'Personal Device1'
        case 'Secondary Device2': return 'Personal Device2'
        case 'Secondary Device3': return 'Personal Device3'
        case 'Keeper PDF': return 'PDF Backup'
        default:
          return buttonText
    }
  }

  render() {
    const {
      levelData,
      selectedId,
      isError,
      selectedLevelId,
      refreshControlLoader,
      selectedKeeper,
    } = this.state
    const { navigation, currentLevel, containerStyle } = this.props
    return (
      <View style={containerStyle}>
      {/* <View style={{
        flex: 1, backgroundColor: 'white'
      }}> */}
        <SafeAreaView style={{
          flex: 0
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          {/* <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center'
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
          </View> */}
          {/* <TouchableOpacity
            onPress={() => navigation.replace( 'Home' )}
            style={styles.headerSettingImageView}
          >
            <Image
              source={require( '../../assets/images/icons/setting.png' )}
              style={styles.headerSettingImage}
            />
          </TouchableOpacity> */}
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshControlLoader}
              onRefresh={() => this.onRefresh()}
            />
          }
          style={{
            flex: 1
          }}
        >
          <View style={ styles.topHealthView }>
            <View style={{
              justifyContent:'center', alignItems:'flex-end', width: wp( '35%' ),
            }}>
              <ImageBackground
                source={require( '../../assets/images/icons/keeper_sheild.png' )}
                style={{
                  ...styles.healthShieldImage, position: 'relative',
                }}
                resizeMode={'contain'}
              >
                {isError && (
                  <View
                    style={{
                      backgroundColor: Colors.red,
                      height: wp( '3%' ),
                      width: wp( '3%' ),
                      borderRadius: wp( '3%' ) / 2,
                      position: 'absolute',
                      top: wp( '5%' ),
                      right: 0,
                      borderWidth: 2,
                      borderColor: Colors.white,
                    }}
                  />
                )}
              </ImageBackground>
            </View>
            <View style={styles.headerSeparator} />
            {currentLevel ?
              <View style={{
                width: wp( '35%' )
              }}>
                <Text style={styles.backupText}>Wallet Security</Text>
                <Text style={styles.backupInfoText}>You are</Text>
                <Text style={styles.backupInfoText}>at Level {currentLevel ? currentLevel : ''}
                </Text>
              </View>:
              <View style={{
                width: wp( '35%' ),
              }}>
                <Text style={styles.backupText}>Wallet Security</Text>
                <Text style={styles.backupInfoText}>Complete Level 1</Text>
              </View>
            }
          </View>
          <View style={{
            justifyContent:'center',
            alignItems:'center',
            width: wp( '85%' ),
            marginLeft: 30,
            marginRight: 30
          }}>
            <Text style={{
              color: Colors.textColorGrey, fontSize: RFValue( 12 ), fontFamily: Fonts.FiraSansRegular, textAlign: 'center'
            }}>{currentLevel === 1 ? 'Cloud Backup complete, \nyou can upgrade the backup to Level 2' : currentLevel === 2 ? 'Double Backup complete, \nyou can upgrade the backup to Level 3' : currentLevel === 3 ? 'Multi-key Backup complete' : 'Cloud Backup incomplete, \nplease complete Level 1' }</Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              position: 'relative',
              paddingBottom: wp( '7%' ),
            }}
          >
            {levelData.map( ( value, index ) => {
              return (
                <TouchableOpacity key={index} onPress={() => this.selectId( value.id )}>
                  <View
                    style={{
                      borderRadius: 10,
                      marginTop: wp( '7%' ),
                      backgroundColor:
                        value.status == 'good' || value.status == 'bad'
                          ? Colors.blue
                          : Colors.backgroundColor,
                      shadowRadius:
                        selectedId && selectedId == value.id ? 10 : 0,
                      shadowColor: Colors.borderColor,
                      shadowOpacity:
                        selectedId && selectedId == value.id ? 10 : 0,
                      shadowOffset: {
                        width: 5, height: 5
                      },
                      elevation:
                        selectedId == value.id || selectedId == 0 ? 10 : 0,
                      opacity:
                        selectedId == value.id || selectedId == 0 ? 1 : 0.3,
                    }}
                  >
                    <View style={styles.cardView}>
                      <View style={{
                        flexDirection: 'row'
                      }}>
                        {value.status == 'good' || value.status == 'bad' ? (
                          <View
                            style={{
                              ...styles.cardHealthImageView,
                              elevation:
                                selectedId == value.id || selectedId == 0
                                  ? 10
                                  : 0,
                              backgroundColor:
                              value.status == 'good'
                                ? Colors.green
                                : Colors.red,
                            }}
                          >
                            {value.status == 'good' ? (
                              <Image
                                source={require( '../../assets/images/icons/check_white.png' )}
                                style={{
                                  ...styles.cardHealthImage,
                                  width: wp( '4%' ),
                                }}
                              />
                            ) : (
                              <Image
                                source={require( '../../assets/images/icons/icon_error_white.png' )}
                                style={styles.cardHealthImage}
                              />
                            )}
                          </View>
                        ) : (
                          <Image
                            source={require( '../../assets/images/icons/icon_setup.png' )}
                            style={{
                              borderRadius: wp( '7%' ) / 2,
                              width: wp( '7%' ),
                              height: wp( '7%' ),
                            }}
                          />
                        )}
                        <TouchableOpacity
                          onPress={()=>{
                            this.setState( {
                              knowMoreType: value.id == 1 ? 'level1' : value.id == 2 ? 'level2' : 'level3'
                            } )
                            this.knowMoreBottomSheet.snapTo( 1 )
                          }}
                          style={{
                            ...styles.cardButtonView,
                            backgroundColor:
                              value.status == 'notSetup'
                                ? Colors.white
                                : Colors.deepBlue,
                          }}
                        >
                          <Text
                            style={{
                              ...styles.cardButtonText,
                              color:
                                value.status == 'notSetup'
                                  ? Colors.textColorGrey
                                  : Colors.white,
                              width:'auto'
                            }}
                          >
                            Know More
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={{
                        flexDirection: 'row', marginTop: 'auto'
                      }}>
                        <View style={{
                          justifyContent: 'center'
                        }}>
                          <Text
                            style={{
                              ...styles.levelText,
                              color:
                                value.status == 'notSetup'
                                  ? Colors.textColorGrey
                                  : Colors.white,
                            }}
                          >
                            {value.levelName}
                          </Text>
                          <Text
                            style={{
                              ...styles.levelInfoText,
                              color:
                                value.status == 'notSetup'
                                  ? Colors.textColorGrey
                                  : Colors.white,
                              width: wp( '55%' )
                            }}
                          >
                            {value.info}
                          </Text>
                        </View>
                        <TouchableOpacity
                          activeOpacity={10}
                          onPress={() => this.selectId( value.id )}
                          style={styles.manageButton}
                        >
                          <Text
                            style={{
                              ...styles.manageButtonText,
                              color:
                                value.status == 'notSetup'
                                  ? Colors.black
                                  : Colors.white,
                            }}
                            onPress={() => this.selectId( value.id )}
                          >
                            {value.status == 'notSetup' ? 'Setup' : 'Manage'}
                          </Text>
                          <AntDesign
                            name={
                              selectedId && selectedId == value.id
                                ? 'arrowup'
                                : 'arrowright'
                            }
                            color={
                              value.status == 'notSetup'
                                ? Colors.black
                                : Colors.white
                            }
                            size={12}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {selectedId == value.id ? (
                      <View>
                        <View
                          style={{
                            backgroundColor: Colors.white, height: 0.5
                          }}
                        />
                        <View style={styles.cardView}>
                          <View style={{
                            width: wp( '70%' )
                          }}>
                            <Text
                              numberOfLines={2}
                              style={{
                                color:
                                  value.status == 'notSetup'
                                    ? Colors.textColorGrey
                                    : Colors.white,
                                fontFamily: Fonts.FiraSansRegular,
                                fontSize: RFValue( 10 ),
                              }}
                            >
                              {value.note}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: 'auto',
                              justifyContent: 'space-between'
                            }}
                          >
                            <MBKeeperButton
                              value={value}
                              keeper={value.keeper1}
                              onPressKeeper={ value.id == 1 ? () => {
                                if ( this.props.cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ) {
                                  navigation.navigate(
                                    'CloudBackupHistory',
                                    {
                                      selectedTime: selectedKeeper.updatedAt
                                        ? this.getTime( selectedKeeper.updatedAt )
                                        : 'never',
                                      selectedStatus: 'Ugly',
                                    }
                                  )
                                }
                              } : () => {
                                this.setState( {
                                  showLoader: true,
                                  selectedKeeper: value.keeper1
                                } )
                                requestAnimationFrame( () => {
                                  this.onPressKeeperButton( value, 1 )
                                  //this.props.onPressKeeper( value, 1 )
                                  // debounce( () => this.props.onPressKeeper( value, 1 ), 1000 )
                                } )
                              }}
                              keeperButtonText={value.id == 1 ? value.keeper1ButtonText : this.keeperButtonText( value.keeper1ButtonText, '1' )}
                              disabled={false}
                            />
                            <MBKeeperButton
                              value={value}
                              keeper={value.keeper2}
                              onPressKeeper={value.id == 1 ? () =>
                                navigation.navigate(
                                  'SecurityQuestionHistoryNewBHR',
                                  {
                                    selectedTime: selectedKeeper.updatedAt
                                      ? this.getTime( selectedKeeper.updatedAt )
                                      : 'never',
                                    selectedStatus: 'Ugly',
                                  }
                                ) : () => {
                                this.setState( {
                                  showLoader: true,
                                  selectedKeeper: value.keeper2
                                } )
                                requestAnimationFrame( () => {
                                  this.onPressKeeperButton( value, 2 )
                                } )
                              }}
                              keeperButtonText={value.id == 1 ? 'Security Question' : this.keeperButtonText( value.keeper2ButtonText, '2' )}
                              disabled={false}
                            />
                          </View>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              )
            } )}
          </View>
        </ScrollView>
        {this.state.showLoader ? <Loader isLoading={true}/> : null}
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={( c )=>this.keeperTypeBottomSheet = c}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '75%' )
              : hp( '75%' ),
          ]}
          renderContent={() => (
            <KeeperTypeModalContents
              headerText={'Backup Recovery Key'}
              subHeader={'You can save your Recovery Key with a person, on a device running Hexa or simply in a PDF document'}
              onPressSetup={async ( type, name ) => {
                this.setState( {
                  selectedKeeperType: type,
                  selectedKeeperName: name,
                } )
                if (
                  selectedLevelId == 3 &&
                  !this.props.isLevelThreeMetaShareCreated &&
                  !this.props.isLevel3Initialized &&
                  this.props.currentLevel == 2 &&
                  this.props.metaSharesKeeper.length != 5
                ) {
                  this.props.generateMetaShare( selectedLevelId )
                } else if( selectedLevelId == 3 ) {
                  this.sendApprovalRequestToPK( )
                } else {
                  const obj = {
                    id: selectedLevelId,
                    selectedKeeper: {
                      ...selectedKeeper,
                      name: selectedKeeper.name ? selectedKeeper.name : name,
                      shareType: selectedKeeper.shareType
                        ? selectedKeeper.shareType
                        : type,
                      shareId: selectedKeeper.shareId ? selectedKeeper.shareId : selectedLevelId == 2 ? this.props.metaSharesKeeper[ 1 ] ? this.props.metaSharesKeeper[ 1 ].shareId: '' : this.props.metaSharesKeeper[ 4 ] ? this.props.metaSharesKeeper[ 4 ].shareId : ''
                    },
                    isSetup: true,
                  }
                  console.log( 'obj', obj )
                  this.goToHistory( obj )
                  this.props.setIsKeeperTypeBottomSheetOpen( false );
                  /** other than ThirdLevel first position */
                  ( this.keeperTypeBottomSheet as any ).snapTo( 0 )
                }
              }}
              onPressBack={() =>{
                this.props.setIsKeeperTypeBottomSheetOpen( false );
                ( this.keeperTypeBottomSheet as any ).snapTo( 0 )
              }
              }
              selectedLevelId={selectedLevelId}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              onPressHeader={() =>{
                this.props.setIsKeeperTypeBottomSheetOpen( false );
                ( this.keeperTypeBottomSheet as any ).snapTo( 0 )}
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={( c ) => { this.ErrorBottomSheet = c }}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '30%' )
              : hp( '35%' ),
          ]}
          renderContent={()=><ErrorModalContents
            modalRef={this.ErrorBottomSheet as any}
            title={this.state.errorTitle}
            info={this.state.errorInfo}
            proceedButtonText={'Got it'}
            isIgnoreButton={false}
            onPressProceed={() => this.closeErrorModal()}
            isBottomImage={true}
            bottomImage={require( '../../assets/images/icons/errorImage.png' )}
          />}
          renderHeader={()=><ModalHeader onPressHeader={() => this.closeErrorModal()} />}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={( c )=>this.ApprovePrimaryKeeperBottomSheet=c}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '60%' ) : hp( '70' ),
          ]}
          renderContent={() => (
            <ApproveSetup
              isContinueDisabled={false}
              onPressContinue={() => {
                ( this.ApprovePrimaryKeeperBottomSheet as any ).snapTo( 0 )
                const {
                  selectedKeeper,
                  selectedLevelId,
                  selectedKeeperType,
                  selectedKeeperName,
                } = this.state
                const obj = {
                  id: selectedLevelId,
                  selectedKeeper: {
                    ...selectedKeeper, name: selectedKeeper.name?selectedKeeper.name:selectedKeeperName, shareType: selectedKeeper.shareType?selectedKeeper.shareType:selectedKeeperType,
                    shareId: selectedKeeper.shareId ? selectedKeeper.shareId : selectedLevelId == 2 ? this.props.metaSharesKeeper[ 1 ] ? this.props.metaSharesKeeper[ 1 ].shareId: '' : this.props.metaSharesKeeper[ 4 ] ? this.props.metaSharesKeeper[ 4 ].shareId : ''
                  },
                  isSetup: true,
                }
                this.goToHistory( obj )
              }}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              onPressHeader={() => {
                ( this.keeperTypeBottomSheet as any ).snapTo( 1 );
                ( this.ApprovePrimaryKeeperBottomSheet as any ).snapTo( 0 )
              }}
            />
          )}
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
          ref={( c )=>this.loaderBottomSheet = c}
          snapPoints={[ -50, hp( '100%' ) ]}
          renderContent={this.renderLoaderModalContent}
          renderHeader={this.renderLoaderModalHeader}
        />
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={( c )=>this.knowMoreBottomSheet = c}
          snapPoints={[ -50, hp( '95%' ) ]}
          renderContent={this.renderKnowMoreModalContent}
          renderHeader={this.renderKnowMoreModalHeader}
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
    metaSharesKeeper: idx(
      state,
      ( _ ) => _.health.service.levelhealth.metaSharesKeeper
    ),
    s3Service: idx( state, ( _ ) => _.health.service ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
    cloudBackupStatus:
      idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    regularAccount: idx( state, ( _ ) => _.accounts[ REGULAR_ACCOUNT ].service ),
    database: idx( state, ( _ ) => _.storage.database ) || {
    },
    levelHealth: idx( state, ( _ ) => _.health.levelHealth ),
    currentLevel: idx( state, ( _ ) => _.health.currentLevel ),
    isLevelTwoMetaShareCreated: idx(
      state,
      ( _ ) => _.health.isLevelTwoMetaShareCreated
    ),
    isLevel2Initialized: idx( state, ( _ ) => _.health.isLevel2Initialized ),
    isLevel3Initialized: idx( state, ( _ ) => _.health.isLevel3Initialized ),
    isLevelThreeMetaShareCreated: idx(
      state,
      ( _ ) => _.health.isLevelThreeMetaShareCreated
    ),
    healthLoading: idx( state, ( _ ) => _.health.loading.checkMSharesHealth ),
    keeperSetupStatus: idx( state, ( _ ) => _.health.loading.keeperSetupStatus ),
    initLoading: idx( state, ( _ ) => _.health.loading.initLoader ),

    keeperInfo: idx( state, ( _ ) => _.health.keeperInfo ),
    service: idx( state, ( _ ) => _.keeper.service ),
    secureAccount: idx( state, ( _ ) => _.accounts[ SECURE_ACCOUNT ].service ),
    keeperApproveStatus: idx( state, ( _ ) => _.health.keeperApproveStatus ),
    trustedChannelsSetupSyncing: idx(
      state,
      ( _ ) => _.trustedContacts.loading.trustedChannelsSetupSync
    ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    activePersonalNode: idx( state, ( _ ) => _.nodeSettings.activePersonalNode ),
    versionHistory: idx( state, ( _ ) => _.versionHistory.versions ),
    isNewFCMUpdated: idx( state, ( _ ) => _.keeper.isNewFCMUpdated ),
    isSmMetaSharesCreatedFlag: idx( state, ( _ ) => _.health.isSmMetaSharesCreatedFlag ),
    downloadSmShare: idx( state, ( _ ) => _.health.loading.downloadSmShare ),
    secondaryShareDownloadedStatus: idx( state, ( _ ) => _.health.secondaryShareDownloaded ),
    cloudPermissionGranted: state.health.cloudPermissionGranted,
    keeperProcessStatusFlag:  idx( state, ( _ ) => _.health.keeperProcessStatus ),
    isLevelToNotSetupStatus: idx( state, ( _ ) => _.health.isLevelToNotSetupStatus ),
    status: idx( state, ( _ ) => _.newBHR.status ),
    errorTitle: idx( state, ( _ ) => _.newBHR.errorTitle ),
    navigationObj: idx( state, ( _ ) => _.newBHR.navigationObj ),
    errorInfo: idx( state, ( _ ) => _.newBHR.errorInfo ),
    isTypeBottomSheetOpen: idx( state, ( _ ) => _.newBHR.isTypeBottomSheetOpen ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    fetchEphemeralChannel,
    updateHealthForCloud,
    generateMetaShare,
    checkMSharesHealth,
    initLevelTwo,
    sendApprovalRequest,
    onApprovalStatusChange,
    fetchKeeperTrustedChannel,
    reShareWithSameKeeper,
    autoShareContact,
    trustedChannelsSetupSync,
    updateNewFcm,
    setCloudData,
    generateSMMetaShares,
    deletePrivateData,
    updateKeeperInfoToTrustedChannel,
    secondaryShareDownloaded,
    autoShareToLevel2Keepers,
    downloadSmShareForApproval,
    updateLevelData,
    keeperProcessStatus,
    setLevelToNotSetupStatus,
    setHealthStatus,
    onPressKeeper,
    setLevelCompletionError,
    setIsKeeperTypeBottomSheetOpen,
  } )( ManageBackupNewBHR )
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
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  headerSettingImageView: {
    height: wp( '10%' ),
    width: wp( '10&' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSettingImage: {
    height: wp( '6%' ),
    width: wp( '6%' ),
  },
  topHealthView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthShieldImage: {
    width: wp( '17%' ),
    height: wp( '25%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSeparator: {
    backgroundColor: Colors.seaBlue,
    width: 4,
    borderRadius: 5,
    height: wp( '17%' ),
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
  },
  backupText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 15 ),
  },
  backupInfoText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 18 ),
  },
  cardView: {
    height: wp( '35%' ),
    width: wp( '85%' ),
    padding: 15,
  },
  cardHealthImageView: {
    backgroundColor: Colors.red,
    shadowColor: Colors.deepBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0, height: 3
    },
    shadowRadius: 10,
    borderRadius: wp( '7%' ) / 2,
    width: wp( '7%' ),
    height: wp( '7%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHealthImage: {
    width: wp( '2%' ),
    height: wp( '4%' ),
    resizeMode: 'contain',
  },
  cardButtonView: {
    width: wp( '21%' ),
    height: wp( '8' ),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    borderRadius: 8,
  },
  cardButtonText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
    width: wp( '24%' ),
  },
  levelText: {
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  levelInfoText: {
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginTop: 'auto',
  },
  manageButtonText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
    marginRight: 5,
  },
} )
