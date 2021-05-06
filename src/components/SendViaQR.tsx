import React, { useState, useEffect } from 'react'
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomInfoBox from './BottomInfoBox'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import { nameToInitials } from '../common/CommonFunctions'
import { ScrollView } from 'react-native-gesture-handler'
import QRCode from 'react-native-qrcode-svg'
import {
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
} from '../common/constants/wallet-service-types'
import TextLink from './TextLink'
import Ionicons from 'react-native-vector-icons/Ionicons'

export default function SendViaQR( props ) {
  const [ contactName, setContactName ] = useState( '' )
  const amount = props.amount
  const contact = props.contact
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const [ dropdownBoxList, setDropdownBoxList ] = useState( [
    {
      id: '1',
      account_name: 'Test Account',
      type: TEST_ACCOUNT,
    },
    {
      id: '2',
      account_name: 'Checking Account',
      type: REGULAR_ACCOUNT,
    },
    {
      id: '3',
      account_name: 'Saving Account',
      type: SECURE_ACCOUNT,
    },
  ] )
  const [ serviceType, setServiceType ] = useState(
    props.serviceType ? props.serviceType : '',
  )
  //console.log("amountCurrency", props.amountCurrency);
  const [ Contact, setContact ] = useState( props.contact ? props.contact : {
  } )
  useEffect( () => {
    if ( contact ) {
      setContact( props.contact )
    }
  }, [ contact ] )

  useEffect( () => {
    if ( props.serviceType ) {
      setServiceType( props.serviceType )
    }
  }, [ props.serviceType ] )

  useEffect( () => {
    const contactName =
      Contact && Contact.firstName && Contact.lastName
        ? Contact.firstName + ' ' + Contact.lastName
        : Contact && Contact.firstName && !Contact.lastName
          ? Contact.firstName
          : Contact && !Contact.firstName && Contact.lastName
            ? Contact.lastName
            : ''
    setContactName( contactName )
  }, [ Contact ] )

  const renderVerticalDivider = () => {
    return (
      <View
        style={{
          width: 1,
          height: '60%',
          backgroundColor: Colors.borderColor,
          marginRight: 5,
          marginLeft: 5,
          alignSelf: 'center',
        }}
      />
    )
  }

  const setPhoneNumber = () => {
    const phoneNumber = Contact.phoneNumbers[ 0 ].number
    let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
    number = number.slice( number.length - 10 ) // last 10 digits only
    return number
  }
  
  return (
    <View style={styles.modalContainer}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          paddingRight: 10,
          paddingBottom: hp( '1.5%' ),
          paddingTop: hp( '1%' ),
          marginLeft: 10,
          marginRight: 10,
          marginBottom: hp( '1.5%' ),
        }}
      >
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center'
        }}>
          {/* <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.onPressBack();
            }}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper> */}
          <View style={{
            flex: 1, marginLeft: 5
          }}>
            <Text style={styles.modalHeaderTitleText}>
              {props.headerText ? props.headerText : 'Send Request via QR'}
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue( 12 ),
                fontFamily: Fonts.FiraSansRegular,
                paddingTop: 5,
              }}
            >
              {props.subHeaderText
                ? props.subHeaderText
                : 'Scan the QR from your Contact\'s Hexa Wallet'}
            </Text>
          </View>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressDone()}
            style={{
              height: wp( '8%' ),
              width: wp( '18%' ),
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.blue,
              justifyContent: 'center',
              borderRadius: 8,
              alignSelf: 'center',
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue( 12 ),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              Done
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      <ScrollView contentContainerStyle={{
        flex: 1
      }}>
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: props.isFromReceive ? 0 : hp( '1.7%' ),
            marginBottom: props.isFromReceive ? 0 : hp( '1.7%' ),
          }}
        >
          {!props.isFromReceive ? (
            <View>
              {contact && (
                <View style={styles.contactProfileView}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center'
                  }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                        backgroundColor: Colors.backgroundColor1,
                        height: 90,
                        position: 'relative',
                        borderRadius: 10,
                      }}
                    >
                      <View style={{
                        marginLeft: 70
                      }}>
                        {props.contactText ? (
                          <Text
                            style={{
                              color: Colors.textColorGrey,
                              fontFamily: Fonts.FiraSansRegular,
                              fontSize: RFValue( 11 ),
                              marginLeft: 25,
                              paddingTop: 5,
                              paddingBottom: 3,
                            }}
                          >
                            {props.contactText}
                          </Text>
                        ) : null}
                        {contactName ? (
                          <Text style={styles.contactNameText}>
                            {contactName}
                          </Text>
                        ) : null}
                        {Contact &&
                          Contact.phoneNumbers &&
                          Contact.phoneNumbers.length ? (
                            <Text
                              style={{
                                color: Colors.textColorGrey,
                                fontFamily: Fonts.FiraSansRegular,
                                fontSize: RFValue( 10 ),
                                marginLeft: 25,
                                paddingTop: 3,
                              }}
                            >
                              {setPhoneNumber()}
                              {/* {Contact && Contact.phoneNumbers[0].digits} */}
                            </Text>
                          ) : Contact &&
                            Contact.emails &&
                            Contact.emails.length ? (
                              <Text
                                style={{
                                  color: Colors.textColorGrey,
                                  fontFamily: Fonts.FiraSansRegular,
                                  fontSize: RFValue( 10 ),
                                  marginLeft: 25,
                                  paddingTop: 3,
                                  paddingBottom: 5,
                                }}
                              >
                                {Contact && Contact.emails[ 0 ].email}
                              </Text>
                            ) : null}
                      </View>
                    </View>
                    {Contact && Contact.imageAvailable ? (
                      <View
                        style={{
                          position: 'absolute',
                          marginLeft: 15,
                          marginRight: 15,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowOpacity: 1,
                          shadowOffset: {
                            width: 2, height: 2
                          },
                        }}
                      >
                        <Image
                          source={Contact && Contact.image}
                          style={{
                            ...styles.contactProfileImage
                          }}
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          position: 'absolute',
                          marginLeft: 15,
                          marginRight: 15,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: Colors.backgroundColor,
                          width: 70,
                          height: 70,
                          borderRadius: 70 / 2,
                          shadowColor: Colors.shadowBlue,
                          shadowOpacity: 1,
                          shadowOffset: {
                            width: 2, height: 2
                          },
                        }}
                      >
                        <Text
                          style={{
                            textAlign: 'center',
                            fontSize: RFValue( 20 ),
                            lineHeight: RFValue( 20 ), //... One for top and one for bottom alignment
                          }}
                        >
                          {nameToInitials( contactName )}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              {props.serviceType ? (
                <AppBottomSheetTouchableWrapper
                  style={{
                    flexDirection: 'row',
                    paddingLeft: 20,
                    paddingRight: 20,
                    marginTop: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  activeOpacity={10}
                  onPress={() => {
                    //setDropdownBoxOpenClose(!dropdownBoxOpenClose);
                  }}
                >
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue( 12 ),
                      fontFamily: Fonts.FiraSansRegular,
                      textAlign: 'center',
                    }}
                  >
                    Receiving to:
                    <Text style={styles.boldItalicText}>
                      {serviceType && serviceType == TEST_ACCOUNT
                        ? '  Test Account'
                        : serviceType && serviceType == REGULAR_ACCOUNT
                          ? '  Checking Account'
                          : serviceType && serviceType == SECURE_ACCOUNT
                            ? '  Saving Account'
                            : ''}
                    </Text>
                  </Text>

                </AppBottomSheetTouchableWrapper>
              ) : null}
              {props.amount && (
                <View style={styles.amountContainer}>
                  <Text
                    style={{
                      color: Colors.blue,
                      fontSize: RFValue( 13 ),
                      fontFamily: Fonts.FiraSansRegular,
                      marginLeft: 5,
                    }}
                  >
                    Requested Amount
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <View style={styles.amountInputImage}>
                        <Image
                          style={styles.textBoxImage}
                          source={require( '../assets/images/icons/icon_bitcoin_gray.png' )}
                        />
                      </View>
                      {renderVerticalDivider()}
                      <Text
                        style={{
                          color: Colors.black,
                          fontSize: RFValue( 20 ),
                          fontFamily: Fonts.FiraSansRegular,
                          marginLeft: 10,
                        }}
                      >
                        {amount}
                      </Text>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue( 13 ),
                          fontFamily: Fonts.FiraSansRegular,
                          marginRight: 5,
                        }}
                      >
                        {props.amountCurrency
                          ? ' ' + props.amountCurrency
                          : ' sats'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : null}
          <View style={{
            height: hp( '27%' ),
            justifyContent: 'center',
            marginLeft: 20,
            marginRight: 20,
            alignItems: 'center',
            marginTop: props.isFromReceive ? 0 : hp( '4%' )
          }}>
            {!props.QR ? (
              <ActivityIndicator size="large" />
            ) : (
              <QRCode value={props.QR} size={hp( '27%' )} />
            )}
          </View>
          {props.autoQRLink &&
            <TextLink onPress={props.onPressLink} text={props.autoQRLink} />
          }
          {/* <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressDone()}
            style={{
              backgroundColor: Colors.blue,
              borderRadius: 10,
              width: wp('50%'),
              height: wp('13%'),
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('3%'),
              marginBottom: hp('3%'),
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Yes, this was scanned
          </Text>
          </AppBottomSheetTouchableWrapper> */}
        </View>
      </ScrollView>

      {!props.isFromReceive ? (
        <View style={{
          marginTop: 'auto'
        }}>
          <BottomInfoBox
            title={props.noteHeader ? props.noteHeader : 'Note'}
            infoText={
              props.noteText ? props.noteText : 'Use the scanner of your friends app to scan the QR and proceed with the Friends and Family request'
            }
          />
        </View>
      ) : null}
    </View>
  )
}
const styles = StyleSheet.create( {
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 2,
    backgroundColor: Colors.backgroundColor,
  },
  contactProfileView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactProfileImage: {
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    resizeMode: 'cover',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '30%' ),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp( '1%' ),
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    paddingBottom: hp( '1.5%' ),
    paddingTop: hp( '1.5%' ),
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBoxImage: {
    width: wp( '6%' ),
    height: wp( '6%' ),
    resizeMode: 'contain',
  },
  dropdownBoxModal: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: hp( '1%' ),
    width: wp( '90%' ),
    height: hp( '18%' ),
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
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 15,
  },
  boldItalicText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    fontStyle: 'italic',
    color: Colors.blue,
  },
} )
