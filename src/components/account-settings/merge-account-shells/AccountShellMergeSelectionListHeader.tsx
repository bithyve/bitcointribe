import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import ListStyles from '../../../common/Styles/Lists';
import Colors from '../../../common/Colors';
import Fonts from '../../../common/Fonts';
import AccountShell from '../../../common/data/models/AccountShell';
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell';
import { RFValue } from 'react-native-responsive-fontsize';

export type Props = {
  sourceShell: AccountShell;
};

const AccountShellMergeSelectionListHeader: React.FC<Props> = ({
  sourceShell,
}: Props) => {
  const primarySubAccount = usePrimarySubAccountForShell(sourceShell);

  return (
    <View style={styles.rootContainer}>

      <ListItem pad={4} containerStyle={{ marginBottom: 36 }}>
        <Avatar
          source={primarySubAccount.avatarImageSource}
          imageProps={{
            resizeMode: "contain",
          }}
          size="large"
          containerStyle={styles.avatarImageContainer}
        />

        <ListItem.Content>
          <ListItem.Subtitle
            style={styles.titleLabelText}
            numberOfLines={1}
          >
            Merging Account
          </ListItem.Subtitle>

          <ListItem.Title
            style={styles.accountShellItemTitleText}
            numberOfLines={1}
          >
            {primarySubAccount.customDisplayName || primarySubAccount.defaultTitle}
          </ListItem.Title>

          <ListItem.Subtitle
            style={styles.balanceCaptionText}
            numberOfLines={1}
          >
            {primarySubAccount.balance} Sats
        </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>

      <Text style={ListStyles.infoHeaderText}>
        Choose a destination to merge this account's sub-accounts into.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    ...ListStyles.infoHeaderSection,
    paddingHorizontal: 36,
  },

  accountShellItemTitleText: {
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
  },

  titleLabelText: {
    fontSize: RFValue(10),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
  },

  balanceCaptionText: {
    fontSize: RFValue(10),
    color: Colors.blue,
    fontFamily: Fonts.FiraSansMediumItalic,
  },

  avatarImageContainer: {
    marginRight: 4,
  },
});

export default AccountShellMergeSelectionListHeader;
