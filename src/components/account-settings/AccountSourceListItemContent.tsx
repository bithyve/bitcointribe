import React, { useMemo } from 'react';
import { StyleSheet, Image } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import AccountKind from '../../common/data/enums/AccountKind';
import AccountPayload from '../../common/data/models/AccountPayload/Interfaces';
import ListStyles from '../../common/Styles/Lists';

export type Props = {
  accountPayload: AccountPayload;
};

export function imageSourceForAccountKind(accountKind: AccountKind): NodeRequire {
  switch (accountKind) {
    case AccountKind.REGULAR:
      return require('../../assets/images/icons/icon_checking_circled.png');
    default:
      // TODO: Get image assets for other possible account kinds
      return require('../../assets/images/icons/icon_checking_circled.png');
  }
}

const AccountSourceListItemContent: React.FC<Props> = ({
  accountPayload,
}: Props) => {

  const accountKindImageSource = useMemo(() => {
    return imageSourceForAccountKind(accountPayload.kind);
  }, [accountPayload.kind]);

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
          {accountPayload.customDisplayName || accountPayload.defaultTitle}
        </ListItem.Title>

        <ListItem.Subtitle
          style={ListStyles.listItemSubtitle}
          numberOfLines={2}
        >
          {accountPayload.customDescription || accountPayload.defaultDescription}
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
