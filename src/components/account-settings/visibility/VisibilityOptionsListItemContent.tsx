import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { ListItem } from 'react-native-elements'
import Visibilty from '../../../assets/images/svgs/icon_visibility.svg'
import NameNDesc from '../../../assets/images/svgs/name_desc.svg'
import { translations } from '../../../common/content/LocContext'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import ImageStyles from '../../../common/Styles/ImageStyles'
import ListStyles from '../../../common/Styles/ListStyles'

export type Props = {
  visibilityOption: AccountVisibility;
};

const VisibilityOptionsListItemContent: React.FC<Props> = ( { visibilityOption, }: Props ) => {
  const common  = translations[ 'common' ]
  const strings  = translations[ 'accounts' ]

  const avatarImageSource = useMemo( () => {
    switch ( visibilityOption ) {
        case AccountVisibility.DEFAULT:
          // return require( '../../../assets/images/icons/account-visibility/icon_visible.png' )
          return <NameNDesc />
        case AccountVisibility.HIDDEN:
          // return require( '../../../assets/images/icons/account-visibility/icon_hidden.png' )
          return <Visibilty />
        case AccountVisibility.DURESS:
          // return require( '../../../assets/images/icons/account-visibility/icon_duress.png' )
          return <NameNDesc />
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
      {/* <Image
        source={avatarImageSource}
        style={styles.avatarImage}
        resizeMode="contain"
      /> */}
      <View style={styles.avatarImage}>
        {avatarImageSource}
      </View>

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
