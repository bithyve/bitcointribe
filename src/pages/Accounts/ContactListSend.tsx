import React, { memo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { nameToInitials } from '../../common/CommonFunctions'
import Fonts from './../../common/Fonts'

function getImageIcon( item ) {
  if ( item ) {
    if ( item.image ) {
      return <Image source={item.image} style={styles.circleShapeView} />
    } else {
      return (
        <View
          style={{
            ...styles.circleShapeView,
            backgroundColor: Colors.shadowBlue,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 13,
              lineHeight: 13, //... One for top and one for bottom alignment
            }}
          >
            {item
              ? nameToInitials(
                item.firstName === 'F&F request' &&
                    item.contactsWalletName !== undefined &&
                    item.contactsWalletName !== ''
                  ? `${item.contactsWalletName}'s wallet`
                  : item.firstName && item.lastName
                    ? item.firstName + ' ' + item.lastName
                    : item.firstName && !item.lastName
                      ? item.firstName
                      : !item.firstName && item.lastName
                        ? item.lastName
                        : '',
              )
              : ''}
          </Text>
        </View>
      )
    }
  }
}

const ContactListSend = ( { transfer, Items, onSelectContact } ) => {
  return (
    <TouchableOpacity onPress={() => onSelectContact( Items )}>
      <View style={{
        justifyContent: 'center', marginRight: hp( '4%' )
      }}>
        {transfer.details &&
          transfer.details.length > 0 &&
          transfer.details.map( ( contact, index ) => {
            if ( contact.selectedContact.id === Items.id ) {
              return (
                <Image
                  key={`${JSON.stringify( contact )}_${index}`}
                  style={styles.checkmarkStyle}
                  source={require( '../../assets/images/icons/checkmark.png' )}
                  resizeMode="contain"
                />
              )
            }
          } )}
        {getImageIcon( Items )}
        <Text numberOfLines={1} style={styles.contactName}>
          {Items.firstName === 'F&F request' &&
          Items.contactsWalletName !== undefined &&
          Items.contactsWalletName !== ''
            ? `${Items.contactsWalletName}'s wallet`
            : Items.name}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create( {
  circleShapeView: {
    width: wp( '14%' ),
    height: wp( '14%' ),
    borderRadius: wp( '14%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    elevation: 10,
  },
  checkmarkStyle: {
    position: 'absolute',
    width: wp( '5%' ),
    height: wp( '5%' ),
    top: 0,
    right: 0,
    zIndex: 999,
    elevation: 10,
  },
  contactName: {
    width: wp( '14%' ),
    color: Colors.black,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
    textAlign: 'center',
    marginTop: 5,
  },
} )

export default memo( ContactListSend )
