import React, { useEffect } from 'react'
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'

export default function CustodianRequestAccepted( props ) {
  const requester = props.route.params?.requester

  const onPressAssociateContacts = () => {
    props.navigation.navigate( 'ContactsListForAssociateContact' )
  }

  return (
    <View style={{
      ...styles.modalContentContainer, height: '100%'
    }}>
      <View style={{
        height: '100%'
      }}>
        <View
          style={{
            ...styles.successModalHeaderView,
            marginRight: wp( '8%' ),
            marginLeft: wp( '8%' ),
          }}
        >
          <Text style={styles.modalTitleText}>
            Recovery Key Accepted{'\n'}Successfully
          </Text>
          <Text style={{
            ...styles.modalInfoText, marginTop: wp( '1.5%' )
          }}>
            Recovery Key Accepted Successfully{'\n'}You are now a Keeper for
          </Text>
        </View>
        <View style={styles.box}>
          <View style={{
            flexDirection: 'row', alignItems: 'center'
          }}>
            <Image
              style={styles.successModalAmountImage}
              source={require( '../../assets/images/icons/icon_wallet.png' )}
            />
            <Text style={styles.successModalWalletNameText}>{requester}</Text>
          </View>
        </View>
        <View>
          <View
            style={{
              marginLeft: wp( '8%' ),
              marginRight: wp( '8%' ),
            }}
          >
            <Text style={{
              ...styles.modalInfoText
            }}>
              Associate the Key with a contact to better manage the{'\n'}
              secrets you are Keeper for
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 'auto',
            alignItems: 'center',
          }}
        >
          <AppBottomSheetTouchableWrapper
            onPress={() => onPressAssociateContacts()}
            style={{
              ...styles.successModalButtonView
            }}
          >
            <Text style={styles.proceedButtonText}>Associate a contact</Text>
          </AppBottomSheetTouchableWrapper>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.navigation.replace( 'Home' )}
            style={{
              height: wp( '13%' ),
              width: wp( '35%' ),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{
              ...styles.proceedButtonText, color: Colors.blue
            }}>
              Skip
            </Text>
          </AppBottomSheetTouchableWrapper>
          <Image
            source={require( '../../assets/images/icons/accept.png' )}
            style={styles.successModalImage}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '50%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
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
    marginTop: hp( '5%' ),
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
    marginLeft: 15,
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
    marginLeft: wp( '8%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  successModalImage: {
    width: wp( '25%' ),
    height: hp( '20%' ),
    marginLeft: 'auto',
    resizeMode: 'cover',
  },
} )
