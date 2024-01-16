import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'

export default function ContactListForRestore( props ) {
  const { contactList }: { contactList: any[] } = props
  return (
    <View style={styles.modalContentContainer}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.headerTitleText}>{props.title}</Text>
        <Text style={styles.headerInfoText}>{props.subText}</Text>
      </View>
      {contactList.map( ( contact, index ) => {
        const data = contact.data
        return (
          <AppBottomSheetTouchableWrapper
            key={index}
            activeOpacity={10}
            onPress={() => props.onPressCard( contact, index )}
            style={{
              justifyContent: 'center', alignItems: 'center'
            }}
          >
            <View style={styles.greyBox}>
              <View style={styles.greyBoxImage}>
                <Image
                  source={require( '../../assets/images/icons/icon_contact.png' )}
                  style={styles.cardImage}
                />
              </View>
              <View style={{
                marginLeft: 10
              }}>
                <Text
                  style={{
                    ...styles.greyBoxText,
                    fontSize: RFValue( 20 ),
                  }}
                >
                  {contact.name}
                </Text>
                <Text
                  style={{
                    ...styles.greyBoxText,
                    fontSize: RFValue( 10 ),
                  }}
                >
                  {data && data.phoneNumbers && data.phoneNumbers.length
                    ? data.phoneNumbers[ 0 ].number
                    : data && data.emails && data.emails.length
                      ? data.emails[ 0 ].email
                      : ''}
                </Text>
              </View>
            </View>
          </AppBottomSheetTouchableWrapper>
        )
      } )}

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
    fontFamily: Fonts.Medium,
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    marginTop: wp( '1.5%' ),
  },
  bottomInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    marginBottom: hp( '1%' ),
    marginTop: 'auto',
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
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
  },
  cardImage: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    resizeMode: 'contain',
    marginBottom: wp( '1%' ),
  },
} )
