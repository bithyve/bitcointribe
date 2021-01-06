import React from 'react'
import { Image } from 'react-native'
import AccountShell from '../../../common/data/models/AccountShell'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import { ListItem } from 'react-native-elements'
import Colors from '../../../common/Colors'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForSubAccountKind'

export type Props = {
  accountShell: AccountShell;
  isActive: boolean;
  onLongPress?: () => void;
  containerStyle?: Record<string, unknown>;
};

const ReorderAccountShellsDraggableListItem: React.FC<Props> = ( {
  accountShell,
  isActive,
  onLongPress = () => {},
  containerStyle = {
  },
}: Props ) => {
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )

  return (
    <ListItem
      activeOpacity={1}
      onLongPress={onLongPress}
      containerStyle={{
        opacity: isActive ? 0.6 : 1,
        backgroundColor: isActive ? 'rgba(175,175,175,0.7)' : Colors.white,
      }}
    >
      <Image
        source={getAvatarForSubAccount( primarySubAccount )}
        style={ImageStyles.thumbnailImageMedium}
        resizeMode="contain"
      />

      <ListItem.Content>
        <ListItem.Title
          style={ListStyles.listItemTitle}
          numberOfLines={1}
        >
          {primarySubAccount.customDisplayName || primarySubAccount.defaultTitle}
        </ListItem.Title>

        <ListItem.Subtitle
          style={ListStyles.listItemSubtitle}
          numberOfLines={2}
        >
          {primarySubAccount.customDescription || primarySubAccount.defaultDescription}
        </ListItem.Subtitle>
      </ListItem.Content>

      <Image
        source={require( '../../../assets/images/icons/icon_rearrange.png' )}
        style={ImageStyles.reorderItemIconImage}
      />
    </ListItem>
  )
}

export default ReorderAccountShellsDraggableListItem
