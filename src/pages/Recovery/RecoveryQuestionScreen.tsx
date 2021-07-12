import React, { useState, useEffect } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Colors from '../../common/Colors'
import QuestionList from '../../common/QuestionList'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from 'react-native-vector-icons/Ionicons'
import KnowMoreButton from '../../components/KnowMoreButton'
import { useDispatch, useSelector } from 'react-redux'
import { initializeRecovery } from '../../store/actions/setupAndAuth'
import commonStyle from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

export default function RecoveryQuestionScreen( props ) {
  const walletName = props.navigation.getParam( 'walletName' )
  const dispatch = useDispatch()
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const [ dropdownBoxValue, setDropdownBoxValue ] = useState( {
    id: '',
    question: '',
  } )
  const [ answer, setAnswer ] = useState( '' )
  const [ dropdownBoxList ] = useState( QuestionList )
  const { initializeRecoveryCompleted } = useSelector( state => state.setupAndAuth )
  const { insertedIntoDB } = useSelector( state => state.storage )
  useEffect( () => {
    ( async () => {
      if ( initializeRecoveryCompleted ) {
        await AsyncStorage.setItem( 'recoveryExists', 'true' )
        //props.navigation.navigate( 'RestoreWithICloud' )
        props.navigation.navigate( 'RestoreSelectedContactsList' )
      }
    } )()
  }, [ initializeRecoveryCompleted ] )

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={commonStyle.headerContainer}>
        <TouchableOpacity
          style={commonStyle.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
          }}
          hitSlop={{
            top: 20, left: 20, bottom: 20, right: 20
          }}
        >
          <View style={commonStyle.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.modalContentContainer}>
        <View>
          <View style={{
            flexDirection: 'row', padding: wp( '7%' )
          }}>
            <View style={{
              justifyContent: 'center'
            }}>
              <Text style={styles.modalTitleText}>
                Enter Security Question and Answer
              </Text>
              <Text style={{
                ...styles.modalInfoText, marginTop: wp( '1.5%' )
              }}>
                To recover your wallet you have to select the security question
                and enter its answer
              </Text>
            </View>
            {/* <View style={{
              flex: 1
            }}>
              <KnowMoreButton
                onpress={() => {}}
                containerStyle={{
                  marginLeft: 'auto', marginTop: 10
                }}
                textStyle={{
                }}
              />
            </View>*/}
          </View>
          <View style={{
            paddingLeft: wp( '6%' ), paddingRight: wp( '6%' ),
          }}>
            <TouchableOpacity
              activeOpacity={10}
              style={
                dropdownBoxOpenClose
                  ? styles.dropdownBoxOpened
                  : styles.dropdownBox
              }
              onPress={() => {
                setDropdownBoxOpenClose( !dropdownBoxOpenClose )
              }}
            >
              <Text
                style={{
                  ...styles.dropdownBoxText,
                  color: dropdownBoxValue.question
                    ? Colors.textColorGrey
                    : Colors.borderColor,
                }}
              >
                {dropdownBoxValue.question
                  ? dropdownBoxValue.question
                  : 'Select Security Question'}
              </Text>
              <Ionicons
                style={{
                  marginLeft: 'auto'
                }}
                name={dropdownBoxOpenClose ? 'ios-arrow-up' : 'ios-arrow-down'}
                size={15}
                color={Colors.borderColor}
              />
            </TouchableOpacity>
            <View style={{
              position: 'relative'
            }}>
              {dropdownBoxOpenClose && (
                <View style={styles.dropdownBoxModal}>
                  <ScrollView>
                    {dropdownBoxList.map( ( value, index ) => (
                      <TouchableOpacity
                        onPress={() => {
                          setDropdownBoxValue( value )
                          setDropdownBoxOpenClose( false )
                        }}
                        style={{
                          ...styles.dropdownBoxModalElementView,
                          borderTopLeftRadius: index == 0 ? 10 : 0,
                          borderTopRightRadius: index == 0 ? 10 : 0,
                          borderBottomLeftRadius:
                            index == dropdownBoxList.length - 1 ? 10 : 0,
                          borderBottomRightRadius:
                            index == dropdownBoxList.length - 1 ? 10 : 0,
                          paddingTop: index == 0 ? 5 : 0,
                          backgroundColor:
                            dropdownBoxValue.id == value.id
                              ? Colors.lightBlue
                              : Colors.white,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              dropdownBoxValue.id == value.id
                                ? Colors.blue
                                : Colors.black,
                            fontFamily: Fonts.FiraSansRegular,
                            fontSize: RFValue( 12 ),
                          }}
                        >
                          {value.question}
                        </Text>
                      </TouchableOpacity>
                    ) )}
                  </ScrollView>
                </View>
              )}
              <TextInput
                style={{
                  ...styles.inputBox,
                  width: '100%',
                  marginTop: 15,
                  marginBottom: hp( '3%' ),
                }}
                keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                textContentType="none"
                autoCompleteType="off"
                autoCorrect={false}
                autoCapitalize="none"
                placeholder={'Enter Security Answer'}
                placeholderTextColor={Colors.borderColor}
                value={answer}
                onChangeText={text => {
                  setAnswer( text )
                }}
                onFocus={() => {
                  setDropdownBoxOpenClose( false )
                }}
                onBlur={() => {
                  setDropdownBoxOpenClose( false )
                }}
              />
              <TouchableOpacity style={{
                flexDirection: 'row',
                marginLeft: wp( '6%' ),
                marginRight: wp( '6%' ),
                paddingBottom: 10,
                paddingTop: 10,
                marginBottom: 25
              }}
              onPress={()=> props.navigation.navigate( 'NewRecoveryOwnQuestions', {
                walletName,
              } )}>
                <Text
                  style={{
                    fontFamily: Fonts.FiraSansMediumItalic,
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    fontSize: RFValue( 12 ),
                    color: Colors.blue,
                  }}
                  onPress={()=> props.navigation.navigate( 'NewRecoveryOwnQuestions', {
                    walletName,
                  } )}
                >
                Or choose your own question
                </Text>
              </TouchableOpacity>

              <Text style={styles.modalInfoText}>
                The Security answer is case sensitive, make sure you enter
                the case, numeric or symbolic values correctly
              </Text>
            </View>
            <TouchableOpacity
              disabled={dropdownBoxValue.id && answer ? false : true}
              onPress={() => {
                const security = {
                  question: dropdownBoxValue.question,
                  answer,
                }
                dispatch( initializeRecovery( walletName, security ) )
              }}
              style={styles.questionConfirmButton}
            >
              <Text style={styles.proceedButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  dropdownBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 13 ),
    marginRight: 15,
  },
  dropdownBoxModal: {
    borderRadius: 10,
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    marginTop: hp( '1%' ),
    width: '100%',
    height: '110%',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: {
      width: 0, height: 10
    },
    backgroundColor: Colors.white,
    position: 'absolute',
    zIndex: 9999,
    overflow: 'hidden',
  },
  dropdownBoxModalElementView: {
    height: 55,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
  dropdownBox: {
    marginTop: hp( '2%' ),
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  dropdownBoxOpened: {
    marginTop: hp( '1%' ),
    marginBottom: hp( '1%' ),
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    height: 50,
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
  questionConfirmButton: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    marginTop: hp( '6%' ),
  },
  inputBox: {
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp( '85%' ),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
  },
  inputBoxFocused: {
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp( '85%' ),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
} )
