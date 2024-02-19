import React from 'react'
import {
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import RecipientComponent from './RecipientComponent'

export default function SendConfirmationContent( props ) {
  const renderRecipientItem = ( recipient: RecipientDescribing ) => {
    return (
      <RecipientComponent
        key={recipient.id}
        recipient={recipient}
        selectedContactId={'0'}
        accountKind={props.accountKind}
      />
    )
  }

  return (
    <View style={{
      backgroundColor: Colors.white
    }}>
      <View
        style={{
          ...styles.successModalHeaderView,
          marginRight: wp( '8%' ),
          marginLeft: wp( '8%' ),
          marginTop: hp( 3 )
        }}
      >
        <Text style={styles.modalTitleText}>{props.title}</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '1%' )
        }}>
          {props.info}
        </Text>
      </View>

      {
        props.recipients && (
          <ScrollView style={{
            marginTop: hp( '1.5%' ), marginBottom: hp( '1%' )
          }}>
            {props.recipients.map( ( item ) => renderRecipientItem( item ) )}
          </ScrollView>
        )
      }


      {props.infoText && (
        <View
          style={{
            marginTop: hp( '1%' ),
            marginBottom: hp( '1%' ),
            marginRight: wp( '8%' ),
            marginLeft: wp( '8%' ),
          }}
        >
          <Text style={{
            ...styles.modalInfoText
          }}>
            {props.infoText ? props.infoText : ''}
          </Text>
        </View>
      )}
      <View
        style={{
          // flex: 1,
          flexDirection: 'row',
          marginTop: hp( 9 ),
          alignItems: 'center',
          // backgroundColor: 'red'
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressOk()}
        >
          <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
            start={{
              x: 0, y: 0
            }} end={{
              x: 1, y: 0
            }}
            locations={[ 0.2, 1 ]}
            style={{
              ...styles.successModalButtonView
            }}
          >
            <Text style={styles.proceedButtonText}>{props.okButtonText}</Text>
          </LinearGradient>
        </AppBottomSheetTouchableWrapper>
        {props.isCancel && (
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressCancel()}
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
              {props.cancelButtonText}
            </Text>
          </AppBottomSheetTouchableWrapper>
        )}
        {( props.isSuccess || props.isUnSuccess ) && (
          <Image
            style={{
              width: wp( '25%' ),
              height: hp( '10%' ),
              resizeMode: 'cover',
              marginLeft: 'auto',
              // backgroundColor: 'green'
              // marginBottom: props.recipients.length === 0 ? 'auto' : 0,
            }}
            source={
              props.isSuccess
                ? require( '../../assets/images/icons/sendSuccess.png' )
                : require( '../../assets/images/icons/sendError.png' )
            }
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  box: {
    backgroundColor: Colors.backgroundColor1,
    marginRight: wp( '5%' ),
    marginLeft: wp( '5%' ),
    marginBottom: hp( '3%' ),
    borderRadius: 10,
    justifyContent: 'center',
    padding: wp( '5%' ),
  },
  successModalHeaderView: {
    marginBottom: hp( '1%' ),
    marginTop: hp( '1%' ),
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
    paddingRight: 10,
    flex: 1,
  },
  successModalAmountImage: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    marginRight: 15,
    marginLeft: 10,
    // marginBottom: wp("1%"),
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
  separator: {
    height: 2,
    marginLeft: wp( '2%' ),
    marginRight: wp( '2%' ),
    backgroundColor: Colors.borderColor,
  },
  sendSuccessView: {
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginBottom: wp( '1%' ),
    flexDirection: 'row',
  },
  sendSuccessInfoTitle: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
  },
  contactProfileView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp( '1.7%' ),
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
    fontFamily: Fonts.Regular,
    marginLeft: 25,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
} )
