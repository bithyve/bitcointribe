import React, { useMemo } from 'react'
import { StyleSheet, Image } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import { translations } from '../../../common/content/LocContext'

export type Props = {
  visibilityOption: AccountVisibility;
};

const VisibilityOptionsListItemContent: React.FC<Props> = ( { visibilityOption, }: Props ) => {
  const common  = translations[ 'common' ]
  const strings  = translations[ 'accounts' ]

  const avatarImageSource = useMemo( () => {
    switch ( visibilityOption ) {
        case AccountVisibility.DEFAULT:
          return require( '../../../assets/images/icons/account-visibility/icon_visible.png' )
        case AccountVisibility.HIDDEN:
          return require( '../../../assets/images/icons/account-visibility/icon_hidden.png' )
        case AccountVisibility.DURESS:
          return require( '../../../assets/images/icons/account-visibility/icon_duress.png' )
    }
  }, [ visibilityOption ] )

  const titleText = useMemo( () => {
    switch ( visibilityOption ) {
        case AccountVisibility.DEFAULT:
          return common.visible
        case AccountVisibility.HIDDEN:
          return common.hidden
        case AccountVisibility.DURESS:
          return common.duress
    }
  }, [ visibilityOption ] )

  const subtitleText = useMemo( () => {
    switch ( visibilityOption ) {
        case AccountVisibility.DEFAULT:
          return strings.Alwaysshow
        case AccountVisibility.HIDDEN:
          return strings.Onlyshow
        case AccountVisibility.DURESS:
          return strings.Duressmode
        default:
          return ''
    }
  }, [ visibilityOption ] )

  return (
    <>
      <Image
        source={avatarImageSource}
        style={styles.avatarImage}
        resizeMode="contain"
      />

      <ListItem.Content style={styles.titleSection}>
        <ListItem.Title
          style={ListStyles.listItemTitle}
          numberOfLines={1}
        >
          {titleText}
        </ListItem.Title>

        <ListItem.Subtitle
          style={ListStyles.listItemSubtitle}
          numberOfLines={2}
        >
          {subtitleText}
        </ListItem.Subtitle>
      </ListItem.Content>
    </>
  )
}

const styles = StyleSheet.create( {
  avatarImage: {
    ...ImageStyles.thumbnailImageSmall,
    marginRight: 14,
  },

  titleSection: {
    flex: 1,
  },
} )


export default VisibilityOptionsListItemContent
