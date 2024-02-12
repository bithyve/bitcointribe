import React, { useContext, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ListItem } from 'react-native-elements'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import Fonts from '../../common/Fonts'
import ImageStyles from '../../common/Styles/ImageStyles'
import ListStyles from '../../common/Styles/ListStyles'
import LastSeenActiveIndicator from '../LastSeenActiveIndicator'
import RecipientAvatar from '../RecipientAvatar'
import { agoTextForLastSeen } from '../send/LastSeenActiveUtils'

export type Props = {
  contact: ContactRecipientDescribing,
  index: number
};

const FriendsAndFamilyContactListItemContent: React.FC<Props> = ( { contact, index }: Props ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]
  const lastSeenDays = agoTextForLastSeen( contact.lastSeenActive )
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

        <ListItem.Subtitle
          style={styles.lastSeenText}
          numberOfLines={1}
        >
          <Text>{`${strings.lastSeen} `}</Text>
          {Number.isFinite( contact.lastSeenActive ) ? (

            <Text style={{
              fontFamily: Fonts.Medium,
              fontWeight:'bold'
            }}>
              {lastSeenDays === 'today'? common.today : lastSeenDays}
            </Text>
          ) : (
            <Text style={{
              fontFamily: Fonts.Medium
            }}>
              {common.unknown}
            </Text>
          )}
        </ListItem.Subtitle>
        <ListItem.Title
          style={styles.listItemTitle}
          numberOfLines={1}
        >
          <Text>{firstNamePieceText}</Text>
          <Text style={styles.secondNamePieceText}>{secondNamePieceText}</Text>
        </ListItem.Title>


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
    width: widthPercentageToDP( 13 ),
    height: widthPercentageToDP( 13 ),
    borderRadius: widthPercentageToDP( 13 )/2,
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
    fontFamily: Fonts.Regular,
    color: Colors.textColorGrey,
  },

  lastSeenText: {
    marginBottom: 3,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
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
