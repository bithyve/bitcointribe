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
  ImagePropTypes
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
import { Gift, GiftThemeId, Wallet } from '../../bitcoin/utilities/Interface'
import idx from 'idx'
import AccountShell from '../../common/data/models/AccountShell'
import ImageStyles from '../../common/Styles/ImageStyles'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import More from '../../assets/images/svgs/icon_more_gray.svg'
import ArrowDown from '../../assets/images/svgs/icon_arrow_down.svg'
import ArrowUp from '../../assets/images/svgs/icon_arrow_up.svg'
import Halloween from '../../assets/images/svgs/halloween.svg'
import Birthday from '../../assets/images/svgs/birthday.svg'
import ThemeList from './Theme'
import { updateUserName } from '../../store/actions/storage'

import { translations } from '../../common/content/LocContext'

const GiftDetails = ( { navigation } ) => {
  const dispatch = useDispatch()
  const { giftId, contact } = navigation.state.params
  const wallet: Wallet = useSelector( state => state.storage.wallet )
  const strings = translations[ 'f&f' ]
  // const login = translations[ 'login' ]
  const common = translations[ 'common' ]
  const [ note, setNote ] = useState( '' )
  const [ name, setName ] = useState( '' )
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const [ dropdownBoxList, setDropdownBoxList ] = useState( [] )
  const [ isDisabled, setIsDisabled ] = useState( false )
  const [ dropdownBoxValue, setDropdownBoxValue ] = useState( {
    id: GiftThemeId.ONE,
    title: 'Bitcoin',
    subText: 'Lorem ipsum dolor',
    avatar: <GiftCard />,
    color: Colors.darkBlue
    // id: '',
    // title: '',
    // subText: '',
    // avatar: ImagePropTypes,
    // color: ''
  } )

  useEffect( () => {
    setDropdownBoxList( ThemeList )
    setName( wallet.walletName )
  }, [] )

  const { title, walletName, gift, avatar }: {title: string, walletName: string, gift: Gift, avatar: boolean} = navigation.state.params


  const renderButton = ( text ) => {

    const isDisabled = false
    return(
      <TouchableOpacity
        disabled={isDisabled}
        onPress={()=>{
          if ( contact ) {

            navigation.navigate( 'AddContactSendRequest', {
              SelectedContact: contact,
              giftId: giftId,
              headerText: strings.addContact,
              subHeaderText:strings.send,
              contactText:strings.adding,
              showDone:true,
              themeId: dropdownBoxValue?.id ?? GiftThemeId.ONE,
              senderName: name,
            } )
          } else {
            navigation.navigate( 'SendGift', {
              fromScreen: 'Gift',
              giftId,
              note,
              contact,
              senderName: name,
              themeId: dropdownBoxValue?.id ?? GiftThemeId.ONE
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
    <ScrollView contentContainerStyle={{
      flexGrow: 1, height: '100%'
    }}
    keyboardShouldPersistTaps='handled'
    >
      <SafeAreaView style={styles.viewContainer}>
        <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
        <View style={[ CommonStyles.headerContainer, {
          backgroundColor: Colors.backgroundColor
        } ]}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              navigation.goBack()
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
        <View style={{
          flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginRight: wp( 4 )
        }}>
          <HeaderTitle
            firstLineTitle={'Enter gift details'}
            secondLineTitle={'Who are we delighting today?'}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />
        </View>
        <View style={{
          flexDirection: 'row', marginHorizontal: wp( 5 ), alignItems: 'center',
        }}>
          <Text
            style={{
              fontSize: RFValue( 14 ),
              color: Colors.black,
              width: wp( '54%' ),
            }}
          >You have recieved gift from
          </Text>
          <View
            style={[ styles.inputBox ]}
          >
            <TextInput
              style={styles.modalInputBox}
              placeholder={'Enter name'}
              placeholderTextColor={Colors.gray1}
              value={name}
              keyboardType={
                Platform.OS == 'ios'
                  ? 'ascii-capable'
                  : 'visible-password'
              }
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
            marginHorizontal: wp( 5 ),
            lineHeight: wp( 7 )
          }}
        >{`The gift would be valid for 30 days and the sats would revert to ${name} if unclaimed`}
        </Text>
        <TouchableOpacity
          onPress={() => setDropdownBoxOpenClose( !dropdownBoxOpenClose )}
          style={[ styles.dashedContainer, {
            borderColor: dropdownBoxValue?.color ?? Colors.lightBlue
          } ]}>
          <View style={[ styles.dashedStyle, {
            borderColor: dropdownBoxValue?.color ?? Colors.lightBlue
          } ]}>
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center'
              }}>
                <View style={{
                  margin: wp( 1 )
                }}>
                  {dropdownBoxValue?.avatar
                    ? dropdownBoxValue?.avatar
                    : <GiftCard />}
                </View>

                <View>
                  <Text style={styles.titleText}>
                    {dropdownBoxValue?.title
                      ? dropdownBoxValue?.title
                      : 'Greeting Bitcoin'}
                  </Text>
                  <Text style={styles.subText}>
                    {dropdownBoxValue?.subText
                      ? dropdownBoxValue?.subText
                      : 'Greeting Bitcoin'}
                  </Text>
                </View>
              </View>
              {
                dropdownBoxOpenClose ? <ArrowDown /> : <ArrowUp />
              }
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
                height: hp( '40%' )
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
                  style={[ styles.dashedStyle, {
                    margin: wp( 1.5 ),
                    borderColor: `${value.color?? Colors.lightBlue}`,
                    backgroundColor: dropdownBoxValue
                      ? dropdownBoxValue?.id == value.id
                        ? Colors.skyBlue
                        : Colors.white
                      : Colors.white,

                  } ]}
                >
                  <View style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center'
                    }}>
                      <View style={{
                        margin: wp( 1 )
                      }}>
                        {value.avatar}
                      </View>

                      <View>
                        <Text style={styles.titleText}>
                          {value.title}
                        </Text>
                        <Text style={styles.subText}>
                          { 'Lorem ipsum dolor'}
                        </Text>
                      </View>
                    </View>
                  </View>

                </TouchableOpacity>
              ) )}
            </ScrollView>
          </View>
        ) : null}
        <View
          style={[ styles.inputBoxLong, styles.inputField ]}
        >
          <TextInput
            style={styles.modalInputBox}
            placeholder={`Add a personal note (${common.optional})`}
            placeholderTextColor={Colors.gray1}
            value={note}
            keyboardType={
              Platform.OS == 'ios'
                ? 'ascii-capable'
                : 'visible-password'
            }
            returnKeyType="done"
            returnKeyLabel="Done"
            autoCompleteType="off"
            autoCorrect={false}
            autoCapitalize="none"
            onChangeText={( text ) => {
              setNote( text )
            }}
          />
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', marginTop: hp( 2 ), marginLeft: wp( 2 )
        }}>
          {renderButton( 'Next' )}
          <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorActiveView} />
            <View style={styles.statusIndicatorInactiveView} />
          </View>
        </View>

      </SafeAreaView>
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
    marginHorizontal: wp( 2 )
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
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
    width: '90%'
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
} )

export default GiftDetails
