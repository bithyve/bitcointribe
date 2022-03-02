import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Text,
  StatusBar,
  ScrollView,
  Platform,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import HeaderTitle from '../../components/HeaderTitle'
import CommonStyles from '../../common/Styles/Styles'
import { Gift, GiftThemeId, Wallet, DeepLinkEncryptionType } from '../../bitcoin/utilities/Interface'
import idx from 'idx'
import CheckMark from '../../assets/images/svgs/checkmark.svg'
import AccountShell from '../../common/data/models/AccountShell'
import ImageStyles from '../../common/Styles/ImageStyles'
import GiftCard from '../../assets/images/svgs/gift_icon_new.svg'
import LeftArrow from '../../assets/images/svgs/Left_arrow_new.svg'
import More from '../../assets/images/svgs/icon_more_gray.svg'
import ArrowDown from '../../assets/images/svgs/icon_arrow_down.svg'
import ArrowUp from '../../assets/images/svgs/icon_arrow_up.svg'
import Halloween from '../../assets/images/svgs/halloween.svg'
import Birthday from '../../assets/images/svgs/birthday.svg'
import Setting from '../../assets/images/svgs/setting_icon.svg'
import Menu from '../../assets/images/svgs/menu_dots_icon.svg'
import ThemeList from './Theme'
import { updateUserName } from '../../store/actions/storage'
import Toast from '../../components/Toast'
import DeviceInfo from 'react-native-device-info'

import { translations } from '../../common/content/LocContext'

import RadioButton from '../../components/RadioButton'
import Feather from 'react-native-vector-icons/Feather'
import ModalContainer from '../../components/home/ModalContainer'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import BottomInfoBox from '../../components/BottomInfoBox'

enum AdvancedSetting {
  FNF_IDENTIFICATION = 'FNF_IDENTIFICATION',
  SIMPLE_OTP = 'SIMPLE_OTP',
  LONG_OTP = 'LONG_OTP',
  CUSTOM_SECRET = 'CUSTOM_SECRET',
  NO_2FA = 'NO_2FA'
}

const ADVANCEDSETTINGDATA = [
  {
    id: '1',
    type: AdvancedSetting.FNF_IDENTIFICATION,
    title: 'F&F Identification',
    subtitle: 'Use contact\'s phone number or email ID',
  },
  {
    id: '2',
    type: AdvancedSetting.SIMPLE_OTP,
    title: 'Simple OTP (6 digit)',
    subtitle: 'Reduces the chances of man-in-the-middle attack',
  },
  {
    id: '3',
    type: AdvancedSetting.LONG_OTP,
    title: 'Long OTP (Unguessable)',
    subtitle: 'Improved security against server access/hack',
  },
  {
    id: '4',
    type: AdvancedSetting.CUSTOM_SECRET,
    title: 'Custom Secret Phrase',
    subtitle: 'Manually enter a paraphrase with a hint',
  },
  {
    id: '5',
    type: AdvancedSetting.NO_2FA,
    title: 'No Second Factor',
    subtitle: 'Good for small gifts',
  },
]

enum FNF_IDENTIFICATION_TYPE {
  PHONE_NUMBER = 'PHONE_NUMBER',
  EMAIL = 'EMAIL'
}

const FNFIDENTIFICATIONDATA = [
  {
    id: '1',
    type: FNF_IDENTIFICATION_TYPE.PHONE_NUMBER,
    title: 'Phone Number',
    subtitle: 'Confirm with contact\'s phone number',
  },
  {
    id: '2',
    type: FNF_IDENTIFICATION_TYPE.EMAIL,
    title: 'Email Address',
    subtitle: 'Confirm with contact\'s email address',
  },
]

const GiftDetails = ( { navigation } ) => {


  const renderItem = ( { item } ) => {
    if( addfNf ){
      if( item.type === AdvancedSetting.FNF_IDENTIFICATION )
        return<SettingCard type={item.type} title={item.title} subTitle={item.subtitle} />
    } else {
      if( item.type !== AdvancedSetting.FNF_IDENTIFICATION )
        return<SettingCard type={item.type} title={item.title} subTitle={item.subtitle} />
    }
  }


  const renderIdentificationItem = ( { item } ) => (
    <IdentificationCard type={item.type} title={item.title} subtitle={item.subtitle} />
  )

  const dispatch = useDispatch()
  const { giftId, contact } = navigation.state.params
  const wallet: Wallet = useSelector( state => state.storage.wallet )
  const strings = translations[ 'f&f' ]
  // const login = translations[ 'login' ]
  const common = translations[ 'common' ]
  const [ note, setNote ] = useState(
    navigation.state.params.giftMsg != undefined ? navigation.state.params.giftMsg :
      'Bitcoin is a new type of money that is not controlled by any government or company' )
  const [ encryptionType, setEncryptionType ] = useState( DeepLinkEncryptionType.OTP )
  const [ bottomNote, setbottomNote ] = useState(
    navigation.state.params.giftMsg != undefined ? navigation.state.params.giftMsg :
      '' )
  const [ name, setName ] = useState( '' )
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const [ addfNf, setAddfNf ] = useState( false )
  const [ dropdownBoxList, setDropdownBoxList ] = useState( [] )
  const [ advanceSettingsModal, setAdvanceSettingsModal ] = useState( false )
  const [ selectedAdvancedOption, setSelectedAdvancedOption ] = useState( AdvancedSetting.SIMPLE_OTP )
  const [ FnFIdentificationModal, setFnFIdentificationModal ] = useState( false )
  const [ selectedFAndF, setSelectedFAndF ] = useState( FNF_IDENTIFICATION_TYPE.PHONE_NUMBER )

  const [ customSecretIdentificationModal, setCustomSecretIdentificationModal ] = useState( false )

  const [ secretPhrase, setSecretPhrase ] = useState( '' )
  const [ secretPhraseVisibility, setSecretPhraseVisibility ] = useState( true )
  const [ confirmSecretPhrase, setConfirmSecretPhrase ] = useState( '' )
  const [ confirmSecretPhraseVisibility, setconfirmSecretPhraseVisibility ] = useState( true )
  const [ secretPhraseHint, setSecretPhraseHint ] = useState( '' )

  const [ dropdownBoxValue, setDropdownBoxValue ] = useState( {
    id: GiftThemeId.ONE,
    title: 'Gift Sats',
    subText: 'Something that appreciates with time',
    avatar: <GiftCard />,
    color: Colors.darkBlue
  } )
  const [ isKeyboardVisible, setKeyboardVisible ] = useState( false )

  useEffect( () => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible( true )
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible( false )
      }
    )

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [] )
  useEffect( () => {
    setDropdownBoxList( ThemeList )
  }, [] )

  useEffect( ()=>{
    setbottomNote( ()=>{
      if( encryptionType != 'DEFAULT' ){
        return `Your friend will be prompted to enter their ${encryptionType == 'OTP' ? 'OTP' : encryptionType == 'LONG_OTP' ? 'OTP':encryptionType == 'SECRET_PHRASE' &&'secret phrase' } while accepting the gift. You can change the 2FA from advanced.`
      }else{
        return 'No second factor has been used. You can change the 2FA settings from Advanced.'
      }
    } )
  }, [ encryptionType ] )
  useEffect( () => {
    setName( wallet.userName? wallet.userName: wallet.walletName )
  }, [ wallet.walletName, wallet.userName ] )

  const { title, walletName, gift, avatar }: {title: string, walletName: string, gift: Gift, avatar: boolean} = navigation.state.params


  const IdentificationCard = ( { type, title, subtitle } ) => {
    return (
      <AppBottomSheetTouchableWrapper
        onPress={() => {setSelectedFAndF( type )}}>

        <View style={styles.cardContainer}>
          <View style={styles.radioBtnContainer}>
            <RadioButton
              isChecked={type === selectedFAndF}
              size={20}
              color={Colors.lightBlue}
              borderColor={Colors.borderColor}
            />
          </View>
          <View>
            <Text style={styles.identificationHeading}>{title}</Text>
            <Text numberOfLines={2} style={styles.identificationDescription}>{subtitle}</Text>
          </View>

        </View>
      </AppBottomSheetTouchableWrapper>
    )
  }

  const selectAdvancedOption = ( type: AdvancedSetting ) => {
    setSelectedAdvancedOption( type )
    setAdvanceSettingsModal( false )

    switch( type ){
        case AdvancedSetting.NO_2FA:
          setEncryptionType( DeepLinkEncryptionType.DEFAULT )
          break

        case AdvancedSetting.FNF_IDENTIFICATION:
          setFnFIdentificationModal( true ) // selected F&F
          break

        case AdvancedSetting.SIMPLE_OTP:
          setEncryptionType( DeepLinkEncryptionType.OTP )
          break

        case AdvancedSetting.LONG_OTP:
          setEncryptionType( DeepLinkEncryptionType.LONG_OTP )
          break

        case AdvancedSetting.CUSTOM_SECRET:
          setEncryptionType( DeepLinkEncryptionType.SECRET_PHRASE )
          setCustomSecretIdentificationModal( true )
          break

        default:
          setEncryptionType( DeepLinkEncryptionType.OTP )
    }
  }

  const SettingCard = ( { type, title, subTitle } ) => {
    return (
      <AppBottomSheetTouchableWrapper
        onPress={() => {
          selectAdvancedOption( type )
        }}>
        <View style={styles.cardContainer}>
          <View style={styles.radioBtnContainer}>
            <RadioButton
              isChecked={type === selectedAdvancedOption }
              size={20}
              color={Colors.lightBlue}
              borderColor={Colors.borderColor}
              onpress={() => {selectAdvancedOption( type )}}
            />
          </View>
          <View>
            <Text style={styles.identificationHeading}>{title}</Text>
            <Text numberOfLines={2} style={styles.identificationDescription}>{subTitle}</Text>
          </View>
        </View>
      </AppBottomSheetTouchableWrapper>
    )
  }

  const AdvancedSettingsModal = () => {
    return (
      <View style={styles.modalContentContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setAdvanceSettingsModal( false )
          }}
          style={{
            width: wp( 7 ),
            height: wp( 7 ),
            borderRadius: wp( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: wp( 3 ),
            marginRight: wp( 3 ),
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} />
        </TouchableOpacity>
        <View>
          <View
            style={{
              marginLeft: wp( 7 ),
            }}
          >
            <Text style={{
              ...styles.modalTitleText, fontSize: 18, fontFamily: Fonts.FiraSansRegular
            }}>Add Second Factor</Text>
          </View>

          <Text
            style={{
              ...styles.modalInfoText,
              paddingTop: 8,
              marginLeft: 30,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: 14,
            }}
          >
            {'For confirming identity or improving security'}
          </Text>

          <FlatList data={ADVANCEDSETTINGDATA} renderItem={renderItem} keyExtractor={( item ) => item.id} />
          <Text style={{
            ...styles.modalInfoText,
            paddingTop: 8,
            marginLeft: 30,
            fontFamily: Fonts.FiraSansRegular,
            fontSize: 14,
            marginTop: 40
          }}>Use a different medium/app for sending the 2nd factor.(Not the same as the gift link/QR)</Text>
        </View>
      </View>
    )
  }


  const FandFIndentificationModal = () => {
    return (
      <View style={styles.modalContentContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setFnFIdentificationModal( false )
          }}
          style={{
            width: wp( 7 ),
            height: wp( 7 ),
            borderRadius: wp( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: wp( 3 ),
            marginRight: wp( 3 ),
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} />
        </TouchableOpacity>
        <View>
          <View
            style={{
              marginLeft: wp( 7 ),
            }}
          >
            <Text style={{
              ...styles.modalTitleText, fontSize: 18, fontFamily: Fonts.FiraSansRegular, color: 'grey',
            }}>Add Second Factor</Text>
            <Text
              style={{
                ...styles.modalInfoText,
                color: '#006DB4',
                fontFamily: Fonts.FiraSansRegular,
                fontSize: 18,
              }}
            >
              {'F&F Identication'}
            </Text>
          </View>

          <Text
            style={{
              ...styles.modalInfoText,
              paddingTop: 8,
              marginLeft: 30,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: 12,
            }}
          >
            {'Use a phone number or email ID stored in your contact details. the recipient needs to confirm'}
          </Text>

          <FlatList data={FNFIDENTIFICATIONDATA} renderItem={renderIdentificationItem} keyExtractor={( item ) => item.id} />
          <Text style={{
            ...styles.modalInfoText,
            paddingTop: 8,
            marginLeft: 30,
            fontFamily: Fonts.FiraSansRegular,
            fontSize: 14,
            marginTop: 50
          }}>The option selected above will be used to encrypt your Gift Sats. Don't use the medium</Text>
        </View>

        <View style={{
          flexDirection:'row', alignItems: 'center'
        }}>
          <TouchableOpacity
            style={{
              ...styles.btnContainer, marginTop: 30
            }}
            onPress={() => {
              console.log( 'Proceed clicked' )
            }}
          >
            <Text style={styles.btnText}>Proceed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              marginTop: 30, marginLeft: 40
            }}
            onPress={() => {
              console.log( 'Back clicked' )
              // navigation.goback();
            }}
          >
            <Text style={{
              ...styles.btnText, color:'#006DB4'
            }}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }


  const SecretPhaseModal = () => {
    return (
      <View style={styles.modalContentContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setCustomSecretIdentificationModal( false )
          }}
          style={{
            width: wp( 7 ),
            height: wp( 7 ),
            borderRadius: wp( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: wp( 3 ),
            marginRight: wp( 3 ),
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} />
        </TouchableOpacity>
        <View>
          <View
            style={{
              marginLeft: wp( 7 ),
            }}
          >
            <Text style={{
              ...styles.modalTitleText, fontSize: 18, fontFamily: Fonts.FiraSansRegular, color: 'grey'
            }}>Add Second Factor</Text>
            <Text
              style={{
                ...styles.modalInfoText,
                color: '#006DB4',
                fontFamily: Fonts.FiraSansRegular,
                fontSize: 18,
              }}
            >
              {'Custom Secret Phrase'}
            </Text>
          </View>

          <View style={styles.textInputContainer}>
            <TextInput style={styles.textInput}
              secureTextEntry={secretPhraseVisibility}
              placeholder='Enter a Secret Phrase'
              onChangeText={( text ) => {
                setSecretPhrase( text )
              }}/>
            <TouchableWithoutFeedback
              onPress={() => {
                setSecretPhraseVisibility( !secretPhraseVisibility )
              }}
            >
              <Feather
                style={{
                  marginLeft: 'auto',
                }}
                size={15}
                color={Colors.blue}
                name={secretPhraseVisibility ? 'eye-off' : 'eye'}
              />
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.textInputContainer}>
            <TextInput style={styles.textInput}
              secureTextEntry={confirmSecretPhraseVisibility}
              placeholder='Confirm the Secret Phrase'

              onChangeText={( text ) => {
                setConfirmSecretPhrase( text )
              }}
            />
            <TouchableWithoutFeedback
              onPress={() => {
                setconfirmSecretPhraseVisibility( !confirmSecretPhraseVisibility )
              }}
            >
              <Feather
                style={{
                  marginLeft: 'auto',
                }}
                size={15}
                color={Colors.blue}
                name={confirmSecretPhraseVisibility ? 'eye-off' : 'eye'}
              />
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.textInputContainer}>
            <TextInput style={styles.textInput}
              placeholder="Add a hint"
              onChangeText={( text ) => {
                setSecretPhraseHint( text )
              }}
            />
          </View>
          <Text
            style={{
              margin: 10,
              marginLeft: 35,
              color: '#6C6C6C',
              width:'85%'
            }}
          >
              The recipient will be shown the hint and they will have to provide the passphrase to accept the gift
          </Text>

          <TouchableOpacity
            style={{
              ...styles.btnContainer, backgroundColor: ( secretPhrase && secretPhrase === confirmSecretPhrase )? Colors.blue: Colors.lightBlue
            }}
            disabled={!( secretPhrase && secretPhrase === confirmSecretPhrase )}
            onPress={() => {
              navigation.replace( 'SendGift', {
                fromScreen: 'Gift',
                giftId,
                encryptionType,
                note,
                secretPhrase,
                secretPhraseHint,
                contact,
                senderName: name,
                themeId: dropdownBoxValue?.id ?? GiftThemeId.ONE,
                setActiveTab: navigation.state.params.setActiveTab
              } )
            }}
          >
            <Text style={styles.btnText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }



  const renderButton = ( text, condn ) => {

    const isDisabled = false
    return(
      <TouchableOpacity
        disabled={isDisabled}
        onPress={()=>{
          if ( contact ) {
            navigation.replace( 'AddContactSendRequest', {
              SelectedContact: contact,
              giftId: giftId,
              note,
              headerText: strings.addContact,
              subHeaderText:strings.send,
              contactText:strings.adding,
              showDone:true,
              themeId: dropdownBoxValue?.id ?? GiftThemeId.ONE,
              senderName: name,
              setActiveTab: navigation.state.params.setActiveTab
            } )
          } else if ( condn === 'Add F&F and Send' ) {
            navigation.navigate( 'AddContact', {
              fromScreen: 'GiftDetails',
              giftId,
              note,
              senderName: name,
              setActiveTab: navigation.state.params.setActiveTab
            } )
          } else {
            if( encryptionType === DeepLinkEncryptionType.SECRET_PHRASE ) {
              if( !secretPhrase.trim() || !secretPhraseHint.trim() ){
                Toast( 'Enter secret phrase and hint' )
                return
              }
            }
            navigation.replace( 'SendGift', {
              fromScreen: 'Gift',
              giftId,
              encryptionType,
              note,
              contact,
              senderName: name,
              themeId: dropdownBoxValue?.id ?? GiftThemeId.ONE,
              setActiveTab: navigation.state.params.setActiveTab
            } )
          }

        }}
        style={isDisabled ? {
          ...styles.disabledButtonView
        } : {
          ...styles.buttonView
        }
        }
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        height: '100%',
      }}
      keyboardShouldPersistTaps="handled"
      style = {{
        backgroundColor: Colors.backgroundColor
      }}
    >
      <SafeAreaView style={styles.viewContainer}>
        <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
        <View style={styles.advancedButton}>
          <View
            style={[
              CommonStyles.headerContainer,
              {
                backgroundColor: Colors.backgroundColor,
              },
            ]}
          >
            <TouchableOpacity
              style={CommonStyles.headerLeftIconContainer}
              onPress={() => {
                navigation.goBack()
              }}
            >
              <View style={styles.headerLeftIconInnerContainer}>
                <LeftArrow />
              </View>
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity
              onPress={() =>
                setAdvanceSettingsModal( true )
              }
              disabled={addfNf}
              style={{
                height: 30,
                width: 150,
                paddingHorizontal:6,
                flexDirection:'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: Colors.lightBlue
              }}
            >
              <View style={styles.settingIcon}>
                <Setting/>
              </View>
              <Text style={{
                color: 'white'
              }}>{'Advanced'}</Text>
              <View style={styles.menuIcon}>
                <Menu/>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {advanceSettingsModal && <ModalContainer
          closeBottomSheet={() => setAdvanceSettingsModal( false )}
          visible={advanceSettingsModal}
          onBackground={()=>setAdvanceSettingsModal( false )}
        >
          {AdvancedSettingsModal()}
        </ModalContainer>}

        {FnFIdentificationModal && <ModalContainer
          closeBottomSheet={() => setFnFIdentificationModal( false )}
          visible={FnFIdentificationModal}
          onBackground={()=>setFnFIdentificationModal( false )}
        >
          {FandFIndentificationModal()}
        </ModalContainer>}

        {
          customSecretIdentificationModal && <ModalContainer
            closeBottomSheet={() => {
              setCustomSecretIdentificationModal( false )
            }}
            visible={customSecretIdentificationModal}
            onBackground={()=>{setCustomSecretIdentificationModal( false )}}
          >
            {SecretPhaseModal()}
          </ModalContainer>}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginLeft: wp( 3 ),
          }}
        >
          <HeaderTitle
            firstLineTitle={'Enter gift details'}
            secondLineTitle="" //{'Who are we delighting today?'}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: wp( 8 ),
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: RFValue( 14 ),
              color: Colors.black,
              fontWeight: '400',
            }}
          >
            You have received gift from{' '}
          </Text>
          <View style={styles.inputBox}>
            <TextInput
              style={
                name
                  ? [ styles.modalInputBox ]
                  : [
                    styles.modalInputBox,
                    {
                      fontSize: RFValue( 15 ),
                    },
                  ]
              }
              placeholder={'Enter name'}
              placeholderTextColor={Colors.gray1}
              value={name}
              keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
              returnKeyType="done"
              returnKeyLabel="Done"
              autoCompleteType="off"
              autoCorrect={false}
              autoCapitalize="none"
              onChangeText={( txt ) => {
                setName( txt )
              }}
              onBlur={() => {
                dispatch( updateUserName( name ) )
              }}
            />
          </View>
        </View>
        <Text
          style={{
            fontSize: RFValue( 14 ),
            color: Colors.black,
            marginHorizontal: wp( 8 ),
            lineHeight: wp( 7 ),
          }}
        >
          {'Scan the QR or click the link to accept your gift.'}
        </Text>
        <TouchableOpacity
          onPress={() => setDropdownBoxOpenClose( !dropdownBoxOpenClose )}
          style={[
            styles.dashedContainer,
            {
              borderColor: dropdownBoxValue?.color ?? Colors.lightBlue,
            },
          ]}
        >
          <View
            style={[
              styles.dashedStyle,
              {
                borderColor: dropdownBoxValue?.color ?? Colors.lightBlue,
              },
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width:'100%'
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width:'97%'
                }}
              >
                <View
                  style={{
                    margin: wp( 1 ),
                  }}
                >
                  {dropdownBoxValue?.avatar ? dropdownBoxValue?.avatar : <GiftCard />}
                </View>

                <View>
                  <Text style={styles.titleText}>{dropdownBoxValue?.title ? dropdownBoxValue?.title : 'Greeting Bitcoin'}</Text>
                  <Text style={styles.subText}>{dropdownBoxValue?.subText ? dropdownBoxValue?.subText : 'Greeting Bitcoin'}</Text>
                </View>
              </View>
              {dropdownBoxOpenClose ? <ArrowUp /> : <ArrowDown />}
            </View>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity
          activeOpacity={10}
          style={
            dropdownBoxOpenClose
              ? styles.dropdownBoxOpened
              : styles.dropdownBox
          }
          onPress={() => {
            setDropdownBoxOpenClose( !dropdownBoxOpenClose )
          }}
          disabled={isDisabled}
        >
          <Text style={styles.dropdownBoxText}>
            {dropdownBoxValue.question
              ? dropdownBoxValue.question
              : strings.SelectQuestion}
          </Text>{
            dropdownBoxOpenClose ? <ArrowDown /> : <ArrowUp />
          }
        </TouchableOpacity> */}
        {dropdownBoxOpenClose ? (
          <View style={styles.dropdownBoxModal}>
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              style={{
                height: hp( '40%' ),
              }}
            >
              {dropdownBoxList.map( ( value, index ) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setTimeout( () => {
                      setDropdownBoxValue( value )
                      setDropdownBoxOpenClose( false )
                    }, 70 )
                  }}
                  style={[
                    styles.dashedStyle,
                    {
                      margin: wp( 1.5 ),
                      borderColor: `${value.color ?? Colors.lightBlue}`,
                      backgroundColor: dropdownBoxValue ? ( dropdownBoxValue?.id == value.id ? Colors.skyBlue : Colors.white ) : Colors.white,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          margin: wp( 1 ),
                        }}
                      >
                        {value.avatar}
                      </View>

                      <View>
                        <Text style={styles.titleText}>{value.title}</Text>
                        <Text style={styles.subText}>{value.subText}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ) )}
            </ScrollView>
          </View>
        ) : null}
        <View style={[ styles.inputBoxLong, styles.inputField ]}>
          <TextInput
            style={[
              styles.modalInputBox,
              {
                fontFamily: Fonts.FiraSansItalic,
              },
            ]}
            placeholder={`Add a personal note (${common.optional})`}
            placeholderTextColor={Colors.gray1}
            value={note}
            keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
            blurOnSubmit={true}
            autoCompleteType="off"
            autoCorrect={false}
            autoCapitalize="none"
            numberOfLines={2}
            multiline
            onChangeText={( text ) => {
              setNote( text )
            }}
          />
        </View>

        <View
          style={{
            marginTop: hp( 2 ),
            marginBottom: hp( 2 ),
            marginHorizontal: wp( 7 ),
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity
            onPress={() => setAddfNf( !addfNf )}
            style={{
              flexDirection: 'row',
            }}
          >
            <View style={styles.imageView}>
              {addfNf &&
                <CheckMark
                  style={{
                    marginLeft: 6,
                    marginTop: 6,
                  }}
                />
              }
            </View>
            <Text style={{
              color: Colors.textColorGrey,
              fontSize: RFValue( 12 ),
              fontFamily: Fonts.FiraSansRegular,
              marginHorizontal: wp( 3 )
            }}>
          Add recipient to Friends and Family
            </Text>
          </TouchableOpacity>
        </View>

        {!isKeyboardVisible && <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: hp( 2 ),
            marginLeft: wp( 2 ),
          }}
        >
          {renderButton( 'Next', addfNf ? 'Add F&F and Send' : 'Next' )}
          <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorActiveView} />
            <View style={styles.statusIndicatorInactiveView} />
          </View>
        </View>}


      </SafeAreaView>
      {!dropdownBoxOpenClose && !isKeyboardVisible && <View style={{
        marginBottom: DeviceInfo.hasNotch ? hp( '3%' ) : 0
      }}>
        <BottomInfoBox
          title={'Note'}
          infoText={
            bottomNote
          }
        />
      </View>}
    </ScrollView>
  )
}

const styles = StyleSheet.create( {
  titleText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    marginHorizontal: wp( 2 )
  },
  dropdownBox: {
    flexDirection: 'row',
    borderColor: Colors.white,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 15,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  dropdownBoxOpened: {
    flexDirection: 'row',
    borderColor: Colors.white,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 15,
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
    shadowColor: Colors.gray2,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 10, height: 10
    },
    backgroundColor: Colors.white,
  },
  dropdownBoxModalElementView: {
    height: 55,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '6%' ),
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    height: 5,
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  inputField: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    width: wp( 90 )
  },
  line:{
    height: '100%',
    width: wp( 0.18 ),
    backgroundColor: Colors.lightTextColor,
    marginHorizontal: wp( 3 ),
  },
  subText: {
    color: Colors.lightTextColor,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginHorizontal: wp( 2 ),
    width: 240,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 8/2,
    backgroundColor: Colors.lightTextColor,
    marginHorizontal: wp( 2 ),
    alignSelf: 'center'

  },
  timeInfo:{
    width: '87%',
    alignSelf: 'center',
    alignItems: 'flex-start',
    marginVertical: hp( 1 )
  },
  dashedStyle: {
    backgroundColor: Colors.gray7,
    borderRadius: wp( 2 ),
    paddingVertical: hp( 1 ),
    paddingHorizontal: wp( 4 ),
    borderColor: Colors.lightBlue,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  normalStyle: {
    backgroundColor: Colors.gray7,
    paddingTop: hp( 1 ),
    paddingHorizontal: wp( 2 ),
  },
  dashedContainer: {
    width: '90%',
    backgroundColor: Colors.gray7,
    // shadowOpacity: 0.06,
    // shadowOffset: {
    //   width: 10, height: 10
    // },
    // shadowRadius: 10,
    // elevation: 2,
    alignSelf: 'center',
    borderRadius: wp( 2 ),
    marginTop: hp( 1 ),
    marginBottom: hp( 1 ),
    paddingVertical: wp( 1 ),
    paddingHorizontal: wp( 1 ),
    borderColor: Colors.lightBlue,
    borderWidth: 0.7,
  },
  avatarContainer: {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: wp( 9 )/2,
  },
  bottomButton: {
    backgroundColor: Colors.lightBlue,
    height: wp( '18%' ),
    width: wp( '45%' ),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderColor,
    alignSelf: 'center',
  },
  buttonSubText: {
    marginTop: hp( 0.4 ),
    color: Colors.white,
    fontSize: RFValue( 11 ),
    letterSpacing: 0.5,
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    width: wp( '46%' )
  },
  buttonText: {
    color: Colors.backgroundColor1,
    fontSize: RFValue( 15 ),
    letterSpacing: 0.01,
    fontFamily: Fonts.FiraSansMedium,
    // marginLeft: 10,
    // marginRight: 10,
    marginLeft: 0,
    marginRight: 0,
    width: wp( '46%' ),
    textAlign: 'center'
  },
  keeperViewStyle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundColor,
    paddingHorizontal: wp( '4%' ),
    justifyContent: 'space-between',
    height: wp( '30' ),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: wp( 10 )
  },
  modalContentContainer: {
    backgroundColor: Colors.backgroundColor,
    paddingBottom: hp( 4 ),
  },
  viewContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  buttonView: {
    height: wp( '13%' ),
    width: wp( '34%' ),
    paddingHorizontal: wp( 2 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    marginLeft: wp( 5 )
  },
  disabledButtonView: {
    marginTop: hp( 2 ),
    height: wp( '12%' ),
    width: wp( '30%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.lightBlue,
    marginLeft: wp( 5 )
  },
  imageView: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 1, height: 1
    },
  },
  modalInputBox: {
    flex: 1,
    //height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingHorizontal: 15,
    width: '90%',
    paddingVertical: 7,
  },
  inputBox: {
    borderRadius: 10,
    backgroundColor: Colors.white,
    width: wp( 32 ),
    height: wp( 10 ),
    marginHorizontal: wp( 1 )
  },
  inputBoxLong: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: Colors.white,
  },
  // inputBoxFocused: {
  //   borderWidth: 0.5,
  //   borderRadius: 10,
  //   marginLeft: 20,
  //   marginRight: 20,
  //   elevation: 10,
  //   shadowColor: Colors.borderColor,
  //   shadowOpacity: 10,
  //   shadowOffset: {
  //     width: 10, height: 10
  //   },
  //   backgroundColor: Colors.white,
  // },
  accImage:{
    marginRight: wp( 4 )
  },
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
  },
  proceedButtonText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium
  },
  selectedContactsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.blue,
    borderRadius: wp ( 2 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 )
  },
  contactText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  headerLeftIconInnerContainer:{
    marginLeft: wp( 8.7 ),
  },
  cardContainer:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fff',
    width:'80%',
    alignSelf:'center',
    padding:13,
    borderRadius:8,
    paddingHorizontal:20,
    marginVertical:10,
  },
  identificationHeading:{
    color:'#006DB4',
    fontSize:13,
    fontWeight:'400',
    fontFamily: Fonts.FiraSansRegular,

  },
  identificationDescription:{
    color:'#6C6C6C',
    fontSize:11,
    fontWeight:'400',
    width:225,
    fontFamily: Fonts.FiraSansRegular,

  },
  radioBtnContainer:{
    marginRight:10
  },
  advancedButton: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    width: '94%'
  },
  textInputContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    width:'85%',
    alignSelf:'center',
    marginTop:10,
    backgroundColor:'#fff',
    padding:14,
    borderRadius:10
  },
  textInput:{
    width:'92%'
  },
  btnContainer:{
    marginTop:10,
    backgroundColor:'#006DB4',
    width:100,
    padding:14,
    borderRadius:6,
    marginLeft: 30,
    justifyContent:'center',
    alignItems:'center',
  },
  btnText: {
    color: '#fff',
    fontWeight:'500',
    fontSize:15,
    fontFamily: Fonts.FiraSansRegular
  },
  menuIcon:{
    paddingTop:hp( 0.6 ),
  },
  settingIcon:{
    paddingTop:hp( 0.3 ),
  }
} )

export default GiftDetails
