import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Image,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Fonts from '../../common/Fonts'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Feather from 'react-native-vector-icons/Feather'
import HeaderTitle from '../../components/HeaderTitle'
import RequestModalContents from '../../components/RequestModalContents'
import TransparentHeaderModal from '../../components/TransparentHeaderModal'
import Entypo from 'react-native-vector-icons/Entypo'
import RecoverySuccessModalContents from '../../components/RecoverySuccessModalContents'
import ErrorModalContents from '../../components/ErrorModalContents'
import { useDispatch, useSelector } from 'react-redux'
import {
  downloadMShare,
  recoverWallet,
  walletRecoveryFailed,
  ErrorReceiving,
} from '../../store/actions/sss'
import ModalHeader from '../../components/ModalHeader'
import RestoreByCloudQRCodeContents from './RestoreByCloudQRCodeContents'

import LoaderModal from '../../components/LoaderModal'
import { MetaShare } from '../../bitcoin/utilities/Interface'
import { walletCheckIn } from '../../store/actions/trustedContacts'
import { setVersion } from '../../store/actions/versionHistory'

export default function RestoreSelectedContactsList( props ) {
  const [ SecondaryDeviceRS, setSecondaryDeviceRS ] = useState( null )
  const [ message ] = useState( 'Creating your wallet' )
  const [ Elevation, setElevation ] = useState( 10 )
  const [ selectedContacts, setSelectedContacts ] = useState( [] )
  const [ selectedDocuments, setSelectedDocuments ] = useState( [] )
  const [ walletNameOpenModal ] = useState( 'close' )
  const [ openmodal, setOpenmodal ] = useState( 'closed' )

  const loaderBottomSheet = useRef<BottomSheet>()
  const requestBottomSheet = useRef<BottomSheet>()
  const walletNameBottomSheet = useRef<BottomSheet>()
  const successMessageBottomSheet = useRef<BottomSheet>()
  const recoveryQuestionBottomSheet = useRef<BottomSheet>()
  const ErrorBottomSheet = useRef<BottomSheet>()
  const RestoreByCloudQrCode = useRef<BottomSheet>()

  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const { downloadMetaShare } = useSelector( ( state ) => state.sss.loading )

  const isWalletRecoveryFailed = useSelector(
    ( state ) => state.sss.walletRecoveryFailed,
  )
  const isErrorReceivingFailed = useSelector(
    ( state ) => state.sss.errorReceiving,
  )

  const [ exchangeRates, setExchangeRates ] = useState()
  const accounts = useSelector( ( state ) => state.accounts )

  const dispatch = useDispatch()

  const { DECENTRALIZED_BACKUP, SERVICES } = useSelector(
    ( state ) => state.storage.database,
  )

  const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP

  const SD_META_SHARE = RECOVERY_SHARES[ 0 ]
    ? RECOVERY_SHARES[ 0 ].META_SHARE
    : null

  const [ metaShares, setMetaShares ] = useState( [] )

  useEffect( () => {
    let temp = null
    // onPullDown();
    const focusListener = props.navigation.addListener( 'didFocus', () => {
      getSelectedContactList()
      temp = setInterval( () => {
        // onPullDown();
      }, 30000 )
    } )
    const focusListener1 = props.navigation.addListener( 'didBlur', () => {
      getSelectedContactList()
      clearInterval( temp )
    } )
    return () => {
      focusListener.remove()
      focusListener1.remove()
    }
  }, [] )

  useEffect( () => {
    if ( walletNameOpenModal == 'closed' ) {
      ( walletNameBottomSheet as any ).current.snapTo( 0 )
    }
    if ( walletNameOpenModal == 'half' ) {
      ( walletNameBottomSheet as any ).current.snapTo( 1 )
    }
    if ( walletNameOpenModal == 'full' ) {
      ( walletNameBottomSheet as any ).current.snapTo( 2 )
    }
  }, [ walletNameOpenModal ] )

  const getSelectedContactList = async () => {
    const contactList = await AsyncStorage.getItem( 'selectedContacts' )
    if ( contactList ) {
      setSelectedContacts( JSON.parse( contactList ) )
    }
    const documentList = await AsyncStorage.getItem( 'selectedDocuments' )
    if ( documentList ) {
      setSelectedDocuments( JSON.parse( documentList ) )
    }
  }

  const onPressRequest = async () => {
    const selectedContacts = JSON.parse(
      await AsyncStorage.getItem( 'selectedContacts' ),
    )
    if ( !selectedContacts[ 0 ].status && !selectedContacts[ 1 ].status ) {
      selectedContacts[ 1 ].status = 'received'
    } else if ( selectedContacts[ 1 ].status == 'received' ) {
      selectedContacts[ 0 ].status = 'inTransit'
      selectedContacts[ 1 ].status = 'rejected'
    }
    AsyncStorage.setItem( 'selectedContacts', JSON.stringify( selectedContacts ) )
    getSelectedContactList();
    ( requestBottomSheet as any ).current.snapTo( 0 )
  }

  const RequestModalContentFunction = () => {
    return (
      <RequestModalContents
        onPressRequest={() => onPressRequest()}
        onPressViaQr={() => {}}
      />
    )
  }

  const RequestHeaderFunction = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          ( requestBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  function renderHeader() {
    return <TransparentHeaderModal onPressheader={() => closeModal()} />
  }

  const renderLoaderModalContent = () => {
    return (
      <LoaderModal
        headerText={message}
        messageText={
          'This may take some time while Hexa is using the Recovery Keys to recreate your wallet'
        }
      />
    )
  }

  const renderLoaderModalHeader = () => {
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

  function closeModal() {
    ( successMessageBottomSheet as any ).current.snapTo( 0 );
    ( recoveryQuestionBottomSheet as any ).current.snapTo( 0 );
    ( walletNameBottomSheet.current as any ).snapTo( 0 )
    return
  }

  function renderSuccessContent() {
    return (
      <RecoverySuccessModalContents
        walletName={'Pam’s Wallet'}
        walletAmount={'2,065,000'}
        walletUnit={'sats'}
        onPressGoToWallet={() => {
          props.navigation.navigate( 'Home' )
        }}
      />
    )
  }

  const handleDocuments = async () => {
    const selectedDocuments = JSON.parse(
      await AsyncStorage.getItem( 'selectedDocuments' ),
    )
    if ( !selectedDocuments[ 0 ].status ) {
      selectedDocuments[ 0 ].status = 'rejected'
    } else if ( selectedDocuments[ 0 ].status == 'rejected' ) {
      selectedDocuments[ 0 ].status = 'received'
    }
    AsyncStorage.setItem(
      'selectedDocuments',
      JSON.stringify( selectedDocuments ),
    )
    getSelectedContactList()
  }

  const renderErrorModalContent1 = useCallback( () => {
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

  const renderErrorModalHeader1 = useCallback( () => {
    return <ModalHeader />
  }, [] )

  useEffect( () => {
    if ( isWalletRecoveryFailed ) {
      setTimeout( () => {
        setErrorMessageHeader( 'Error recovering your wallet!' )
        setErrorMessage(
          'There was an error while recovering your wallet (incompatible recovery shares), please try again',
        )
      }, 2 );
      ( ErrorBottomSheet as any ).current.snapTo( 1 );
      ( loaderBottomSheet as any ).current.snapTo( 0 )

      dispatch( walletRecoveryFailed( null ) )
    }
  }, [ isWalletRecoveryFailed ] )

  useEffect( () => {
    if ( isErrorReceivingFailed ) {
      setErrorMessageHeader( 'Error receiving Recovery Key' )
      setErrorMessage(
        'There was an error while receiving your Recovery Key, please try again',
      )

      setTimeout( () => {
        ( ErrorBottomSheet as any ).current.snapTo( 1 )
      }, 2 )
      dispatch( ErrorReceiving( null ) )
    }
  }, [ isErrorReceivingFailed ] )

  useEffect( () => {
    const shares: MetaShare[] = []
    Object.keys( RECOVERY_SHARES ).forEach( ( key ) => {
      const META_SHARE: MetaShare = RECOVERY_SHARES[ key ].META_SHARE
      if ( META_SHARE ) {
        let insert = true
        shares.forEach( ( share ) => {
          if ( share.shareId === META_SHARE.shareId ) insert = false
        }, [] )

        if ( insert ) shares.push( META_SHARE )
      }
    } )
    if ( shares.length ) setMetaShares( shares )
  }, [ RECOVERY_SHARES, selectedDocuments ] )

  useEffect( () => {
    setSecondaryDeviceRS( SD_META_SHARE )
  }, [ SD_META_SHARE ] )

  const walletImageChecked: Boolean = useSelector(
    ( state ) => state.sss.walletImageChecked,
  )

  useEffect( () => {
    ( async () => {
      if ( SERVICES && walletImageChecked ) {
        AsyncStorage.setItem( 'walletExists', 'true' )
        AsyncStorage.setItem( 'walletRecovered', 'true' )

        dispatch( walletCheckIn() )
        props.navigation.navigate( 'Home' )
      }
    } )()
  }, [ SERVICES, walletImageChecked ] )

  useEffect( () => {
    if ( accounts.accountsSynched ) {
      ( loaderBottomSheet as any ).current.snapTo( 0 )
      props.navigation.navigate( 'Home', {
        exchangeRates,
      } )
    }
  }, [ accounts.accountsSynched ] )

  const downloadSecret = useCallback(
    ( shareIndex?, key? ) => {
      if ( shareIndex ) {
        const { REQUEST_DETAILS, META_SHARE } = RECOVERY_SHARES[ shareIndex ]

        if ( !META_SHARE ) {
          const { KEY } = REQUEST_DETAILS
          console.log( {
            KEY
          } )
          dispatch( downloadMShare( KEY, null, 'recovery' ) )
        } else {
          Alert.alert(
            'Key Exists',
            'Following key already exists for recovery',
          )
        }
      } else if ( key ) {
        // key is directly supplied in case of scanning QR from Guardian (reverse-recovery)
        dispatch( downloadMShare( key, null, 'recovery' ) )
      }
    },
    [ RECOVERY_SHARES ],
  )

  const updateStatusOnShareDownloadForTrustedContact = async () => {
    let mod = false
    selectedContacts.forEach( ( contact, index ) => {
      if ( RECOVERY_SHARES[ index + 1 ] ) {
        if ( RECOVERY_SHARES[ index + 1 ].META_SHARE ) {
          if ( selectedContacts[ index ].status !== 'received' ) {
            selectedContacts[ index ].status = 'received'
            mod = true
          }
        } else if ( RECOVERY_SHARES[ index + 1 ].REQUEST_DETAILS ) {
          if ( selectedContacts[ index ].status !== 'inTransit' ) {
            selectedContacts[ index ].status = 'inTransit'
            mod = true
          }
        }
      }
    } )

    if ( mod ) {
      await AsyncStorage.setItem(
        'selectedContacts',
        JSON.stringify( selectedContacts ),
      )
      getSelectedContactList()
    }
  }

  useEffect( () => {
    updateStatusOnShareDownloadForTrustedContact()
  }, [ RECOVERY_SHARES, selectedContacts ] )

  useEffect( () => {
    if ( openmodal == 'closed' ) {
      ( RestoreByCloudQrCode as any ).current.snapTo( 0 )
    }
    if ( openmodal == 'full' ) {
      ( RestoreByCloudQrCode as any ).current.snapTo( 1 )
    }
  }, [ openmodal ] )

  function openCloseModal() {
    if ( openmodal == 'closed' ) {
      setOpenmodal( 'full' )
    }
    if ( openmodal == 'full' ) {
      setOpenmodal( 'closed' )
    }
  }

  const onScanCompleted = async ( shareCode ) => {
    ( RestoreByCloudQrCode as any ).current.snapTo( 0 )

    let selectedDocsTemp = JSON.parse(
      await AsyncStorage.getItem( 'selectedDocuments' ),
    )
    if ( !selectedDocsTemp ) {
      selectedDocsTemp = []
    }
    let obj = null
    if ( shareCode == 'e0' ) {
      obj = {
        title: 'Personal Copy 1', status: 'received'
      }
      selectedDocsTemp[ 0 ] = obj
    } else if ( shareCode == 'c0' ) {
      obj = {
        title: 'Personal Copy 2', status: 'received'
      }
      selectedDocsTemp[ 1 ] = obj
    }
    await AsyncStorage.setItem(
      'selectedDocuments',
      JSON.stringify( selectedDocsTemp ),
    )
    selectedDocsTemp = JSON.parse(
      await AsyncStorage.getItem( 'selectedDocuments' ),
    )
    setSelectedDocuments( selectedDocsTemp )
  }

  function renderRestoreByCloudQrCodeContent() {
    return <RestoreByCloudQRCodeContents onScanCompleted={onScanCompleted} />
  }

  function renderRestoreByCloudQrCodeHeader() {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( RestoreByCloudQrCode as any ).current.snapTo( 0 )
          openCloseModal()
        }}
      />
    )
  }

  const onPullDown = async () => {
    let downloading = false
    if (
      RECOVERY_SHARES[ 1 ] &&
      RECOVERY_SHARES[ 1 ].REQUEST_DETAILS &&
      !RECOVERY_SHARES[ 1 ].META_SHARE
    ) {
      downloading = true
      downloadSecret( 1 )
    }

    if (
      !downloading &&
      RECOVERY_SHARES[ 2 ] &&
      RECOVERY_SHARES[ 2 ].REQUEST_DETAILS &&
      !RECOVERY_SHARES[ 2 ].META_SHARE
    ) {
      downloadSecret( 2 )
    }

    updateStatusOnShareDownloadForTrustedContact()
  }

  return (
    <View style={{
      flex: 1
    }}>
      <SafeAreaView style={{
        flex: 0
      }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.navigate( 'WalletInitialization' )
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={downloadMetaShare}
            onRefresh={() => {
              onPullDown()
            }}
          />
        }
      >
        <HeaderTitle
          firstLineTitle={'Restore wallet using'}
          secondLineTitle={'Recovery Keys'}
          infoTextNormal={
            'These are the Recovery Keys that you have stored in five places. '
          }
          infoTextBold={'You need three of them restore your wallet'}
        />
        <TouchableOpacity
          style={{
            ...styles.listElements,
            marginTop: 60,
            marginBottom: SD_META_SHARE ? 0 : 10,
          }}
          onPress={() =>
            props.navigation.navigate( 'RestoreWalletBySecondaryDevice' )
          }
        >
          <Image
            style={styles.iconImage}
            source={require( '../../assets/images/icons/icon_secondarydevice.png' )}
          />
          <View style={styles.textInfoView}>
            <Text style={styles.listElementsTitle}>Keeper Device (One)</Text>
            <Text style={styles.listElementsInfo}>
              You need your Keeper device with you to scan the QR code
            </Text>
          </View>
          <View style={styles.listElementIcon}>
            <Ionicons
              name="ios-arrow-forward"
              color={Colors.textColorGrey}
              size={15}
              style={{
                alignSelf: 'center'
              }}
            />
          </View>
        </TouchableOpacity>
        {SecondaryDeviceRS && (
          <View style={{
          }}>
            <TouchableOpacity
              style={{
                ...styles.selectedContactView,
                marginBottom: 15,
              }}
            >
              <View>
                <Text style={styles.selectedContactName}>
                  {SecondaryDeviceRS ? 'Received' : 'Receive'}
                </Text>
              </View>
              {SecondaryDeviceRS ? (
                <View style={{
                  flexDirection: 'row', marginLeft: 'auto'
                }}>
                  <View
                    style={{
                      ...styles.secretReceivedCheckSignView,
                      backgroundColor: Colors.green,
                    }}
                  >
                    <Feather
                      name={'check'}
                      size={12}
                      color={Colors.darkGreen}
                    />
                  </View>
                </View>
              ) : !SecondaryDeviceRS ? (
                <View style={{
                  flexDirection: 'row', marginLeft: 'auto'
                }}>
                  <View
                    style={{
                      height: 25,
                      width: 25,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 5,
                    }}
                  >
                    <Entypo
                      name={'dots-three-horizontal'}
                      size={15}
                      color={Colors.borderColor}
                    />
                  </View>
                </View>
              ) : (
                <View style={{
                  flexDirection: 'row', marginLeft: 'auto'
                }}>
                  <Text>{SecondaryDeviceRS ? 'Received' : 'Receive'}</Text>
                  <View style={styles.dotsView} />
                  <View style={styles.dotsView} />
                  <View style={styles.dotsView} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.separator} />
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate( 'RestoreWalletByContacts', {
              index: 1
            } )
          }
        >
          <View
            style={{
              ...styles.listElements,
              marginBottom: selectedContacts.length > 0 ? 0 : 10,
            }}
          >
            <Image
              style={styles.iconImage}
              source={require( '../../assets/images/icons/icon_contact.png' )}
            />
            <View style={styles.textInfoView}>
              <Text style={styles.listElementsTitle}>Keepers (Two)</Text>
              <Text style={styles.listElementsInfo}>
                Select one or two contacts with whom you have stored your
                recover secret
              </Text>
            </View>
            <View style={styles.listElementIcon}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{
                  alignSelf: 'center'
                }}
              />
            </View>
          </View>
          {selectedContacts.length > 0 && (
            <View style={{
            }}>
              {selectedContacts.map( ( contact, index ) => {
                return (
                  <TouchableOpacity
                    activeOpacity={contact.status == '' ? 0 : 10}
                    onPress={() => {
                      props.navigation.navigate( 'RecoveryCommunication', {
                        contact,
                        index: index + 1,
                      } )
                    }}
                    style={{
                      ...styles.selectedContactView, marginBottom: 15
                    }}
                  >
                    <View>
                      <Text style={styles.selectedContactName}>
                        {contact.name && contact.name.split( ' ' )[ 0 ]
                          ? contact.name.split( ' ' )[ 0 ]
                          : ''}{' '}
                        <Text style={{
                          fontFamily: Fonts.FiraSansMedium
                        }}>
                          {contact.name && contact.name.split( ' ' )[ 0 ]
                            ? contact.name.split( ' ' )[ 1 ]
                            : ''}
                        </Text>
                      </Text>
                      {contact &&
                      contact.communicationMode &&
                      contact.communicationMode.length ? (
                          <Text
                            style={{
                              ...styles.selectedContactName,
                              fontSize: RFValue( 11 ),
                            }}
                          >
                            {contact.communicationMode[ 0 ].info}
                          </Text>
                        ) : null}
                    </View>
                    {contact.status == 'received' ? (
                      <View
                        style={{
                          flexDirection: 'row', marginLeft: 'auto'
                        }}
                      >
                        <View
                          style={{
                            ...styles.secretReceivedView,
                            backgroundColor: Colors.green,
                          }}
                        >
                          <Text
                            style={{
                              ...styles.secretReceivedText,
                              color: Colors.darkGreen,
                            }}
                          >
                            Recovery Key Receieved
                          </Text>
                        </View>
                        <View
                          style={{
                            ...styles.secretReceivedCheckSignView,
                            backgroundColor: Colors.green,
                          }}
                        >
                          <Feather
                            name={'check'}
                            size={12}
                            color={Colors.darkGreen}
                          />
                        </View>
                      </View>
                    ) : contact.status == 'inTransit' ? (
                      <View
                        style={{
                          flexDirection: 'row', marginLeft: 'auto'
                        }}
                      >
                        <View
                          style={{
                            ...styles.secretReceivedView,
                            backgroundColor: Colors.lightBlue,
                          }}
                        >
                          <Text
                            style={{
                              ...styles.secretReceivedText,
                              color: Colors.blue,
                            }}
                          >
                            Recovery Key In-Transit
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={{
                            ...styles.secretReceivedCheckSignView,
                            backgroundColor: Colors.lightBlue,
                          }}
                          onPress={() => downloadSecret( index + 1 )}
                        >
                          <Ionicons
                            name={'download'}
                            size={15}
                            color={Colors.blue}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : contact.status == 'rejected' ? (
                      <View
                        style={{
                          flexDirection: 'row', marginLeft: 'auto'
                        }}
                      >
                        <View
                          style={{
                            ...styles.secretReceivedView,
                            backgroundColor: Colors.lightRed,
                          }}
                        >
                          <Text
                            style={{
                              ...styles.secretReceivedText,
                              color: Colors.red,
                            }}
                          >
                            Rejected by Contact
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 25,
                            width: 25,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 5,
                          }}
                        >
                          <Entypo
                            name={'dots-three-horizontal'}
                            size={15}
                            color={Colors.borderColor}
                          />
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {}}
                        style={{
                          flexDirection: 'row', marginLeft: 'auto'
                        }}
                      >
                        <Text>{contact.status}</Text>
                        <View style={styles.dotsView} />
                        <View style={styles.dotsView} />
                        <View style={styles.dotsView} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                )
              } )}
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.separator} />

        <TouchableOpacity
          onPress={() => ( RestoreByCloudQrCode as any ).current.snapTo( 1 )}
        >
          <View
            style={{
              ...styles.listElements,
              marginBottom: selectedDocuments.length > 0 ? 0 : hp( '5%' ),
            }}
          >
            <Image
              style={styles.iconImage}
              source={require( '../../assets/images/icons/files-and-folders-2.png' )}
            />
            <View style={styles.textInfoView}>
              <Text style={styles.listElementsTitle}>
                Personal Copies (Two)
              </Text>
              <Text style={styles.listElementsInfo}>
                Select one or two of the sources where you have kept the
                Recovery Key
              </Text>
            </View>
            <View style={styles.listElementIcon}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{
                  alignSelf: 'center'
                }}
              />
            </View>
          </View>
          {selectedDocuments.length > 0 && (
            <View style={{
            }}>
              {selectedDocuments.map( ( value ) => {
                if ( value ) {
                  return (
                    <TouchableOpacity
                      activeOpacity={value.status != 'received' ? 0 : 10}
                      onPress={() =>
                        value.status != 'received' ? handleDocuments() : {
                        }
                      }
                      style={{
                        ...styles.selectedContactView,
                        marginBottom: 15,
                      }}
                    >
                      <View>
                        <Text style={styles.selectedContactName}>
                          {value.title}
                        </Text>
                      </View>
                      {value.status == 'received' ? (
                        <View
                          style={{
                            flexDirection: 'row', marginLeft: 'auto'
                          }}
                        >
                          <View
                            style={{
                              ...styles.secretReceivedView,
                              backgroundColor: Colors.green,
                            }}
                          >
                            <Text
                              style={{
                                ...styles.secretReceivedText,
                                color: Colors.darkGreen,
                              }}
                            >
                              Recovery Key Entered
                            </Text>
                          </View>
                          <View
                            style={{
                              ...styles.secretReceivedCheckSignView,
                              backgroundColor: Colors.green,
                            }}
                          >
                            <Feather
                              name={'check'}
                              size={12}
                              color={Colors.darkGreen}
                            />
                          </View>
                        </View>
                      ) : value.status == 'rejected' ? (
                        <View
                          style={{
                            flexDirection: 'row', marginLeft: 'auto'
                          }}
                        >
                          <View
                            style={{
                              ...styles.secretReceivedView,
                              backgroundColor: Colors.lightRed,
                            }}
                          >
                            <Text
                              style={{
                                ...styles.secretReceivedText,
                                color: Colors.red,
                              }}
                            >
                              Recovery Key Invalid
                            </Text>
                          </View>
                          <View
                            style={{
                              height: 25,
                              width: 25,
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginLeft: 5,
                            }}
                          >
                            <Entypo
                              name={'dots-three-horizontal'}
                              size={15}
                              color={Colors.borderColor}
                            />
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleDocuments()}
                          style={{
                            flexDirection: 'row', marginLeft: 'auto'
                          }}
                        >
                          <Text>{value.status}</Text>
                          <View style={styles.dotsView} />
                          <View style={styles.dotsView} />
                          <View style={styles.dotsView} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  )
                } else {
                  null
                }
              } )}
            </View>
          )}
        </TouchableOpacity>

        {metaShares.length >= 3 ? (
          <View>
            <TouchableOpacity
              style={{
                ...styles.questionConfirmButton,
                margin: 20,
                elevation: Elevation,
              }}
              onPress={() => {
                ( loaderBottomSheet as any ).current.snapTo( 1 )
                setTimeout( () => {
                  setElevation( 0 )
                }, 2 )
                dispatch( recoverWallet() )
                dispatch( setVersion( 'Restored' ) )
              }}
            >
              <Text style={styles.proceedButtonText}>Restore</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      <BottomSheet
        enabledInnerScrolling={true}
        ref={successMessageBottomSheet as any}
        snapPoints={[
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0,
          hp( '60%' ),
        ]}
        renderContent={renderSuccessContent}
        renderHeader={renderHeader}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        ref={requestBottomSheet as any}
        snapPoints={[
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '60%' ) : hp( '75%' ),
        ]}
        renderContent={RequestModalContentFunction}
        renderHeader={RequestHeaderFunction}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        ref={RestoreByCloudQrCode as any}
        snapPoints={[ -30, hp( '90%' ) ]}
        renderContent={renderRestoreByCloudQrCodeContent}
        renderHeader={renderRestoreByCloudQrCodeHeader}
      />

      <BottomSheet
        onCloseEnd={() => {}}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={loaderBottomSheet as any}
        snapPoints={[ -50, hp( '100%' ) ]}
        renderContent={renderLoaderModalContent}
        renderHeader={renderLoaderModalHeader}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        enabledGestureInteraction={false}
        ref={ErrorBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderErrorModalContent1}
        renderHeader={renderErrorModalHeader1}
      />
    </View>
  )
}

const styles = StyleSheet.create( {
  listElements: {
    flexDirection: 'row',
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  listElementsTitle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    marginLeft: 13,
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    marginLeft: 13,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementIcon: {
    paddingRight: 5,
    marginLeft: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsView: {
    backgroundColor: Colors.borderColor,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  separator: {
    borderBottomColor: Colors.backgroundColor,
    borderBottomWidth: 5,
  },
  iconImage: {
    resizeMode: 'contain',
    width: 25,
    height: 30,
    alignSelf: 'center',
  },
  textInfoView: {
    justifyContent: 'space-between',
    flex: 1,
  },

  selectedContactView: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  selectedContactName: {
    marginLeft: 10,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  secretReceivedView: {
    borderRadius: 5,
    height: 25,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secretReceivedText: {
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  secretReceivedCheckSignView: {
    backgroundColor: Colors.green,
    borderRadius: 25 / 2,
    height: 25,
    width: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  questionConfirmButton: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    marginTop: hp( '6%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
} )
