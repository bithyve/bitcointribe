import React, { useMemo } from 'react';
import { StyleSheet, Image } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import SubAccountKind from '../../common/data/enums/SubAccountKind';
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces';
import ListStyles from '../../common/Styles/Lists';

export type Props = {
  subAccountInfo: SubAccountDescribing;
};

export function imageSourceForAccountKind(accountKind: SubAccountKind): NodeRequire {
  switch (accountKind) {
    case SubAccountKind.REGULAR:
      return require('../../assets/images/icons/icon_checking_circled.png');
    default:
      // TODO: Get image assets for other possible account kinds
      return require('../../assets/images/icons/icon_checking_circled.png');
  }
}

const AccountSourceListItemContent: React.FC<Props> = ({
  subAccountInfo,
}: Props) => {

  const accountKindImageSource = useMemo(() => {
    return imageSourceForAccountKind(subAccountInfo.kind);
  }, [subAccountInfo.kind]);

  return (
    <>
      <Image
        style={styles.accountKindImage}
        source={accountKindImageSource}
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
  accountKindImage: {
    width: 48,
    height: 48,
    marginRight: 14,
  },

  titleSection: {
    flex: 1,
  },
});


export default AccountSourceListItemContent;
