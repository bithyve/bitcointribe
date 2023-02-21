import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import AccountShell from '../../../common/data/models/AccountShell'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import { RFValue } from 'react-native-responsive-fontsize'
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForSubAccountKind'

export type Props = {
  sourceShell: AccountShell;
};

const AccountShellMergeSelectionListHeader: React.FC<Props> = ( { sourceShell, }: Props ) => {
  const primarySubAccount = usePrimarySubAccountForShell( sourceShell )

  return (
    <View style={styles.rootContainer}>

      <ListItem pad={4} containerStyle={{
        marginBottom: 36
      }}>
        <View style={styles.avatarImage} >
          {getAvatarForSubAccount( primarySubAccount )}
        </View>


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

      <Text style={ListStyles.infoHeaderSubtitleText}>
        Choose a destination to merge this account's sub-accounts into.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    ...ListStyles.infoHeaderSection,
    paddingHorizontal: 36,
  },

  accountShellItemTitleText: {
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.Regular,
  },

  titleLabelText: {
    fontSize: RFValue( 10 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.Medium,
  },

  balanceCaptionText: {
    fontSize: RFValue( 10 ),
    color: Colors.blue,
    fontFamily: Fonts.MediumItalic,
  },

  avatarImage: {
    ...ImageStyles.thumbnailImageXLarge,
    marginRight: 8,
  },
} )

export default AccountShellMergeSelectionListHeader
