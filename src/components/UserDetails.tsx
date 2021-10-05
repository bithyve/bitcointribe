import React, { useEffect } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import { nameToInitials } from '../common/CommonFunctions'
import Fonts from '../common/Fonts'
import { DeepLinkEncryptionType } from '../bitcoin/utilities/Interface'

const styles = StyleSheet.create( {
  headerImageInitials: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.shadowBlue,
    width: wp( '15%' ),
    height: wp( '15%' ),
    borderRadius: wp( '15%' ) / 2,
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
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
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  contactView: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.backgroundColor1,
    height: 90,
    position: 'relative',
    borderRadius: 10,
  },
  contactText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
    marginLeft: 25,
    paddingTop: 5,
    paddingBottom: 3,
  },
  phoneNumber: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 10 ),
    marginLeft: 25,
    paddingTop: 3,
  },
  emailView: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 10 ),
    marginLeft: 25,
    paddingTop: 3,
    paddingBottom: 5,
  },
  contactName: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 10 ),
    marginLeft: 25,
    paddingTop: 3,
  },
  imageView: {
    position: 'absolute',
    marginLeft: 15,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 1,
    shadowOffset: {
      width: 2, height: 2
    },
  },
  initialsContainer: {
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
    padding: 10
  },
  initialsText: {
    textAlign: 'center',
    fontSize: RFValue( 20 ),
    lineHeight: RFValue( 20 ), //... One for top and one for bottom alignment
  }
} )

export default function CopyThisText( props ) {

  const setPhoneNumber = () => {
    if( props.Contact.deepLinkConfig ){ // when trusted contact object is passed instead of RN-contact
      const { encryptionType, encryptionKey } = props.Contact.deepLinkConfig
      if( encryptionType === DeepLinkEncryptionType.NUMBER ) return encryptionKey
    }

    const phoneNumber = props.Contact.phoneNumbers[ 0 ].number
    let number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
    number = number.slice( number.length - 10 ) // last 10 digits only
    return number
  }
  return (
    <View style={styles.contactProfileView}>
      <View style={styles.mainContainer}>
        <View
          style={styles.contactView}
        >
          <View style={{
            marginLeft: 70
          }}>
            {props.contactText ? (
              <Text
                style={styles.contactText}
              >
                {props.contactText}
              </Text>
            ) : null}
            {( props.Contact.contactName || props.Contact.name || props.Contact.displayedName ) && props.fromScreen !== 'TimerModalContents' ? (
              <Text style={props.titleStyle}>
                {props.Contact.contactName || props.Contact.name || props.Contact.displayedName}
              </Text>
            ) : null}
            {props.Contact &&
							props.Contact.phoneNumbers &&
							props.Contact.phoneNumbers.length ? (
                <Text
                  style={props.fromScreen == 'TimerModalContents' ? props.titleStyle
                    :
                    styles.phoneNumber}
                >
                  {setPhoneNumber()}
                  {/* {Contact && Contact.phoneNumbers[0].digits} */}
                </Text>
              ) : props.Contact &&
								props.Contact.emails &&
								props.Contact.emails.length ? (
                  <Text
                    style={props.fromScreen == 'TimerModalContents' ? props.titleStyle
                      :
                      styles.emailView}
                  >
                    {props.Contact && props.Contact.emails[ 0 ].email}
                  </Text>
                ) : null}
          </View>
        </View>
        {props.Contact.image || props.Contact.avatarImageSource ? (
          <View
            style={styles.imageView}
          >
            <Image
              source={props.Contact.image || props.Contact.avatarImageSource}
              style={{
                ...styles.contactProfileImage
              }}
            />
          </View>
        ) : (
        // <View style={styles.headerImageView}>
        //     <View style={styles.headerImageInitials}>
          <View
            style={styles.initialsContainer}
          >
            <Text
              style={styles.initialsText}
            >
              {nameToInitials( props.Contact.contactName || props.Contact.name || props.Contact.displayedName )}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
