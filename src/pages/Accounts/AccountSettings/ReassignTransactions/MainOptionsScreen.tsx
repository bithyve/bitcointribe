import React, { useMemo } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Avatar, ListItem } from 'react-native-elements';
import ListStyles from '../../../../common/Styles/Lists';

export type Props = {
  navigation: any;
};

export type OptionsListItem = {
  title: string;
  subtitle: string;
  screenName: string;
  imageSource: NodeRequire;
};

const listItems: OptionsListItem[] = [
  {
    title: 'Transactions',
    subtitle: `Reassign any of your incoming and outgoing transactions`,
    screenName: 'ReassignAllTransactionsSelectTransactions',
    imageSource: require('../../../../assets/images/icons/icon_transactions_circle.png'),
  },
  {
    title: 'Sources',
    subtitle: 'Reassign the entire transaction set of a source',
    screenName: 'ReassignSubAccountSourcesSelectSources',
    imageSource: require('../../../../assets/images/icons/icon_sources.png'),
  },
];

const listItemKeyExtractor = (item: OptionsListItem) => item.title;


const AccountSettingsReassignTransactionsMainOptionsScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const accountID = useMemo(() => {
    return navigation.getParam('accountID');
  }, [navigation]);

  function handleListItemPressed(listItem: OptionsListItem) {
    navigation.navigate(listItem.screenName, {
      accountID,
    });
  }

  const renderItem = ({ item: listItem }: { item: OptionsListItem }) => {
    return (
      <ListItem
        bottomDivider
        onPress={() => { handleListItemPressed(listItem) }}
      >
        <Avatar
          source={listItem.imageSource}
          size="small"
          imageProps={{
            resizeMode: 'contain',
          }}
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

export default AccountSettingsReassignTransactionsMainOptionsScreen;
