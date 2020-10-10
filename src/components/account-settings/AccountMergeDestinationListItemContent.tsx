import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import AccountShell from '../../common/data/models/AccountShell';
import ListStyles from '../../common/Styles/Lists';
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
      <Avatar
        rounded
        source={primarySubAccount.avatarImageSource}
        imageProps={{
          resizeMode: "cover",
        }}
        size="medium"
        containerStyle={styles.avatarImageContainer}
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
  avatarImageContainer: {
    marginRight: 14,
  },

  titleSection: {
    flex: 1,
  },
});


export default AccountMergeDestinationListItemContent;
