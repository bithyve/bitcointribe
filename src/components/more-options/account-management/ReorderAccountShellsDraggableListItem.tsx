import React from 'react';
import { Image } from 'react-native';
import AccountShell from '../../../common/data/models/AccountShell';
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell';
import { ListItem } from 'react-native-elements';
import ListStyles from '../../../common/Styles/ListStyles';
import ImageStyles from '../../../common/Styles/ImageStyles';

export type Props = {
  accountShell: AccountShell;
  onLongPress?: () => void;
  containerStyle?: Record<string, unknown>;
};

const ReorderAccountShellsDraggableListItem: React.FC<Props> = ({
  accountShell,
  onLongPress = () => {},
  containerStyle = {},
}: Props) => {
  const primarySubAccount = usePrimarySubAccountForShell(accountShell);

  return (
    <ListItem onLongPress={onLongPress} style={containerStyle}>
      <Image
        source={primarySubAccount.avatarImageSource}
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
        source={require('../../../assets/images/icons/icon_rearrange.png')}
        style={ImageStyles.reorderItemIconImage}
      />
    </ListItem>
  );
};

export default ReorderAccountShellsDraggableListItem;
