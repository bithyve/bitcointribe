import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { ListItem } from 'react-native-elements';
import AccountShell from '../../common/data/models/AccountShell';
import ListStyles from '../../common/Styles/ListStyles';
import ImageStyles from '../../common/Styles/ImageStyles';
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell';

export type Props = {
  accountShell: AccountShell;
};

const AccountMergeDestinationListItemContent: React.FC<Props> = ({
  accountShell,
}: Props) => {
  const primarySubAccount = usePrimarySubAccountForShell(accountShell);

  return (
    <>
      <Image
        source={primarySubAccount.avatarImageSource}
        style={styles.avatarImage}
        resizeMode="contain"
      />

      <ListItem.Content style={styles.titleSection}>
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
    </>
  );
};

const styles = StyleSheet.create({
  avatarImage: {
    ...ImageStyles.thumbnailImageMedium,
    marginRight: 14,
    borderRadius: 9999,
  },

  titleSection: {
    flex: 1,
  },
});


export default AccountMergeDestinationListItemContent;
