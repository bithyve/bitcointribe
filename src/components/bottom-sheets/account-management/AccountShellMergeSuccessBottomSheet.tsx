import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import { Avatar, Button, ListItem } from 'react-native-elements';
import Colors from '../../../common/Colors';
import Fonts from '../../../common/Fonts';
import ButtonStyles from '../../../common/Styles/Buttons';
import ListStyles from '../../../common/Styles/Lists';
import HeadingStyles from '../../../common/Styles/HeadingStyles';
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles';
import AccountShell from '../../../common/data/models/AccountShell';
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell';
import { RFValue } from 'react-native-responsive-fontsize';


export type Props = {
  sourceAccountShell: AccountShell;
  destinationAccountShell: AccountShell;
  onViewAccountDetailsPressed: () => void;
};

type ItemProps = {
  accountShell: AccountShell;
};

const AccountShellItem: React.FC<ItemProps> = ({
  accountShell,
}: ItemProps) => {
  const primarySubAccount = usePrimarySubAccountForShell(accountShell);

  return (
    <ListItem>
      <Avatar
        source={primarySubAccount.avatarImageSource}
        imageProps={{
          resizeMode: "contain",
        }}
        size="large"
        containerStyle={styles.avatarImageContainer}
      />

      <ListItem.Content style={styles.titleSection}>
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
  );
};

const AccountShellMergeSuccessBottomSheet: React.FC<Props> = ({
  sourceAccountShell,
  destinationAccountShell,
  onViewAccountDetailsPressed,
}: Props) => {
  return (
    <View style={styles.rootContainer}>
      <View style={styles.backgroundImageContainer}>
        <Image
          source={require('../../../assets/images/BottomSheetMessages/success-stars.png')}
          style={{
            width: 103,
            height: 128,
          }}
        />
      </View>

      <View style={styles.mainContentContainer}>

        <View style={styles.headerSection}>
          <Text style={BottomSheetStyles.confirmationMessageHeading}>
            Accounts Merged
          </Text>
        </View>

        <View>
          <View style={styles.accountShellItem}>
            <Text style={{...HeadingStyles.listSectionHeading, marginBottom: 0 }}>Source</Text>
            <AccountShellItem accountShell={sourceAccountShell} />
          </View>

          <View style={styles.accountShellItem}>
            <Text style={{ ...HeadingStyles.listSectionHeading, marginBottom: 0 }}>Destination</Text>
            <AccountShellItem accountShell={destinationAccountShell} />
          </View>

        </View>

        <View style={styles.actionButtonContainer}>
          <Button
            raised
            buttonStyle={ButtonStyles.primaryActionButton}
            title="View Account"
            titleStyle={ButtonStyles.actionButtonText}
            onPress={onViewAccountDetailsPressed}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  backgroundImageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  mainContentContainer: {
    padding: 30,
    paddingBottom: 40,
    flex: 1,
    justifyContent: 'space-between',
  },

  headerSection: {
    marginBottom: 30,
  },

  accountShellItem: {
    marginBottom: 12,
  },

  accountShellItemTitleText: {
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
  },

  balanceCaptionText: {
    fontSize: RFValue(10),
    color: Colors.blue,
    fontFamily: Fonts.FiraSansMediumItalic,
  },

  actionButtonContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  avatarImageContainer: {
    marginRight: 4,
  },

  titleSection: {
    flex: 1,
  },
});

export default AccountShellMergeSuccessBottomSheet;
