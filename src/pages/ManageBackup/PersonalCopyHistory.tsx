import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  AsyncStorage,
  Platform,
  Alert,
  PermissionsAndroid
} from 'react-native'
import * as Permissions from 'expo-permissions'
import Fonts from '../../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { getIconByStatus, verifyPersonalCopyAccess } from './utils'
import { useDispatch, useSelector } from 'react-redux'
import {
  checkPDFHealth,
  personalCopyShared,
  generatePersonalCopy,
  personalCopyGenerated,
  pdfHealthChecked,
  pdfHealthCheckFailed,
  calculateOverallHealth,
} from '../../store/actions/sss';
import Colors from '../../common/Colors';
import NavStyles from '../../common/Styles/NavStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BottomSheet from 'reanimated-bottom-sheet';
import ModalHeader from '../../components/ModalHeader';
import HistoryPageComponent from '../../components/HistoryPageComponent';
import PersonalCopyShareModal from '../../components/PersonalCopyShareModal';
import moment from 'moment';
import _ from 'underscore';
import Toast from '../../components/Toast';
import DeviceInfo from 'react-native-device-info';
import ErrorModalContents from '../../components/ErrorModalContents';
import KnowMoreButton from '../../components/KnowMoreButton';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import { SECURE_ACCOUNT } from '../../common/constants/wallet-service-types';
import QRModal from '../Accounts/QRModal';
import S3Service from '../../bitcoin/services/sss/S3Service';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import PersonalCopyHelpContents from '../../components/Helper/PersonalCopyHelpContents';

const PersonalCopyHistory = (props) => {
  const [ErrorBottomSheet] = useState(React.createRef());
  const [HelpBottomSheet] = useState(React.createRef());
  const storagePermissionBottomSheet = useRef<BottomSheet>()
  const [ hasStoragePermission, setHasStoragePermission ] = useState( false )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const [ QrBottomSheet ] = useState( React.createRef() )
  const [ QRModalHeader, setQRModalHeader ] = useState( '' )
  const [ QrBottomSheetsFlag, setQrBottomSheetsFlag ] = useState( false )
  const [ blockReshare, setBlockReshare ] = useState( '' )
  const healthCheckFailed = useSelector(
    ( state ) => state.sss.pdfHealthCheckFailed,
  )
  const s3Service: S3Service = useSelector( ( state ) => state.sss.service )
  const overallHealth = useSelector( ( state ) => state.sss.overallHealth )

  const [ personalCopyHistory, setPersonalCopyHistory ] = useState( [
    {
      id: 1,
      title: 'Recovery Key created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Key in-transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Key accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Key not accessible',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
  ] )
  const [
    PersonalCopyShareBottomSheet,
  ] = useState( React.createRef() )

  const secureAccount: SecureAccount = useSelector(
    ( state ) => state.accounts[ SECURE_ACCOUNT ].service,
  )

  const updateAutoHighlightFlags = props.navigation.getParam(
    'updateAutoHighlightFlags',
  )
  const selectedPersonalCopy = props.navigation.getParam(
    'selectedPersonalCopy',
  )
  const next = props.navigation.getParam( 'next' )
  const healthChecked = useSelector(
    ( state ) => state.sss.loading.pdfHealthChecked,
  )
  const personalCopiesGenerated = useSelector(
    ( state ) => state.sss.personalCopiesGenerated,
  )
  const [ personalCopyDetails, setPersonalCopyDetails ] = useState( null )

  const dispatch = useDispatch()

  const [] = useState(
    React.createRef(),
  )
  useEffect( ()=>  {
    if( Platform.OS === 'ios' ) {
      ( storagePermissionBottomSheet as any ).current.snapTo( 0 )
      setHasStoragePermission( true )
    } else {
      hasStoragePermission
        ? ( storagePermissionBottomSheet as any ).current.snapTo( 0 )
        : ( storagePermissionBottomSheet as any ).current.snapTo( 1 )
    }

  }, [hasStoragePermission]);

  }, [ hasStoragePermission ] )

  useEffect( () => {
    if ( personalCopiesGenerated === false ) {
      Alert.alert(
        'Internal Error',
        'Personal Copy Generation Failed, try again',
      )
    }
  }, [ personalCopiesGenerated ] )

  useEffect( () => {
    if ( healthChecked ) {
      // dispatch(checkMSharesHealth());
      dispatch( calculateOverallHealth() )
      dispatch( pdfHealthChecked( '' ) )
      props.navigation.goBack()
      Toast( 'PDF scanned Successfully' )
    }
  }, [ healthChecked ] )

  useEffect( () => {
    ( async () => {
      const blockPCShare = await AsyncStorage.getItem( 'blockPCShare' )
      if ( blockPCShare ) {
        setBlockReshare( blockPCShare )
      } else if ( !secureAccount.secureHDWallet.secondaryMnemonic ) {
        AsyncStorage.setItem( 'blockPCShare', 'true' )
        setBlockReshare( blockPCShare )
      }
    } )()
  }, [] )

  useEffect( () => {
    if ( healthCheckFailed ) {
      setTimeout( () => {
        setErrorMessageHeader( 'Invalid QR!' )
        setErrorMessage( 'The scanned QR is wrong, please try again' )
      }, 2 );
      ( ErrorBottomSheet as any ).current.snapTo( 1 )
      dispatch( pdfHealthCheckFailed( false ) )
    }
  }, [ healthCheckFailed ] )

  useEffect( () => {
    if ( next ) ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
  }, [ next ] )

  const [ pcShared, setPCShared ] = useState( false )

  const saveInTransitHistory = async () => {
    const index = selectedPersonalCopy.type === 'copy1' ? 3 : 4
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
    if ( next ) {
      props.navigation.goBack()
    }
  }

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
    const index = selectedPersonalCopy.type === 'copy1' ? 3 : 4
    const updatedPersonalCopyHistory = [ ...personalCopyHistory ]
    if ( shareHistory[ index ].createdAt )
      updatedPersonalCopyHistory[ 0 ].date = shareHistory[ index ].createdAt
    if ( shareHistory[ index ].inTransit )
      updatedPersonalCopyHistory[ 1 ].date = shareHistory[ index ].inTransit

    if ( shareHistory[ index ].accessible )
      updatedPersonalCopyHistory[ 2 ].date = shareHistory[ index ].accessible

    if ( shareHistory[ index ].notAccessible )
      updatedPersonalCopyHistory[ 3 ].date = shareHistory[ index ].notAccessible

    setPersonalCopyHistory( updatedPersonalCopyHistory )
  }

  useEffect( () => {
    ( async () => {
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem( 'shareHistory' ),
      )
      if ( shareHistory ) updateHistory( shareHistory )
    } )()
  }, [] )

  const shared = useSelector(
    ( state ) => state.sss.personalCopyShared[ selectedPersonalCopy.type ],
  )

  const generated = useSelector(
    ( state ) => state.sss.personalCopyGenerated[ selectedPersonalCopy.type ],
  )

  useEffect( () => {
    ( async () => {
      let personalCopyDetails = await AsyncStorage.getItem(
        'personalCopyDetails',
      )
      personalCopyDetails = JSON.parse( personalCopyDetails )
      if ( hasStoragePermission && (
        !personalCopyDetails ||
        !personalCopyDetails[ selectedPersonalCopy.type ] ||
        !( await verifyPersonalCopyAccess(
          personalCopyDetails[ selectedPersonalCopy.type ]
        ) ) )
      ) {
        // generate a pdf only if health is less than 100%
        if ( !overallHealth || ( overallHealth && overallHealth.overallStatus < 100 ) ) {
          dispatch( generatePersonalCopy( selectedPersonalCopy ) )
          setPCShared( !!personalCopyDetails[ selectedPersonalCopy.type ].shared )
        }
      } else {
        setPersonalCopyDetails( personalCopyDetails )
      }
    } )()
  }, [ generated, shared, hasStoragePermission ] )

  useEffect( () => {
    if (
      personalCopyDetails &&
      personalCopyDetails[ selectedPersonalCopy.type ] &&
      personalCopyDetails[ selectedPersonalCopy.type ].shared
    ) {
      if ( !pcShared ) setPCShared( true )
      updateAutoHighlightFlags()
    }
  }, [ personalCopyDetails ] )

  useEffect( () => {
    if ( generated === false ) {
      setTimeout( () => {
        setErrorMessageHeader( 'Personal Copy Generation failed' )
        setErrorMessage(
          'There was some error while generating the Personal Copy, please try again',
        )
      }, 2 );
      ( ErrorBottomSheet as any ).current.snapTo( 1 )
      dispatch( personalCopyGenerated( {
        [ selectedPersonalCopy.type ]: null
      } ) )
    }
  }, [ generated ] )

  useEffect( () => {
    if ( shared === false ) {
      setTimeout( () => {
        setErrorMessageHeader( 'PDF Sharing failed' )
        setErrorMessage(
          'There was some error while sharing the Recovery Key, please try again',
        )
      }, 2 );
      ( PersonalCopyShareBottomSheet as any ).current.snapTo( 0 );
      ( ErrorBottomSheet as any ).current.snapTo( 1 )
      dispatch( personalCopyShared( {
        [ selectedPersonalCopy.type ]: null
      } ) )
    }
  }, [ shared ] )

  const renderStoragePermissionModalContent = useCallback( () => {
    checkStoragePermission()
    return (
      <ErrorModalContents
        modalRef={storagePermissionBottomSheet}
        title={'Why do we need access to your files and storage?'}
        info={'File and Storage access will let Hexa save a pdf with your Recovery Keys. This will also let Hexa attach the pdf to emails, messages and to print in case you want to.\n\n'}
        otherText={'Don’t worry these are only sent to the email address you choose, in the next steps you will be able to choose how the pdf is shared.'}
        proceedButtonText={'Continue'}
        isIgnoreButton={false}
        onPressProceed={() => {
          getStoragePermission()
        }}
        onPressIgnore={() => {
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
      />
    )
  }, [] )


  const renderStoragePermissionModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( storagePermissionBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )


  const getStoragePermission = async () => {
    // await checkStoragePermission()
    if ( Platform.OS === 'android' ) {
      const granted = await requestStoragePermission()
      if ( !granted ) {
        setErrorMessage(
          'Cannot access files and storage. Permission denied.\nYou can enable files and storage from the phone settings page \n\n Settings > Hexa > Storage',
        )
        setHasStoragePermission( false );
        ( storagePermissionBottomSheet as any ).current.snapTo( 0 );
        ( ErrorBottomSheet as any ).current.snapTo( 1 )
        return
      }
      else {
        setHasStoragePermission( true )
      }
    }

    if (Platform.OS === 'ios') {
      setHasStoragePermission(true)
      return;
    }
  }

  const requestStoragePermission = async () => {
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

  const checkStoragePermission = async () =>  {
    if( Platform.OS==='android' ) {
      const [ read, write ] = [
        await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE ),
        await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE )
      ]
      if( read && write ) {
        setHasStoragePermission( true )
        return true
      }
      else {
        setHasStoragePermission( false )
        return false
      }
    }

  }

  const renderErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Ok'}
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
      // onPressHeader={() => {
      //   (ErrorBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const renderPersonalCopyShareModalContent = useCallback( () => {
    return (
      <PersonalCopyShareModal
        removeHighlightingFromCard={() => { }}
        selectedPersonalCopy={selectedPersonalCopy}
        personalCopyDetails={personalCopyDetails}
        onPressBack={() => {
          ( PersonalCopyShareBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressShare={() => { }}
        onPressConfirm={async () => {
          const personalCopyDetails = JSON.parse(
            await AsyncStorage.getItem( 'personalCopyDetails' ),
          )
          personalCopyDetails[ selectedPersonalCopy.type ].shared = true
          AsyncStorage.setItem(
            'personalCopyDetails',
            JSON.stringify( personalCopyDetails ),
          )

          setPersonalCopyDetails( personalCopyDetails )
          saveInTransitHistory();
          ( PersonalCopyShareBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [ selectedPersonalCopy, personalCopyDetails ] )

  const renderPersonalCopyShareModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( PersonalCopyShareBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const renderQrContent = useCallback( () => {
    return (
      <QRModal
        QRModalHeader={QRModalHeader}
        title={
          QRModalHeader === 'Confirm Personal Copy'
            ? 'Scan the 1st QR from Personal Copy'
            : 'Scan the Exit Key'
        }
        infoText={
          'Open your PDF copy which is password protected with your Security Question\'s answer'
        }
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onBackPress={() => {
          ( QrBottomSheet.current as any ).snapTo( 0 )
        }}
        onQrScan={async ( qrData ) => {
          if ( QRModalHeader === 'Confirm Personal Copy' ) {
            const index = selectedPersonalCopy.type === 'copy1' ? 3 : 4
            dispatch( checkPDFHealth( qrData, index ) )
          } else if ( QRModalHeader === 'Reshare Personal Copy' ) {
            let restored = false
            try {
              qrData = JSON.parse( qrData )
              if ( qrData.type && qrData.type === 'encryptedExitKey' ) {
                const res = s3Service.decryptStaticNonPMDD(
                  qrData.encryptedExitKey,
                )
                if ( res.status === 200 ) {
                  restored = secureAccount.restoreSecondaryMnemonic(
                    res.data.decryptedStaticNonPMDD.secondaryMnemonic,
                  ).restored
                } else {
                  Alert.alert(
                    'Reshare failed',
                    'Unable to decrypt the exit key',
                  )
                }
              } else {
                restored = secureAccount.restoreSecondaryMnemonic( qrData )
                  .restored
              }
            } catch ( err ) {
              restored = secureAccount.restoreSecondaryMnemonic( qrData )
                .restored
            }

            if ( restored ) {
              setPCShared( false )
              dispatch( generatePersonalCopy( selectedPersonalCopy ) )
              saveInTransitHistory();
              ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
            } else {
              Alert.alert(
                'Invalid Exit Key',
                'Please scan appropriate QR from one of your personal copy',
              )
            }
          }

          setTimeout( () => {
            setQrBottomSheetsFlag( false );
            ( QrBottomSheet.current as any ).snapTo( 0 )
          }, 2 )
        }}
      />
    )
  }, [ QRModalHeader, QrBottomSheetsFlag ] )

  const renderQrHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setTimeout( () => {
            setQrBottomSheetsFlag( false )
          }, 2 );
          ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

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

  const renderHelpContent = () => {
    return (
      <PersonalCopyHelpContents
        titleClicked={() => {
          if ( HelpBottomSheet.current )
            ( HelpBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }



  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView
        style={{
          flex: 0, backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View
        style={NavStyles.modalHeaderTitleView}
      >
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center'
        }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack()
            }}
            hitSlop={{
              top: 20, left: 20, bottom: 20, right: 20
            }}
            style={{
              height: 30, width: 30, justifyContent: 'center'
            }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              // marginLeft: 10,
              marginRight: 10,
            }}
          >
            <Image
              style={{
                width: wp( '9%' ),
                height: wp( '9%' ),
                resizeMode: 'contain',
                alignSelf: 'center',
                marginRight: 8,
              }}
              source={require( '../../assets/images/icons/note.png' )}
            />
            <View style={{
              flex: 1, justifyContent: 'center'
            }}>
              <Text style={NavStyles.modalHeaderTitleText}>
                {'Personal Copy'}
              </Text>
              <Text style={NavStyles.modalHeaderInfoText}>
                Last backup{' '}
                <Text
                  style={{
                    fontFamily: Fonts.FiraSansMediumItalic,
                    fontWeight: 'bold',
                  }}
                >
                  {' '}
                  {props.navigation.state.params.selectedTime}
                </Text>
              </Text>
            </View>
            <KnowMoreButton
              onpress={() => {
                ( HelpBottomSheet as any ).current.snapTo( 1 )
              }}
              containerStyle={{
                marginTop: 'auto',
                marginBottom: 'auto',
                marginRight: 10,
              }}
              textStyle={{
              }}
            />
            <Image
              style={{
                width: pcShared ? 14 : 17,
                height: pcShared ? 16 : 17,
                resizeMode: 'contain',
                marginLeft: 'auto',
                alignSelf: 'center',
              }}
              source={
                pcShared
                  ? getIconByStatus(
                    props.navigation.state.params.selectedStatus,
                  )
                  : require( '../../assets/images/icons/icon_error_gray.png' )
              }
            />
          </View>
        </View>
      </View>
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          type={'copy'}
          // IsReshare
          IsReshare={pcShared ? true : false}
          data={sortedHistory( personalCopyHistory )}
          reshareInfo={
            pcShared
              ? 'Want to send the Recovery Key again to the same destination? '
              : null
          }
          onPressConfirm={() => {
            setTimeout( () => {
              setQRModalHeader( 'Confirm Personal Copy' )
            }, 2 );
            ( QrBottomSheet.current as any ).snapTo( 1 )
          }}
          onPressReshare={async () => {
            if ( blockReshare ) {
              setTimeout( () => {
                setQRModalHeader( 'Reshare Personal Copy' )
              }, 2 );
              ( QrBottomSheet.current as any ).snapTo( 1 )
            } else {
              ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
            }
          }}
          onPressContinue={() => {
            ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
          }}
        />
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={PersonalCopyShareBottomSheet as any}
        snapPoints={[ -50, hp( '85%' ) ]}
        renderContent={renderPersonalCopyShareModalContent}
        renderHeader={renderPersonalCopyShareModalHeader}
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
        enabledInnerScrolling={true}
        ref={storagePermissionBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '55%' ) : hp( '60%' ),
        ]}
        renderContent={renderStoragePermissionModalContent}
        renderHeader={renderStoragePermissionModalHeader}
      />
    </View>
  )
}

export default PersonalCopyHistory
