import React from 'react';
import { StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { ListItem } from 'react-native-elements';
import SubAccountKind from '../../common/data/enums/SubAccountKind';
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces';
import ListStyles from '../../common/Styles/ListStyles';
import ImageStyles from '../../common/Styles/ImageStyles';

export type Props = {
  subAccountInfo: SubAccountDescribing;
};


const DestinationAccountShellListItemContent: React.FC<Props> = ({
  subAccountInfo,
}: Props) => {
  return (
    <>
      <Image
        source={subAccountInfo.avatarImageSource}
        style={styles.avatarImage}
        resizeMode="contain"
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
  avatarImage: {
    ...ImageStyles.thumbnailImageMedium,
    marginRight: 14,
    borderRadius: 9999,
  },

  titleSection: {
    flex: 1,
  },
});


export default DestinationAccountShellListItemContent;
