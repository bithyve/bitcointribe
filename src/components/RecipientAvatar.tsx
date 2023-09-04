import React, { useContext, useEffect, useState } from 'react'
import { View, Text, Image, Platform, PermissionsAndroid } from 'react-native'
import ExpoContacts from 'expo-contacts'
import Colors from '../common/Colors'
import ImageStyles from '../common/Styles/ImageStyles'
import { nameToInitials } from '../common/CommonFunctions'
import { RecipientDescribing } from '../common/data/models/interfaces/RecipientDescribing'
import RecipientKind from '../common/data/enums/RecipientKind'
import { LocalizationContext } from '../common/content/LocContext'

export type Props = {
  recipient: RecipientDescribing;
  containerStyle?: Record<string, unknown>;
  contentContainerStyle?: Record<string, unknown>;
};

const RecipientAvatar: React.FC<Props> = ( {
  recipient,
  contentContainerStyle
}: Props ) => {
  const [ contactPermission, setContactPermission ] = useState( false )

  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]

  const checkForContactPermissions = async () => {
    try {
      if ( Platform.OS === 'android' ) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
            title: strings.hexaWould,
            message: strings.Addressbookdetails,
            buttonPositive: common.allow,
            buttonNegative: common.deny,
          }
        )
        if ( granted !== PermissionsAndroid.RESULTS.GRANTED ) {
          setContactPermission( false )
        } else {
          setContactPermission( true )
        }
      } else if ( Platform.OS === 'ios' ) {
        const { status } = await ExpoContacts.requestPermissionsAsync()
        if ( status === 'denied' ) {
          setContactPermission( false )
        } else {
          setContactPermission( true )
        }
      }
    } catch ( e ) {
      console.log( 'PERMISSION_ERROR', e )
    }
  }

  useEffect( () => {
    checkForContactPermissions()
  }, [ contactPermission ] )

  if ( contactPermission && ( recipient.avatarImageSource || recipient.image ) ) {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          ...contentContainerStyle,
        }}
      >
        <Image
          source={recipient.avatarImageSource ? recipient.avatarImageSource : recipient.image}
          style={contentContainerStyle}
          resizeMode="contain"
        />
      </View>
    )
  } else {
    return (
      <View
        style={{
          backgroundColor: Colors.shadowBlue,
          alignItems: 'center',
          justifyContent: 'center',
          ...contentContainerStyle,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: 14,
            fontWeight: '500'
          }}
        >
          {nameToInitials(
            recipient.kind == RecipientKind.ADDRESS ? 'External Address' : ( recipient.displayedName ? recipient.displayedName : recipient.contactName || '' )
          )}
        </Text>
      </View>
    )
  }
}

export default RecipientAvatar
