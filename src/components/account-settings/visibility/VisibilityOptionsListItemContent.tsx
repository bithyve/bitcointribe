import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import ListStyles from '../../../common/Styles/Lists';
import AccountVisibility from '../../../common/data/enums/AccountVisibility';

export type Props = {
  visibilityOption: AccountVisibility;
};

const VisibilityOptionsListItemContent: React.FC<Props> = ({
  visibilityOption,
}: Props) => {

  const avatarImageSource = useMemo(() => {
    switch (visibilityOption) {
      case AccountVisibility.DEFAULT:
        return require('../../../assets/images/icons/account-visibility/icon_visible.png');
      case AccountVisibility.HIDDEN:
        return require('../../../assets/images/icons/account-visibility/icon_hidden.png');
      case AccountVisibility.DURESS:
        return require('../../../assets/images/icons/account-visibility/icon_duress.png');
    }
  }, [visibilityOption]);

  const titleText = useMemo(() => {
    switch (visibilityOption) {
      case AccountVisibility.DEFAULT:
        return "Visible";
      case AccountVisibility.HIDDEN:
        return "Hidden";
      case AccountVisibility.DURESS:
        return "Duress";
    }
  }, [visibilityOption]);

  const subtitleText = useMemo(() => {
    switch (visibilityOption) {
      case AccountVisibility.DEFAULT:
        return "Always show this account.";
      case AccountVisibility.HIDDEN:
        return "Only show when manually revealing all accounts.";
      case AccountVisibility.DURESS:
        return "Only show in Duress mode -- or when manually revealing all accounts.";
      default:
        return "";
    }
  }, [visibilityOption]);

  return (
    <>
      <Avatar
        source={avatarImageSource}
        imageProps={{
          resizeMode: "contain",
        }}
        size="small"
        containerStyle={styles.avatarImageContainer}
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


export default VisibilityOptionsListItemContent;
