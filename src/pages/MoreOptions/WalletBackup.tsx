import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import idx from 'idx'
import React, { useEffect, useState } from 'react'
import {
  BackHandler,
  FlatList,
  Image,
  InteractionManager,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { Shadow } from 'react-native-shadow-2'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch, useSelector } from 'react-redux'
import { AccountType, KeeperType, LevelData, LevelHealthInterface, TrustedContactRelationTypes, Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { translations } from '../../common/content/LocContext'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import LevelStatus from '../../common/data/enums/LevelStatus'
import AccountShell from '../../common/data/models/AccountShell'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import ErrorModalContents from '../../components/ErrorModalContents'
import HeaderTitle from '../../components/HeaderTitle'
import ModalContainer from '../../components/home/ModalContainer'
import MBNewBhrKnowMoreSheetContents from '../../components/know-more-sheets/MBNewBhrKnowMoreSheetContents'
import AccountArchiveModal from '../../pages/Accounts/AccountSettings/AccountArchiveModal'
import { updateAccountSettings } from '../../store/actions/accounts'
import { autoShareToLevel2Keepers, deletePrivateData, downloadSMShare, generateMetaShare, keeperProcessStatus, modifyLevelData, onPressKeeper, setApprovalStatus, setIsKeeperTypeBottomSheetOpen, setLevelCompletionError, setLevelToNotSetupStatus, updateKeeperInfoToChannel, upgradeLevelOneKeeper } from '../../store/actions/BHR'
import { setCloudErrorMessage, updateCloudData } from '../../store/actions/cloud'
import { sourceAccountSelectedForSending } from '../../store/actions/sending'
import { PermanentChannelsSyncKind, syncPermanentChannels } from '../../store/actions/trustedContacts'
import { AccountsState } from '../../store/reducers/accounts'
import { getNextFreeAddress } from '../../store/sagas/accounts'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import { makeContactRecipientDescription } from '../../utils/sending/RecipientFactories'
import QRModal from '../Accounts/QRModal'
import BackupTypeModalContent from '../NewBHR/BackupTypeModalContent'
import KeeperTypeModalContents from '../NewBHR/KeeperTypeModalContent'
import SeedBacupModalContents from '../NewBHR/SeedBacupModalContents'


const WalletBackup = ( props, navigation ) => {
  const dispatch = useDispatch()
  const strings = translations[ 'bhr' ]
  const headerStrings = translations[ 'header' ]
  const common = translations[ 'common' ]
  const keeperInfo = useSelector( ( state ) => state.bhr.keeperInfo )
  const cloudBackupStatus: CloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING
  const levelHealth: LevelHealthInterface[] = useSelector( ( state ) => state.bhr.levelHealth )
  const currentLevel: number = useSelector( ( state ) => state.bhr.currentLevel )
  const isLevel3Initialized: boolean = useSelector( ( state ) => state.bhr.isLevel3Initialized )
  const isLevelThreeMetaShareCreated: boolean = useSelector( ( state ) => state.bhr.isLevelThreeMetaShareCreated )
  const cloudPermissionGranted: boolean = useSelector( ( state ) => state.bhr.cloudPermissionGranted )
  const keeperProcessStatusFlag: string = useSelector( ( state ) => state.bhr.keeperProcessStatus )
  const isLevelToNotSetupStatus: boolean = useSelector( ( state ) => state.bhr.isLevelToNotSetupStatus )
  const status: any = useSelector( ( state ) => state.bhr.status )
  const errorTitleProp: string = useSelector( ( state ) => state.bhr.errorTitle )
  const navigationObj: any = useSelector( ( state ) => state.bhr.navigationObj )
  const errorInfoProp: string = useSelector( ( state ) => state.bhr.errorInfo )
  const isTypeBottomSheetOpen: any = useSelector( ( state ) => state.bhr.isTypeBottomSheetOpen )
  const levelData: LevelData[] = useSelector( ( state ) => state.bhr.levelData )
  const shieldHealth: boolean = useSelector( ( state ) => state.bhr.shieldHealth )
  const trustedContacts: Trusted_Contacts = useSelector( ( state ) => state.trustedContacts.contacts )
  const approvalStatus: boolean = useSelector( ( state ) => state.bhr.approvalStatus )
  const isKeeperInfoUpdated2: boolean = useSelector( ( state ) => state.bhr.isKeeperInfoUpdated2 )
  const isKeeperInfoUpdated3: boolean = useSelector( ( state ) => state.bhr.isKeeperInfoUpdated3 )
  const cloudErrorMessage: string = useSelector( ( state ) => state.cloud.cloudErrorMessage )
  const accountsState: AccountsState = useSelector( ( state ) => state.accounts, )
  const accountState: AccountsState = useSelector( ( state ) => idx( state, ( _ ) => _.accounts ) )
  const accountShells: AccountShell[] = accountState.accountShells

  const [ accType, setAccType ] = useState( AccountType.CHECKING_ACCOUNT )
  const sendingAccount = accountShells.find( shell => shell.primarySubAccount.type == accType && shell.primarySubAccount.instanceNumber === 0 )
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sendingAccount )
  const iCloudErrors = translations[ 'iCloudErrors' ]
  const driveErrors = translations[ 'driveErrors' ]
  const defaultKeeperObj: {
    shareType: string
    updatedAt: number;
    status: string
    shareId: string
    reshareVersion: number;
    name?: string
    data?: any;
    channelKey?: string
  } = {
    shareType: '',
    updatedAt: 0,
    status: 'notAccessible',
    shareId: '',
    reshareVersion: 0,
    name: '',
    data: {
    },
    channelKey: ''
  }
  const [ selectedKeeper, setSelectedKeeper ]: [{
    shareType: string;
    updatedAt: number;
    status: string;
    shareId: string;
    reshareVersion: number;
    name?: string;
    data?: any;
    channelKey?: string;
  }, any] = useState( defaultKeeperObj )
  const [ selectedId, setSelectedId ] = useState( 0 )
  const [ selectedLevelId, setSelectedLevelId ] = useState( 0 )
  const [ SelectedRecoveryKeyNumber, setSelectedRecoveryKeyNumber ] = useState( 0 )
  const [ selectedKeeperType, setSelectedKeeperType ] = useState( '' )
  const [ selectedKeeperName, setSelectedKeeperName ] = useState( '' )
  const [ isEnabled, setIsEnabled ] = useState( false )
  const [ errorTitle, setErrorTitle ] = useState( '' )
  const [ errorInfo, setErrorInfo ] = useState( '' )

  const [ refreshControlLoader, setRefreshControlLoader ] = useState( false )
  const [ showLoader, setShowLoader ] = useState( false )
  const [ knowMoreType, setKnowMoreType ] = useState( 'manageBackup' )
  const [ keeping, setKeeping ] = useState( [] )
  const [ keeperTypeModal, setKeeperTypeModal ] = useState( false )
  const [ backupTypeModal, setBackupTypeModal ] = useState( false )
  const [ seedBackupModal, setSeedBackupModal ] = useState( false )
  const [ errorModal, setErrorModal ] = useState( false )
  const [ isLevel3Started, setIsLevel3Started ] = useState( false )

  const [ loaderModal, setLoaderModal ] = useState( false )
  const [ knowMoreModal, setKnowMoreModal ] = useState( false )
  const metaSharesKeeper = useSelector( ( state ) => state.bhr.metaSharesKeeper )
  const [ onKeeperButtonClick, setOnKeeperButtonClick ] = useState( false )
  const [ cloudErrorModal, setCloudErrorModal ] = useState( false )
  const [ errorMsg, setErrorMsg ] = useState( '' )
  const [ showQRModal, setShowQRModal ] = useState( false )

  const [ localLevelData, setLocalLevelData ] = useState( [] )
  const [ isUpgrade, setIsUpgrade ] = useState( false )
  const [ showAccountArchiveModal, setShowAccountArchiveModal ] = useState( false )
  const [ primarySubAccount, setPrimarySubAccount ] = useState( null )
  const [ accountShell, setAccountShell ] = useState( null )
  const [ emptyAccountErrorModal, setEmptyAccountErrorModal ] = useState( false )
  const [ multipleAcccountModal, setMultipleAcccountModal ] = useState( false )
  const [ checkingAddress, setCheckingAddress ] = useState( null )

  let localPrimarySubAccount = null
  let localAccountShell = null

  function handleAccountArchive() {
    const settings = {
      visibility: AccountVisibility.ARCHIVED
    }
    dispatch( updateAccountSettings( {
      accountShell: accountShell, settings
    } ) )
    setTimeout( () => {
      onChangeSeedWordBackUp()
    }, 1000 )
    // props.navigation.navigate( 'Home' )
  }

  // After Mount didMount
  useEffect( () => {

    InteractionManager.runAfterInteractions( async () => {
      await AsyncStorage.getItem( 'walletRecovered' ).then( async ( recovered ) => {
        if ( !isLevelToNotSetupStatus && JSON.parse( recovered ) ) {
          dispatch( setLevelToNotSetupStatus() )
          dispatch( modifyLevelData() )
        }
      } )
    } )
    // console.log( 'accountsState on walletbackup====>' + JSON.stringify( accountsState.accountShells ) )

    const unsubscribe = props.navigation.addListener( 'focus', () => {
      updateAddressBook()
    } )
    return unsubscribe
  }, [] )

  useEffect( () => {
    init()
  }, [] )

  function handleBackButtonClick() {
    props.navigation.navigate( 'MoreOptionsContainerScreen' )
    return true
  }

  useEffect( () => {
    BackHandler.addEventListener( 'hardwareBackPress', handleBackButtonClick )
    return () => {
      BackHandler.removeEventListener( 'hardwareBackPress', handleBackButtonClick )
    }
  }, [] )

  const init = async () => {
    await onRefresh()
    // dispatch( modifyLevelData() )
  }

  const updateAddressBook = async () => {
    const keeping = []
    for ( const channelKey of Object.keys( trustedContacts ) ) {
      const contact = trustedContacts[ channelKey ]
      const isWard = [ TrustedContactRelationTypes.WARD, TrustedContactRelationTypes.KEEPER_WARD ].includes( contact.relationType )

      if ( contact.isActive ) {
        if ( isWard ) {
          if ( isWard ) keeping.push( makeContactRecipientDescription(
            channelKey,
            contact,
            ContactTrustKind.USER_IS_KEEPING,
          ) )
        }
      } else {
        // TODO: inject in expired contacts list
      }
    }

    setKeeping( keeping )
  }

  // On update
  useEffect( () => {
    requestAnimationFrame( () => {
      updateAddressBook()
    } )
  }, [ trustedContacts ] )

  useEffect( () => {
    if ( cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) {
      setRefreshControlLoader( true )
      setShowLoader( true )
    } else if ( ( cloudBackupStatus === CloudBackupStatus.COMPLETED || cloudBackupStatus === CloudBackupStatus.PENDING || cloudBackupStatus === CloudBackupStatus.FAILED ) ) {
      setRefreshControlLoader( false )
      setShowLoader( false )
      if ( ( currentLevel == 2 && !isKeeperInfoUpdated2 ) || currentLevel == 3 && !isKeeperInfoUpdated3 )
        dispatch( updateKeeperInfoToChannel() )
    }
  }, [ cloudBackupStatus ] )

  useEffect( () => {
    if ( isLevelToNotSetupStatus ) {
      setShowLoader( false )
    }
  }, [ isLevelToNotSetupStatus ] )

  useEffect( () => {
    autoCloudUpload()
    if ( Platform.OS === 'ios' ) {
      if (
        levelHealth.length > 0 &&
        levelHealth.length == 1 &&
        cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS &&
        cloudPermissionGranted === true &&
        levelHealth.length &&
        levelHealth[ 0 ].levelInfo.length &&
        levelHealth[ 0 ].levelInfo[ 0 ].status != 'notSetup' &&
        levelHealth[ 0 ].levelInfo[ 1 ].updatedAt == 0
      ) {
        // dispatch( setCloudData() )
      }
    }

    if (
      currentLevel == 2 &&
      levelHealth[ 1 ] &&
      levelHealth[ 1 ].levelInfo[ 4 ] &&
      levelHealth[ 1 ].levelInfo[ 5 ] &&
      levelHealth[ 1 ].levelInfo[ 4 ].updatedAt > 0 &&
      levelHealth[ 1 ].levelInfo[ 5 ].updatedAt > 0 &&
      ( levelHealth[ 1 ].levelInfo[ 2 ].updatedAt == 0 ||
        levelHealth[ 1 ].levelInfo[ 3 ].updatedAt == 0 )
    ) {
      dispatch( autoShareToLevel2Keepers() )
    }
  }, [ levelHealth ] )

  const sendApprovalRequestToPK = () => {
    setShowQRModal( true )
    setIsLevel3Started( true )
    setKeeperTypeModal( false )
  }

  useEffect( () => {
    if ( metaSharesKeeper?.length == 3 && onKeeperButtonClick ) {
      const obj = {
        selectedKeeper: {
          shareType: 'primaryKeeper',
          name: strings.Backuponadevice,
          reshareVersion: 0,
          status: 'notSetup',
          updatedAt: 0,
          shareId: metaSharesKeeper[ 1 ].shareId,
          data: {
          },
        },
      }
      if ( selectedKeeperType == 'pdf' ) {
        sendApprovalRequestToPK()
      } else {
        setSelectedKeeper( obj.selectedKeeper )
        setShowLoader( false )
        setSelectedLevelId( 2 )
        goToHistory( obj, 'metaSharesKeeper2' )
        dispatch( setIsKeeperTypeBottomSheetOpen( false ) )
      }
    }
  }, [ metaSharesKeeper ] )

  useEffect( () => {
    if ( metaSharesKeeper?.length == 5 && onKeeperButtonClick ) {
      const obj = {
        selectedKeeper: {
          shareType: selectedKeeperType,
          name: selectedKeeperName,
          reshareVersion: 0,
          status: 'notSetup',
          updatedAt: 0,
          shareId: metaSharesKeeper[ 3 ].shareId,
          data: {
          },
        },
      }
      setSelectedKeeper( obj.selectedKeeper )
      dispatch( setIsKeeperTypeBottomSheetOpen( false ) )
      setShowLoader( false )
      setSelectedLevelId( 3 )
      goToHistory( obj, 'metaSharesKeeper' )
    }
  }, [ metaSharesKeeper ] )

  useEffect( () => {
    if ( keeperProcessStatusFlag == KeeperProcessStatus.COMPLETED ) {
      dispatch( keeperProcessStatus( '' ) )
    }
  }, [ keeperProcessStatusFlag ] )

  useEffect( () => {
    if ( status === LevelStatus.FAILED ) {
      setErrorTitle( errorTitleProp )
      setErrorInfo( errorInfoProp )
      setShowLoader( false )
      dispatch( setLevelCompletionError( null, null, LevelStatus.PENDING ) )
      setTimeout( () => {
        setErrorModal( true )
      }, 600 )
    }
  }, [ status ] )

  useEffect( () => {
    if ( navigationObj.selectedKeeper && onKeeperButtonClick ) {
      setSelectedKeeper( navigationObj.selectedKeeper )
      setSelectedLevelId( navigationObj.id )
      if ( selectedLevelId == 2 && SelectedRecoveryKeyNumber == 1 ) {
        goToHistory( navigationObj, 'navigationObjIF' )
      } else if ( navigationObj.selectedKeeper && navigationObj.selectedKeeper.shareId && navigationObj.selectedKeeper.status !== 'notSetup' ) {
        goToHistory( navigationObj, 'navigationObjIF' )
      } else {
        setTimeout( () => {
          setKeeperTypeModal( true )
        }, 500 )
      }
    }
  }, [ navigationObj ] )

  useEffect( () => {
    if ( isTypeBottomSheetOpen === true && onKeeperButtonClick ) {
      // setShowLoader( false )
      // setTimeout( () => {
      // setKeeperTypeModal( true )
      // }, 500 )
      const obj = {
        selectedKeeper: {
          ...selectedKeeper, name: selectedKeeper.name ? selectedKeeper.name : selectedKeeperName, shareType: selectedKeeper.shareType ? selectedKeeper.shareType : 'cloud',
          shareId: selectedKeeper.shareId ? selectedKeeper.shareId : selectedLevelId == 2 ? metaSharesKeeper[ 1 ] ? metaSharesKeeper[ 1 ].shareId : '' : metaSharesKeeper[ 4 ] ? metaSharesKeeper[ 4 ].shareId : ''
        },
      }
      goToHistory( obj, 'navigationObjIF' )
      dispatch( setIsKeeperTypeBottomSheetOpen( false ) )
    }
  }, [ isTypeBottomSheetOpen ] )

  useEffect( () => {
    if ( approvalStatus && isLevel3Started ) {
      setShowLoader( false )
      setShowQRModal( false )
      const obj = {
        selectedKeeper: {
          ...selectedKeeper, name: selectedKeeper.name ? selectedKeeper.name : selectedKeeperName, shareType: selectedKeeper.shareType ? selectedKeeper.shareType : selectedKeeperType,
          shareId: selectedKeeper.shareId ? selectedKeeper.shareId : selectedLevelId == 2 ? metaSharesKeeper[ 1 ] ? metaSharesKeeper[ 1 ].shareId : '' : metaSharesKeeper[ 4 ] ? metaSharesKeeper[ 4 ].shareId : ''
        },
      }
      goToHistory( obj, 'approvalStatus' )
    }
  }, [ approvalStatus ] )

  useEffect( () => {
    if ( cloudErrorMessage != '' ) {
      const message = Platform.select( {
        ios: iCloudErrors[ cloudErrorMessage ],
        android: driveErrors[ cloudErrorMessage ],
      } )
      setErrorMsg( message )
      setCloudErrorModal( true )
      //setErrorMsg( cloudErrorMessage )
      dispatch( setCloudErrorMessage( '' ) )
    } else if ( cloudBackupStatus == CloudBackupStatus.COMPLETED || cloudBackupStatus == CloudBackupStatus.IN_PROGRESS ) {
      setCloudErrorModal( false )
    }
  }, [ cloudErrorMessage, cloudBackupStatus ] )

  const onRefresh = async () => {
    const contacts: Trusted_Contacts = trustedContacts
    const channelUpdates = []
    // Contact or Device type
    if ( contacts ) {
      for ( const ck of Object.keys( contacts ) ) {
        if ( contacts[ ck ].relationType == TrustedContactRelationTypes.KEEPER || contacts[ ck ].relationType == TrustedContactRelationTypes.PRIMARY_KEEPER ) {
          // initiate permanent channel
          const channelUpdate = {
            contactInfo: {
              channelKey: ck,
            }
          }
          channelUpdates.push( channelUpdate )
        }
      }
      dispatch( syncPermanentChannels( {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
        channelUpdates: channelUpdates,
        metaSync: true
      } ) )
      syncPermanentChannels( {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.EXISTING_CONTACTS,
        metaSync: true
      } )
    }
    dispatch( modifyLevelData() )
    // dispatch( setHealthStatus() )
    // autoCloudUpload()
  }

  const autoCloudUpload = () => {
    if ( levelHealth[ 0 ] && levelHealth[ 1 ] ) {
      if ( levelHealth[ 1 ].levelInfo.length == 4 &&
        levelHealth[ 1 ].levelInfo[ 1 ].updatedAt == 0 &&
        levelHealth[ 1 ].levelInfo[ 2 ].updatedAt > 0 &&
        levelHealth[ 1 ].levelInfo[ 3 ].updatedAt > 0 &&
        cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ) {
        if ( levelHealth[ 0 ].levelInfo[ 1 ].shareType == 'cloud' ) {
          dispatch( deletePrivateData() )
          setLoaderModal( true )
          dispatch( updateCloudData() )
        } else {
          dispatch( upgradeLevelOneKeeper() )
        }
      } else if ( levelHealth[ 1 ].levelInfo.length == 6 &&
        levelHealth[ 1 ].levelInfo[ 1 ].updatedAt == 0 &&
        levelHealth[ 1 ].levelInfo[ 2 ].updatedAt > 0 &&
        levelHealth[ 1 ].levelInfo[ 3 ].updatedAt > 0 &&
        levelHealth[ 1 ].levelInfo[ 4 ].updatedAt > 0 &&
        levelHealth[ 1 ].levelInfo[ 5 ].updatedAt > 0 &&
        cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ) {
        if ( levelHealth[ 0 ].levelInfo[ 1 ].shareType == 'cloud' ) {
          dispatch( updateCloudData() )
          setLoaderModal( true )
        } else {
          dispatch( upgradeLevelOneKeeper() )
        }
      }
    }
  }

  const onKeeperButtonPress = ( value, keeperNumber, showSeedAcion ) => {
    if ( showSeedAcion )
      return
    // if ( ( currentLevel == 0 && levelHealth.length == 0 ) || ( currentLevel == 0 && levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ) {
    //   setBackupTypeModal( true )
    //   return
    // }
    if ( ( keeperNumber == 1 ) && ( currentLevel == 0 && levelHealth.length == 0 ) || ( currentLevel == 0 && levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ) {
      if ( value.id == 1 ) {
        // props.navigation.navigate( 'SetNewPassword', {
        //   isFromManageBackup: true,
        // } )
        setSeedBackupModal( true )
        return
      }
    }
    if ( ( currentLevel == 0 && levelHealth.length == 0 ) || ( currentLevel == 0 && levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ) {
      dispatch( setLevelCompletionError( strings[ 'PleaseSetPasswordTitle' ], strings[ 'PleaseSetPasswordInfo' ], LevelStatus.FAILED ) )
      return
    }
    setSelectedKeeper( keeperNumber == 1 ? value.keeper1 : value.keeper2 )
    dispatch( onPressKeeper( value, keeperNumber ) )
    onRefresh()
    setSelectedRecoveryKeyNumber( keeperNumber )
    setSelectedLevelId( value.id )
    setOnKeeperButtonClick( true )
  }

  const goToHistory = ( value, test ) => {
    const { selectedKeeper } = value
    setShowLoader( false )
    setShowQRModal( false )
    const navigationParams = {
      selectedTitle: selectedKeeper.name ? selectedKeeper.name : selectedKeeperName,
      SelectedRecoveryKeyNumber,
      selectedKeeper,
      selectedLevelId
    }
    let index = 1
    let count = 0
    if ( selectedKeeper.shareType == 'primaryKeeper' || selectedKeeper.shareType == 'device' || selectedKeeper.shareType == 'contact' || selectedKeeper.shareType == 'existingContact' ) {
      for ( let i = 0; i < levelData.length; i++ ) {
        const element = levelData[ i ]
        if ( selectedKeeper.shareType == 'contact' || selectedKeeper.shareType == 'existingContact' ) {
          if ( element.keeper1.shareType == 'contact' || element.keeper1.shareType == 'existingContact' ) count++
          if ( element.keeper2.shareType == 'contact' || element.keeper2.shareType == 'existingContact' ) count++
        }
        if ( selectedKeeper.shareType == 'device' || selectedKeeper.shareType == 'primaryKeeper' ) {
          if ( element.keeper1.shareType == 'device' || ( currentLevel > 0 && element.keeper1.shareType == 'primaryKeeper' ) ) count++
          if ( element.keeper2.shareType == 'device' ) count++
        }
      }
      if ( selectedKeeper.shareType == 'contact' || selectedKeeper.shareType == 'existingContact' ) {
        if ( count == 1 ) index = 2
        else if ( count == 0 ) index = 1
        else index = selectedKeeper.data && selectedKeeper.data.index ? selectedKeeper.data.index : 1
      }
      if ( selectedKeeper.shareType == 'device' || selectedKeeper.shareType == 'primaryKeeper' ) {
        if ( selectedKeeper.shareType == 'primaryKeeper' ) index = 0
        else if ( selectedKeeper.data && ( selectedKeeper.data.index == 0 || selectedKeeper.data.index > 0 ) ) index = selectedKeeper.data.index
        else if ( count == 0 ) index = 0
        else if ( count == 1 ) index = 3
        else if ( count == 2 ) index = 4
        else index = 0
      }
    }
    setSelectedKeeper( defaultKeeperObj )
    setKeeperTypeModal( false )
    if ( selectedKeeper.shareType == 'device' || selectedKeeper.shareType == 'primaryKeeper' ) {
      props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...navigationParams,
        isPrimaryKeeper: selectedKeeper.shareType == 'primaryKeeper' ? true : false,
        index: index > -1 ? index : 0,
      } )
    } else if ( selectedKeeper.shareType == 'contact' || selectedKeeper.shareType == 'existingContact' ) {
      props.navigation.navigate( 'TrustedContactHistoryNewBHR', {
        ...navigationParams,
        index,
      } )
    } else if ( selectedKeeper.shareType == 'pdf' ) props.navigation.navigate( 'PersonalCopyHistoryNewBHR', navigationParams )
    else if ( selectedKeeper.shareType == 'securityQuestion' ) props.navigation.navigate( 'SecurityQuestionHistoryNewBHR', navigationParams )
    else if ( selectedKeeper.shareType == 'cloud' ) props.navigation.navigate( 'CloudBackupHistory', navigationParams )
    else if ( selectedKeeper.shareType == 'seed' ) {
      props.navigation.navigate( 'SeedBackupHistory', navigationParams )
    }
    setOnKeeperButtonClick( false )
  }

  useEffect( () => {
    const tempData = []
    let isSeed = false
    levelData.map( ( item, index ) => {
      if ( isSeed ) return
      if ( item.keeper1.status != 'notSetup' || index == 0 ) {
        if ( item.keeper1.shareType == 'seed' || item.keeper1ButtonText == 'Write down Backup Phrase' ) {
          tempData.push( item )
          isSeed = true
          return
        }
        tempData.push( item )
        tempData.push( item )
      }
      else if ( index >= 1 && levelData[ index - 1 ].keeper1.status == 'accessible' && levelData[ index - 1 ].keeper2.status == 'accessible' ) {
        // For Upgrade Functionality
        // setIsUpgrade(true)
      }
    } )
    setLocalLevelData( tempData )
  }, [ levelData ] )

  const onUpgradeClick = () => {
    const tempData = []
    levelData.map( ( item, index ) => {
      if ( item.keeper1.status != 'notSetup' || index == 0 ) {
        tempData.push( item )
        tempData.push( item )
      } else if ( index >= 1 && levelData[ index - 1 ].keeper1.status == 'accessible' && levelData[ index - 1 ].keeper2.status == 'accessible' ) {
        tempData.push( item )
        tempData.push( item )
      }
    } )
    setLocalLevelData( tempData )
    setIsUpgrade( false )
  }

  const getKeeperIcon = ( item, index ) => {
    const shareType = index % 2 == 0 ? item.keeper1.shareType : item.keeper2.shareType
    const status = index % 2 == 0 ? item.keeper1.status : item.keeper2.status
    const valueStatus = item.status
    const updatedAt = index % 2 == 0 ? item.keeper1.updatedAt : item.keeper2.updatedAt
    const chosenContact = index % 2 == 0 ? item.keeper1.data : item.keeper2.data
    switch ( shareType ) {
        case 'seed':
          if ( status == 'notSetup' ) {
            return require( '../../assets/images/icons/seedwords.png' )
          } else {
            return require( '../../assets/images/icons/seedwords.png' )
          }
        case 'securityQuestion':
          if ( status == 'notSetup' ) {
            return require( '../../assets/images/icons/icon_password.png' )
          } else {
            return require( '../../assets/images/icons/icon_password.png' )
          }
        case 'cloud':
          return Platform.OS == 'ios' ? require( '../../assets/images/icons/logo_brand_brands_logos_icloud.png' ) : require( '../../assets/images/icons/icon_google_drive.png' )
        case 'device':
        case 'primaryKeeper':
          if ( status == 'accessible' )
            return require( '../../assets/images/icons/icon_ipad_blue.png' )
          else return Platform.OS == 'ios' ? require( '../../assets/images/icons/icon_secondarydevice.png' ) : require( '../../assets/images/icons/icon_secondarydevice.png' )
        case 'contact':
        case 'existingContact':
          if ( updatedAt != 0 ) {
            if ( chosenContact && chosenContact.displayedName && chosenContact.avatarImageSource ) {
              return {
                uri: chosenContact.avatarImageSource.uri ? chosenContact.avatarImageSource.uri : chosenContact.avatarImageSource
              }
            } else return require( '../../assets/images/icons/icon_user.png' )
          }
          return require( '../../assets/images/icons/icon_contact.png' )
        case 'pdf':
          if ( status == 'accessible' )
            if ( valueStatus == 'notSetup' )
              return require( '../../assets/images/icons/files-and-folders-2.png' )
            else return require( '../../assets/images/icons/files-and-folders-2.png' )
          else require( '../../assets/images/icons/files-and-folders-2.png' )
        default:
          if ( index == 0 )
            return require( '../../assets/images/icons/seedwords.png' )
          else if ( index == 1 )
            return Platform.OS == 'ios' ? require( '../../assets/images/icons/logo_brand_brands_logos_icloud.png' ) : require( '../../assets/images/icons/icon_google_drive.png' )
          else if ( index == 2 )
            return require( '../../assets/images/icons/pexels-photo.png' )
          else if ( index == 3 )
            return require( '../../assets/images/icons/pexels-photo.png' )
          else if ( index == 4 )
            return require( '../../assets/images/icons/pexels-photo.png' )
          else if ( index == 5 )
            return require( '../../assets/images/icons/pexels-photo.png' )
    }
  }

  useEffect( () => {
    const unsubscribe = props.navigation.addListener( 'focus', () => {
      getMessageToShow()
    } )
    return unsubscribe
  }, [] )
  const showBackupMessage = () => {
    const { messageOne, messageTwo, isFirstMessageBold, isError, isInit } = getMessageToShow()
    return (
      <>
        {isFirstMessageBold ? <Text numberOfLines={1} style={{
          fontSize: 12, color: Colors.lightTextColor, fontFamily: Fonts.Light, marginTop: 6, marginStart: 20
        }}><Text style={{
            fontSize: 12, color: Colors.lightTextColor, fontFamily: Fonts.Light, marginTop: 6, marginStart: 20
          }}>{messageOne}</Text>{messageTwo}</Text> : <Text ellipsizeMode="middle" numberOfLines={1} style={{
          fontSize: 12, color: Colors.lightTextColor, fontFamily: Fonts.Light, marginTop: 6, marginStart: 20
        }}>{messageOne} <Text style={{
            fontSize: 12, color: Colors.lightTextColor, fontFamily: Fonts.Light, marginTop: 6, marginStart: 20
          }}>{messageTwo}</Text></Text>}
      </>
    )
  }
  const onChangeSeedWordBackUp = () => {
    let isAccountArchived = false
    let isBalanceFilled = false
    let savingAccountCount = 0

    accountsState?.accountShells?.map( ( item, index ) => {
      if ( item?.primarySubAccount?.type == AccountType.SAVINGS_ACCOUNT ) {
        savingAccountCount++
        localPrimarySubAccount = item.primarySubAccount
        localAccountShell = item
        setAccountShell( localAccountShell )
        setPrimarySubAccount( localPrimarySubAccount )
        if ( item?.primarySubAccount?.balances?.confirmed + item?.primarySubAccount?.balances?.unconfirmed != 0 ) {
          isBalanceFilled = true
        } else if ( item?.primarySubAccount?.visibility == AccountVisibility.ARCHIVED ) {
          isAccountArchived = true
        }
      }
      if ( item?.primarySubAccount?.type == AccountType.CHECKING_ACCOUNT ) {
        const nextFreeAddress = getNextFreeAddress( dispatch,
          accountsState.accounts[ item.primarySubAccount.id ] )
        setCheckingAddress( nextFreeAddress )
      }
    } )
    if ( savingAccountCount > 1 ) {
      setMultipleAcccountModal( true )
    } else if ( isBalanceFilled ) {
      setEmptyAccountErrorModal( true )
    } else if ( isAccountArchived || currentLevel < 2 )
      setSeedBackupModal( true )
    else setShowAccountArchiveModal( true )
  }
  const getMessageToShow = () => {
    if ( levelData[ 0 ].keeper2.updatedAt == 0 && currentLevel == 0 && cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) {
      return {
        isFirstMessageBold: false, messageOne: headerStrings.init, messageTwo: '', isError: false, isInit: true
      }
    }
    if ( levelData ) {
      let messageOneName = ''
      for ( let i = 0; i < levelData.length; i++ ) {
        const element = levelData[ i ]
        if ( element.keeper1.name && element.keeper1.status == 'notAccessible' ) {
          return {
            isFirstMessageBold: true, messageOne: element.keeper1.name, messageTwo: headerStrings.needAttention, isError: true
          }
        }
        if ( element.keeper2.name && element.keeper2.status == 'notAccessible' ) {
          return {
            isFirstMessageBold: true, messageOne: element.keeper2.name, messageTwo: headerStrings.needAttention, isError: true
          }
        }
        if ( element.keeper1.status == 'accessible' && element.keeper1.shareType == 'seed' ) {
          messageOneName = 'Seed ' + headerStrings.backupIsCompleted
        }
        if ( element.keeper2.status == 'accessible' ) {
          messageOneName = element.keeper2.name
        }
      }
      if ( currentLevel == 0 && levelData[ 0 ].keeper1.shareType != 'seed' ) {
        return {
          isFirstMessageBold: false, messageOne: headerStrings.Backupyour, messageTwo: '', isError: true
        }
      } else if ( currentLevel === 1 ) {
        if ( messageOneName ) {
          return {
            isFirstMessageBold: false, messageOne: `${messageOneName} ` + headerStrings.backupIsCompleted, messageTwo: '', isError: false
          }
        }
        return {
          isFirstMessageBold: false, messageOne: Platform.OS == 'ios' ? headerStrings.l1 : headerStrings.l1Drive, messageTwo: '', isError: false
        }
      } else if ( currentLevel === 2 ) {
        return {
          isFirstMessageBold: false, messageOne: headerStrings.l2, messageTwo: '', isError: false
        }
      } else if ( currentLevel == 3 ) {
        return {
          isFirstMessageBold: true, messageOne: headerStrings.l3, messageTwo: '', isError: false
        }
      }
    }
    if ( currentLevel === 1 ) {
      return {
        isFirstMessageBold: false, messageOne: Platform.OS == 'ios' ? headerStrings.l1 : headerStrings.l1Drive, messageTwo: '', isError: false
      }
    } else if ( currentLevel == 0 && levelData[ 0 ].keeper1.shareType == 'seed' ) {
      return {
        isFirstMessageBold: false, messageOne: 'Seed ' + headerStrings.backupIsCompleted, messageTwo: '', isError: true
      }
    } else {
      return {
        isFirstMessageBold: false, messageOne: headerStrings.Backupyour, messageTwo: '', isError: true
      }
    }
  }

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.pop()
            // props.navigation.navigate( 'MoreOptionsContainerScreen' )
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <HeaderTitle
        firstLineTitle={strings[ 'WalletBackup' ]}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      {/* <Text style={{
        fontSize: 16, color: Colors.blue, fontFamily: Fonts.Regular, marginTop: 10, marginStart: 20
      }}>{( levelData && levelData[ 0 ]?.status == 'notSetup' ) ? 'No backup created' : 'Backup created'}</Text> */}
      {/* <Text style={{
        fontSize: 12, color: Colors.lightTextColor, fontFamily: Fonts.Light, marginTop: 6, marginStart: 20
      }}>{levelData[ 0 ].keeper1.shareType == '' || levelData[ 0 ].keeper1.shareType == 'notSetup' ? strings.Backupyour : ( levelData[ 0 ].keeper1.shareType == 'seed' ? 'Seed backup is Completed' : 'Wallet backup not complete' )}</Text> */}
      {/* {showBackupMessage()} */}

      <FlatList
        keyExtractor={( item, index ) => item + index}
        data={localLevelData}
        extraData={localLevelData}
        showsVerticalScrollIndicator={false}
        renderItem={( { item, index } ) => {
          if ( index == 0 && item.keeper1ButtonText == 'Encryption Password' ) {
            return null
          } else {
            const showSeedAcion = ( levelData && ( levelData[ 0 ]?.status != 'notSetup' && levelData[ 0 ]?.keeper1?.shareType !== 'seed' )
              || ( levelData[ 0 ]?.status == 'notSetup' && levelData[ 0 ]?.keeper1?.shareType == KeeperType.SECURITY_QUESTION ) )
            return (
              <AppBottomSheetTouchableWrapper
                style={showSeedAcion ? styles.disableAddModalView : styles.addModalView}
                activeOpacity={showSeedAcion ? 1 : 0}
                onPress={() => onKeeperButtonPress( item, ( ( index % 2 ) + 1 ), showSeedAcion )}
              >
                <View style={styles.modalElementInfoView}>
                  <Image style={{
                    width: 32, height: 32
                  }} resizeMode={'contain'} source={getKeeperIcon( item, index )} />
                  <Text style={{
                    fontSize: 16, color: Colors.blue, fontFamily: Fonts.Regular, marginTop: 10,
                  }}>
                    {index % 2 == 0 ? ( ( item.keeper1ButtonText == 'Seed' ? 'Backup phrase' : ( item.keeper1ButtonText == 'Write down Backup Phrase' ? 'Backup phrase' : item.keeper1ButtonText ) ) || 'Share Recovery Key 1' ) : item.keeper2ButtonText || 'Share Recovery Key 2'}
                  </Text>
                  <Text style={{
                    fontSize: 12, color: Colors.lightTextColor, fontFamily: Fonts.Light, marginTop: 6,
                  }}>{index == 0 && ( item.keeper1ButtonText == 'Seed' || item.keeper1ButtonText == 'Write down Backup Phrase' )
                      ? ( item.keeper1ButtonText == 'Seed' ? 'Wallet backup confirmed' : 'Confirm Backup Phrase to secure your wallet' ) : 'Encrypt and backup wallet on your cloud'}</Text>
                </View>
                {
                  showSeedAcion ?
                    null
                    :
                    <Image source={require( '../../assets/images/icons/icon_arrow.png' )}
                      style={{
                        width: 10,
                        height: 16,
                        alignSelf: 'flex-end',
                        resizeMode: 'contain',
                        marginBottom: 2,
                        // backgroundColor:'red'
                      }}
                    />
                }
              </AppBottomSheetTouchableWrapper>
            )
          }
        }}
      />

      {
        ( levelData && ( levelData[ 0 ]?.status != 'notSetup' && levelData[ 0 ]?.keeper1?.shareType != 'seed' )
          || ( levelData[ 0 ]?.status == 'notSetup' && levelData[ 0 ]?.keeper1?.shareType == KeeperType.SECURITY_QUESTION ) ) &&
        <Shadow viewStyle={{
          ...styles.successModalButtonView,
          backgroundColor: Colors.blue,
        }} distance={2}
        startColor={Colors.shadowBlue}
        offset={[ 40, 24 ]}>
          <AppBottomSheetTouchableWrapper
            onPress={onChangeSeedWordBackUp}
            style={{
              // ...styles.successModalButtonView,
              shadowColor: Colors.shadowBlue,
            }}
            delayPressIn={0}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.white,
              }}
            >
              {'Change to Backup phrase'}
            </Text>
          </AppBottomSheetTouchableWrapper>
        </Shadow>
      }
      <ModalContainer onBackground={() => setKeeperTypeModal( false )} visible={keeperTypeModal} closeBottomSheet={() => setKeeperTypeModal( false )}>
        <KeeperTypeModalContents
          selectedLevelId={selectedLevelId}
          headerText={'Backup Recovery Key'}
          subHeader={strings[ 'saveyourRecovery' ]}
          onPressSetup={async ( type, name ) => {
            try {
              setSelectedKeeperType( type )
              setSelectedKeeperName( name )
              if (
                selectedLevelId == 3 &&
                !isLevelThreeMetaShareCreated &&
                !isLevel3Initialized &&
                currentLevel == 2 &&
                metaSharesKeeper.length != 5
              ) {
                dispatch( generateMetaShare( selectedLevelId ) )
              } else if ( type == 'pdf' ) {
                if ( currentLevel == 0 ) {
                  const obj = {
                    selectedKeeper: {
                      shareType: type,
                      name: name,
                      reshareVersion: 0,
                      status: 'notSetup',
                      updatedAt: 0,
                      shareId: selectedKeeper.shareId,
                      data: {
                      },
                    },
                  }
                  goToHistory( obj, 'TYPE' )
                } else {
                  sendApprovalRequestToPK()
                }
              } else {
                const obj = {
                  selectedKeeper: {
                    shareType: type,
                    name: name,
                    reshareVersion: 0,
                    status: 'notSetup',
                    updatedAt: 0,
                    shareId: selectedKeeper.shareId,
                    data: {
                    },
                  },
                }
                setSelectedKeeper( obj.selectedKeeper )
                setShowLoader( false )
                goToHistory( obj, 'TYPE' )
              }
            } catch ( err ) {
              console.log( 'err', err )
            }
          }}
          onPressBack={() => {
            dispatch( setIsKeeperTypeBottomSheetOpen( false ) )
            setKeeperTypeModal( false )
          }}
        />
      </ModalContainer>

      <ModalContainer onBackground={() => setBackupTypeModal( false )} visible={backupTypeModal}
        closeBottomSheet={() => setBackupTypeModal( false )}>
        <BackupTypeModalContent
          headerText={'Please select backup type'}
          onPressBackupType={async ( onPressBackupType ) => {
            setBackupTypeModal( false )
            if ( onPressBackupType == 1 ) {
              props.navigation.navigate( 'SetNewPassword', {
                isFromManageBackup: true,
              } )
            } else if ( onPressBackupType == 2 ) {
              setSeedBackupModal( true )
            }
          }}
          onPressBack={() => {
            setBackupTypeModal( false )
          }}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => setSeedBackupModal( false )} visible={seedBackupModal}
        closeBottomSheet={() => setSeedBackupModal( false )}>
        <SeedBacupModalContents
          // title={'Backup using \nBackup Phrase'}
          title={'Backup using phrase'}
          // info={'You will be shown 12 English words that you need to write down privately\n\nMake sure you keep them safe'}
          info={'Twelve-word backup phrase (Backup Phrase)\nMake sure you note them down in private and keep them secure.\n'}
          note={'If someone gets access to these, they can withdraw all the funds. If you lose them, you will not be able to restore the wallet'}
          proceedButtonText={'Proceed'}
          bottomBoxInfo={true}
          cancelButtonText={'Cancel'}
          onPressProceed={() => {
            setSeedBackupModal( false )
            props.navigation.navigate( 'BackupSeedWordsContent', {
              from: props.route.params?.from
            } )
          }}
          onPressIgnore={() => setSeedBackupModal( false )}
          isIgnoreButton={true}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => setErrorModal( false )} visible={errorModal} closeBottomSheet={() => setErrorModal( false )}>
        <ErrorModalContents
          title={errorTitle}
          info={errorInfo}
          proceedButtonText={( currentLevel == 0 && levelHealth.length == 0 ) || ( currentLevel == 0 && levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ? 'Proceed To Password' : 'Got it'}
          cancelButtonText={( currentLevel == 0 && levelHealth.length == 0 ) || ( currentLevel == 0 && levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ? 'Got it' : ''}
          isIgnoreButton={( currentLevel == 0 && levelHealth.length == 0 ) || ( currentLevel == 0 && levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ? true : false}
          onPressProceed={() => {
            setErrorModal( false )
            if ( ( currentLevel == 0 && levelHealth.length == 0 ) || ( currentLevel == 0 && levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ) props.navigation.navigate( 'SetNewPassword', {
              isFromManageBackup: true,
            } )
          }}
          onPressIgnore={() => setErrorModal( false )}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => setKnowMoreModal( false )} visible={knowMoreModal} closeBottomSheet={() => setKnowMoreModal( false )} >
        <MBNewBhrKnowMoreSheetContents
          type={knowMoreType}
          titleClicked={() => setKnowMoreModal( false )}
          containerStyle={{
            shadowOpacity: 0,
          }}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => setCloudErrorModal( false )} visible={cloudErrorModal} closeBottomSheet={() => setCloudErrorModal( false )}>
        <ErrorModalContents
          title={strings[ 'CloudBackupError' ]}
          //info={cloudErrorMessage}
          note={errorMsg}
          onPressProceed={() => {
            setCloudErrorModal( false )
            setTimeout( () => {
              setLoaderModal( true )
            }, 500 )
            dispatch( updateCloudData() )
          }}
          onPressIgnore={() => setTimeout( () => { setCloudErrorModal( false ) }, 500 )}
          proceedButtonText={common.tryAgain}
          cancelButtonText={common.ok}
          isIgnoreButton={true}
          isBottomImage={true}
          isBottomImageStyle={{
            width: wp( '27%' ),
            height: wp( '27%' ),
            marginLeft: 'auto',
            resizeMode: 'stretch',
            marginBottom: hp( '-3%' ),
          }}
          bottomImage={require( '../../assets/images/icons/cloud_ilustration.png' )}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => setEmptyAccountErrorModal( false )} visible={emptyAccountErrorModal} closeBottomSheet={() => setEmptyAccountErrorModal( false )}>
        <ErrorModalContents
          title={'Action Required'}
          info={'Please empty and Archive your Savings Account to backup using backup phrase'}
          // note={''}
          onPressProceed={() => {
            setEmptyAccountErrorModal( false )
            dispatch( sourceAccountSelectedForSending( accountShell ) )

            props.navigation.navigate( 'AccountSend', {
              subAccountKind: primarySubAccount.kind,
              accountShellID: accountShell.id,
              fromWallet: true,
              address: checkingAddress
            } )
          }}
          onPressIgnore={() => setTimeout( () => { setEmptyAccountErrorModal( false ) }, 500 )}
          proceedButtonText={'Sweep funds'}
          cancelButtonText={'Not now'}
          isIgnoreButton={true}
          isBottomImage={true}
          isBottomImageStyle={{
            width: wp( '27%' ),
            height: wp( '27%' ),
            marginLeft: 'auto',
            resizeMode: 'stretch',
            marginBottom: hp( '-3%' ),
          }}
        // bottomImage={require( '../../assets/images/icons/cloud_ilustration.png' )}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => setMultipleAcccountModal( false )} visible={multipleAcccountModal} closeBottomSheet={() => setMultipleAcccountModal( false )}>
        <ErrorModalContents
          title={'Action Required'}
          info={'Please empty and archive all your Savings Accounts to use Backup Phrase'}
          // note={''}
          onPressProceed={() => {
            setMultipleAcccountModal( false )
            const resetAction = CommonActions.reset( {
              index: 0,
              routes: [
                {
                  name: 'Home'
                }
              ],
            } )
            props.navigation.dispatch( resetAction )

          }}
          onPressIgnore={() => setTimeout( () => { setMultipleAcccountModal( false ) }, 500 )}
          proceedButtonText={'Ok'}
          cancelButtonText={'Not now'}
          isIgnoreButton={true}
          isBottomImage={true}
          isBottomImageStyle={{
            width: wp( '27%' ),
            height: wp( '27%' ),
            marginLeft: 'auto',
            resizeMode: 'stretch',
            marginBottom: hp( '-3%' ),
          }}
        // bottomImage={require( '../../assets/images/icons/cloud_ilustration.png' )}
        />
      </ModalContainer>
      <ModalContainer visible={showQRModal} closeBottomSheet={() => { }} >
        <QRModal
          isFromKeeperDeviceHistory={false}
          QRModalHeader={'QR scanner'}
          title={common[ 'note' ]}
          infoText={strings[ 'Pleaseapprovethis' ]}
          isOpenedFlag={showQRModal}
          onQrScan={async ( qrScannedData ) => {
            setShowQRModal( true )
            dispatch( setApprovalStatus( false ) )
            dispatch( downloadSMShare( qrScannedData ) )
            setShowQRModal( false )
          }}
          onBackPress={() => setShowQRModal( false )}
          onPressContinue={async () => {
            setShowQRModal( true )
            const qrScannedData = '{"type":"APPROVE_KEEPER","walletName":"Asa","channelId":"59554060913cddb8cca36888affd621fc9939e43f57365cc6e87a0b78d018cad","streamId":"84af9aa6d","secondaryChannelKey":"cjIzFMeQiCjzEtC8piv1qSow","version":"2.0.7","walletId":"30cd144365acc65dc809f5fac231643883d37f256bc9d9d0d09cec5f119b83d9"}'
            dispatch( setApprovalStatus( false ) )
            dispatch( downloadSMShare( qrScannedData ) )
            setShowQRModal( false )
          }}
        />
      </ModalContainer>
      <ModalContainer onBackground={() => setShowAccountArchiveModal( false )} visible={showAccountArchiveModal} closeBottomSheet={() => { }}>
        <AccountArchiveModal
          isError={false}
          onProceed={() => {
            handleAccountArchive()
            // closeArchiveModal()
            setShowAccountArchiveModal( false )
          }}
          onBack={() => setShowAccountArchiveModal( false )}
          onViewAccount={() => setShowAccountArchiveModal( false )}
          account={primarySubAccount}
        />
      </ModalContainer>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  headerTitleText: {
    color: Colors.black,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 16 ),
    // marginBottom: wp( '1%' ),
    alignSelf: 'center',
    marginHorizontal: wp( 2 ),
    letterSpacing: 0.48
  },
  addModalView: {
    backgroundColor: Colors.white,
    paddingVertical: 34,
    paddingHorizontal: 16,
    flexDirection: 'row',
    borderRadius: wp( '4' ),
    marginBottom: hp( '1' ),
    shadowOpacity: 0.16,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 6,
    elevation: 5,
    marginTop: 40,
    marginHorizontal: 20
  },
  disableAddModalView: {
    backgroundColor: Colors.white,
    paddingVertical: 34,
    paddingHorizontal: 16,
    flexDirection: 'row',
    borderRadius: wp( '4' ),
    marginBottom: hp( '1' ),
    marginTop: 25,
    marginHorizontal: 20
  },
  modalElementInfoView: {
    flex: 1,
  },

  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
    letterSpacing: 0.01
  },

  addModalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    marginTop: 5,
    fontFamily: Fonts.Regular
  },
  successModalButtonView: {
    height: wp( '12%' ),
    // minWidth: wp( '22%' ),
    paddingLeft: wp( '5%' ),
    paddingRight: wp( '5%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    // alignSelf: 'center',
    marginLeft: wp( '6%' ),
    marginBottom: hp( '2%' ),
    marginTop: hp( '2%' )
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )

export default WalletBackup
