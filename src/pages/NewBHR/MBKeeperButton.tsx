import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import { View, Image, TouchableOpacity, Text, StyleSheet, ImageBackground } from 'react-native'
import { useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { nameToInitials } from '../../common/CommonFunctions'

function MBKeeperButton( props ) {

  const getImageIcon = ( chosenContact ) => {
    if ( chosenContact && chosenContact.name ) {
      if ( chosenContact.imageAvailable ) {
        return (
          <View style={styles.imageBackground}>
            <Image
              source={{
                uri: chosenContact.image.uri
              }}
              style={styles.contactImage}
            />
          </View>
        )
      } else {
        return (
          <View style={styles.imageBackground}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: RFValue( 9 ),
              }}
            >
              {chosenContact &&
              chosenContact.firstName === 'F&F request' &&
              chosenContact.contactsWalletName !== undefined &&
              chosenContact.contactsWalletName !== ''
                ? nameToInitials( `${chosenContact.contactsWalletName}'s wallet` )
                : chosenContact && chosenContact.name
                  ? nameToInitials(
                    chosenContact &&
                      chosenContact.firstName &&
                      chosenContact.lastName
                      ? chosenContact.firstName + ' ' + chosenContact.lastName
                      : chosenContact.firstName && !chosenContact.lastName
                        ? chosenContact.firstName
                        : !chosenContact.firstName && chosenContact.lastName
                          ? chosenContact.lastName
                          : ''
                  )
                  : ''}
            </Text>
          </View>
        )
      }
    }
    return (
      <Image
        style={styles.contactImageAvatar}
        source={require( '../../assets/images/icons/icon_user.png' )}
      />
    )
  }

  const value = props.value
  const keeper = props.keeper
  return (
    <TouchableOpacity
      disabled={props.disabled}
      style={{
        ...styles.appBackupButton,
        backgroundColor:
          value.status == 'notSetup' ? Colors.white : Colors.deepBlue,
        paddingLeft: wp( '3%' ),
        paddingRight: wp( '3%' ),
        borderColor:
          keeper.status == 'accessible'
            ? value.status == 'notSetup'
              ? Colors.white
              : Colors.deepBlue
            : Colors.red,
        borderWidth: keeper.status == 'accessible' ? 0 : 1,
        overflow: 'hidden',
      }}
      delayPressIn={0}
      onPress={() => props.onPressKeeper( )}
    >
      {keeper.shareType == 'securityQuestion'?
        <ImageBackground
          source={require( '../../assets/images/icons/questionMark.png' )}
          style={{
            ...styles.resetImage,
            position: 'relative',
          }}
        >
          {keeper.status == 'notAccessible' ? (
            <View
              style={{
                backgroundColor: Colors.red,
                width: wp( '1%' ),
                height: wp( '1%' ),
                position: 'absolute',
                top: 0,
                right: 0,
                borderRadius: wp( '1%' ) / 2,
              }}
            />
          ) : null}
        </ImageBackground>
        :keeper.shareType == 'cloud' ?
          <Image
            source={require( '../../assets/images/icons/ico_cloud_backup.png' )}
            style={styles.resetImage}
          />
          :keeper.status == 'accessible' && keeper.shareType == 'device' ? (
            <Image
              source={
                keeper.shareType == 'device'
                  ? require( '../../assets/images/icons/icon_ipad_blue.png' )
                  : require( '../../assets/images/icons/pexels-photo.png' )
              }
              style={{
                width: wp( '6%' ),
                height: wp( '6%' ),
                resizeMode: 'contain',
                borderRadius: wp( '6%' ) / 2,
              }}
            />
          ) : keeper.shareType == 'contact' && keeper.updatedAt != 0 ? (
            getImageIcon( keeper.data )
          ) : keeper.shareType == 'pdf' && keeper.status == 'accessible' ? (
            <Image
              source={require( '../../assets/images/icons/doc.png' )}
              style={{
                width: wp( '5%' ),
                height: wp( '6%' ),
                resizeMode: 'contain',
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: Colors.red,
                width: wp( '2%' ),
                height: wp( '2%' ),
                borderRadius: wp( '2%' ) / 2,
              }}
            />
          )}
      <Text
        style={{
          ...styles.cardButtonText,
          color:
                value.status == 'notSetup' ? Colors.textColorGrey : Colors.white,
          fontSize: RFValue( 8 ),
          marginLeft: wp( '2%' ),
        }}
        numberOfLines={1}
      >
        {props.keeperButtonText}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create( {
  cardButtonText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
    width: wp( '24%' ),
  },
  appBackupButton: {
    flexDirection: 'row',
    backgroundColor: Colors.deepBlue,
    alignItems: 'center',
    borderRadius: 8,
    width: wp( '37%' ),
    height: wp( '11%' ),
  },
  resetImage: {
    width: wp( '4%' ),
    height: wp( '4%' ),
    resizeMode: 'contain',
  },
  contactImageAvatar: {
    width: wp( '6%' ),
    height: wp( '6%' ),
    alignSelf: 'center',
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0, height: 3
    },
    shadowRadius: 5,
  },
  imageBackground: {
    backgroundColor: Colors.shadowBlue,
    height: wp( '6%' ),
    width: wp( '6%' ),
    borderRadius: wp( '6%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 1,
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0, height: 3
    },
    shadowRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactImage: {
    height: wp( '6%' ),
    width: wp( '6%' ),
    borderRadius: wp( '6%' ) / 2,
  },
} )
export default memo( MBKeeperButton )
