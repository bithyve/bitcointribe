import React, { useEffect, useState } from 'react'
import {
  BackHandler, Image, Linking, Platform,
  SafeAreaView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Octicons from 'react-native-vector-icons/Octicons'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { setReleaseCases } from '../store/actions/preferences'

export default function UpdateApp( props ) {
  const dispatch = useDispatch()

  const releaseDataObj = props.route.params?.releaseData || []
  const isOpenFromNotificationList = props.route.params?.isOpenFromNotificationList || false
  const releaseNumber = props.route.params?.releaseNumber || ''

  const [ releaseNotes, setReleaseNotes ] = useState( [] )
  const [ isUpdateMandatory, setIsUpdateMandatory ] = useState( false )
  const [ releaseData, setReleaseData ] = useState( {
  } )
  const [ isUpdateInValid, setIsUpdateInValid ] = useState( false )
  const releaseCasesValue = useSelector(
    ( state ) => state.preferences.releaseCasesValue,
  )
  useEffect( () => {
    /**
     * Following if condition is for when this page is open from Home page Notification list
     */
    if (
      isOpenFromNotificationList &&
      releaseNumber
    ) {
      if ( DeviceInfo.getBuildNumber() >= releaseNumber ) {
        setIsUpdateInValid( true )
      } else {
        setIsUpdateInValid( false )
      }

      if ( releaseDataObj[ 0 ] && releaseDataObj[ 0 ].reminderLimit == 0 ) {
        setIsUpdateMandatory( true )
      } else if( releaseDataObj[ 0 ] && releaseDataObj[ 0 ].reminderLimit < 0 ) setIsUpdateMandatory( true )

      setReleaseData( releaseDataObj[ 0 ] )
    }

    /**
    * Following code is for when this page is open from Login and check for update
    */
    if ( !isOpenFromNotificationList ) {
      ( async () => {
        const releaseDataOld = releaseCasesValue
        let releaseData = releaseDataOld
        if ( releaseDataObj[ 0 ] && releaseDataObj[ 0 ].reminderLimit > 0 ) {
          if ( !releaseDataOld ) {
            releaseData = {
              ...releaseDataObj[ 0 ],
              reminderLimit: releaseDataObj[ 0 ].reminderLimit - 1,
              build: releaseDataObj[ 0 ].build,
            }
          } else {
            releaseData = {
              ...releaseDataOld,
              reminderLimit: releaseDataOld.reminderLimit - 1,
              build: releaseDataOld.build,
            }
          }
        }

        const releaseNotes = releaseDataObj.length
          ? releaseDataObj.find( ( el ) => {
            return el.reminderLimit === 0
          } )
          : ''
        if (
          releaseNotes ||
          ( releaseDataObj[ 0 ] && releaseDataObj[ 0 ].reminderLimit == 0 ) ||
          ( releaseDataOld && releaseDataOld.reminderLimit == 0 )
        ) {
          setIsUpdateMandatory( true )
        } else if( releaseDataObj[ 0 ] && releaseDataObj[ 0 ].reminderLimit < 0 ){
          setIsUpdateMandatory( true )
        }
        setReleaseData( releaseData )

        // if ( releaseDataOld && releaseDataOld.reminderLimit == 0 ) {
        //   await AsyncStorage.setItem( 'releaseData', '' )
        // }

        BackHandler.addEventListener( 'hardwareBackPress', hardwareBackHandler )
        return () =>
          BackHandler.removeEventListener(
            'hardwareBackPress',
            hardwareBackHandler,
          )

      } )()
    }
  }, [] )

  useEffect( () => {
    if ( releaseData ) {
      const tempReleaseNote = releaseData.releaseNotes
        ? Platform.OS == 'ios'
          ? releaseData.releaseNotes.ios
          : releaseData.releaseNotes.android
        : releaseData.notes
          ? Platform.OS == 'ios'
            ? releaseData.notes.ios
            : releaseData.notes.android
          : ''
      setReleaseNotes( tempReleaseNote.split( '-' ) )
    }
  }, [ releaseData ] )

  const hardwareBackHandler = () => {
    return true
  } // returning true disables the hardware back button

  const upgradeNow = () => {
    const url =
      Platform.OS == 'ios'
        ? 'https://apps.apple.com/us/app/bitcoin-wallet-hexa-2-0/id1586334138'
        : 'https://play.google.com/store/apps/details?id=io.hexawallet.hexa2&hl=en'
    Linking.canOpenURL( url ).then( ( supported ) => {
      if ( supported ) {
        Linking.openURL( url )
      } else {
        // console.log("Don't know how to open URI: " + url);
      }
    } )
  }

  const onClick = async ( _ignoreClick, _remindMeLaterClick ) => {
    let releaseCasesData
    releaseCasesData = {
      ...releaseData,
      ignoreClick: _ignoreClick,
      remindMeLaterClick: _remindMeLaterClick,
    }
    dispatch( setReleaseCases( releaseCasesData ) )

    props.navigation.goBack()
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <View style={{
        ...styles.modalContentContainer
      }}>
        <View
          style={{
            ...styles.successModalHeaderView,

          }}
        >
          <View style={{
            flexDirection: 'row', alignItems: 'center', marginRight: wp( '4%' ),
            marginLeft: wp( '4%' ),
          }}>
            {isOpenFromNotificationList ? (
              <TouchableOpacity
                onPress={() => props.navigation.goBack()}
                hitSlop={{
                  top: 20, left: 20, bottom: 20, right: 20
                }}
                style={{
                  height: 30, width: 30, justifyContent: 'center'
                }}
              >
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.homepageButtonColor}
                  size={17}
                />
              </TouchableOpacity> ) : null}
            <Text style={styles.modalTitleText}>
              {isUpdateInValid ? 'Your app is already updated' :
                'We’re better than ever\nTime to update'}
            </Text>
            {!isUpdateMandatory && !isUpdateInValid ? (
              <TouchableOpacity
                style={{
                  height: wp( '8%' ),
                  width: wp( '20%' ),
                  backgroundColor: Colors.lightBlue,
                  borderWidth: 1,
                  borderColor: Colors.borderColor,
                  borderRadius: 7,
                  marginLeft: 'auto',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
                onPress={() => {
                  if ( isOpenFromNotificationList ) props.navigation.goBack()
                  else onClick( true, false )
                }}
              >
                <Text
                  onPress={() => {
                    if ( isOpenFromNotificationList ) props.navigation.goBack()
                    else onClick( true, false )
                  }}
                  style={{
                    color: Colors.white,
                    fontSize: RFValue( 12 ),
                    fontFamily: Fonts.Regular,
                  }}
                >
                  Close
                </Text>
                <Image
                  style={{
                    width: 12,
                    height: 12,
                    resizeMode: 'contain',
                    marginLeft: 5,
                  }}
                  source={require( '../assets/images/icons/icon_remove.png' )}
                />
              </TouchableOpacity>
            ) : null}
          </View>

        </View>
        {releaseNotes.map( ( value, index ) => {
          return (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: wp( '8%' ),
              }}
            >
              <Octicons
                name={'primitive-dot'}
                size={RFValue( 10 )}
                color={Colors.blue}
              />
              <Text
                style={{
                  marginLeft: wp( '2%' ),
                  color: Colors.blue,
                  fontSize: RFValue( 13 ),
                  fontFamily: Fonts.Regular,
                }}
              >
                {value}
              </Text>
            </View>
          )
        } )}
        <View
          style={{
            marginTop: 'auto',
            marginBottom: hp( '5%' ),
            marginLeft: wp( '8%' ),
          }}
        >
          <Text style={{
            ...styles.modalInfoText, marginBottom: hp( '3%' )
          }}>
            {Platform.OS == 'ios' ? 'For updating you will be taken to the App Store' : 'For updating you will be taken to the Play Store'}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 'auto',
              alignItems: 'center',
            }}
          >
            {!isUpdateInValid ? (
              <TouchableOpacity
                disabled={false}
                onPress={() => {
                  upgradeNow()
                }}
                style={{
                  ...styles.successModalButtonView
                }}
              >
                <Text style={styles.proceedButtonText}>Update Now</Text>
              </TouchableOpacity> ) : null}

            {!isUpdateMandatory && !isUpdateInValid ? (
              <TouchableOpacity
                onPress={() => {
                  if ( isOpenFromNotificationList ) props.navigation.goBack()
                  else
                    onClick( false, true )
                }}
                style={{
                  height: wp( '13%' ),
                  width: wp( '35%' ),
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: 15,
                }}
              >
                <Text
                  onPress={() => {
                    if ( isOpenFromNotificationList ) props.navigation.goBack()
                    else
                      onClick( false, true )
                  }}
                  style={{
                    ...styles.proceedButtonText, color: Colors.blue
                  }}
                >
                  Remind me Later
                </Text>
              </TouchableOpacity>
            ) : null}
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
  box: {
    backgroundColor: Colors.backgroundColor1,
    marginRight: wp( '5%' ),
    marginLeft: wp( '5%' ),
    paddingTop: hp( '2%' ),
    paddingBottom: hp( '2%' ),
    marginBottom: hp( '3%' ),
    borderRadius: 10,
    justifyContent: 'center',
  },
  successModalHeaderView: {
    marginTop: hp( '4%' ),
    marginBottom: hp( '3%' ),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Medium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
  },
  successModalAmountView: {
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
  },
  successModalWalletNameText: {
    color: Colors.black,
    fontSize: RFValue( 25 ),
    fontFamily: Fonts.Regular,
    textAlign: 'center',
  },
  successModalAmountImage: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    marginRight: 15,
    marginLeft: 10,
    marginBottom: wp( '1%' ),
    resizeMode: 'contain',
  },
  successModalAmountText: {
    color: Colors.black,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 21 ),
    marginLeft: 5,
  },
  successModalAmountUnitText: {
    color: Colors.borderColor,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
  },
  successModalAmountInfoView: {
    flex: 0.4,
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  separator: {
    height: 2,
    marginLeft: wp( '2%' ),
    marginRight: wp( '2%' ),
    backgroundColor: Colors.borderColor,
  },
} )
