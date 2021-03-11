import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
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
};

const FriendsAndFamilyContactListItemContent: React.FC<Props> = ( { contact, }: Props ) => {

  const firstNamePieceText = useMemo( () => {
    return contact.displayedName.split( ' ' )[ 0 ] + ' '
  }, [ contact ] )

  const secondNamePieceText = useMemo( () => {
    return contact.displayedName.split( ' ' ).slice( 1 ).join( ' ' )
  }, [ contact ] )

  const trustKindText = useMemo( () => {
    switch ( contact.trustKind ) {
        case ContactTrustKind.KEEPER_OF_USER:
          return 'My Keeper'
        case ContactTrustKind.USER_IS_KEEPING:
          return 'Keeping Their Secret'
        case ContactTrustKind.OTHER:
          return 'Trusted Contact'
    }
  }, [ contact ] )


  const hasExpirationBadge = useMemo( () => {
    // TODO: Establish more clarity about what this logic is supposed to mean.
    return (
      (
        contact.hasTrustedChannelWithUser == false
        || contact.trustKind != ContactTrustKind.USER_IS_KEEPING
      ) &&
      (
        contact.hasXPub ||
        contact.hasTrustedAddress
      ) == false
    )
  }, [ contact ] )

  const secondsUntilTrustedContactRequestExpiration = useMemo( () => {
    if ( hasExpirationBadge == false ) { return }

    return (
      ( HexaConfig.TC_REQUEST_EXPIRY / 1000 ) -
      ( ( Date.now() - contact.initiatedAt ) / 1000 )
    )
  }, [ hasExpirationBadge ] )

  const isTrustedContactRequestExpired = useMemo( () => {
    return secondsUntilTrustedContactRequestExpiration <= 0
  }, [ secondsUntilTrustedContactRequestExpiration ] )


  return (
    <>
      <ListItem.Content style={{
        flex: 0
      }}>
        <View style={styles.avatarContainer}>
          <RecipientAvatar recipient={contact} contentContainerStyle={styles.avatarImage} />

          <LastSeenActiveIndicator
            style={{
              position: 'absolute', right: -2, top: -2
            }}
            timeSinceActive={contact.lastSeenActive}
          />
        </View>
      </ListItem.Content>

      <ListItem.Content style={{
        flex: 1
      }}>
        {Number.isFinite( contact.lastSeenActive ) && (
          <ListItem.Subtitle
            style={styles.lastSeenText}
            numberOfLines={1}
          >
            <Text>Last seen </Text>
            <Text style={{
              fontFamily: Fonts.FiraSansMediumItalic
            }}>
              {agoTextForLastSeen( contact.lastSeenActive )}
            </Text>
          </ListItem.Subtitle>
        )}

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

      {hasExpirationBadge && (
        <ListItem.Content style={{
          flex: 0, marginRight: 6
        }}>
          {isTrustedContactRequestExpired && (
            <View
              style={styles.expirationBadgeContainer}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue( 10 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Expired
              </Text>
            </View>
          ) || (
            <CountDown
              size={12}
              until={secondsUntilTrustedContactRequestExpiration}
              digitStyle={{
                backgroundColor: '#FFF',
                borderWidth: 0,
                borderColor: '#FFF',
                margin: -10,
              }}
              digitTxtStyle={{
                color: Colors.textColorGrey,
                fontSize: RFValue( 12 ),
                fontFamily: Fonts.FiraSansRegular,
              }}
              separatorStyle={{
                color: Colors.textColorGrey
              }}
              timeToShow={[ 'H', 'M', 'S' ]}
              timeLabels={{
                h: null, m: null, s: null
              }}
              showSeparator
            />
          )}
        </ListItem.Content>
      )}

      <ListItem.Chevron />
    </>
  )
}

const styles = StyleSheet.create( {
  avatarContainer: {
    ...ImageStyles.circledAvatarContainer,
    marginRight: 16,
  },

  avatarImage: {
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: 9999,
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
