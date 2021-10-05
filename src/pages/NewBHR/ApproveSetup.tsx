import React from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import CountDown from 'react-native-countdown-component'
import Config from '../../bitcoin/HexaConfig'

export default function ApproveSetup( props ) {
  const KP_REQUEST_EXPIRY = Config.KP_REQUEST_EXPIRY

  return (
    <View style={{
      ...styles.modalContentContainer, height: '100%'
    }}>
      <View style={{
        height: '100%'
      }}>
        <View style={styles.successModalHeaderView}>
          <Text style={styles.headerText}>
          Share Recovery Key
          </Text>
        </View>
        <View style={{
          flex: 1
        }}>
          <View style={styles.grayBox}>
            <View style={styles.grayBoxImageView}>
              <Image
                source={require( '../../assets/images/icons/icon_ipad.png' )}
                style={styles.grayBoxImage}
              />
            </View>
            <View style={{
              width: wp( '63%' )
            }}>
              <Text style={styles.modalInfoText}>
                Waiting for approval from:
              </Text>
              <Text style={{
                ...styles.modalInfoText, fontSize: RFValue( 20 )
              }}>
                Your Previous Backup Devices
              </Text>
            </View>
          </View>
          <Text
            numberOfLines={2}
            style={{
              ...styles.modalInfoText,
              marginLeft: wp( '8%' ),
            }}
          >
           The timer below shows the time remaining before the approval request expires
          </Text>
          <View style={styles.bottomButtonView}>
            <AppBottomSheetTouchableWrapper
              disabled={
                props.isContinueDisabled ? props.isContinueDisabled : false
              }
              onPress={() => props.onPressContinue()}
              style={{
                ...styles.successModalButtonView,
                shadowColor: Colors.shadowBlue,
                backgroundColor: props.isContinueDisabled
                  ? Colors.lightBlue
                  : Colors.blue,
              }}
            >
              <Text
                style={{
                  ...styles.proceedButtonText,
                  color: Colors.white,
                }}
              >
                Continue
              </Text>
            </AppBottomSheetTouchableWrapper>
          </View>
        </View>
        <View style={{
          marginBottom: hp( '4%' )
        }}>
          <View
            style={{
              height: 0.5,
              backgroundColor: Colors.borderColor,
              marginLeft: wp( '10%' ),
              marginRight: wp( '10%' ),
              marginBottom: wp( '10%' ),
            }}
          />
          <CountDown
            size={15}
            until={KP_REQUEST_EXPIRY}
            // onFinish={() => props.onPressContinue()}
            digitStyle={{
              backgroundColor: '#FFF',
              borderWidth: 0,
              borderColor: '#FFF',
              margin: -10,
            }}
            digitTxtStyle={{
              color: Colors.blue,
              fontSize: RFValue( 19 ),
              fontFamily: Fonts.FiraSansRegular,
            }}
            separatorStyle={{
              color: Colors.blue
            }}
            timeToShow={[ 'H', 'M', 'S' ]}
            timeLabels={{
              h: null, m: null, s: null
            }}
            showSeparator
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: wp( '5%' ),
  },
  modalInfoText: {
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: wp( '1.5%' ),
    color: Colors.textColorGrey,
  },
  headerText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  grayBox: {
    alignItems: 'center',
    marginTop: wp( '7%' ),
    marginBottom: wp( '7%' ),
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
    alignSelf: 'center',
    width: wp( '90%' ),
    height: wp( '25%' ),
    flexDirection: 'row',
    overflow: 'hidden'
  },
  grayBoxImageView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '15%' ),
    height: wp( '15%' ),
    marginLeft: wp( '6%' ),
    marginRight: wp( '3%' ),
    borderRadius: wp( '15%' ) / 2,
    backgroundColor: Colors.white,
    shadowRadius: 10,
    shadowColor: Colors.borderColor,
    shadowOffset: {
      width: 4, height: 4
    },
    shadowOpacity: 0.9,
    elevation: 10,
    borderWidth: 0.5,
    borderColor: Colors.borderColor,
  },
  grayBoxImage: {
    width: wp( '10%' ),
    height: wp( '10%' ),
    resizeMode: 'contain',
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
    marginLeft: wp( '8%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  bottomButtonView: {
    height: 'auto',
    paddingBottom: wp( '8%' ),
    marginTop: 'auto',
  },
} )
