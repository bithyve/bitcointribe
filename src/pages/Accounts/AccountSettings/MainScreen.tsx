import React, { useMemo } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Avatar, ListItem } from 'react-native-elements';
import ListStyles from '../../../common/Styles/Lists';

export type Props = {
  navigation: any;
};

export type SettingsListItem = {
  title: string;
  subtitle: string;
  screenName: string;
  imageSource: NodeRequire;
};

const listItems: SettingsListItem[] = [
  {
    title: 'Name & Description',
    subtitle: `Customize display properties`,
    screenName: 'EditDisplayProperties',
    imageSource: require('../../../assets/images/icons/icon_checking_blue.png'),
  },
  {
    title: 'Reassign Transactions',
    subtitle: 'Map from this account to another',
    screenName: 'ReassignTransactionsMainOptions',
    imageSource: require('../../../assets/images/icons/icon_transactions_circle.png'),
  },
  {
    title: 'Account Visibility',
    subtitle: `Configure for different privacy-sensitive contexts`,
    screenName: '',
    imageSource: require('../../../assets/images/icons/icon_checking_blue_visibility.png'),
  },
  {
    title: 'Merge Account',
    subtitle: `Move all transactions to another Hexa account`,
    screenName: '',
    imageSource: require('../../../assets/images/icons/icon_merge_blue.png'),
  },
  {
    title: 'Archive Account',
    subtitle: 'Move this account out of sight and out of mind',
    screenName: '',
    imageSource: require('../../../assets/images/icons/icon_archive.png'),
  },
];

const listItemKeyExtractor = (item: SettingsListItem) => item.title;

const AccountSettingsMainScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const accountID = useMemo(() => {
    return navigation.getParam('accountID');
  }, [navigation]);

  function handleListItemPressed(listItem: SettingsListItem) {
    navigation.navigate(listItem.screenName, {
      accountID,
    });
  }

  const renderItem = ({ item: listItem }: { item: SettingsListItem }) => {
    return (
      <ListItem
        bottomDivider
        onPress={() => { handleListItemPressed(listItem) }}
      >
        <Avatar
          source={listItem.imageSource}
          size={"small"}
        />

        <ListItem.Content style={ListStyles.listItemContentContainer}>
          <ListItem.Title style={ListStyles.listItemTitle}>{listItem.title}</ListItem.Title>
          <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{listItem.subtitle}</ListItem.Subtitle>
        </ListItem.Content>

        <ListItem.Chevron />
      </ListItem>
    );
  };

  return (
    <FlatList
      style={styles.rootContainer}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      data={listItems}
      keyExtractor={listItemKeyExtractor}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    paddingHorizontal: 10,
  },
});

export default AccountSettingsMainScreen;
