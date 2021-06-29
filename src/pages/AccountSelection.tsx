import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  Image,
  ImageSourcePropType
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Fonts from '../common/Fonts'
import Colors from '../common/Colors'
import QuestionList from '../common/QuestionList'
import CommonStyles from '../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Feather from 'react-native-vector-icons/Feather'
import { RFValue } from 'react-native-responsive-fontsize'
import HeaderTitle from '../components/HeaderTitle'
import BottomInfoBox from '../components/BottomInfoBox'

import { useDispatch, useSelector } from 'react-redux'
import { setupWallet } from '../store/actions/setupAndAuth'
import BottomSheet from 'reanimated-bottom-sheet'
import LoaderModal from '../components/LoaderModal'

import DeviceInfo from 'react-native-device-info'
import { walletCheckIn } from '../store/actions/trustedContacts'
import { setVersion } from '../store/actions/versionHistory'
import { initNewBHRFlow } from '../store/actions/health'
import {  setCloudData } from '../store/actions/cloud'
import CloudBackupStatus from '../common/data/enums/CloudBackupStatus'
import ModalContainer from '../components/home/ModalContainer'
import ButtonBlue from '../components/ButtonBlue'

// only admit lowercase letters and digits
const ALLOWED_CHARACTERS_REGEXP = /^[0-9a-z]+$/
let messageIndex = 0
const LOADER_MESSAGE_TIME = 2000

interface AccountOption {
    id: number;
    title: string;
    subtitle: string;
    imageSource: ImageSourcePropType;
    screenName?: string;
    onOptionPressed?: () => void;
  }

const accountOptions: AccountOption[] = [
  {
    id: 0,
    title: 'Test Account',
    imageSource: require( '../assets/images/accIcons/icon_test.png' ),
    subtitle: 'An on-chain, single-signature wallet Fast and easy. Ideal for small amounts',
    // screenName: 'FriendsAndFamily',
  },
  {
    id: 1,
    title: 'Checking Account',
    imageSource: require( '../assets/images/accIcons/icon_checking.png' ),
    subtitle: 'An on-chain, single-signature wallet Fast and easy. Ideal for small amounts',
  },
  {
    id: 2,
    title: 'Savings Account',
    imageSource: require( '../assets/images/accIcons/icon_savings.png' ),
    subtitle: 'An on-chain, 2 of 3 multi-signature wallet. Use for securing larger amounts',
  },
  {
    id: 3,
    title: 'Donation Account',
    imageSource: require( '../assets/images/accIcons/icon_donation.png' ),
    subtitle: 'An on-chain, 2 of 3 multi-signature wallet. Use for securing larger amountss',
  },
  {
    id: 4,
    title: 'F&F Account',
    imageSource: require( '../assets/images/accIcons/icon_F&F.png' ),
    subtitle: 'A separate account where you can receive funds from your contacts',
  },
  {
    id: 5,
    title: 'Bought BTC Account',
    imageSource: require( '../assets/images/accIcons/boughtbtc.png' ),
    subtitle: 'Bought or Exchange Account where newly bought bitcoins land',
  }
]

const loaderMessages = [
  {
    heading: 'Bootstrapping Accounts',
    text: 'Hexa has a multi-account model which lets you better manage your bitcoin (sats)',
    subText: '',
  },
  {
    heading: 'Filling Test Account with test sats',
    text:
      'Preloaded Test Account is the best place to start your Bitcoin journey',
    subText: '',
  },
  {
    heading: 'Generating Recovery Keys',
    text: 'Recovery Keys help you restore your Hexa wallet in case your phone is lost',
    subText: '',
  },
  {
    heading: 'Manage Backup',
    text:
      'You can backup your wallet at 3 different levels of security\nAutomated cloud backup | Double backup | Multi-key backup',
    subText: '',
  },
  {
    heading: 'Level 1 - Automated Cloud Backup',
    text: 'Allow Hexa to automatically backup your wallet to your cloud storage and we’ll ensure you easily recover your wallet in case your phone gets lost',
    subText: '',
  },
  {
    heading: 'Level 2 - Double Backup',
    text: 'Starting to hodl sats and bitcoin? Ensure that you backup your wallet atleast to Level 2 backup called Double Backup',
    subText: '',
  },
  {
    heading: 'Level 3 - Multi-key Backup',
    text: 'For hardcore Bitcoiners who understand Bitcoin, stack large amounts of sats or bitcoin and care for utmost security of their wallet',
    subText: '',
  }
]

const getNextMessage = () => {
  if ( messageIndex == ( loaderMessages.length ) ) messageIndex = 0
  return loaderMessages[ messageIndex++ ]
}

function validateAllowedCharacters( answer: string ): boolean {
  return answer == '' || ALLOWED_CHARACTERS_REGEXP.test( answer )
}

export default function AccountSelection( props: { navigation: { getParam: ( arg0: string ) => any; navigate: ( arg0: string, arg1: { walletName: any, selectedAcc: string[] } ) => void } } ) {
  const [ message, setMessage ] = useState( 'Creating your wallet' )
  const [ subTextMessage, setSubTextMessage ] = useState(
    'The Hexa wallet is non-custodial and is created locally on your phone so that you have full control of it',
  )
  const [ Elevation, setElevation ] = useState( 10 )
  const [ isLoaderStart, setIsLoaderStart ] = useState( false )
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const [ dropdownBoxList ] = useState( QuestionList )
  const [ dropdownBoxValue, setDropdownBoxValue ] = useState( {
    id: '',
    question: '',
  } )
  const [ answerInputStyle, setAnswerInputStyle ] = useState( styles.inputBox )
  const [ pswdInputStyle, setPswdInputStyle ] = useState( styles.inputBox )
  const [ confirmInputStyle, setConfirmAnswerInputStyle ] = useState(
    styles.inputBox,
  )
  const [ confirmPswdInputStyle, setConfirmPswdInputStyle ] = useState(
    styles.inputBox,
  )
  const [ confirmAnswer, setConfirmAnswer ] = useState( '' )
  const [ confirmPswd, setConfirmPswd ] = useState( '' )
  const [ answer, setAnswer ] = useState( '' )
  const [ answerMasked, setAnswerMasked ] = useState( '' )
  const [ confirmAnswerMasked, setConfirmAnswerMasked ] = useState( '' )
  const [ pswd, setPswd ] = useState( '' )
  const [ pswdMasked, setPswdMasked ] = useState( '' )
  const [ confirmPswdMasked, setConfirmPswdMasked ] = useState( '' )
  const [ hideShowConfirmAnswer, setHideShowConfirmAnswer ] = useState( true )
  const [ hideShowConfirmPswd, setHideShowConfirmPswd ] = useState( true )
  const [ hideShowAnswer, setHdeShowAnswer ] = useState( true )
  const [ hideShowPswd, setHideShowPswd ] = useState( true )

  const dispatch = useDispatch()
  const walletName = props.navigation.getParam( 'walletName' )
  const [ answerError, setAnswerError ] = useState( '' )
  const [ pswdError, setPswdError ] = useState( '' )
  const [ tempAns, setTempAns ] = useState( '' )
  const [ tempPswd, setTempPswd ] = useState( '' )
  const [ isEditable, setIsEditable ] = useState( true )
  const [ isDisabled, setIsDisabled ] = useState( false )
  const { walletSetupCompleted } = useSelector( ( state ) => state.setupAndAuth )
  // const [ loaderBottomSheet ] = useState( React.createRef() )
  const [ loaderModal, setLoaderModal ] = useState( false )
  const [ confirmAnswerTextInput ] = useState( React.createRef() )
  const [ confirmPswdTextInput ] = useState( React.createRef() )
  const [ visibleButton, setVisibleButton ] = useState( false )
  const [ showNote, setShowNote ] = useState( true )
  const [ securityQue, showSecurityQue ] = useState( false )
  const [ encryptionPswd, showEncryptionPswd ] = useState( false )
  const [ activeIndex, setActiveIndex ] = useState( 1 )
  const s3service = useSelector( ( state ) => state.health.service )
  const accounts = useSelector( ( state: { accounts: any } ) => state.accounts )
  const cloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus )
  const cloudPermissionGranted = useSelector( ( state ) => state.health.cloudPermissionGranted )
  const levelHealth = useSelector( ( state ) => state.health.levelHealth )
  const [ selectedAcc, setSelectedAcc ] = useState( [ 'Checking Account' ] )


  useEffect( () => {
    if( cloudBackupStatus === CloudBackupStatus.COMPLETED || cloudBackupStatus === CloudBackupStatus.FAILED ){
      // ( loaderBottomSheet as any ).current.snapTo( 0 )
      setLoaderModal( false )
      props.navigation.navigate( 'HomeNav', {
        walletName, selectedAcc
      } )
    }
  }, [ cloudBackupStatus ] )

  useEffect( () => {
    if( walletSetupCompleted ){
      console.log( 'walletSetupCompleted****', walletSetupCompleted )

      dispatch( walletCheckIn() )
    }
  }, [ walletSetupCompleted ] )

  useEffect( () => {
    if( walletSetupCompleted && levelHealth && levelHealth.length ){
      console.log( 'healthCheckInitializedKeeper****', levelHealth.length )
      if( cloudPermissionGranted ){
        dispatch( setCloudData() )
      } else{
        // ( loaderBottomSheet as any ).current.snapTo( 0 )
        setLoaderModal( false )
        props.navigation.navigate( 'HomeNav', {
          walletName, selectedAcc
        } ) }
    }
  }, [ walletSetupCompleted, levelHealth ] )

  const checkCloudLogin = () =>{
    showLoader()
    requestAnimationFrame( () => {
      const security = {
        questionId: dropdownBoxValue.id,
        question: dropdownBoxValue.question,
        answer,
      }
      dispatch( setupWallet( walletName, security ) )
      dispatch( initNewBHRFlow( true ) )
      dispatch( setVersion( 'Current' ) )
      const current = Date.now()
      AsyncStorage.setItem(
        'SecurityAnsTimestamp',
        JSON.stringify( current ),
      )
      const securityQuestionHistory = {
        created: current,
      }
      AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify( securityQuestionHistory ),
      )
    } )
  }

  const showLoader = () => {
    // ( loaderBottomSheet as any ).current.snapTo( 1 )
    setLoaderModal( true )
    setLoaderMessages()
    setTimeout( () => {
      setElevation( 0 )
    }, 0.2 )
    setTimeout( () => {
      setIsLoaderStart( true )
      setIsEditable( false )
      setIsDisabled( true )
    }, 2 )
  }

  const handleSubmit = () => {
    setConfirmAnswer( tempAns )

    if ( answer && confirmAnswer && confirmAnswer != answer ) {
      setAnswerError( 'Answers do not match' )
    } else if (
      validateAllowedCharacters( answer ) == false ||
      validateAllowedCharacters( tempAns ) == false
    ) {
      setAnswerError( 'Answers must only contain lowercase characters (a-z) and digits (0-9)' )
    } else {
      setTimeout( () => {
        setAnswerError( '' )
      }, 2 )
    }
  }

  const handlePswdSubmit = () => {
    setConfirmPswd( tempPswd )

    if ( pswd && confirmPswd && confirmPswd != pswd ) {
      setPswdError( 'Password do not match' )
    } else if (
      validateAllowedCharacters( pswd ) == false ||
      validateAllowedCharacters( tempPswd ) == false
    ) {
      setPswdError( 'Password must only contain lowercase characters (a-z) and digits (0-9)' )
    } else {
      setTimeout( () => {
        setPswdError( '' )
      }, 2 )
    }
  }


  useEffect( () => {
    if ( answer.trim() == confirmAnswer.trim() && answer && confirmAnswer && answerError.length == 0 ) {
      setVisibleButton( true )
    } else {
      setVisibleButton( false )

      if ( answer && confirmAnswer && confirmAnswer != answer ) {
        setAnswerError( 'Answers do not match' )
      } else if (
        validateAllowedCharacters( answer ) == false ||
        validateAllowedCharacters( confirmAnswer ) == false
      ) {
        setAnswerError( 'Answers must only contain lowercase characters (a-z) and digits (0-9)' )
      }
    }
  }, [ confirmAnswer ] )

  useEffect( () => {
    if ( pswd.trim() == confirmPswd.trim() && pswd && confirmPswd && pswdError.length == 0 ) {
      setVisibleButton( true )
    } else {
      setVisibleButton( false )

      if ( pswd && confirmPswd && confirmPswd != pswd ) {
        setPswdError( 'Password do not match' )
      } else if (
        validateAllowedCharacters( pswd ) == false ||
        validateAllowedCharacters( confirmPswd ) == false
      ) {
        setPswdError( 'Password must only contain lowercase characters (a-z) and digits (0-9)' )
      }
    }
  }, [ confirmPswd ] )



  const setButtonVisible = () => {
    return (
      <TouchableOpacity
        onPress={async () => {
          if ( activeIndex === 0 ) {
            checkCloudLogin()
            showSecurityQue( false )
          } else {
            showEncryptionPswd( false )
          }
        }}
        style={{
          ...styles.buttonView, elevation: Elevation
        }}
      >
        {/* {!loading.initializing ? ( */}
        <Text style={styles.buttonText}>Proceed</Text>
        {/* ) : (
          <ActivityIndicator size="small" />
        )} */}
      </TouchableOpacity>
    )
  }

  const setLoaderMessages = () => {
    setTimeout( () => {
      const newMessage = getNextMessage()
      setMessage( newMessage.heading )
      setSubTextMessage( newMessage.text )
      setTimeout( () => {
        const newMessage = getNextMessage()
        setMessage( newMessage.heading )
        setSubTextMessage( newMessage.text )
        setTimeout( () => {
          const newMessage = getNextMessage()
          setMessage( newMessage.heading )
          setSubTextMessage( newMessage.text )
          setTimeout( () => {
            const newMessage = getNextMessage()
            setMessage( newMessage.heading )
            setSubTextMessage( newMessage.text )
            setTimeout( () => {
              const newMessage = getNextMessage()
              setMessage( newMessage.heading )
              setSubTextMessage( newMessage.text )
              setTimeout( () => {
                const newMessage = getNextMessage()
                setMessage( newMessage.heading )
                setSubTextMessage( newMessage.text )
              }, LOADER_MESSAGE_TIME )
            }, LOADER_MESSAGE_TIME )
          }, LOADER_MESSAGE_TIME )
        }, LOADER_MESSAGE_TIME )
      }, LOADER_MESSAGE_TIME )
    }, LOADER_MESSAGE_TIME )
  }

  const renderLoaderModalContent = useCallback( () => {
    return <LoaderModal headerText={message} messageText={subTextMessage} />
  }, [ message, subTextMessage ] )

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

  const confirmAction = ( isAccountselected ) => {
    if ( isAccountselected ) {
      props.navigation.navigate( 'NewWalletQuestion', {
        walletName, selectedAcc
      } )
    } else {
      props.navigation.navigate( 'NewWalletQuestion', {
        walletName, selectedAcc: []
      } )
    }

  }

  const selectAccount = ( title ) => {
    if ( selectedAcc.includes( title ) ) {
      setSelectedAcc( selectedAcc.filter( item => item !== title ) )
    } else {
      const newArr = [ ...selectedAcc ]
      newArr.push( title )
      setSelectedAcc( newArr )
    }
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.backgroundColor1
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <SafeAreaView style={{
        flex: 0
      }} />

      <ScrollView>
        <View style={{
          flex: 1,
          backgroundColor: Colors.backgroundColor
        }}>
          <View style={[ CommonStyles.headerContainer, {
            backgroundColor: Colors.backgroundColor,
            borderBottomWidth: 0
          } ]}>
            <TouchableOpacity
              style={CommonStyles.headerLeftIconContainer}
              onPress={() => {
                props.navigation.goBack()
              }}
            >
              <View style={CommonStyles.headerLeftIconInnerContainer}>
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.blue}
                  size={17}
                />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={10}
            style={{
              flex: 1
            }}
            onPress={() => {
              setDropdownBoxOpenClose( false )
              Keyboard.dismiss()
            }}
            disabled={isDisabled}
          >
            <HeaderTitle
              firstLineTitle={'Step 2'}
              secondLineTitle={'Personalize your accounts'}
              infoTextNormal={'New Wallet creation '}
              infoTextBold={''}
              infoTextNormal1={''}
              step={''}
            />
            {accountOptions.map( ( item, index ) => {
              return(
                <TouchableOpacity
                  key={index}
                  onPress={() => selectAccount( item.title )}
                  style={{
                    // flex: 1,
                    width: '90%', height: hp( '12%' ), backgroundColor: selectedAcc.includes( item.title ) ?  Colors.lightBlue: Colors.white,
                    alignSelf: 'center', justifyContent: 'center',
                    borderRadius: wp( '4' ),
                    marginVertical: hp( '1%' )
                  }}>
                  <View style={{
                    borderRadius: 6, borderWidth: selectedAcc.includes( item.title ) ? 0.6 : 0, borderColor: selectedAcc.includes( item.title ) ? Colors.white : Colors.textColorGrey, backgroundColor: selectedAcc.includes( item.title ) ? Colors.lightBlue : Colors.backgroundColor,
                    alignSelf: 'flex-end',  position: 'absolute', right: 10, top: 10
                  }}>
                    <Text style={{
                      margin: 6, color: selectedAcc.includes( item.title ) ? Colors.white : Colors.textColorGrey, fontSize: RFValue( 10 )
                    }}>
                          Know More
                    </Text>
                  </View>
                  <View style={{
                    flexDirection:'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginHorizontal: wp( '4%' )
                  }}>
                    <View style={{
                      width: 45,
                      height: 45,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Image
                        style={{
                          width: '100%', height: '100%'
                        }}
                        source={item.imageSource}
                      />
                    </View>
                    <View style={{
                      flex: 1,
                      marginLeft: wp( 2 )
                    }}>
                      <Text style={{
                        marginBottom: hp( 1 ),
                        fontSize: RFValue( 13 ), fontFamily:  Fonts.FiraSansRegular, color: selectedAcc.includes( item.title ) ? Colors.white : Colors.black
                      }}>
                        {item.title}
                      </Text>
                      <Text style={{
                        // flex: 1,
                        marginRight: wp( 10 ),
                        fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, color: selectedAcc.includes( item.title ) ? Colors.white : Colors.textColorGrey
                      }}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  {/* {isSelected && ( */}


                  {/* )} */}
                </TouchableOpacity>
              )
            } )}


          </TouchableOpacity>

        </View>
      </ScrollView>
      <View style={{
        alignItems: 'center', marginLeft: wp( '9%' ), marginBottom: hp( '3%' ),
        flexDirection: 'row'
      }}>
        <ButtonBlue
          buttonText="Proceed"
          handleButtonPress={() => confirmAction( true )}
          buttonDisable={false}
        />
        <TouchableOpacity
          onPress={() => confirmAction( false )}

        >
          <Text style={{
            color: Colors.blue,
            fontFamily: Fonts.FiraSansMedium,
            alignSelf: 'center',
            marginLeft: wp( '5%' )
          }}>Skip</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create( {
  dropdownBox: {
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 30,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
  },
  dropdownBoxOpened: {
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 30,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  buttonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bottomButtonView1: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.white,
  },
  modalInputBox: {
    // flex: 1,
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
  },
  dropdownBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 13 ),
    marginRight: 15,
  },
  dropdownBoxModal: {
    borderRadius: 10,
    margin: 15,
    height: 'auto',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: {
      width: 0, height: 10
    },
    backgroundColor: Colors.white,
  },
  dropdownBoxModalElementView: {
    height: 55,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },

  helpText: {
    fontSize: RFValue( 12 ),
    color: Colors.textColorGrey,
    paddingHorizontal: 24,
  }
} )
