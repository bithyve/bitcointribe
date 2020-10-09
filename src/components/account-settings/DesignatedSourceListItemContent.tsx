import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces';
import ListStyles from '../../common/Styles/Lists';

export type Props = {
  subAccountInfo: SubAccountDescribing;
};

const DesignatedSourceListItemContent: React.FC<Props> = ({
  subAccountInfo,
}: Props) => {

  const avatarImageSource = useMemo(() => {
    // TODO: Figure out how each designated-source sub-account will have an avatar
    // that corresponds to it.
    return require('../../assets/images/icons/icon_bitcoin_dark.png');
  }, [subAccountInfo.kind]);

  return (
    <>
      <Avatar
        rounded
        source={avatarImageSource}
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
          {subAccountInfo.customDisplayName || subAccountInfo.defaultTitle}
        </ListItem.Title>

        <ListItem.Subtitle
          style={ListStyles.listItemSubtitle}
          numberOfLines={2}
        >
          {subAccountInfo.customDescription || subAccountInfo.defaultDescription}
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


export default DesignatedSourceListItemContent;
