import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControl,
  ImageBackground,
  Image,
  InteractionManager
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { withNavigationFocus } from 'react-navigation'
import { connect } from 'react-redux'
import { PermanentChannelsSyncKind } from '../../store/actions/trustedContacts'
import idx from 'idx'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { syncPermanentChannels } from '../../store/actions/trustedContacts'
import {
  generateMetaShare,
  initLevelTwo,
  deletePrivateData,
  autoShareToLevel2Keepers,
  updateLevelData,
  keeperProcessStatus,
  setLevelToNotSetupStatus,
  setHealthStatus,
  modifyLevelData,
  setApprovalStatus,
  downloadSMShare,
  updateKeeperInfoToChannel,
} from '../../store/actions/BHR'
import {
  LevelData,
  LevelHealthInterface,
  MetaShare,
  Trusted_Contacts,
} from '../../bitcoin/utilities/Interface'
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
import { onPressKeeper, setLevelCompletionError, setIsKeeperTypeBottomSheetOpen } from '../../store/actions/BHR'
import LevelStatus from '../../common/data/enums/LevelStatus'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import { makeContactRecipientDescription } from '../../utils/sending/RecipientFactories'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import ManageBackupCard from './ManageBackupCard'
import { TrustedContactRelationTypes } from '../../bitcoin/utilities/Interface'
import ModalContainer from '../../components/home/ModalContainer'
import RecipientAvatar from '../../components/RecipientAvatar'
import ImageStyles from '../../common/Styles/ImageStyles'
import dbManager from '../../storage/realm/dbManager'
import realm from '../../storage/realm/realm'
import schema from '../../storage/realm/schema/Schema'
import BottomInfoBox from '../../components/BottomInfoBox'

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
  isEnabled: boolean;
  errorTitle: string;
  errorInfo: string;
  refreshControlLoader: boolean;
  showLoader: boolean;
  knowMoreType: string;
  keeping: any[];
  keeperTypeModal: boolean;
  errorModal: boolean;
  showQRModal: boolean;
  isLevel3Started: boolean;
  loaderModal: boolean;
  knwowMoreModal: boolean;
  metaSharesKeeper: MetaShare[];
  onKeeperButtonClick: boolean;
}

interface ManageBackupNewBHRPropsTypes {
  navigation: any;
  containerStyle: {};
  cloudBackupStatus: CloudBackupStatus;
  levelHealth: LevelHealthInterface[];
  currentLevel: any;
  generateMetaShare: any;
  isLevel3Initialized: Boolean;
  initLevelTwo: any;
  keeperInfo: any[];
  service: any;
  isLevelThreeMetaShareCreated: Boolean;
  syncPermanentChannels: any;
  isNewFCMUpdated: Boolean;
  setCloudData: any;
  deletePrivateData: any;
  autoShareToLevel2Keepers: any;
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
  trustedContacts: Trusted_Contacts;
  createChannelAssets: any;
  setApprovalStatus: any;
  approvalStatus: boolean;
  downloadSMShare: any;
  updateKeeperInfoToChannel: any;
  isKeeperInfoUpdated2: boolean;
  isKeeperInfoUpdated3: boolean;
  generateMetaShareStatus: boolean;
}

// const HeaderComponent = React.lazy( () => import( '../../navigation/stacks/Header' ) )
class ManageBackupNewBHR extends Component<
  ManageBackupNewBHRPropsTypes,
  ManageBackupNewBHRStateTypes
> {
  focusListener: any;
  NoInternetBottomSheet: any;
  unsubscribe: any;
  ErrorBottomSheet: any;
  keeperTypeBottomSheet: any;
  QrBottomSheet: any;
  loaderBottomSheet: any
  knowMoreBottomSheet: any

  constructor( props ) {
    super( props )
    this.focusListener = null
    this.NoInternetBottomSheet = React.createRef()
    this.unsubscribe = null
    this.ErrorBottomSheet
    this.keeperTypeBottomSheet
    const s3 = dbManager.getBHR()
    console.log( 's3', typeof s3, s3 )

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
      isEnabled: false,
      errorTitle: '',
      errorInfo: '',
      refreshControlLoader: false,
      showLoader: false,
      knowMoreType: 'manageBackup',
      keeping: [],
      keeperTypeModal: false,
      errorModal: false,
      showQRModal: false,
      isLevel3Started: false,
      loaderModal: false,
      knwowMoreModal: false,
      metaSharesKeeper: [ ...s3.metaSharesKeeper  ],
      onKeeperButtonClick: false
    }
  }

  componentDidMount = async () => {
    InteractionManager.runAfterInteractions( async() => {
      realm.objects( schema.BHR ).addListener( obj => {
        if( obj.length > 0 ) {
          this.setState( {
            metaSharesKeeper: obj[ 0 ].metaSharesKeeper
          } )
        }
      } )
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
        // updates the new FCM token to channels post recovery
        // if ( JSON.parse( recovered ) && !this.props.isNewFCMUpdated ) {
        //   this.props.updateNewFcm()
        // }
      } )
      this.focusListener = this.props.navigation.addListener( 'didFocus', () => {
        this.updateAddressBook( )
      } )
    } )
  };

  updateAddressBook = async ( ) => {
    const { trustedContacts } = this.props

    const keeping = []
    for( const channelKey of Object.keys( trustedContacts ) ){
      const contact = trustedContacts[ channelKey ]
      const isWard = [ TrustedContactRelationTypes.WARD, TrustedContactRelationTypes.KEEPER_WARD ].includes( contact.relationType )

      if( contact.isActive ){
        if( isWard ){
          if( isWard ) keeping.push( makeContactRecipientDescription(
            channelKey,
            contact,
            ContactTrustKind.USER_IS_KEEPING,
          ) )
        }
      } else {
        // TODO: inject in expired contacts list
      }
    }

    this.setState( {
      keeping,
    }
    )
  };

  handleContactSelection(
    contactDescription: ContactRecipientDescribing,
    index: number,
    contactType: string,
  ) {
    this.props.navigation.navigate( 'ContactDetails', {
      contact: contactDescription,
      index,
      contactsType: contactType,
    } )
  }

  renderContactItem = ( {
    contactDescription,
    index,
    contactsType,
  }: {
    contactDescription: ContactRecipientDescribing;
    index: number;
    contactsType: string;
  } ) => {
    return (
      <TouchableOpacity
        onPress={() =>
          this.handleContactSelection( contactDescription, index, contactsType )
        }
        style={{
          marginTop: hp( 1 ),
          alignItems: 'center',
          justifyContent: 'center'
        }}
        key={index}
      >
        <View style={styles.imageContainer}>
          <RecipientAvatar recipient={contactDescription} contentContainerStyle={styles.avatarImage} />
        </View>
        <Text style={{
          textAlign: 'center',
          marginTop: hp ( 0.5 ),
          alignSelf: 'center',
          fontSize: RFValue( 10 ),
          fontFamily: Fonts.FiraSansRegular
        }}>{contactDescription.displayedName.split( ' ' )[ 0 ] + ' '} </Text>
      </TouchableOpacity>
    )
  };

  toggleSwitch = () => this.setState( {
    isEnabled: !this.state.isEnabled
  } );

  componentDidUpdate = ( prevProps, prevState ) => {
    const {
      cloudBackupStatus,
      levelHealth
    } = this.props

    if (
      prevProps.trustedContacts != this.props.trustedContacts
    ) {
      requestAnimationFrame( () => {
        this.updateAddressBook()
      } )
    }
    if (
      prevProps.cloudBackupStatus !==
      this.props.cloudBackupStatus
    ) {
      if ( cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) {
        this.setState( {
          refreshControlLoader: true,
          showLoader: true
        } )
      } else if ( ( cloudBackupStatus === CloudBackupStatus.COMPLETED || cloudBackupStatus === CloudBackupStatus.PENDING || cloudBackupStatus === CloudBackupStatus.FAILED ) ) {
        this.setState( {
          refreshControlLoader: false,
          showLoader: false
        } )
        if( ( this.props.currentLevel == 2 && !this.props.isKeeperInfoUpdated2 ) || this.props.currentLevel == 3 && !this.props.isKeeperInfoUpdated3 )
          this.props.updateKeeperInfoToChannel()
      }
    }

    if( prevProps.isLevelToNotSetupStatus != this.props.isLevelToNotSetupStatus && this.props.isLevelToNotSetupStatus ){
      this.setState( {
        showLoader: false
      } )
    }

    if ( JSON.stringify( prevProps.levelHealth ) !==
      JSON.stringify( this.props.levelHealth ) ) {
      this.autoCloudUpload()
      if (
        this.props.levelHealth.length > 0 &&
        this.props.levelHealth.length == 1 &&
        prevProps.levelHealth.length == 0 &&
        cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS &&
        this.props.cloudPermissionGranted === true &&
        this.props.levelHealth.length &&
        this.props.levelHealth[ 0 ].levelInfo.length &&
        this.props.levelHealth[ 0 ].levelInfo[ 0 ].status != 'notSetup'
      ) {
        this.props.setCloudData( )
      }
    }

    if (
      prevState.metaSharesKeeper != this.state.metaSharesKeeper && this.state.metaSharesKeeper.length == 3 && this.state.onKeeperButtonClick
    ) {
      const obj = {
        id: 2,
        selectedKeeper: {
          shareType: 'primaryKeeper',
          name: 'Personal Device 1',
          reshareVersion: 0,
          status: 'notSetup',
          updatedAt: 0,
          shareId: this.state.metaSharesKeeper[ 1 ]
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
      }, () => {
        this.goToHistory( obj )
      } )
      this.props.setIsKeeperTypeBottomSheetOpen( false )
      // ( this.keeperTypeBottomSheet as any ).snapTo( 1 )
      // this.goToHistory( obj )
      // this.loaderBottomSheet.snapTo( 0 )
    }
    if (
      prevState.metaSharesKeeper != this.state.metaSharesKeeper && this.state.metaSharesKeeper.length == 5 && this.state.onKeeperButtonClick
    ) {
      const obj = {
        id: 2,
        selectedKeeper: {
          shareType: this.state.selectedKeeperType,
          name: this.state.selectedKeeperName,
          reshareVersion: 0,
          status: 'notSetup',
          updatedAt: 0,
          shareId: this.state.metaSharesKeeper[ 3 ].shareId,
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
      this.props.keeperProcessStatus( '' )
    }

    if( prevProps.status !== this.props.status && this.props.status === LevelStatus.FAILED ){
      this.setState( {
        errorTitle: this.props.errorTitle,
        errorInfo: this.props.errorInfo,
        showLoader: false
      } )
      this.props.setLevelCompletionError( null, null, LevelStatus.PENDING )
      // ( this.ErrorBottomSheet as any ).snapTo( 1 )
      this.setState( {
        errorModal: true
      } )
    }

    if( prevProps.navigationObj !== this.props.navigationObj ){
      this.setState( {
        selectedKeeper: this.props.navigationObj.selectedKeeper, selectedLevelId: this.props.navigationObj.id
      } )
      if( this.props.navigationObj.selectedKeeper.shareType && this.props.navigationObj.selectedKeeper.shareType == 'primaryKeeper' ){
        this.goToHistory( this.props.navigationObj )
      } else {
        this.setState( {
          keeperTypeModal: true
        } )
        this.goToHistory( this.props.navigationObj )
      }
    }

    if( prevProps.isTypeBottomSheetOpen !== this.props.isTypeBottomSheetOpen && this.props.isTypeBottomSheetOpen === true ){
      this.setState( {
        showLoader: false
      }, () => {
        this.setState( {
          keeperTypeModal: true
        } )
      } )
      this.props.setIsKeeperTypeBottomSheetOpen( false )
    }

    if( prevProps.approvalStatus != this.props.approvalStatus && this.props.approvalStatus && this.state.isLevel3Started ) {
      this.setState( {
        showLoader: false
      } )
      console.log( 'APPROVe MB' )
      this.setState( {
        showQRModal: false
      },
      () => {
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
            shareId: selectedKeeper.shareId ? selectedKeeper.shareId : selectedLevelId == 2 ? this.state.metaSharesKeeper[ 1 ] ? this.state.metaSharesKeeper[ 1 ].shareId: '' : this.state.metaSharesKeeper[ 4 ] ? this.state.metaSharesKeeper[ 4 ].shareId : ''
          },
          isSetup: true,
        }
        this.goToHistory( obj )
      } )
    }

    if( prevProps.levelHealth != this.props.levelHealth ){
      if (
        this.props.currentLevel == 2 &&
        levelHealth[ 1 ] &&
        levelHealth[ 1 ].levelInfo[ 4 ] &&
        levelHealth[ 1 ].levelInfo[ 5 ] &&
        levelHealth[ 1 ].levelInfo[ 4 ].updatedAt > 0 &&
        levelHealth[ 1 ].levelInfo[ 5 ].updatedAt > 0 &&
        ( levelHealth[ 1 ].levelInfo[ 2 ].updatedAt == 0 ||
        levelHealth[ 1 ].levelInfo[ 3 ].updatedAt == 0 )
      ) {
        this.props.autoShareToLevel2Keepers()
      }
    }
  };

  componentWillUnmount() {
    this.focusListener.remove()
  }

  goToHistory = ( value ) => {
    const { id, selectedKeeper, isSetup, isChangeKeeperAllow } = value
    this.setState( {
      showLoader: false
    } )
    const navigationParams = {
      selectedTitle: selectedKeeper.name ? selectedKeeper.name : this.state.selectedKeeperName,
      selectedLevelId: id,
      selectedKeeper,
    }
    let index = 1
    let count = 0
    if ( selectedKeeper.shareType == 'primaryKeeper' || selectedKeeper.shareType == 'device' || selectedKeeper.shareType == 'contact' || selectedKeeper.shareType == 'existingContact' ) {
      for ( let i = 0; i < this.props.levelData.length; i++ ) {
        const element = this.props.levelData[ i ]
        if( selectedKeeper.shareType == 'contact' || selectedKeeper.shareType == 'existingContact' ) {
          if ( element.keeper1.shareType == 'contact' || element.keeper1.shareType == 'existingContact' ) count++
          if ( element.keeper2.shareType == 'contact' || element.keeper2.shareType == 'existingContact' ) count++
        }
        if( selectedKeeper.shareType == 'device' || selectedKeeper.shareType == 'primaryKeeper' ) {
          if ( element.keeper1.shareType == 'device' || element.keeper1.shareType == 'primaryKeeper' ) count++
          if ( element.keeper2.shareType == 'device' ) count++
        }
      }
      if( selectedKeeper.shareType == 'contact' || selectedKeeper.shareType == 'existingContact' ) {
        if ( count == 1 && isSetup ) index = 2
        else if ( count == 0 && isSetup ) index = 1
        else index = selectedKeeper.data && selectedKeeper.data.index ? selectedKeeper.data.index : 1
      }
      if( selectedKeeper.shareType == 'device' || selectedKeeper.shareType == 'primaryKeeper' ) {
        if( selectedKeeper.data && ( selectedKeeper.data.index == 0 || selectedKeeper.data.index > 0 ) ) index = selectedKeeper.data.index
        else if ( count == 0 && isSetup ) index = 0
        else if ( count == 1 && isSetup ) index = 3
        else if ( count == 2 && isSetup ) index = 4
        else index = 0
      }
      if( selectedKeeper.shareType == 'primaryKeeper' ) index = 0
    }
    // ( this.keeperTypeBottomSheet as any ).snapTo( 0 );
    this.setState( {
      keeperTypeModal: false,
      showQRModal: false,
    } )
    if ( selectedKeeper.shareType == 'device' || selectedKeeper.shareType == 'primaryKeeper' ) {
      this.props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...navigationParams,
        isPrimaryKeeper: selectedKeeper.shareType == 'primaryKeeper' ? true : false,
        isChangeKeeperAllow,
        index: index > -1 ? index : 0,
      } )
    } else if ( selectedKeeper.shareType == 'contact' || selectedKeeper.shareType == 'existingContact' ) {
      this.props.navigation.navigate( 'TrustedContactHistoryNewBHR', {
        ...navigationParams,
        index,
        isChangeKeeperAllow
      } )
    } else if ( selectedKeeper.shareType == 'pdf' ) {
      this.props.navigation.navigate(
        'PersonalCopyHistoryNewBHR', {
          ...navigationParams,
          isChangeKeeperAllow
        }
      )
    }
  };

  onPressKeeperButton = ( value, number ) => {
    this.setState( {
      selectedLevelId: value.id,
      onKeeperButtonClick: true
    } )
    this.props.onPressKeeper( value, number )
  };

  onRefresh = async () => {
    const contacts: Trusted_Contacts = this.props.trustedContacts
    const channelUpdates = []
    // Contact or Device type
    if( contacts ){
      for( const ck of Object.keys( contacts ) ){
        if( contacts[ ck ].relationType == TrustedContactRelationTypes.KEEPER || contacts[ ck ].relationType == TrustedContactRelationTypes.PRIMARY_KEEPER ){
          // initiate permanent channel
          const channelUpdate =  {
            contactInfo: {
              channelKey: ck,
            }
          }
          channelUpdates.push( channelUpdate )
        }
      }
      this.props.syncPermanentChannels( {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
        channelUpdates: channelUpdates,
        metaSync: true
      } )
    }
    this.props.modifyLevelData( )
    this.props.setHealthStatus()
    this.autoCloudUpload()
  };

  autoCloudUpload = () =>{
    const { levelHealth, cloudBackupStatus } = this.props
    if( levelHealth[ 0 ] && levelHealth[ 1 ] ){
      if( levelHealth[ 1 ].levelInfo.length == 4 &&
        levelHealth[ 1 ].levelInfo[ 1 ].updatedAt == 0 &&
        levelHealth[ 1 ].levelInfo[ 2 ].updatedAt > 0 &&
        levelHealth[ 1 ].levelInfo[ 3 ].updatedAt > 0 &&
        cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ){
        this.props.deletePrivateData()
        this.props.updateCloudData()
      } else if( levelHealth[ 1 ].levelInfo.length == 6 &&
        levelHealth[ 1 ].levelInfo[ 1 ].updatedAt == 0 &&
        levelHealth[ 1 ].levelInfo[ 2 ].updatedAt > 0 &&
        levelHealth[ 1 ].levelInfo[ 3 ].updatedAt > 0 &&
        levelHealth[ 1 ].levelInfo[ 4 ].updatedAt > 0 &&
        levelHealth[ 1 ].levelInfo[ 5 ].updatedAt > 0 &&
        cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ){
        this.props.updateCloudData()
        this.setState( {
          loaderModal: true
        } )
      }
    }
  }

  sendApprovalRequestToPK = ( ) => {
    this.setState( {
      showQRModal: true,
      isLevel3Started: true
    } )

    // ( this.keeperTypeBottomSheet as any ).snapTo( 0 )
    this.setState( {
      keeperTypeModal: false
    } )
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
        isOpenedFlag={this.state.showQRModal}
        onQrScan={async( qrScannedData ) => {
          this.setState( {
            showLoader: true
          } )
          this.props.setApprovalStatus( false )
          this.props.downloadSMShare( qrScannedData )
          this.setState( {
            showQRModal: false
          } )
        }}
        onBackPress={() => {
          this.setState( {
            showQRModal: false
          } )
        }}
        onPressContinue={async() => {
          this.setState( {
            showLoader: true
          } )
          const qrScannedData = '{"type":"RECOVERY_REQUEST","walletName":"Sdfsd","channelId":"b819ad391b9b81c5a6debd67f82c2ea772d282ab75af67cfb4a599328c80f99f","streamId":"5adb81478","secondaryChannelKey":"YUlXUgC4q6mzJx2DalfRw5cV","version":"1.9.5","walletId":"4ec72a6d467844c32bd136250496238cafc5baabed1f474a7a1e2122b86444d3"}'
          this.props.setApprovalStatus( false )
          this.props.downloadSMShare( qrScannedData )
          this.setState( {
            showQRModal: false
          } )
        }}
      />
    )
  }

  renderQrHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          this.setState( {
            showQRModal: false,
          } )
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
      titleClicked={()=>{
        this.setState( {
          knwowMoreModal: false
        } )
      }}
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
          this.setState( {
            knwowMoreModal: false
          } )
        }}
      />
    )
  }

  onKeeperButtonPress = ( value, keeperNumber ) =>{
    requestAnimationFrame( () => {
      if( ( this.props.currentLevel == 0 && this.props.levelHealth.length == 0 ) || ( this.props.currentLevel == 0 && this.props.levelHealth.length && this.props.levelHealth[ 0 ].levelInfo.length && this.props.levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ) {
        this.props.setLevelCompletionError( 'Please set password', 'It seems you have not set passward to backup. Please set password first to proceed', LevelStatus.FAILED )
        return
      }
      if( value.id == 1 && keeperNumber == 2 ){
        if ( this.props.cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ) {
          this.props.navigation.navigate(
            'CloudBackupHistory',
            {
              selectedTime: value.keeper2.updatedAt
                ? getTime( value.keeper2.updatedAt )
                : 'never',
            }
          )
        }
      } else if( value.id == 1 && keeperNumber == 1 ) {
        this.props.navigation.navigate(
          'SecurityQuestionHistoryNewBHR',
          {
            selectedTime: value.keeper1.updatedAt
              ? getTime( value.keeper1.updatedAt )
              : 'never',
          }
        )
      } else {
        this.setState( {
          showLoader: true,
          selectedKeeper: keeperNumber == 1 ? value.keeper1 : value.keeper2
        } )

        this.onPressKeeperButton( value, keeperNumber )
      }
    } )
  }

  getHeaderMessage = () => {
    const { levelData, currentLevel } = this.props
    if( levelData ){
      for ( let i = 0; i < levelData.length; i++ ) {
        const element = levelData[ i ]
        if( element.keeper1.name && element.keeper1.status == 'notAccessible' ){
          return element.keeper1.name+' needs your attention.'
        }
        if( element.keeper2.name && element.keeper2.status == 'notAccessible' ){
          return  element.keeper2.name+' needs your attention.'
        }
      }
    }
    if( currentLevel == 0 ){
      return 'Cloud backup incomplete, please complete Level 1'
    } else if( currentLevel === 1 ){
      return 'Cloud backup complete, upgrade backup to Level 2'
    } else if( currentLevel === 2 ){
      return 'Double backup complete, upgrade backup to Level 3'
    } else if( currentLevel == 3 ){
      return 'Multi-Key backup complete'
    }
  }

  render() {
    const {
      selectedLevelId,
      refreshControlLoader,
      selectedKeeper,
      isEnabled,
      keeping,
      selectedKeeperName,
      selectedKeeperType,
      keeperTypeModal,
      errorModal,
      showQRModal,
      loaderModal,
      knwowMoreModal
    } = this.state
    const { navigation, currentLevel, levelData, shieldHealth } = this.props
    return (
      <View style={{
        backgroundColor: Colors.blue,
        flex: 1
      }}>
        <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
        <View style={styles.accountCardsSectionContainer}>
          <Text style={{
            color: Colors.blue,
            fontSize: RFValue( 18 ),
            letterSpacing: 0.54,
            fontFamily: Fonts.FiraSansMedium,
            marginTop: hp( 4 ),
            marginHorizontal: wp( 4 ),
            paddingBottom: hp( 1 )
          }}>
            Security & Privacy
          </Text>
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
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: wp( 4 ), alignItems: 'center', paddingTop: wp( 3 ),
            }}>
              <View style={{
                flex:2
              }}>
                <Text style={{
                  color: Colors.blue,
                  fontSize: RFValue( 12 ),
                  fontFamily: Fonts.FiraSansRegular
                }}>Wallet Backup</Text>
                <Text style={styles.headerMessageText}>{this.getHeaderMessage()}</Text>
              </View>
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
                        knowMoreType: value.levelName,
                        knwowMoreModal: true
                      } )
                    }}
                    onPressKeeper1={()=> this.onKeeperButtonPress( value, 1 )}
                    onPressKeeper2={()=> this.onKeeperButtonPress( value, 2 )}
                  />
                )
              } )}
            </View>
            <View style={{
              marginTop: wp( '5%' ), backgroundColor: Colors.backgroundColor, height: '100%',
              paddingLeft: wp ( '6%' ),
              paddingBottom: hp( 3 )
            }}>
              <Text style={styles.pageTitle}>I am the Keeper of</Text>
              <Text style={styles.pageInfoText}>
               Contacts whose wallets I can help restore
              </Text>
              <View style={{
                marginBottom: 15
              }}>
                {keeping.length > 0 ?
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      height: 'auto', alignItems: 'flex-start', flexDirection: 'row'
                    }}>
                    {keeping.length && keeping.map( ( item, index ) => {
                      return this.renderContactItem( {
                        contactDescription: item,
                        index,
                        contactsType: 'I am the Keeper of',
                      } )
                    } ) }
                  </ScrollView>
                  :
                  <BottomInfoBox
                    containerStyle={{
                      marginLeft: wp( 0 ),
                      marginTop: hp( 2.5 ),
                      backgroundColor: Colors.white
                    }}
                    title="Note"
                    infoText="When you have Friends & Family who you can help with wallet recovery, they will be listed here"
                  />
                }
              </View>
            </View>
          </ScrollView>

          <ModalContainer visible={keeperTypeModal} closeBottomSheet={() => {}}>
            <KeeperTypeModalContents
              headerText={'Backup Recovery Key'}
              subHeader={'You can save your Recovery Key with a person, on a device running Hexa or simply in a PDF document'}
              onPressSetup={async ( type, name ) => {
                try{
                  this.setState( {
                    selectedKeeperType: type,
                    selectedKeeperName: name,
                  } )
                  if (
                    selectedLevelId == 3 &&
                  !this.props.isLevelThreeMetaShareCreated &&
                  !this.props.isLevel3Initialized &&
                  this.props.currentLevel == 2 &&
                  this.state.metaSharesKeeper.length != 5
                  ) {
                    this.props.generateMetaShare( selectedLevelId )
                  } else {
                    this.sendApprovalRequestToPK( )
                  }
                } catch( err ){
                  console.log( 'err', err )
                }
              }}
              onPressBack={() =>{
                this.props.setIsKeeperTypeBottomSheetOpen( false )
                this.setState( {
                  keeperTypeModal: false
                } )
              }
              }
              selectedLevelId={selectedLevelId}
            />
          </ModalContainer >
          <ModalContainer visible={errorModal} closeBottomSheet={() => {}}>
            <ErrorModalContents
              modalRef={this.ErrorBottomSheet as any}
              title={this.state.errorTitle}
              info={this.state.errorInfo}
              proceedButtonText={( this.props.currentLevel == 0 && this.props.levelHealth.length == 0 ) || ( this.props.currentLevel == 0 && this.props.levelHealth.length && this.props.levelHealth[ 0 ].levelInfo.length && this.props.levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ? 'Proceed To Password' : 'Got it'}
              cancelButtonText={( this.props.currentLevel == 0 && this.props.levelHealth.length == 0 ) || ( this.props.currentLevel == 0 && this.props.levelHealth.length && this.props.levelHealth[ 0 ].levelInfo.length && this.props.levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ? 'Got it' : ''}
              isIgnoreButton={( this.props.currentLevel == 0 && this.props.levelHealth.length == 0 ) || ( this.props.currentLevel == 0 && this.props.levelHealth.length && this.props.levelHealth[ 0 ].levelInfo.length && this.props.levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ? true : false}
              onPressProceed={() => {
                this.setState( {
                  errorModal: false
                } )
                if( ( this.props.currentLevel == 0 && this.props.levelHealth.length == 0 ) || ( this.props.currentLevel == 0 && this.props.levelHealth.length && this.props.levelHealth[ 0 ].levelInfo.length && this.props.levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ) this.props.navigation.navigate( 'SetNewPassword', {
                  isFromManageBackup: true,
                } )
              }}
              onPressIgnore={() => {
                this.setState( {
                  errorModal: false
                } )
              }}
              isBottomImage={true}
              bottomImage={require( '../../assets/images/icons/errorImage.png' )}
            />
          </ModalContainer>
          <ModalContainer visible={showQRModal} closeBottomSheet={() => {}} >
            {this.renderQrContent()}
          </ModalContainer>
          <ModalContainer visible={knwowMoreModal} closeBottomSheet={() => {}} >
            {this.renderKnowMoreModalContent()}
          </ModalContainer>
        </View>
        {this.state.showLoader ? <Loader /> : null}
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    cloudBackupStatus:
      idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    levelHealth: idx( state, ( _ ) => _.bhr.levelHealth ),
    currentLevel: idx( state, ( _ ) => _.bhr.currentLevel ),
    isLevel3Initialized: idx( state, ( _ ) => _.bhr.isLevel3Initialized ),
    isLevelThreeMetaShareCreated: idx(
      state,
      ( _ ) => _.bhr.isLevelThreeMetaShareCreated
    ),
    initLoading: idx( state, ( _ ) => _.bhr.loading.initLoader ),
    keeperInfo: idx( state, ( _ ) => _.bhr.keeperInfo ),
    service: idx( state, ( _ ) => _.keeper.service ),
    isNewFCMUpdated: idx( state, ( _ ) => _.keeper.isNewFCMUpdated ),
    cloudPermissionGranted: idx( state, ( _ ) => _.bhr.cloudPermissionGranted ),
    keeperProcessStatusFlag:  idx( state, ( _ ) => _.bhr.keeperProcessStatus ),
    isLevelToNotSetupStatus: idx( state, ( _ ) => _.bhr.isLevelToNotSetupStatus ),
    status: idx( state, ( _ ) => _.bhr.status ),
    errorTitle: idx( state, ( _ ) => _.bhr.errorTitle ),
    navigationObj: idx( state, ( _ ) => _.bhr.navigationObj ),
    errorInfo: idx( state, ( _ ) => _.bhr.errorInfo ),
    isTypeBottomSheetOpen: idx( state, ( _ ) => _.bhr.isTypeBottomSheetOpen ),
    levelData: idx( state, ( _ ) => _.bhr.levelData ),
    shieldHealth: idx( state, ( _ ) => _.bhr.shieldHealth ),
    modifyLevelDataStatus: idx( state, ( _ ) => _.bhr.loading.modifyLevelDataStatus ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.contacts ),
    approvalStatus: idx( state, ( _ ) => _.bhr.approvalStatus ),
    isKeeperInfoUpdated2: idx( state, ( _ ) => _.bhr.isKeeperInfoUpdated2 ),
    generateMetaShareStatus: idx( state, ( _ ) => _.bhr.loading.generateMetaShareStatus ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    generateMetaShare,
    initLevelTwo,
    syncPermanentChannels,
    setCloudData,
    deletePrivateData,
    autoShareToLevel2Keepers,
    updateLevelData,
    keeperProcessStatus,
    setLevelToNotSetupStatus,
    setHealthStatus,
    onPressKeeper,
    setLevelCompletionError,
    setIsKeeperTypeBottomSheetOpen,
    updateCloudData,
    modifyLevelData,
    setApprovalStatus,
    downloadSMShare,
    updateKeeperInfoToChannel,
  } )( ManageBackupNewBHR )
)

const styles = StyleSheet.create( {
  imageContainer: {
    width: wp( 15 ),
    height: wp( 15 ),
    borderRadius: wp( 15 )/2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowColor,
    shadowOpacity: 0.6,
    shadowOffset: {
      width: 10, height: 10
    },
    elevation: 10
  },
  avatarImage: {
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: wp( 14 )/2,
    marginHorizontal: wp ( 1 ),
  },
  moreImage: {
    width: wp( '10%' ),
    height: wp( '10%' ),
  },
  pageTitle: {
    color: Colors.blue,
    fontSize: RFValue( 16 ),
    // fontFamily: Fonts.FiraSansRegular,
    paddingTop: wp ( '2%' ),
    fontFamily: Fonts.FiraSansMedium,
    // paddingLeft: wp ( '4%' )
  },
  cardTitle: {
    color: Colors.blue,
    fontSize: RFValue( 12 ),
    // fontFamily: Fonts.FiraSansRegular,
    fontFamily: Fonts.FiraSansMedium,
    marginVertical: wp( 2 ),
    // marginHorizontal: wp( 4 )
  },
  pageInfoText: {
    // paddingLeft: wp ( '4%' ),
    color: Colors.textColorGrey,
    letterSpacing: 0.5,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 3,
  },
  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular
  },

  addModalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular
  },

  modalElementInfoView: {
    flex: 1,
    // margin: 10,
    height: hp( '5%' ),
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp ( '6%' )
  },
  accountCardsSectionContainer: {
    height: hp( '71.46%' ),
    // marginTop: 30,
    backgroundColor: Colors.backgroundColor,
    borderTopLeftRadius: 25,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 2,
      height: -1,
    },
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
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
    width: wp( '10%' ),
    height: wp( '18%' ),
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
    height: wp( '11%' ),
    width: wp( '85%' ),
    padding: 15,
    borderBottomWidth: 0.5,
    borderColor: Colors.textColorGrey,
  },
  cardHealthImageView: {
    backgroundColor: Colors.red,
    // shadowColor: Colors.deepBlue,
    // shadowOpacity: 1,
    // shadowOffset: {
    //   width: 0, height: 3
    // },
    // shadowRadius: 10,
    borderRadius: wp( '7%' ) / 2,
    width: wp( '6%' ),
    height: wp( '6%' ),
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
    fontSize: RFValue( 16 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  levelInfoText: {
    fontSize: RFValue( 10 ),
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
    // textAlign: 'center'
  },
  body: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingBottom: wp( '7%' ),
  }
} )
