import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'

export default function RestoreFromICloud( props ) {
  return (
    <View style={styles.modalContentContainer}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.headerTitleText}>{props.title}</Text>
        <Text style={styles.headerInfoText}>{props.subText}</Text>
      </View>
      <AppBottomSheetTouchableWrapper
        activeOpacity={10}
        onPress={() => props.onPressCard ? props.onPressCard() : {
        }}
        style={{
          justifyContent: 'center', alignItems: 'center'
        }}
      >
        <View style={styles.greyBox}>
          <View style={styles.greyBoxImage}>
            <MaterialCommunityIcons
              name={'restore'}
              size={RFValue( 25 )}
              color={Colors.blue}
            />
          </View>
          <View style={{
            marginLeft: 10
          }}>
            <Text style={styles.greyBoxText}>{props.cardInfo}</Text>
            <Text
              style={{
                ...styles.greyBoxText,
                fontSize: RFValue( 20 ),
              }}
            >
              {props.cardTitle}
            </Text>
            <Text
              style={{
                ...styles.greyBoxText,
                fontSize: RFValue( 10 ),
              }}
            >
              {props.levelStatus ? props.levelStatus : ''}
            </Text>
          </View>
          <View style={styles.arrowIconView}>
            <Ionicons
              name="ios-arrow-down"
              color={Colors.textColorGrey}
              size={15}
              style={{
                alignSelf: 'center'
              }}
            />
          </View>
        </View>
      </AppBottomSheetTouchableWrapper>
      {props.info ? <View style={styles.successModalAmountView}>
        <Text style={styles.bottomInfoText}>{props.info}</Text>
      </View> : null}
      <View style={styles.bottomButtonsView}>
        <AppBottomSheetTouchableWrapper
          disabled={props.isLoading ? props.isLoading : false}
          onPress={() => props.onPressProceed()}
          style={styles.successModalButtonView}
        >
          {/* {props.isLoading ? (
            <ActivityIndicator size={"small"} color={Colors.white} />
          ) : ( */}
          <Text
            style={{
              ...styles.proceedButtonText,
              color: Colors.white,
            }}
          >
            {props.proceedButtonText}
          </Text>
          {/* )} */}
        </AppBottomSheetTouchableWrapper>
        <AppBottomSheetTouchableWrapper
          disabled={props.isLoading ? props.isLoading : false}
          onPress={() => props.onPressBack()}
          style={styles.transparentButtonView}
        >
          <Text
            style={{
              ...styles.proceedButtonText,
              color: Colors.blue,
            }}
          >
            {props.backButtonText}
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: wp( '1.5%' ),
  },
  bottomInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: hp( '1%' ),
    marginTop: 'auto',
  },
  bottomButtonsView: {
    height: hp( '15%' ),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto'
  },
  transparentButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalHeaderView: {
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: wp( '4%' ),
  },
  successModalAmountView: {
    justifyContent: 'center',
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: 'auto',
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
    fontFamily: Fonts.FiraSansMedium,
  },
  greyBox: {
    width: wp( '90%' ),
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greyBoxImage: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: wp( '15%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 1,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowColor: Colors.textColorGrey,
    shadowRadius: 5,
    elevation: 10,
  },
  greyBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
  },
  arrowIconView: {
    marginLeft: 'auto',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
} )
