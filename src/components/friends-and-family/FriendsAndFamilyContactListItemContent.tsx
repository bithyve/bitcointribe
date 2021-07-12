import React, { useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { ListItem } from 'react-native-elements'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import RecipientAvatar from '../RecipientAvatar'
import ListStyles from '../../common/Styles/ListStyles'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import { RFValue } from 'react-native-responsive-fontsize'
import CountDown from 'react-native-countdown-component'
import HexaConfig from '../../bitcoin/HexaConfig'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import ImageStyles from '../../common/Styles/ImageStyles'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import LastSeenActiveIndicator from '../LastSeenActiveIndicator'
import { agoTextForLastSeen } from '../send/LastSeenActiveUtils'

export type Props = {
  contact: ContactRecipientDescribing,
  index: number
};

const FriendsAndFamilyContactListItemContent: React.FC<Props> = ( { contact, index }: Props ) => {

  const firstNamePieceText = useMemo( () => {
    return contact.displayedName.split( ' ' )[ 0 ] + ' '
  }, [ contact ] )

  const secondNamePieceText = useMemo( () => {
    return contact.displayedName.split( ' ' ).slice( 1 ).join( ' ' )
  }, [ contact ] )

  return (
    <>
      <ListItem.Content style={{
        flex: 0,
      }}>
        <View style={styles.avatarContainer}>
          <RecipientAvatar recipient={contact} contentContainerStyle={styles.avatarImage} />

          <LastSeenActiveIndicator
            style={{
              position: 'absolute',
              right: -2,
              top: -2,
              elevation: 2,
              zIndex: 2,
            }}
            timeSinceActive={contact.lastSeenActive}
          />
        </View>
      </ListItem.Content>

      <ListItem.Content style={{
        flex: 1
      }}>


        <ListItem.Title
          style={styles.listItemTitle}
          numberOfLines={1}
        >
          <Text>{firstNamePieceText}</Text>
          <Text style={styles.secondNamePieceText}>{secondNamePieceText}</Text>
        </ListItem.Title>
        <ListItem.Subtitle
          style={styles.lastSeenText}
          numberOfLines={1}
        >
          <Text>Last seen </Text>
          {Number.isFinite( contact.lastSeenActive ) ? (

            <Text style={{
              fontFamily: Fonts.FiraSansMediumItalic
            }}>
              {agoTextForLastSeen( contact.lastSeenActive )}
            </Text>
          ) : (
            <Text style={{
              fontFamily: Fonts.FiraSansMediumItalic
            }}>
              _unknown_
            </Text>
          )}
        </ListItem.Subtitle>

        {/*
          📝 TODO: Show this when the F&F list is refactored to a
          single flat list. (See: https://github.com/bithyve/hexa/issues/2123#issuecomment-732326014)
        */}
        {/* <ListItem.Subtitle
          style={styles.trustKindText}
          numberOfLines={1}
        >
          {trustKindText}
        </ListItem.Subtitle> */}

      </ListItem.Content>
      {/* <Image
        style={{
          width: 18, height: 18
        }}
        source={require( '../../assets/images/icons/own-node.png' )}
      /> */}
    </>
  )
}

const styles = StyleSheet.create( {
  avatarContainer: {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: widthPercentageToDP( 14 )/2,
    marginRight: 16,
  },

  avatarImage: {
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: widthPercentageToDP( 12 )/2,
  },

  listItemTitle: {
    ...ListStyles.listItemTitle,
    color: Colors.gray4,
  },

  secondNamePieceText: {
    fontWeight: 'bold',
  },

  trustKindText: {
    marginTop: 3,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },

  lastSeenText: {
    marginBottom: 3,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },

  expirationBadgeContainer: {
    width: widthPercentageToDP( '15%' ),
    height: widthPercentageToDP( '6%' ),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    marginRight: 10,
    borderRadius: 5,
  },
} )

export default FriendsAndFamilyContactListItemContent
