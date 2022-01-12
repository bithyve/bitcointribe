import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, ImageSourcePropType, Keyboard, TouchableOpacity, Clipboard, Platform, TextInput, TouchableWithoutFeedback } from 'react-native'
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import { RescannedTransactionData } from '../../../store/reducers/wallet-rescanning'
import WalletRescanningBottomSheet from '../../../components/bottom-sheets/wallet-rescanning-bottom-sheet/WalletRescanningBottomSheet'
import AccountShellRescanningPromptBottomSheet from '../../../components/bottom-sheets/account-shell-rescanning-bottom-sheet/AccountShellRescanningPromptBottomSheet'
import ModalContainer from '../../../components/home/ModalContainer'
import { translations } from '../../../common/content/LocContext'
import SecurityQuestion from '../../NewBHR/SecurityQuestion'
import CardWithRadioBtn from '../../../components/CardWithRadioBtn'
import HeaderTitle from '../../../components/HeaderTitle'
import BottomInfoBox from '../../../components/BottomInfoBox'
import TrustedContactsOperations from '../../../bitcoin/utilities/TrustedContactsOperations'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import { resetEncryptionPassword } from '../../../store/actions/setupAndAuth'
import { useDispatch, useSelector } from 'react-redux'
import LoaderModal from '../../../components/LoaderModal'
import Toast from '../../../components/Toast'

export type Props = {
  navigation: any;
};

interface MenuOption {
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  screenName?: string;
  onOptionPressed?: () => void;
}

const WalletSettingsContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
  const loginStrings = translations[ 'login' ]
  const dispatch = useDispatch()

  const [ showRescanningPrompt, setShowRescanningPrompt ] = useState( false )
  const [ showRescanningModal, setShowRescanningModal ] = useState( false )
  const [ questionModal, showQuestionModal ] = useState( false )
  const [ showSelectMethodModal, setShowSelectMethodModal ] = useState( false )
  const [ copied, setCopied ] = useState( false )
  const [ confirmPswdTextInput ] = useState( React.createRef() )
  const [ encryptionPswd, showEncryptionPswd ] = useState( false )
  const [ activeIndex, setActiveIndex ] = useState( 0 )
  const [ tempPswd, setTempPswd ] = useState( '' )
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const [ answerInputStyle, setAnswerInputStyle ] = useState( styles.inputBox )
  const [ hintInputStyle, setHintInputStyle ] = useState( styles.inputBox )
  const [ pswdInputStyle, setPswdInputStyle ] = useState( styles.inputBox )
  const [ confirmInputStyle, setConfirmAnswerInputStyle ] = useState(
    styles.inputBox,
  )
  const [ hint ] = useState( React.createRef() )
  const [ hintText, setHint ] = useState( '' )
  const [ confirmPswdInputStyle, setConfirmPswdInputStyle ] = useState(
    styles.inputBox,
  )
  const [ Elevation, setElevation ] = useState( 10 )
  const [ confirmAnswer, setConfirmAnswer ] = useState( '' )
  const [ confirmPswd, setConfirmPswd ] = useState( '' )
  const [ answer, setAnswer ] = useState( '' )
  const [ answerMasked, setAnswerMasked ] = useState( '' )
  const [ confirmAnswerMasked, setConfirmAnswerMasked ] = useState( '' )
  const [ pswd, setPswd ] = useState( '' )
  const [ securityQue, showSecurityQue ] = useState( false )
  const [ pswdMasked, setPswdMasked ] = useState( '' )
  const [ confirmPswdMasked, setConfirmPswdMasked ] = useState( '' )
  const [ hideShowConfirmAnswer, setHideShowConfirmAnswer ] = useState( true )
  const [ hideShowConfirmPswd, setHideShowConfirmPswd ] = useState( true )
  const [ hideShowAnswer, setHdeShowAnswer ] = useState( true )
  const [ hideShowPswd, setHideShowPswd ] = useState( true )
  const [ answerError, setAnswerError ] = useState( '' )
  const [ pswdError, setPswdError ] = useState( '' )
  const passwordResetState = useSelector( ( state ) => state.setupAndAuth.passwordResetState )
  const [ showAGSPmodal, setShowAGSPmodal ] = useState( false )
  const [ showNote, setShowNote ] = useState( true )
  const [ isEditable, setIsEditable ] = useState( true )
  const [ resetStarted, setresetStarted ] = useState( false )
  const [ loading, setLoading ] = useState( false )
  const [ appGeneratedPassword ] = useState( TrustedContactsOperations.generateKey( 18 ) )
  const menuOptions: MenuOption[] = [
    {
      title: strings.ManagePasscode,
      subtitle: strings.Changeyourpasscode,
      imageSource: require( '../../../assets/images/icons/managepin.png' ),
      screenName: 'ManagePasscode',
    },
    {
      title: strings.ChangeCurrency,
      subtitle: strings.Chooseyourcurrency,
      imageSource: require( '../../../assets/images/icons/country.png' ),
      screenName: 'ChangeCurrency',
    },
    {
      title: strings.ChangeEncryptionMethod,
      subtitle: strings.ChangeEncryptionMethod,
      imageSource: require( '../../../assets/images/icons/encryption.png' ),
      screenName: 'ChangeEncryptionMethod',
    },
  ]

  useEffect( () => {
    if( passwordResetState === 'init' ) {
      setLoading( true )
    } else if( passwordResetState === 'completed' ) {
      setLoading( false )
      Toast( 'Password reset successfully' )
    }
  }, [ passwordResetState ] )

  const confirmAction = ( index ) => {
    setActiveIndex( index )
    setShowSelectMethodModal( false )
    if ( index === 0 ) {
      setShowAGSPmodal( true )
    } else if( index === 2 ) {
      showEncryptionPswd( true )
      setTempPswd( '' )
      setConfirmPswdMasked( '' )
      setPswd( '' )
      setPswdMasked( '' )
    }
  }

  const renderSelectMethods = useCallback( () => {
    return (
      <View style={{
        backgroundColor: Colors.backgroundColor,
        padding: 10
      }}>
        <HeaderTitle
          firstLineTitle={strings.setting}
          secondLineBoldTitle={strings.ChangeEncryptionMethod}
          secondLineTitle={''}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />
        <CardWithRadioBtn
          geticon={''}
          mainText={loginStrings.AGSP}
          subText={loginStrings.Hexawillgenerate}
          isSelected={false}
          setActiveIndex={()=> confirmAction( 0 )}
          index={0}
          italicText={''}
          boldText={''}
          changeBgColor={true}
          tag={loginStrings.MostSecure}
          hideRadioBtn
        />

        <CardWithRadioBtn
          geticon={''}
          mainText={loginStrings.Useencryptionpassword}
          subText={loginStrings.Createapassword}
          isSelected={false}
          setActiveIndex={()=> confirmAction( 2 )}
          index={2}
          italicText={''}
          boldText={loginStrings.MakeSureToRememberIt}
          changeBgColor={true}
          tag={loginStrings.UserDefined}
          hideRadioBtn
        />

        <View style={{
          marginTop: 20
        }}>
          <BottomInfoBox
            title={common.note}
            infoText={'Cloud backup provides you an automated recovery scheme as your first step. You can upgrade the security from the'}
            italicText={' Security Center'}
            backgroundColor={Colors.white}
          />
        </View>
      </View>
    )
  }, [ showSelectMethodModal ] )


  const renderSecurityQuestionContent = useCallback( () => {
    return (
      <SecurityQuestion
        onClose={() => showQuestionModal( false )}
        onPressConfirm={async () => {
          Keyboard.dismiss()
          showQuestionModal( false )
          setShowSelectMethodModal( true )
        }}
        title="Enter your Passphrase"
        note=" "
        onPasscodeVerify={()=>{ showQuestionModal( true )  }}
        showAnswer={false}
      />
    )
  }, [ questionModal ] )

  function handleOptionSelection( menuOption: MenuOption ) {
    if ( typeof menuOption.onOptionPressed === 'function' ) {
      menuOption.onOptionPressed()
    } else if ( menuOption.screenName !== undefined ) {
      if( menuOption.screenName === 'ChangeEncryptionMethod' ) {
        showQuestionModal( true )
      } else {
        navigation.navigate( menuOption.screenName )
      }
    }
  }

  function handleRescanListItemSelection() {
    setShowRescanningPrompt( true )
  }

  function handleTransactionDataSelectionFromRescan( transactionData: RescannedTransactionData ) {
    navigation.navigate( 'TransactionDetails', {
      transactionData: transactionData.details,
      accountShellID: transactionData.accountShell.id,
    } )
  }

  useEffect( () => {
    return () => {
      setShowRescanningModal( false )
      setShowRescanningPrompt( false )
    }
  }, [ navigation ] )

  const showRescanningPromptBottomSheet = () => {
    return (
      <AccountShellRescanningPromptBottomSheet
        onContinue={() => {
          setShowRescanningPrompt( false )
          setTimeout( () => {
            setShowRescanningModal( true )
          }, 800 )
        }}
        onDismiss={() => setShowRescanningPrompt( false )}
      />
    )
  }

  const onPressProceed = ( ) => {
    setresetStarted( true )
    setShowAGSPmodal( false )
    let security = null
    if ( activeIndex === 0 ) {
      security = {
        questionId: '0',
        question: 'App generated password',
        answer: appGeneratedPassword,
      }
    } else if ( activeIndex === 2 ){
      security = {
        questionId: '0',
        question: hintText,
        answer: pswd,
      }
    }
    dispatch( resetEncryptionPassword(  security ) )
    showSecurityQue( false )
    showEncryptionPswd( false )
  }

  const handlePswdSubmit = () => {
    setConfirmPswd( tempPswd )

  }

  const showRescanningBottomSheet = () => {
    return (
      <WalletRescanningBottomSheet
        onDismiss={() => setShowRescanningModal( false )}
        onTransactionDataSelected={handleTransactionDataSelectionFromRescan}
      />
    )
  }

  const setButtonVisible = () => {
    return (
      <TouchableOpacity
        onPress={()=>onPressProceed()}
        style={{
          ...styles.buttonView, elevation: Elevation
        }}
      >
        {/* {!loading.initializing ? ( */}
        <Text style={styles.buttonText}>{common.proceed}</Text>
        {/* ) : (
          <ActivityIndicator size="small" />
        )} */}
      </TouchableOpacity>
    )
  }

  const renderEncryptionPswd = () => {
    return(
      <KeyboardAwareScrollView
        resetScrollToCoords={{
          x: 0, y: 0
        }}
        scrollEnabled={false}
        // style={styles.rootContainer}
        style={{
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View style={{
          height: hp( '72%' ),
          paddingTop:  hp( '4%' ),
        }}>
          <Text style={{
            // marginBottom: wp( '%' ),
            color: Colors.blue,
            fontSize: RFValue( 18 ),
            fontFamily: Fonts.FiraSansRegular,
            marginLeft: wp( '6%' )
          }} >{loginStrings.encryptionpassword}</Text>
          <View
            style={{
              ...styles.inputBox,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              borderColor: pswdError ? Colors.red : Colors.white,
              marginTop: 10,
              backgroundColor: Colors.white
            }}
          >
            <TextInput
              style={styles.modalInputBox}
              placeholder={loginStrings.Enteryourpassword}
              placeholderTextColor={Colors.borderColor}
              value={hideShowPswd ? pswdMasked : pswd}
              autoCompleteType="off"
              textContentType="none"
              returnKeyType="next"
              autoCorrect={false}
              editable={isEditable}
              autoCapitalize="none"
              onSubmitEditing={() =>
                ( confirmPswdTextInput as any ).current.focus()
              }
              keyboardType={
                Platform.OS == 'ios'
                  ? 'ascii-capable'
                  : 'visible-password'
              }
              onChangeText={( text ) => {
                setPswd( text.replace( /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '' ) )
                setPswdMasked( text.replace( /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '' ) )
                // setPswdError( '' )
              }}
              onFocus={() => {
                setShowNote( false )
                setDropdownBoxOpenClose( false )
                setPswdInputStyle( styles.inputBoxFocused )
                if ( pswd.length > 0 ) {
                  setPswd( '' )
                  setPswdMasked( '' )
                  setPswdError( '' )
                }
              }}
              onBlur={() => {
                setShowNote( true )
                setPswdInputStyle( styles.inputBox )
                setDropdownBoxOpenClose( false )
                let temp = ''
                for ( let i = 0; i < pswd.length; i++ ) {
                  temp += '*'
                }
                setPswdMasked( temp )
                handlePswdSubmit()
              }}
            />
            {pswd ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  setHideShowPswd( !hideShowPswd )
                }}
              >
                <Feather
                  style={{
                    marginLeft: 'auto', padding: 10
                  }}
                  size={15}
                  color={Colors.blue}
                  name={hideShowPswd ? 'eye-off' : 'eye'}
                />
              </TouchableWithoutFeedback>
            ) : null}
          </View>
          <View
            style={{
              ...styles.inputBox,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              borderColor: pswdError ? Colors.red : Colors.white,
              marginTop: 10,
              backgroundColor: Colors.white
            }}
          >
            <TextInput
              style={styles.modalInputBox}
              ref={confirmPswdTextInput}
              placeholder={loginStrings.Confirmyourpassword}
              placeholderTextColor={Colors.borderColor}
              value={hideShowConfirmPswd ? confirmPswdMasked : tempPswd}
              autoCompleteType="off"
              textContentType="none"
              returnKeyType="next"
              autoCorrect={false}
              editable={isEditable}
              autoCapitalize="none"
              onSubmitEditing={() => {
                handlePswdSubmit();
                ( hint as any ).current.focus()
              }}
              keyboardType={
                Platform.OS == 'ios'
                  ? 'ascii-capable'
                  : 'visible-password'
              }
              onChangeText={( text ) => {
                setTempPswd( text )
                setConfirmPswdMasked( text )
                // setPswdError( '' )
              }}
              onFocus={() => {
                setShowNote( false )
                setDropdownBoxOpenClose( false )
                setConfirmPswdInputStyle( styles.inputBoxFocused )
                if ( tempPswd.length > 0 ) {
                  // setTempPswd( '' )
                  // setPswdMasked( '' )
                  setTempPswd( '' )
                  setPswdError( '' )
                  setConfirmPswd( '' )
                  setConfirmPswdMasked( '' )
                }
              }}
              onBlur={() => {
                setShowNote( true )
                setConfirmPswdInputStyle( styles.inputBox )
                setDropdownBoxOpenClose( false )
                let temp = ''
                for ( let i = 0; i < tempPswd.length; i++ ) {
                  temp += '*'
                }
                setConfirmPswdMasked( temp )
                handlePswdSubmit()
              }}
            />
            {tempPswd ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  setHideShowConfirmPswd( !hideShowConfirmPswd )
                  setDropdownBoxOpenClose( false )
                }}
              >
                <Feather
                  style={{
                    marginLeft: 'auto', padding: 10
                  }}
                  size={15}
                  color={Colors.blue}
                  name={hideShowConfirmPswd ? 'eye-off' : 'eye'}
                />
              </TouchableWithoutFeedback>
            ) : null}
          </View>
          {/* {pswdError.length == 0 && (
            <Text style={styles.helpText}>
              {loginStrings.Numbersorspecial}
            </Text>
          )} */}
          <View
            style={{
              ...hintInputStyle,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              borderColor: Colors.backgroundColor1,
              marginVertical: 10,
              backgroundColor: Colors.white
            }}
          >
            <TextInput
              style={styles.modalInputBox}
              ref={hint}
              placeholder={loginStrings.Addhint}
              placeholderTextColor={Colors.borderColor}
              value={hintText}
              autoCompleteType="off"
              textContentType="none"
              returnKeyType="next"
              autoCorrect={false}
              editable={isEditable}
              autoCapitalize="none"
              keyboardType={
                Platform.OS == 'ios'
                  ? 'ascii-capable'
                  : 'visible-password'
              }
              onChangeText={( text ) => {
                setHint( text )
              }}
              onFocus={() => {
                setShowNote( false )
                setHintInputStyle( styles.inputBoxFocused )
              }}
              onBlur={() => {
                setShowNote( true )
                setHintInputStyle( styles.inputBox )
              }
              }
            />
            {/* {hintText ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  setHideShowHint( !hideShowHint )

                  // setDropdownBoxOpenClose( false )
                }}
              >
                <Feather
                  style={{
                    marginLeft: 'auto', padding: 10
                  }}
                  size={15}
                  color={Colors.blue}
                  name={hideShowHint ? 'eye-off' : 'eye'}
                />
              </TouchableWithoutFeedback>
            ) : null} */}
          </View>

          <View
            style={{
              marginLeft: 20,
              marginRight: 20,
              flexDirection: 'row',
            }}
          >
            <Text
              style={{
                color: Colors.red,
                fontFamily: Fonts.FiraSansMediumItalic,
                fontSize: RFValue( 10 ),
                marginLeft: 'auto',
              }}
            >
              {pswdError}
            </Text>
          </View>
          {showNote ? <View style={{
            ...styles.bottomButtonView,
          }}>
            {(
              pswd.trim() === confirmPswd.trim() &&
            confirmPswd.trim() &&
            pswd.trim() && pswdError.length === 0 && hintText.length > 0
            ) && (
              setButtonVisible()
            ) || null}
            {/* <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorActiveView} />
          </View> */}
          </View> : null}
          {showNote &&
        <View style={{
          marginTop: showNote ? hp( '0%' ) :hp( '2%' ),
          marginBottom: hp( 1 )
        }}>
          {pswd.length === 0 && confirmPswd.length === 0 &&
          <BottomInfoBox
            title={common.note}
            infoText={loginStrings.Youcanuse}
            italicText={''}
            backgroundColor={Colors.white}
          />
          }
        </View>
          }
        </View>
      </KeyboardAwareScrollView>
    )
  }

  const renderAGSP = () => {
    return(
      <KeyboardAwareScrollView
        resetScrollToCoords={{
          x: 0, y: 0
        }}
        scrollEnabled={false}
        // style={styles.rootContainer}
        style={{
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View style={{
          height: hp( '60%' ),
          marginHorizontal: wp( 4 ),
          paddingTop:  hp( '6%' ),
        }}>
          <View style={{
            marginHorizontal: wp( '6%' )
          }}>
            <Text style={{
              color: Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.FiraSansRegular,
            }} >{loginStrings.HexaWalletcreated}</Text>
            <Text style={[ styles.bottomNoteInfoText, {
              color: Colors.lightTextColor,
              marginTop: 10
            } ]}>{loginStrings.Makesureyou}</Text>

            <TouchableOpacity
              onPress={()=> {
                Clipboard.setString( appGeneratedPassword )
                setCopied( true )
                setTimeout( () => {
                  setCopied( false )
                }, 1500 )
              }}
              style={styles.containerPasscode}>
              <Text numberOfLines={1} style={styles.textPasscode}>{appGeneratedPassword.match( /.{1,6}/g ).join( '-' )}</Text>
              <View
                style={{
                  width: wp( '12%' ),
                  height: wp( '12%' ),
                  backgroundColor: Colors.borderColor,
                  borderTopRightRadius: wp( 3 ),
                  borderBottomRightRadius: wp( 3 ),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  style={{
                    width: 18, height: 20
                  }}
                  source={require( '../../../assets/images/icons/icon-copy.png' )}
                />
              </View>
            </TouchableOpacity>
            {
              copied && (
                <Text style={{
                  textAlign: 'center',
                  color: Colors.lightTextColor,
                  marginBottom: 10
                }}>
                  Copied to clipboard
                </Text>
              )
            }

            <Text style={[ styles.bottomNoteInfoText, {
              marginTop: 10
            } ]}>{loginStrings.Itmayalso}</Text>
          </View>

          <View style={{
            alignItems: 'center', marginLeft: wp( '5%' ), marginBottom: hp( '4%' ),
            flexDirection: 'row', marginTop: hp( 10 )
          }}>
            <TouchableOpacity
              onPress={() => {onPressProceed()}}
              style={ButtonStyles.primaryActionButton}
            >
              <Text style={{
                fontSize: RFValue( 13 ),
                color: Colors.white,
                fontFamily: Fonts.FiraSansMedium,
                alignSelf: 'center',
              }}>{`${loginStrings.UseStrongPasscode}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                showSecurityQue( false )
                showEncryptionPswd( false )
                setShowAGSPmodal( false )
                setAnswerError( '' )
              }}
            >
              <Text style={{
                fontSize: RFValue( 13 ),
                color: Colors.blue,
                fontFamily: Fonts.FiraSansMedium,
                alignSelf: 'center',
                marginLeft: wp( '5%' )
              }}>{`${common.cancel}`}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAwareScrollView>
    )
  }

  const renderLoaderModalContent = useCallback( () => {
    return <LoaderModal
      headerText={'Reseting password'}
      messageText={'Please wait'}
      subPoints={''}
      bottomText={''} />
  }, [ loading ] )

  return (
    <View style={styles.modalContainer}>
      <ScrollView style={{
        flex: 1
      }}>
        <ModalContainer onBackground={()=>setShowRescanningModal( false )} visible={showRescanningPrompt} closeBottomSheet={() => { }}>
          {showRescanningPromptBottomSheet()}
        </ModalContainer>
        <ModalContainer onBackground={()=>setShowRescanningModal( false )} visible={showRescanningModal} closeBottomSheet={() => { }}>
          {showRescanningBottomSheet()}
        </ModalContainer>
        {menuOptions.map( ( menuOption, index ) => {
          return (
            <AppBottomSheetTouchableWrapper
              onPress={() => handleOptionSelection( menuOption )}
              style={styles.selectedContactsView}
              key={index}
            >
              <Image
                source={menuOption.imageSource}
                style={{
                  width: widthPercentageToDP( '7%' ),
                  height: widthPercentageToDP( '7%' ),
                  resizeMode: 'contain',
                  marginLeft: widthPercentageToDP( '3%' ),
                  marginRight: widthPercentageToDP( '3%' ),
                }}
              />
              <View
                style={{
                  justifyContent: 'center', marginRight: 10, flex: 1
                }}
              >
                <Text style={styles.titleText}>{menuOption.title}</Text>
                <Text style={styles.infoText}>{menuOption.subtitle}</Text>
              </View>

              <View style={{
                marginLeft: 'auto'
              }}>
                {menuOption.screenName !== undefined && (
                  <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={15}
                    style={{
                      marginLeft: widthPercentageToDP( '3%' ),
                      marginRight: widthPercentageToDP( '3%' ),
                      alignSelf: 'center',
                    }}
                  />
                )}
              </View>
            </AppBottomSheetTouchableWrapper>
          )
        } )}
      </ScrollView>
      <ModalContainer onBackground={()=>{showEncryptionPswd( false )}} visible={encryptionPswd} closeBottomSheet={()=>{showEncryptionPswd( false )}} >
        {renderEncryptionPswd()}
      </ModalContainer>
      <ModalContainer
        onBackground={()=>{setShowAGSPmodal( false )}}
        visible={showAGSPmodal}
        closeBottomSheet={()=>{setShowAGSPmodal( false )}} >
        {renderAGSP()}
      </ModalContainer>
      <ModalContainer
        onBackground={()=>showQuestionModal( false )}
        visible={questionModal}
        closeBottomSheet={() => {showQuestionModal( false )}} >
        {renderSecurityQuestionContent()}
      </ModalContainer>
      <ModalContainer
        onBackground={()=>setShowSelectMethodModal( false )}
        visible={showSelectMethodModal}
        closeBottomSheet={() => {setShowSelectMethodModal( false )}} >
        {renderSelectMethods()}
      </ModalContainer>
      <ModalContainer
        onBackground={()=>()=>setLoading( false )}
        visible={loading}
        closeBottomSheet={null}
      >
        {renderLoaderModalContent()}
      </ModalContainer>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
  },
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },
  infoText: {
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    marginTop: 5,
  },
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.6,
    lineHeight: 18
  },
  contactText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },

  containerPasscode: {
    backgroundColor: Colors.white,
    borderRadius: wp( '3%' ),
    marginVertical: wp( '4%' ),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp( '1%' ),
    flexDirection: 'row'
  },
  textPasscode: {
    fontSize: RFValue( 18 ),
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    flex: 1,
    marginLeft: 5
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
    paddingBottom: hp( 2 ),
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
    marginHorizontal: wp( '6%' ),
    marginBottom: hp( 2 )
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
      width: 10, height: 10
    },
    backgroundColor: Colors.white,
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,

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
    fontSize: RFValue( 10 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansItalic,
    marginRight: wp( 5 ),
    alignSelf: 'flex-end',
    width: wp( '54%' ),
    textAlign: 'right',
    marginTop: hp( 0.5 )
  },


} )

export default WalletSettingsContainerScreen
