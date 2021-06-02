import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
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
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import { withNavigationFocus } from 'react-navigation'
import { connect } from 'react-redux'
import { fetchEphemeralChannel, PermanentChannelsSyncKind } from '../../store/actions/trustedContacts'
import idx from 'idx'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { syncPermanentChannels } from '../../store/actions/trustedContacts'
import {
  generateMetaShare,
  checkMSharesHealth,
  initLevelTwo,
  deletePrivateData,
  updateKeeperInfoToTrustedChannel,
  secondaryShareDownloaded,
  autoShareToLevel2Keepers,
  downloadSmShareForApproval,
  updateLevelData,
  keeperProcessStatus,
  setLevelToNotSetupStatus,
  setHealthStatus,
  modifyLevelData,
  createChannelAssets
} from '../../store/actions/health'
import {
  LevelData,
  LevelHealthInterface,
  MetaShare,
} from '../../bitcoin/utilities/Interface'
import S3Service from '../../bitcoin/services/sss/S3Service'
import ModalHeader from '../../components/ModalHeader'
import ErrorModalContents from '../../components/ErrorModalContents'
import { setCloudData, updateCloudData } from '../../store/actions/cloud'
import ApproveSetup from './ApproveSetup'
import QRModal from '../Accounts/QRModal'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import LoaderModal from '../../components/LoaderModal'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import Loader from '../../components/loader'
import MBNewBhrKnowMoreSheetContents from '../../components/know-more-sheets/MBNewBhrKnowMoreSheetContents'
import debounce from 'lodash.debounce'
import { onPressKeeper, setLevelCompletionError, setIsKeeperTypeBottomSheetOpen } from '../../store/actions/newBHR'
import LevelStatus from '../../common/data/enums/LevelStatus'
import ManageBackupCard from './ManageBackupCard'

interface ManageBackupNewBHRStateTypes {
  selectedId: any;
  selectedKeeper: {
    shareType: string;
    updatedAt: number;
    status: string;
    shareId: string;
    reshareVersion: number;
    name: string;
    data: any;
    channelKey?: string;
  };
  selectedLevelId: number;
  selectedKeeperType: string;
  selectedKeeperName: string;
  errorTitle: string;
  errorInfo: string;
  refreshControlLoader: boolean;
  QrBottomSheetsFlag: boolean;
  showLoader: boolean;
  knowMoreType: string;
}

interface ManageBackupNewBHRPropsTypes {
  navigation: any;
  cloudBackupStatus: CloudBackupStatus;
  levelHealth: LevelHealthInterface[];
  currentLevel: any;
  healthLoading: any;
  generateMetaShare: any;
  checkMSharesHealth: any;
  isLevel3Initialized: Boolean;
  initLevelTwo: any;
  s3Service: S3Service;
  keeperInfo: any[];
  service: any;
  isLevelThreeMetaShareCreated: Boolean;
  metaSharesKeeper: MetaShare[];
  syncPermanentChannels: any;
  isNewFCMUpdated: Boolean;
  setCloudData: any;
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
  updateCloudData: any;
  levelData: LevelData[]
  shieldHealth: boolean;
  modifyLevelData: any;
  modifyLevelDataStatus: boolean;
  createChannelAssets: any
}

class ManageBackupNewBHR extends Component<
  ManageBackupNewBHRPropsTypes,
  ManageBackupNewBHRStateTypes
> {
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
      channelKey: ''
    }
    this.state = {
      selectedKeeper: obj,
      selectedId: 0,
      selectedLevelId: 0,
      selectedKeeperType: '',
      selectedKeeperName: '',
      errorTitle: '',
      errorInfo: '',
      refreshControlLoader: false,
      QrBottomSheetsFlag: false,
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
        this.props.modifyLevelData()
      } else {
        await this.onRefresh()
        this.props.modifyLevelData()
      }
    } )
  };

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

    if( prevProps.levelHealth != this.props.levelHealth ) {
      this.props.modifyLevelData( )
    }

    if ( JSON.stringify( prevProps.levelHealth ) !==
      JSON.stringify( this.props.levelHealth ) ) {
      if(
        ( levelHealth[ 2 ] && levelHealth[ 2 ].levelInfo[ 4 ].updatedAt > 0 &&
        levelHealth[ 2 ].levelInfo[ 5 ].updatedAt > 0 )
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
        ( levelHealth[ 1 ] && levelHealth[ 1 ].levelInfo[ 0 ].updatedAt == 0 &&
          levelHealth[ 1 ].levelInfo[ 2 ].updatedAt > 0 &&
          levelHealth[ 1 ].levelInfo[ 3 ].updatedAt > 0 )
      ) {
        this.props.deletePrivateData()
      }
      else if(
        ( levelHealth[ 2 ] && levelHealth[ 2 ].levelInfo[ 0 ].updatedAt == 0 &&  levelHealth[ 2 ].levelInfo[ 2 ].updatedAt > 0 &&
        levelHealth[ 2 ].levelInfo[ 3 ].updatedAt > 0 &&
        levelHealth[ 2 ].levelInfo[ 4 ].updatedAt > 0 &&
        levelHealth[ 2 ].levelInfo[ 5 ].updatedAt > 0 )
      ) {
        this.props.updateCloudData()
      }
    }

    if( this.props.s3Service.levelhealth.SMMetaSharesKeeper.length == 0 && levelHealth[ 1 ] && levelHealth[ 1 ].levelInfo[ 0 ].updatedAt == 0 &&  levelHealth[ 1 ].levelInfo[ 2 ].updatedAt > 0 && levelHealth[ 1 ].levelInfo[ 3 ].updatedAt > 0 && this.props.cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ) {
      this.props.updateCloudData()
    }

    if( this.props.currentLevel == 3 ) {
      this.loaderBottomSheet.snapTo( 0 )
    }

    if (
      prevProps.initLoading !== this.props.initLoading && this.props.metaSharesKeeper.length == 3
    ) {
      const obj = {
        id: 2,
        selectedKeeper: {
          shareType: '',
          name: '',
          reshareVersion: 0,
          status: 'notSetup',
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
        showLoader: false,
        selectedLevelId: 2
      } )
      this.props.setIsKeeperTypeBottomSheetOpen( false );
      ( this.keeperTypeBottomSheet as any ).snapTo( 1 )
      // this.goToHistory( obj )
      // this.loaderBottomSheet.snapTo( 0 )
    }
    if (
      JSON.stringify( prevProps.metaSharesKeeper ) !==
      JSON.stringify( this.props.metaSharesKeeper ) && prevProps.metaSharesKeeper.length == 3 && this.props.metaSharesKeeper.length == 5
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
      console.log( 'prevProps.navigationObj' )
      this.setState( {
        selectedKeeper: this.props.navigationObj.selectedKeeper, selectedLevelId: this.props.navigationObj.id
      } );
      ( this.keeperTypeBottomSheet as any ).snapTo( 1 )
      this.goToHistory( this.props.navigationObj )
    }

    if( prevProps.isTypeBottomSheetOpen !== this.props.isTypeBottomSheetOpen && this.props.isTypeBottomSheetOpen === true ){
      this.setState( {
        showLoader: false
      } )
      this.props.setIsKeeperTypeBottomSheetOpen( false );
      ( this.keeperTypeBottomSheet as any ).snapTo( 1 )
    }

    if( prevProps.modifyLevelDataStatus != this.props.modifyLevelDataStatus ){
      if( this.props.modifyLevelDataStatus ) this.setState( {
        showLoader: true
      } )
      else  this.setState( {
        showLoader: false
      } )
    }
  };

  goToHistory = ( value ) => {
    const { id, selectedKeeper, isSetup, isPrimaryKeeper, isChangeKeeperAllow } = value
    this.setState( {
      showLoader: false
    } )
    const navigationParams = {
      selectedTime: selectedKeeper.updatedAt
        ? getTime( selectedKeeper.updatedAt )
        : 'never',
      selectedStatus: selectedKeeper.status,
      selectedTitle: selectedKeeper.name,
      selectedLevelId: id,
      selectedContact: selectedKeeper.data,
      selectedKeeper,
    }
    let index = 1
    let count = 0
    if ( selectedKeeper.shareType == 'device' || selectedKeeper.shareType == 'contact' ) {
      for ( let i = 0; i < this.props.levelData.length; i++ ) {
        const element = this.props.levelData[ i ]
        if( selectedKeeper.shareType == 'contact' ) {
          if ( element.keeper1.shareType == 'contact' ) count++
          if ( element.keeper2.shareType == 'contact' ) count++
        }
        if( selectedKeeper.shareType == 'device' ) {
          if ( element.keeper1.shareType == 'device' ) count++
          if ( element.keeper2.shareType == 'device' ) count++
        }
      }
      if( selectedKeeper.shareType == 'contact' ) {
        if ( count == 1 && isSetup ) index = 2
        else if ( count == 0 && isSetup ) index = 1
        else index = selectedKeeper.data.index
      }
      if( selectedKeeper.shareType == 'device' ) {
        if( selectedKeeper.data && ( selectedKeeper.data.index == 0 || selectedKeeper.data.index > 0 ) ) index = selectedKeeper.data.index
        else if ( count == 0 && isSetup ) index = 0
        else if ( count == 1 && isSetup ) index = 3
        else if ( count == 2 && isSetup ) index = 4
        else index = 0
      }
    }
    if ( selectedKeeper.shareType == 'device' ) {
      ( this.keeperTypeBottomSheet as any ).snapTo( 0 );
      ( this.QrBottomSheet as any ).snapTo( 0 );
      ( this.ApprovePrimaryKeeperBottomSheet as any ).snapTo( 0 )
      this.props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...navigationParams,
        isPrimaryKeeper: isPrimaryKeeper,
        isChangeKeeperAllow,
        index: index > -1 ? index : 0,
      } )
    } else if ( selectedKeeper.shareType == 'contact' ) {
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
    this.props.onPressKeeper( value, number )
  };

  onRefresh = async () => {
    this.props.modifyLevelData( )
    // this.props.checkMSharesHealth()
    this.props.setHealthStatus()
    if (
      this.props.levelHealth.findIndex(
        ( value ) =>
          value.levelInfo.findIndex( ( item ) => item.shareType == 'contact' || item.shareType == 'device' ) >
          -1
      ) > -1
    ) {
      this.props.syncPermanentChannels( {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.NON_FINALIZED_CONTACTS,
      } )
    }
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
          this.props.createChannelAssets( this.state.selectedKeeper.shareId, qrScannedData )
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
          //     this.props.createChannelAssets( this.state.selectedKeeper.shareId, qrScannedData )
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

  onKeeperButtonPress = ( value, keeperNumber ) =>{
    const { selectedKeeper } = this.state
    if( value.id == 1 && keeperNumber == 1 ){
      if ( this.props.cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ) {
        this.props.navigation.navigate(
          'CloudBackupHistory',
          {
            selectedTime: selectedKeeper.updatedAt
              ? getTime( selectedKeeper.updatedAt )
              : 'never',
          }
        )
      }
    } else if( value.id == 1 && keeperNumber == 2 ) {
      this.props.navigation.navigate(
        'SecurityQuestionHistoryNewBHR',
        {
          selectedTime: selectedKeeper.updatedAt
            ? getTime( selectedKeeper.updatedAt )
            : 'never',
        }
      )
    } else {
      this.setState( {
        showLoader: true,
        selectedKeeper: keeperNumber == 1 ? value.keeper1 : value.keeper2
      } )
      requestAnimationFrame( () => {
        this.onPressKeeperButton( value, keeperNumber )
      } )
    }
  }

  render() {
    const {
      selectedLevelId,
      refreshControlLoader,
      selectedKeeper,
    } = this.state
    const { navigation, currentLevel, levelData, shieldHealth } = this.props
    return (
      <View style={{
        flex: 1, backgroundColor: 'white'
      }}>
        <SafeAreaView style={{
          flex: 0
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
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
                {shieldHealth && (
                  <View style={styles.shieldErrorDot} />
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
          <View style={styles.headerMessageView}>
            <Text style={styles.headerMessageText}>{currentLevel === 1 ? 'Cloud Backup complete, \nyou can upgrade the backup to Level 2' : currentLevel === 2 ? 'Double Backup complete, \nyou can upgrade the backup to Level 3' : currentLevel === 3 ? 'Multi-key Backup complete' : 'Cloud Backup incomplete, \nplease complete Level 1' }</Text>
          </View>
          <View style={styles.body}>
            {levelData.map( ( value, index ) => {
              return (
                <ManageBackupCard
                  key={index}
                  value={value}
                  selectedId={this.state.selectedId}
                  selectedKeeper={this.state.selectedKeeper}
                  onPressSelectId={( )=>{ this.setState( {
                    selectedId: value.id != this.state.selectedId ? value.id : 0
                  } )
                  }}
                  onPressKnowMore={() => {
                    this.setState( {
                      knowMoreType: value.levelName
                    } )
                    this.knowMoreBottomSheet.snapTo( 1 )
                  }}
                  onPressKeeper1={()=> this.onKeeperButtonPress( value, 1 )}
                  onPressKeeper2={()=> this.onKeeperButtonPress( value, 2 )}
                />
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
            onPressProceed={() => ( this.ErrorBottomSheet as any ).snapTo( 0 )}
            isBottomImage={true}
            bottomImage={require( '../../assets/images/icons/errorImage.png' )}
          />}
          renderHeader={()=><ModalHeader onPressHeader={() => ( this.ErrorBottomSheet as any ).snapTo( 0 )} />}
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
    metaSharesKeeper: idx(
      state,
      ( _ ) => _.health.service.levelhealth.metaSharesKeeper
    ),
    s3Service: idx( state, ( _ ) => _.health.service ),
    cloudBackupStatus:
      idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    levelHealth: idx( state, ( _ ) => _.health.levelHealth ),
    currentLevel: idx( state, ( _ ) => _.health.currentLevel ),
    isLevel3Initialized: idx( state, ( _ ) => _.health.isLevel3Initialized ),
    isLevelThreeMetaShareCreated: idx(
      state,
      ( _ ) => _.health.isLevelThreeMetaShareCreated
    ),
    healthLoading: idx( state, ( _ ) => _.health.loading.checkMSharesHealth ),
    initLoading: idx( state, ( _ ) => _.health.loading.initLoader ),
    keeperInfo: idx( state, ( _ ) => _.health.keeperInfo ),
    service: idx( state, ( _ ) => _.keeper.service ),
    isNewFCMUpdated: idx( state, ( _ ) => _.keeper.isNewFCMUpdated ),
    downloadSmShare: idx( state, ( _ ) => _.health.loading.downloadSmShare ),
    secondaryShareDownloadedStatus: idx( state, ( _ ) => _.health.secondaryShareDownloaded ),
    cloudPermissionGranted: idx( state, ( _ ) => _.health.cloudPermissionGranted ),
    keeperProcessStatusFlag:  idx( state, ( _ ) => _.health.keeperProcessStatus ),
    isLevelToNotSetupStatus: idx( state, ( _ ) => _.health.isLevelToNotSetupStatus ),
    status: idx( state, ( _ ) => _.newBHR.status ),
    errorTitle: idx( state, ( _ ) => _.newBHR.errorTitle ),
    navigationObj: idx( state, ( _ ) => _.newBHR.navigationObj ),
    errorInfo: idx( state, ( _ ) => _.newBHR.errorInfo ),
    isTypeBottomSheetOpen: idx( state, ( _ ) => _.newBHR.isTypeBottomSheetOpen ),
    levelData: idx( state, ( _ ) => _.health.levelData ),
    shieldHealth: idx( state, ( _ ) => _.health.shieldHealth ),
    modifyLevelDataStatus: idx( state, ( _ ) => _.health.loading.modifyLevelDataStatus ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    fetchEphemeralChannel,
    generateMetaShare,
    checkMSharesHealth,
    initLevelTwo,
    syncPermanentChannels,
    setCloudData,
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
    updateCloudData,
    modifyLevelData,
    createChannelAssets,
  } )( ManageBackupNewBHR )
)

const styles = StyleSheet.create( {
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 7,
    marginLeft: 20,
    marginRight: 20,
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
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
  shieldErrorDot: {
    backgroundColor: Colors.red,
    height: wp( '3%' ),
    width: wp( '3%' ),
    borderRadius: wp( '3%' ) / 2,
    position: 'absolute',
    top: wp( '5%' ),
    right: 0,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  headerMessageView: {
    justifyContent:'center',
    alignItems:'center',
    width: wp( '85%' ),
    marginLeft: 30,
    marginRight: 30
  },
  headerMessageText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center'
  },
  body: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingBottom: wp( '7%' ),
  }
} )
