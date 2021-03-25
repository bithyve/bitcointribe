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
  Platform,
  AsyncStorage,
} from 'react-native'
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
import { setIsBackupProcessing } from '../../store/actions/preferences'
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
  updateMSharesHealth,
  sendApprovalRequest,
  onApprovalStatusChange,
  reShareWithSameKeeper,
  autoShareContact,
  generateSMMetaShares,
  deleteSmSharesAndSM,
  updateKeeperInfoToTrustedChannel,
  secondaryShareDownloaded,
  autoShareToLevel2Keepers,
  downloadSmShareForApproval
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
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { setCloudData, updateHealthForCloud } from '../../store/actions/cloud'
import ApproveSetup from './ApproveSetup'
import QRModal from '../Accounts/QRModal'

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
}

interface ManageBackupNewBHRPropsTypes {
  navigation: any;
  updateHealthForCloud: any;
  setIsBackupProcessing: any;
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
  updateMSharesHealth: any;
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
  deleteSmSharesAndSM: any;
  updateKeeperInfoToTrustedChannel: any;
  secondaryShareDownloaded: any
  autoShareToLevel2Keepers: any;
  downloadSmShareForApproval: any;
  downloadSmShare: boolean;
  secondaryShareDownloadedStatus: any;
  cloudPermissionGranted: boolean;
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
          levelName: 'Automated Cloud Backup',
          status: 'notSetup',
          keeper1ButtonText: 'Add Backup',
          keeper2ButtonText: 'Security Question',
          keeper1: obj,
          keeper2: obj,
          note:'',
          info:'',
          id: 1,
        },
        {
          levelName: 'Double Backup',
          status: 'notSetup',
          keeper1ButtonText: 'Share Recovery Key (1)',
          keeper2ButtonText: 'Share Recovery Key (2)',
          keeper1: obj,
          keeper2: obj,
          note:'',
          info:'',
          id: 2,
        },
        {
          levelName: 'Multi Key Backup',
          status: 'notSetup',
          keeper1ButtonText: 'Share Recovery Key (1)',
          keeper2ButtonText: 'Share Recovery Key (2)',
          keeper1: obj,
          keeper2: obj,
          note:'',
          info:'',
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
    }
  }

  componentDidMount = async () => {
    await AsyncStorage.getItem( 'walletRecovered' ).then( ( recovered ) => {
      // updates the new FCM token to channels post recovery
      if ( recovered && !this.props.isNewFCMUpdated ) {
        this.props.updateNewFcm()
      }
    } )

    await this.onRefresh()
    this.modifyLevelData()
  };

  modifyLevelData = () => {
    const { levelHealth, currentLevel, keeperInfo } = this.props
    const levelHealthObject = [ ...levelHealth ]
    const levelData = modifyLevelStatus(
      this.state.levelData,
      levelHealthObject,
      currentLevel,
      keeperInfo
    )
    console.log( 'LEVELDATA', levelData )
    this.setState( {
      levelData: levelData.levelData,
      isError: levelData.isError,
    } )
    this.setSelectedCards()
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

  componentDidUpdate = ( prevProps, prevState ) => {
    const {
      healthLoading,
      cloudBackupStatus,
      keeperInfo,
      currentLevel,
      levelHealth
    } = this.props
    if (
      prevProps.healthLoading !== this.props.healthLoading ||
      prevProps.cloudBackupStatus !==
      this.props.cloudBackupStatus
    ) {
      if ( healthLoading || cloudBackupStatus===CloudBackupStatus.IN_PROGRESS ) {
        this.setState( {
          refreshControlLoader: true
        } )
      } else if ( !healthLoading && cloudBackupStatus===CloudBackupStatus.COMPLETED ) {
        this.setState( {
          refreshControlLoader: false
        } )
      }
    }

    // console.log( 'currentLevel', currentLevel )
    // console.log( 'this.props.cloudBackupStatus', this.props.cloudBackupStatus )
    if ( JSON.stringify( prevProps.levelHealth ) !==
      JSON.stringify( this.props.levelHealth ) ) {
      console.log( 'second condition' )
      this.modifyLevelData()
      if (
        this.props.levelHealth.length > 0 &&
        this.props.levelHealth.length == 1 &&
        prevProps.levelHealth.length == 0 && this.props.cloudBackupStatus === CloudBackupStatus.FAILED && this.props.cloudPermissionGranted === true
      ) {
        this.props.setCloudData( )
      } else if(
        ( levelHealth[ 1 ] && levelHealth[ 1 ].levelInfo[ 0 ].status == 'notAccessible' &&  levelHealth[ 1 ].levelInfo[ 2 ].status == 'accessible' && levelHealth[ 1 ].levelInfo[ 3 ].status == 'accessible' ) ||
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

    if( prevProps.currentLevel == 0 && prevProps.currentLevel != this.props.currentLevel && this.props.currentLevel == 1 ) {
      this.props.generateMetaShare( 2 )
    }

    if( prevProps.currentLevel != this.props.currentLevel && this.props.currentLevel == 2 ) {
      this.props.deleteSmSharesAndSM()
    }

    if (
      JSON.stringify( prevProps.metaSharesKeeper ) !==
      JSON.stringify( this.props.metaSharesKeeper ) && this.props.isSmMetaSharesCreatedFlag
    ) {
      if ( this.props.metaSharesKeeper.length == 3 ) {
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
      }
      if ( this.props.metaSharesKeeper.length == 5 ) {
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
    }

    if( JSON.stringify( prevProps.keeperInfo ) != JSON.stringify( keeperInfo ) ){
      this.props.updateKeeperInfoToTrustedChannel()
    }

    if (
      ( prevProps.secondaryShareDownloadedStatus !== this.props.secondaryShareDownloadedStatus ||
      prevProps.downloadSmShare !==
      this.props.downloadSmShare ) && !this.props.downloadSmShare && this.props.secondaryShareDownloadedStatus
    ) {
      ( this.ApprovePrimaryKeeperBottomSheet as any ).snapTo( 1 );
      ( this.QrBottomSheet as any ).snapTo( 0 )
    }
  };

  updateCloudData = () => {
    if( this.props.cloudBackupStatus === CloudBackupStatus.COMPLETED ) return
    if( this.props.cloudPermissionGranted === false ) return
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
      reShareWithSameKeeper,
      autoShareContact,
      autoShareToLevel2Keepers
    } = this.props
    if (
      levelHealth[ 2 ] &&
      currentLevel == 2 &&
      levelHealth[ 2 ].levelInfo[ 4 ].status == 'accessible' &&
      levelHealth[ 2 ].levelInfo[ 5 ].status == 'accessible'
    ) {
      const contactLevelInfo = []
      const pdfLevelInfo = []
      for ( let i = 2; i < levelHealth[ 2 ].levelInfo.length - 2; i++ ) {
        if (
          levelHealth[ 2 ].levelInfo[ i ].status != 'accessible' &&
            levelHealth[ 1 ].levelInfo[ i ].shareType == 'pdf'
        ) {
          const obj = {
            ...levelHealth[ 1 ].levelInfo[ i ],
            newShareId: levelHealth[ 2 ].levelInfo[ i ].shareId,
            index: i,
          }
          pdfLevelInfo.push( obj )
        }
        if (
          levelHealth[ 2 ].levelInfo[ i ].status != 'accessible' &&
          ( levelHealth[ 1 ].levelInfo[ i ].shareType == 'contact' || levelHealth[ 1 ].levelInfo[ i ].shareType == 'device' )
        ) {
          const obj = {
            ...levelHealth[ 1 ].levelInfo[ i ],
            newShareId: levelHealth[ 2 ].levelInfo[ i ].shareId,
            index: i,
          }
          contactLevelInfo.push( obj )
        }
      }
      console.log( '**** contactLevelInfo', contactLevelInfo )
      console.log( '**** pdfLevelInfo', pdfLevelInfo )
      if ( contactLevelInfo.length || pdfLevelInfo.length ) autoShareToLevel2Keepers( contactLevelInfo, pdfLevelInfo )
    }
  };

  goToHistory = ( value ) => {
    const { id, selectedKeeper, isSetup } = value
    console.log( 'VALUE', value )
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
      if ( count == 0 && isSetup ) index = 0
      else if ( count == 1 && isSetup ) index = 3
      else if ( count == 2 && isSetup ) index = 4
      else {
        index = selectedKeeper.data.index
      }
      console.log( 'device index', index )
      this.props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...navigationParams,
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
      console.log( 'contact index', index )
      this.props.navigation.navigate( 'TrustedContactHistoryNewBHR', {
        ...navigationParams,
        index,
      } )
    } else if ( selectedKeeper.shareType == 'pdf' ) {
      this.props.navigation.navigate(
        'PersonalCopyHistoryNewBHR',
        navigationParams
      )
    }
    ( this.keeperTypeBottomSheet as any ).snapTo( 0 );
    ( this.QrBottomSheet as any ).snapTo( 0 );
    ( this.ApprovePrimaryKeeperBottomSheet as any ).snapTo( 0 )
  };

  onPressKeeper = ( value, number ) => {
    const {
      currentLevel,
      isLevelThreeMetaShareCreated,
      isLevel3Initialized,
      isLevelTwoMetaShareCreated,
      isLevel2Initialized,
      secureAccount,
    } = this.props
    if (
      currentLevel == 1 &&
      value.id == 3 &&
      !isLevelThreeMetaShareCreated &&
      !isLevel3Initialized
    ) {
      this.setState( {
        errorTitle: 'Please first complete Level 2',
        errorInfo:
          'Please check if you have completed above levels first and try to complete levels',
      } );
      ( this.ErrorBottomSheet as any ).snapTo( 1 )
      return
    } else if (
      currentLevel == 1 &&
      number == 2 &&
      value.id == 2 &&
      !isLevelTwoMetaShareCreated &&
      !isLevel2Initialized
    ) {
      this.setState( {
        errorTitle: 'Please first complete Primary Keeper Setup',
        errorInfo:
          'Please check if you have completed Primary Keeper Setup first and try to complete Primary Keeper Setup',
      } );
      ( this.ErrorBottomSheet as any ).snapTo( 1 )
      return
    } else if (
      currentLevel == 1 &&
      number == 2 &&
      value.id == 2 &&
      !secureAccount.secureHDWallet.xpubs.secondary &&
      !secureAccount.secureHDWallet.xpubs.bh
    ) {
      this.setState( {
        errorTitle: 'Please make sure Primary Keeper setup completed.',
        errorInfo:
          'Please check if you have completed Primary Keeper Setup and check notifications for xPubs.',
      } );
      ( this.ErrorBottomSheet as any ).snapTo( 1 )
      return
    } else {
      this.setState( {
        errorTitle: '', errorInfo: ''
      } )
    }
    const keeper = number == 1 ? value.keeper1 : value.keeper2
    this.setState( {
      selectedKeeper: keeper,
      selectedLevelId: value.id,
    } )

    const obj = {
      id: value.id,
      selectedKeeper: {
        ...keeper,
        name: value.id === 2 && number == 1 ? 'Secondary Device1' : keeper.name,
        shareType: value.id === 2 && number == 1 ? 'device' : keeper.shareType,
      },
      isSetup: keeper.updatedAt ? false : true,
    }
    if ( keeper.updatedAt > 0 ) {
      this.goToHistory( obj )
      return
    } else {
      if ( value.id === 2 && number == 1 ) {
        if ( this.props.currentLevel == 1 ) {
          if (
            !this.props.isLevel2Initialized &&
            !this.props.isLevelTwoMetaShareCreated &&
            value.id == 2
          ) {
            this.props.generateMetaShare( value.id )
          } else {
            this.goToHistory( obj )
          }
          if( !this.props.isSmMetaSharesCreatedFlag ){
            this.props.generateSMMetaShares()
          }
        } else {
          this.setState( {
            errorTitle: 'Please first complete Level 1',
            errorInfo:
              'Please check if you have completed Level 1 first and try to complete Level 1.',
          } );
          ( this.ErrorBottomSheet as any ).snapTo( 1 )
        }
      } else ( this.keeperTypeBottomSheet as any ).snapTo( 1 )
    }
  };

  onRefresh = async () => {
    this.props.checkMSharesHealth()
  };

  getImageIcon = ( chosenContact ) => {
    if ( chosenContact && chosenContact.name ) {
      if ( chosenContact.imageAvailable ) {
        return (
          <View style={styles.imageBackground}>
            <Image
              source={{
                uri: chosenContact.image.uri
              }}
              style={styles.contactImage}
            />
          </View>
        )
      } else {
        return (
          <View style={styles.imageBackground}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: RFValue( 9 ),
              }}
            >
              {chosenContact &&
              chosenContact.firstName === 'F&F request' &&
              chosenContact.contactsWalletName !== undefined &&
              chosenContact.contactsWalletName !== ''
                ? nameToInitials( `${chosenContact.contactsWalletName}'s wallet` )
                : chosenContact && chosenContact.name
                  ? nameToInitials(
                    chosenContact &&
                      chosenContact.firstName &&
                      chosenContact.lastName
                      ? chosenContact.firstName + ' ' + chosenContact.lastName
                      : chosenContact.firstName && !chosenContact.lastName
                        ? chosenContact.firstName
                        : !chosenContact.firstName && chosenContact.lastName
                          ? chosenContact.lastName
                          : ''
                  )
                  : ''}
            </Text>
          </View>
        )
      }
    }
    return (
      <Image
        style={styles.contactImageAvatar}
        source={require( '../../assets/images/icons/icon_user.png' )}
      />
    )
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
        isFromKeeperDeviceHistory={true}
        QRModalHeader={'QR scanner'}
        title={'Note'}
        infoText={
          'Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diam nonumy eirmod'
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
          const qrScannedData = '{"requester":"Erf","publicKey":"0nhtodKPJRk4wRayEenxWuwq","uploadedAt":1616687078230,"type":"ReverseRecoveryQR","ver":"1.5.0"}'
          try {
            if ( qrScannedData ) {
              this.props.downloadSmShareForApproval( qrScannedData )
              this.setState( {
                QrBottomSheetsFlag: false
              } )
            }
          } catch ( err ) {
            console.log( {
              err
            } )
          }
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

  render() {
    const {
      levelData,
      selectedId,
      isError,
      selectedLevelId,
      selectedKeeperType,
      refreshControlLoader,
      selectedKeeper,
    } = this.state
    const { navigation, keeperApproveStatus, currentLevel } = this.props
    return (
      <View style={{
        flex: 1, backgroundColor: 'white'
      }}>
        <SafeAreaView style={{
          flex: 0
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{
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
          </View>
          <TouchableOpacity
            onPress={() => navigation.replace( 'Home' )}
            style={styles.headerSettingImageView}
          >
            <Image
              source={require( '../../assets/images/icons/setting.png' )}
              style={styles.headerSettingImage}
            />
          </TouchableOpacity>
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
            <ImageBackground
              source={require( '../../assets/images/icons/keeper_sheild.png' )}
              style={{
                ...styles.healthShieldImage, position: 'relative'
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
            <View style={styles.headerSeparator} />
            <View style={{
              width: wp( '30%' )
            }}>
              <Text style={styles.backupText}>Backup</Text>
              <Text style={styles.backupInfoText}>{currentLevel == 1 ? 'Cloud Backup Complete' : currentLevel == 2 ? 'Double Backup Complete' : currentLevel == 3 ? 'Multi Key Backup Complete' : ''}</Text>
            </View>
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
                            width: wp( '55%' )
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
                          {value.id == 1 ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                marginTop: 'auto',
                              }}
                            >
                              <TouchableOpacity
                                style={{
                                  ...styles.appBackupButton,
                                  borderColor:
                                    value.keeper1.status == 'accessible'
                                      ? Colors.deepBlue
                                      : Colors.red,
                                  borderWidth:
                                    value.keeper1.status == 'accessible'
                                      ? 0
                                      : 1,
                                  paddingLeft: wp( '3%' ),
                                  paddingRight: wp( '3%' ),
                                  overflow:'hidden'
                                }}
                                disabled={this.props.cloudBackupStatus===CloudBackupStatus.COMPLETED}
                                onPress={() => {
                                  console.log(
                                    'this.props.cloudBackupStatus',
                                    this.props.cloudBackupStatus, typeof this.props.cloudBackupStatus
                                  )
                                  if ( this.props.cloudBackupStatus === CloudBackupStatus.FAILED ) {
                                    this.updateCloudData()
                                  }
                                }}
                              >
                                <Image
                                  source={require( '../../assets/images/icons/reset.png' )}
                                  style={styles.resetImage}
                                />
                                <Text
                                  style={{
                                    ...styles.cardButtonText,
                                    fontSize: RFValue( 11 ),
                                    marginLeft: wp( '2%' ),
                                  }}
                                  numberOfLines={1}
                                >
                                  {value.keeper1.status == 'accessible'
                                    ? 'Data Backed-Up'
                                    : 'Add Backup'}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{
                                  ...styles.appBackupButton,
                                  borderColor:
                                    value.keeper2.status == 'accessible'
                                      ? value.status == 'notSetup'
                                        ? Colors.white
                                        : Colors.deepBlue
                                      : Colors.red,
                                  borderWidth:
                                    value.keeper2.status == 'accessible'
                                      ? 0
                                      : 0.5,
                                  marginLeft: 'auto',
                                  paddingLeft: wp( '3%' ),
                                  paddingRight: wp( '3%' ),
                                  overflow: 'hidden'
                                }}
                                onPress={() =>
                                  navigation.navigate(
                                    'SecurityQuestionHistoryNewBHR',
                                    {
                                      selectedTime: this.getTime( new Date() ),
                                      selectedStatus: 'Ugly',
                                    }
                                  )
                                }
                              >
                                <ImageBackground
                                  source={require( '../../assets/images/icons/questionMark.png' )}
                                  style={{
                                    ...styles.resetImage,
                                    position: 'relative',
                                  }}
                                >
                                  {value.keeper2.status == 'notAccessible' ? (
                                    <View
                                      style={{
                                        backgroundColor: Colors.red,
                                        width: wp( '1%' ),
                                        height: wp( '1%' ),
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        borderRadius: wp( '1%' ) / 2,
                                      }}
                                    />
                                  ) : null}
                                </ImageBackground>
                                <Text
                                  style={{
                                    ...styles.cardButtonText,
                                    fontSize: RFValue( 11 ),
                                    marginLeft: wp( '2%' ),
                                  }}
                                  numberOfLines={1}
                                >
                                  Security Question
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View
                              style={{
                                flexDirection: 'row',
                                marginTop: 'auto',
                                justifyContent: 'space-between'
                              }}
                            >
                              <TouchableOpacity
                                style={{
                                  ...styles.appBackupButton,
                                  backgroundColor:
                                    value.status == 'notSetup'
                                      ? Colors.white
                                      : Colors.deepBlue,
                                  paddingLeft: wp( '3%' ),
                                  paddingRight: wp( '3%' ),
                                  borderColor:
                                    value.keeper1.status == 'accessible'
                                      ? value.status == 'notSetup'
                                        ? Colors.white
                                        : Colors.deepBlue
                                      : Colors.red,
                                  borderWidth:
                                    value.keeper1.status == 'accessible'
                                      ? 0
                                      : 1,
                                  overflow:'hidden'
                                }}
                                onPress={() => this.onPressKeeper( value, 1 )}
                              >
                                {value.keeper1.status == 'accessible' &&
                                ( value.keeper1.shareType == 'device' ) ? (
                                    <Image
                                      source={
                                        value.keeper1.shareType == 'device'
                                          ? require( '../../assets/images/icons/icon_ipad_blue.png' )
                                          : require( '../../assets/images/icons/pexels-photo.png' )
                                      }
                                      style={{
                                        width: wp( '6%' ),
                                        height: wp( '6%' ),
                                        resizeMode: 'contain',
                                        borderRadius: wp( '6%' ) / 2,
                                      }}
                                    />
                                  ) : value.keeper1.shareType == 'contact' &&
                                  value.keeper1.updatedAt != 0 ? (
                                      this.getImageIcon( value.keeper1.data )
                                    ) : value.keeper1.shareType == 'pdf' &&
                                  value.keeper1.status == 'accessible' ? (
                                        <Image
                                          source={require( '../../assets/images/icons/doc.png' )}
                                          style={{
                                            width: wp( '5%' ),
                                            height: wp( '6%' ),
                                            resizeMode: 'contain',
                                          }}
                                        />
                                      ) : (
                                        <View
                                          style={{
                                            backgroundColor: Colors.red,
                                            width: wp( '2%' ),
                                            height: wp( '2%' ),
                                            borderRadius: wp( '2%' ) / 2,
                                          }}
                                        />
                                      )}
                                <Text
                                  style={{
                                    ...styles.cardButtonText,
                                    color:
                                      value.status == 'notSetup'
                                        ? Colors.textColorGrey
                                        : Colors.white,
                                    fontSize: RFValue( 11 ),
                                    marginLeft: wp( '3%' ),
                                  } }
                                  numberOfLines={1}
                                >
                                  {value.keeper1ButtonText ? value.keeper1ButtonText : 'Share Recovery Key (1)'}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{
                                  ...styles.appBackupButton,
                                  backgroundColor:
                                    value.status == 'notSetup'
                                      ? Colors.white
                                      : Colors.deepBlue,
                                  paddingLeft: wp( '3%' ),
                                  paddingRight: wp( '3%' ),
                                  borderColor:
                                    value.keeper2.status == 'accessible'
                                      ? value.status == 'notSetup'
                                        ? Colors.white
                                        : Colors.deepBlue
                                      : Colors.red,
                                  borderWidth:
                                    value.keeper2.status == 'accessible'
                                      ? 0
                                      : 0.5,
                                  marginLeft: wp( '4%' ),
                                  overflow:'hidden'
                                }}
                                onPress={() => this.onPressKeeper( value, 2 )}
                              >
                                {value.keeper2.status == 'accessible' &&
                                ( value.keeper2.shareType == 'device' ) ? (
                                    <Image
                                      source={
                                        value.keeper2.shareType == 'device'
                                          ? require( '../../assets/images/icons/icon_ipad_blue.png' )
                                          : require( '../../assets/images/icons/pexels-photo.png' )
                                      }
                                      style={{
                                        width: wp( '6%' ),
                                        height: wp( '6%' ),
                                        resizeMode: 'contain',
                                        borderRadius: wp( '6%' ) / 2,
                                      }}
                                    />
                                  ) : value.keeper2.shareType == 'contact' &&
                                  value.keeper2.updatedAt != 0 ? (
                                      this.getImageIcon( value.keeper2.data )
                                    ) : value.keeper2.shareType == 'pdf' &&
                                  value.keeper2.status == 'accessible' ? (
                                        <Image
                                          source={require( '../../assets/images/icons/doc.png' )}
                                          style={{
                                            width: wp( '5%' ),
                                            height: wp( '6%' ),
                                            resizeMode: 'contain',
                                          }}
                                        />
                                      ) : (
                                        <View
                                          style={{
                                            backgroundColor: Colors.red,
                                            width: wp( '2%' ),
                                            height: wp( '2%' ),
                                            borderRadius: wp( '2%' ) / 2,
                                          }}
                                        />
                                      )}
                                <Text
                                  style={{
                                    ...styles.cardButtonText,
                                    fontSize: RFValue( 11 ),
                                    color:
                                      value.status == 'notSetup'
                                        ? Colors.textColorGrey
                                        : Colors.white,
                                    marginLeft: wp( '3%' ),
                                    marginRight: wp( '1%' ),
                                  }}
                                  numberOfLines={1}
                                >
                                  {value.keeper2ButtonText ? value.keeper2ButtonText :'Share Recovery Key (2)'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              )
            } )}
          </View>
        </ScrollView>
        <BottomSheet
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
                  this.props.currentLevel == 2
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
                    },
                    isSetup: true,
                  }
                  console.log( 'obj', obj )
                  this.goToHistory( obj );
                  /** other than ThirdLevel first position */
                  ( this.keeperTypeBottomSheet as any ).snapTo( 0 )
                }
              }}
              onPressBack={() =>
                ( this.keeperTypeBottomSheet as any ).snapTo( 0 )
              }
              selectedLevelId={selectedLevelId}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              onPressHeader={() =>
                ( this.keeperTypeBottomSheet as any ).snapTo( 0 )
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
                    ...selectedKeeper, name: selectedKeeper.name?selectedKeeper.name:selectedKeeperName, shareType: selectedKeeper.shareType?selectedKeeper.shareType:selectedKeeperType
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
            } );
            ( this.QrBottomSheet as any ).snapTo( 0 )
          }}
          onCloseStart={() => {}}
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
      idx( state, ( _ ) => _.preferences.cloudBackupStatus ) || CloudBackupStatus.PENDING,
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

  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    fetchEphemeralChannel,
    updateHealthForCloud,
    generateMetaShare,
    checkMSharesHealth,
    initLevelTwo,
    updateMSharesHealth,
    setIsBackupProcessing,
    sendApprovalRequest,
    onApprovalStatusChange,
    fetchKeeperTrustedChannel,
    reShareWithSameKeeper,
    autoShareContact,
    trustedChannelsSetupSync,
    updateNewFcm,
    setCloudData,
    generateSMMetaShares,
    deleteSmSharesAndSM,
    updateKeeperInfoToTrustedChannel,
    secondaryShareDownloaded,
    autoShareToLevel2Keepers,
    downloadSmShareForApproval
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
    width: wp( '22%' ),
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
  appBackupButton: {
    flexDirection: 'row',
    backgroundColor: Colors.deepBlue,
    alignItems: 'center',
    borderRadius: 8,
    width: wp( '37%' ),
    height: wp( '11%' ),
  },
  resetImage: {
    width: wp( '4%' ),
    height: wp( '4%' ),
    resizeMode: 'contain',
  },
  contactImageAvatar: {
    width: wp( '6%' ),
    height: wp( '6%' ),
    alignSelf: 'center',
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0, height: 3
    },
    shadowRadius: 5,
  },
  contactImage: {
    height: wp( '6%' ),
    width: wp( '6%' ),
    borderRadius: wp( '6%' ) / 2,
  },
  imageBackground: {
    backgroundColor: Colors.shadowBlue,
    height: wp( '6%' ),
    width: wp( '6%' ),
    borderRadius: wp( '6%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 1,
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0, height: 3
    },
    shadowRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
} )
