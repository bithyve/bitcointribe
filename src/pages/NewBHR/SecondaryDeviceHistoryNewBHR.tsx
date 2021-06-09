import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import { createChannelAssets, createOrChangeGuardian, downloadSMShare, ErrorSending, setApprovalStatus, setChannelAssets, updatedKeeperInfo } from '../../store/actions/health'
import { updateMSharesHealth } from '../../store/actions/health'
import Colors from '../../common/Colors'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../../components/ModalHeader'
import HistoryPageComponent from './HistoryPageComponent'
import SecondaryDevice from './SecondaryDeviceNewBHR'
import moment from 'moment'
import _ from 'underscore'
import ErrorModalContents from '../../components/ErrorModalContents'
import DeviceInfo from 'react-native-device-info'
import {
  ChannelAssets,
  KeeperInfoInterface,
  Keepers,
  LevelHealthInterface,
  MetaShare,
  QRCodeTypes,
  TrustedContact,
  Trusted_Contacts,
} from '../../bitcoin/utilities/Interface'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import config from '../../bitcoin/HexaConfig'
import QRModal from '../Accounts/QRModal'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import KeeperDeviceHelpContents from '../../components/Helper/KeeperDeviceHelpContents'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import ApproveSetup from './ApproveSetup'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import semver from 'semver'
import { v4 as uuid } from 'uuid'
import SSS from '../../bitcoin/utilities/sss/SSS'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { historyArray } from '../../common/CommonVars/commonVars'

const SecondaryDeviceHistoryNewBHR = ( props ) => {
  const [ ErrorBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ HelpBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ QrBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ keeperTypeBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ ApprovePrimaryKeeperBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ ReshareBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ ChangeBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ secondaryDeviceBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ secondaryDeviceMessageBottomSheet ] = useState( React.createRef<BottomSheet>() )

  const [ oldChannelKey, setOldChannelKey ] = useState( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  const [ channelKey, setChannelKey ] = useState( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const [ QrBottomSheetsFlag, setQrBottomSheetsFlag ] = useState( false )
  const [ blockReshare, setBlockReshare ] = useState( '' )
  const [ selectedKeeperType, setSelectedKeeperType ] = useState( '' )
  const [ selectedKeeperName, setSelectedKeeperName ] = useState( '' )
  const [ isGuardianCreationClicked, setIsGuardianCreationClicked ] = useState( false )
  const [ isVersionMismatch, setIsVersionMismatch ] = useState( false )
  const [ secondaryQR, setSecondaryQR ] = useState( '' )
  const [ secondaryDeviceHistory, setSecondaryDeviceHistory ] = useState( historyArray )
  const [ selectedLevelId, setSelectedLevelId ] = useState( props.navigation.getParam( 'selectedLevelId' ) )
  const [ selectedKeeper, setSelectedKeeper ] = useState( props.navigation.getParam( 'selectedKeeper' ) )
  const [ isReshare, setIsReshare ] = useState( props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ? false : true )
  const [ isChange, setIsChange ] = useState( props.navigation.state.params.isChangeKeeperType
    ? props.navigation.state.params.isChangeKeeperType
    : false )
  const [ Contact, setContact ]: [any, any] = useState( null )

  const keeperInfo = useSelector( ( state ) => state.health.keeperInfo )
  const keeperProcessStatusFlag = useSelector( ( state ) => state.health.keeperProcessStatus )
  const isErrorSendingFailed = useSelector( ( state ) => state.health.errorSending )
  const approvalStatus = useSelector( ( state ) => state.health.approvalStatus )
  const WALLET_SETUP = useSelector( ( state ) => state.storage.database.WALLET_SETUP )
  const trustedContacts: TrustedContactsService = useSelector( ( state ) => state.trustedContacts.service )
  const levelHealth:LevelHealthInterface[] = useSelector( ( state ) => state.health.levelHealth )
  const currentLevel = useSelector( ( state ) => state.health.currentLevel )
  const channelAssets: ChannelAssets = useSelector( ( state ) => state.health.channelAssets )
  const createChannelAssetsStatus = useSelector( ( state ) => state.health.loading.createChannelAssetsStatus )
  const MetaShares: MetaShare[] = useSelector( ( state ) => state.health.service.levelhealth.metaSharesKeeper )
  const dispatch = useDispatch()

  const index = props.navigation.getParam( 'index' )
  const isChangeKeeperAllow = props.navigation.getParam( 'isChangeKeeperAllow' )
  const next = props.navigation.getParam( 'next' )

  useEffect( () => {
    setSelectedLevelId( props.navigation.getParam( 'selectedLevelId' ) )
    setSelectedKeeper( props.navigation.getParam( 'selectedKeeper' ) )
    setIsReshare( props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ? false : true )
    setIsChange(
      props.navigation.getParam( 'isChangeKeeperType' )
        ? props.navigation.getParam( 'isChangeKeeperType' )
        : false
    )
    setChannelKey( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
    setOldChannelKey( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  }, [ props.navigation.state.params ] )

  useEffect( ()=>{
    const firstName = 'Personal'
    let lastName = 'Device'
    if( index === 0 ) lastName = 'Device1'
    else if( index === 3 ) lastName = 'Device2'
    else lastName = 'Device3'

    const Contact = {
      id: uuid(),
      name: `${firstName} ${lastName ? lastName : ''}`
    }
    setContact( selectedKeeper.data && selectedKeeper.data.id ? selectedKeeper.data : Contact )
  }, [ ] )

  const saveInTransitHistory = async () => {
    const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
    if ( shareHistory ) {
      const updatedShareHistory = [ ...shareHistory ]
      updatedShareHistory[ index ] = {
        ...updatedShareHistory[ index ],
        inTransit: Date.now(),
      }
      updateHistory( updatedShareHistory )
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify( updatedShareHistory ),
      )
    }
  }

  const createGuardian = useCallback(
    async ( ) => {
      if( ( secondaryQR || isReshare ) && !isChange ) return
      setIsGuardianCreationClicked( true )
      setChannelKey( channelKey ? channelKey : SSS.generateKey( config.CIPHER_SPEC.keyLength ) )
      const obj: KeeperInfoInterface = {
        shareId: selectedKeeper.shareId,
        name: Contact && Contact.name ? Contact.name : '',
        type: 'device',
        scheme: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme,
        currentLevel: currentLevel,
        createdAt: moment( new Date() ).valueOf(),
        sharePosition: MetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId ),
        data: {
          ...Contact, index
        },
        channelKey: channelKey ? channelKey : SSS.generateKey( config.CIPHER_SPEC.keyLength )
      }
      dispatch( updatedKeeperInfo( obj ) )
      dispatch( createChannelAssets( selectedKeeper.shareId ) )
    },
    [ trustedContacts, Contact ],
  )

  useEffect( ()=> {
    if( !createChannelAssetsStatus && channelAssets.shareId == selectedKeeper.shareId ){
      const channelKey: string = selectedKeeper.channelKey ? selectedKeeper.channelKey : SSS.generateKey( config.CIPHER_SPEC.keyLength )
      dispatch( createOrChangeGuardian( channelKey, selectedKeeper.shareId, Contact, index, isChange, oldChannelKey ) )
    }
  }, [ createChannelAssetsStatus, channelAssets ] )

  useEffect( () => {
    if( !Contact ) return

    const contacts: Trusted_Contacts = trustedContacts.tc.trustedContacts
    let currentContact: TrustedContact
    let channelKey: string

    if( contacts )
      for( const ck of Object.keys( contacts ) ){
        if ( contacts[ ck ].contactDetails.id === Contact.id ){
          currentContact = contacts[ ck ]
          channelKey = ck
          break
        }
      }

    if ( currentContact ) {
      const { secondaryChannelKey } = currentContact
      const appVersion = DeviceInfo.getVersion()

      setSecondaryQR(
        JSON.stringify( {
          type: QRCodeTypes.KEEPER_REQUEST,
          channelKey,
          walletName: WALLET_SETUP.walletName,
          secondaryChannelKey,
          version: appVersion,
        } ),
      )
      if( isGuardianCreationClicked ) {
        const shareObj = {
          walletId: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.walletId,
          shareId: selectedKeeper.shareId,
          reshareVersion: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion,
          shareType: 'device',
          status: 'notAccessible',
          name: Contact && Contact.name ? Contact.name : ''
        }
        dispatch( updateMSharesHealth( shareObj, false ) )
        dispatch( setChannelAssets( {
        } ) )
      }
    }
  }, [ Contact, trustedContacts ] )

  useEffect( () => {
    ( async () => {
      // if( props.navigation.getParam( 'selectedKeeper' ).updatedAt === 0 ) {
      //   ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
      //   createGuardian()
      // }
      // blocking keeper reshare till 100% health
      const blockPCShare = await AsyncStorage.getItem( 'blockPCShare' )
      if ( blockPCShare ) {
        setBlockReshare( blockPCShare )
      }
      const trustedContactsInfo: Keepers = trustedContacts.tc.trustedContacts
      const contactName = props.navigation.getParam( 'selectedKeeper' ).name.toLowerCase().trim()
      const trustedData = trustedContactsInfo[ contactName ]

      console.log( 'trustedData.trustedChannel', trustedData.trustedChannel.data[ 1 ] )
      if( trustedData && trustedData.trustedChannel && trustedData.trustedChannel.data.length == 2 ){
        if( trustedData.trustedChannel.data[ 1 ] && semver.lt( trustedData.trustedChannel.data[ 1 ].data.version, '1.6.0' ) ) {
          setTimeout( () => {
            setErrorMessageHeader( 'Error sending Recovery Key' )
            setErrorMessage(
              'your keeper need to update app / come online',
            )
            setIsVersionMismatch( true )
          }, 2 );
          ( ErrorBottomSheet as any ).current.snapTo( 1 )
        }
      }

      console.log( 'trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel', trustedContacts.tc.trustedContacts, props.navigation.getParam( 'selectedKeeper' ) )
      // else if (!secureAccount.secureHDWallet.secondaryMnemonic) {
      //   AsyncStorage.setItem('blockPCShare', 'true');
      //   setBlockReshare(blockPCShare);
      // }
    } )()
  }, [] )


  const renderSecondaryDeviceContents = useCallback( () => {
    console.log( secondaryQR )
    return (
      <SecondaryDevice
        secondaryQR={secondaryQR}
        onPressOk={async () => {
          saveInTransitHistory();
          // dispatch(checkMSharesHealth());
          ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
          if ( next ) {
            props.navigation.goBack()
          }
          setTimeout( () => {
            setIsReshare( true )
          }, 2 )
        }}
        onPressBack={() => {
          ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [ secondaryQR ] )

  const renderSecondaryDeviceHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const renderSecondaryDeviceMessageContents = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={secondaryDeviceMessageBottomSheet}
        title={'Keeper Device'}
        note={
          'For confirming your Recovery Key on the Keeper Device, simply open the app on that device and log in'
        }
        proceedButtonText={'Ok, got it'}
        onPressProceed={() => {
          if ( secondaryDeviceMessageBottomSheet.current )
            ( secondaryDeviceMessageBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressIgnore={() => {
          if ( secondaryDeviceMessageBottomSheet.current )
            ( secondaryDeviceMessageBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  }, [] )

  const renderSecondaryDeviceMessageHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (secondaryDeviceMessageBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  useEffect( () => {
    if ( next ) ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
  }, [ next ] )

  const sortedHistory = ( history ) => {
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
  }

  const updateHistory = ( shareHistory ) => {
    const updatedSecondaryHistory = [ ...secondaryDeviceHistory ]
    if ( shareHistory[ index ].createdAt )
      updatedSecondaryHistory[ 0 ].date = shareHistory[ index ].createdAt
    if ( shareHistory[ index ].inTransit )
      updatedSecondaryHistory[ 1 ].date = shareHistory[ index ].inTransit

    if ( shareHistory[ index ].accessible )
      updatedSecondaryHistory[ 2 ].date = shareHistory[ index ].accessible

    if ( shareHistory[ index ].notAccessible )
      updatedSecondaryHistory[ 3 ].date = shareHistory[ index ].notAccessible
    setSecondaryDeviceHistory( updatedSecondaryHistory )
  }

  useEffect( () => {
    ( async () => {
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem( 'shareHistory' ),
      )
      if ( shareHistory[ index ].inTransit || shareHistory[ index ].accessible ) {
        setIsReshare( true )
      }
      if ( shareHistory ) updateHistory( shareHistory )
    } )()
  }, [] )

  const renderErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          ( ErrorBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage, errorMessageHeader ] )

  const renderErrorModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( ErrorBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  useEffect( () => {
    if ( isErrorSendingFailed ) {
      setTimeout( () => {
        setErrorMessageHeader( 'Error sending Recovery Key' )
        setErrorMessage(
          'There was an error while sending your Recovery Key, please try again in a little while',
        )
      }, 2 );
      ( ErrorBottomSheet as any ).current.snapTo( 1 )
      dispatch( ErrorSending( null ) )
    }
  }, [ isErrorSendingFailed ] )

  const renderHelpHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if ( HelpBottomSheet.current )
            ( HelpBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  const renderReshareContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={'Reshare with the same device?'}
        info={
          'Proceed if you want to reshare the link/ QR with the same device'
        }
        note={
          'For a different device, please go back and choose ‘Change device'
        }
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          ( ReshareBottomSheet as any ).current.snapTo( 0 )

          if ( blockReshare ) {
            ( QrBottomSheet.current as any ).snapTo( 1 )
          } else {
            ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
            createGuardian()
          }
        }}
        onPressIgnore={() => {
          ( ReshareBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  }, [] )

  const renderReshareHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (ReshareBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const renderChangeContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ChangeBottomSheet}
        title={'Change your\nKeeper'}
        info={'Having problems with your Keeper'}
        note={
          'You can change the Keeper you selected to send your Recovery Key'
        }
        proceedButtonText={'Change'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          ( ChangeBottomSheet as any ).current.snapTo( 0 )

          if ( blockReshare ) {
            ( QrBottomSheet.current as any ).snapTo( 1 )
          } else {
            const changeKeeper = true;
            ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
            createGuardian( )
          }
        }}
        onPressIgnore={() => {
          ( ChangeBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  }, [] )

  const renderChangeHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (ChangeBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const renderHelpContent = () => {
    return (
      <KeeperDeviceHelpContents
        titleClicked={() => {
          if ( HelpBottomSheet.current )
            ( HelpBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  if ( isErrorSendingFailed ) {
    setTimeout( () => {
      setErrorMessageHeader( 'Error sending Recovery Key' )
      setErrorMessage(
        'There was an error while sending your Recovery Key, please try again in a little while',
      )
    }, 2 );
    ( ErrorBottomSheet as any ).current.snapTo( 1 )
    dispatch( ErrorSending( null ) )
  }

  const sendApprovalRequestToPK = ( ) => {
    setQrBottomSheetsFlag( true );
    ( QrBottomSheet as any ).current.snapTo( 1 );
    ( keeperTypeBottomSheet as any ).current.snapTo( 0 )
  }

  const renderQrContent = () => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={false}
        QRModalHeader={'QR scanner'}
        title={'Note'}
        infoText={
          'Please approve this request by scanning the Secondary Key stored with any of the other backups'
        }
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={async( qrScannedData ) => {
          dispatch( setApprovalStatus( false ) )
          dispatch( downloadSMShare( qrScannedData ) )
          setQrBottomSheetsFlag( false )
        }}
        onBackPress={() => {
          setQrBottomSheetsFlag( false )
          if ( QrBottomSheet ) ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressContinue={async() => {
          const qrScannedData = '{"type":"RECOVERY_REQUEST","walletName":"wfewf","channelId":"a337c486c67add6d9cf45efecd94a31734296217b4c8f22fe2c8421b5054f9bd","streamId":"be91dcfa8","secondaryChannelKey":"iYpMjQbvjYZk7hImD1nyOvyY","version":"1.7.5"}'
          try {
            if ( qrScannedData ) {
              dispatch( setApprovalStatus( false ) )
              dispatch( downloadSMShare( qrScannedData ) )
              setQrBottomSheetsFlag( false )
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

  const renderQrHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setQrBottomSheetsFlag( false );
          ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  const onPressChangeKeeperType = ( type, name ) => {
    let levelhealth: LevelHealthInterface[] = []
    if ( levelHealth[ 1 ] && levelHealth[ 1 ].levelInfo.findIndex( ( v ) => v.updatedAt > 0 ) > -1 )
      levelhealth = [ levelHealth[ 1 ] ]
    if ( levelHealth[ 2 ] && levelHealth[ 2 ].levelInfo.findIndex( ( v ) => v.updatedAt > 0 ) > -1 )
      levelhealth = [ levelHealth[ 1 ], levelHealth[ 2 ] ]
    if ( currentLevel == 3 && levelHealth[ 2 ] )
      levelhealth = [ levelHealth[ 2 ] ]
    let changeIndex = 1
    let contactCount = 0
    let deviceCount = 0
    for ( let i = 0; i < levelhealth.length; i++ ) {
      const element = levelhealth[ i ]
      for ( let j = 2; j < element.levelInfo.length; j++ ) {
        const element2 = element.levelInfo[ j ]
        if (
          element2.shareType == 'contact' &&
          selectedKeeper &&
          selectedKeeper.shareId != element2.shareId &&
          levelhealth[ i ]
        ) {
          contactCount++
        }
        if (
          element2.shareType == 'device' &&
          selectedKeeper &&
          selectedKeeper.shareId != element2.shareId &&
          levelhealth[ i ]
        ) {
          deviceCount++
        }
        const kpInfoContactIndex = keeperInfo.findIndex( ( value ) => value.shareId == element2.shareId && value.type == 'contact' )
        if ( type == 'contact' && element2.shareType == 'contact' && contactCount < 2 ) {
          if ( kpInfoContactIndex > -1 && keeperInfo[ kpInfoContactIndex ].data.index == 1 ) {
            changeIndex = 2
          } else changeIndex = 1
        }
        if( type == 'device' ){
          if ( element2.shareType == 'device' && deviceCount == 1 ) {
            changeIndex = 3
          } else if( element2.shareType == 'device' && deviceCount == 2 ){
            changeIndex = 4
          }
        }
      }
    }
    if ( type == 'contact' ) {
      props.navigation.navigate( 'TrustedContactHistoryNewBHR', {
        ...props.navigation.state.params,
        selectedTitle: name,
        index: changeIndex,
        isChangeKeeperType: true,
      } )
    }
    if ( type == 'device' ) {
      ( ChangeBottomSheet as any ).current.snapTo( 1 )
    }
    if ( type == 'pdf' ) {
      props.navigation.navigate( 'PersonalCopyHistoryNewBHR', {
        ...props.navigation.state.params,
        selectedTitle: name,
        isChangeKeeperType: true,
      } )
    }
  }

  useEffect( ()=>{
    if( approvalStatus ){
      ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 1 );
      ( QrBottomSheet as any ).current.snapTo( 0 )
    }
  }, [ approvalStatus ] )

  useEffect( ()=> {
    if( isChange && channelAssets.shareId && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( setApprovalStatus( true ) )
    }
  }, [ channelAssets ] )

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView style={{
        flex: 0, backgroundColor: Colors.backgroundColor
      }}/>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <HistoryHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={props.navigation.state.params.selectedTitle}
        selectedTime={selectedKeeper.updatedAt
          ? getTime( selectedKeeper.updatedAt )
          : 'never'}
        moreInfo={props.navigation.state.params.selectedTitle}
        headerImage={require( '../../assets/images/icons/icon_secondarydevice.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          type={'secondaryDevice'}
          IsReshare={isReshare}
          data={sortedHistory( secondaryDeviceHistory )}
          confirmButtonText={'Share Now'}
          onPressConfirm={() => {
            ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
            createGuardian()
          }}
          reshareButtonText={'Reshare'}
          onPressReshare={async () => {
            ( ReshareBottomSheet as any ).current.snapTo( 1 )
          }}
          changeButtonText={'Change'}
          isChangeKeeperAllow={isChangeKeeperAllow}
          isVersionMismatch={isVersionMismatch}
          onPressChange={() => { ( keeperTypeBottomSheet as any ).current.snapTo( 1 ) }}
        />
      </View>
      <BottomSheet
        onCloseEnd={() => {
          if( keeperProcessStatusFlag == KeeperProcessStatus.COMPLETED ){
            saveInTransitHistory();
            ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
            if ( next ) {
              props.navigation.goBack()
            }
            setTimeout( () => {
              setIsReshare( true )
            }, 2 )
          }
        }}
        onCloseStart={() => {
          ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
        }}
        enabledInnerScrolling={true}
        ref={secondaryDeviceBottomSheet as any}
        snapPoints={[ -30, hp( '85%' ) ]}
        renderContent={renderSecondaryDeviceContents}
        renderHeader={renderSecondaryDeviceHeader}
      />
      <BottomSheet
        onCloseStart={() => {
          ( secondaryDeviceMessageBottomSheet.current as any ).current.snapTo( 0 )
        }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={secondaryDeviceMessageBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderSecondaryDeviceMessageContents}
        renderHeader={renderSecondaryDeviceMessageHeader}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
      <BottomSheet
        onOpenEnd={() => {
          setQrBottomSheetsFlag( true )
        }}
        onCloseEnd={() => {
          setQrBottomSheetsFlag( false );
          ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
        onCloseStart={() => { }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={QrBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '92%' ) : hp( '91%' ),
        ]}
        renderContent={renderQrContent}
        renderHeader={renderQrHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={HelpBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '87%' ) : hp( '89%' ),
        ]}
        renderContent={renderHelpContent}
        renderHeader={renderHelpHeader}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ReshareBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ]}
        renderContent={renderReshareContent}
        renderHeader={renderReshareHeader}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ChangeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ]}
        renderContent={renderChangeContent}
        renderHeader={renderChangeHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={keeperTypeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp( '75%' )
            : hp( '75%' ),
        ]}
        renderContent={() => (
          <KeeperTypeModalContents
            headerText={'Change backup method'}
            subHeader={'Share your Recovery Key with a new contact or a different device'}
            onPressSetup={async ( type, name ) => {
              setSelectedKeeperType( type )
              setSelectedKeeperName( name )
              sendApprovalRequestToPK( )
            }}
            onPressBack={() =>
              ( keeperTypeBottomSheet as any ).current.snapTo( 0 )
            }
            selectedLevelId={selectedLevelId}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() =>
              ( keeperTypeBottomSheet as any ).current.snapTo( 0 )
            }
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ApprovePrimaryKeeperBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '60%' ) : hp( '70' ),
        ]}
        renderContent={() => (
          <ApproveSetup
            isContinueDisabled={!approvalStatus}
            onPressContinue={() => {
              onPressChangeKeeperType( selectedKeeperType, selectedKeeperName );
              ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 0 )
            }}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() => {
              ( keeperTypeBottomSheet as any ).current.snapTo( 1 );
              ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 0 )
            }}
          />
        )}
      />
    </View>
  )
}

export default SecondaryDeviceHistoryNewBHR
