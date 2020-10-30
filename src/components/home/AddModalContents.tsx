import React from 'react';
import { StyleSheet, Image } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { FlatList } from 'react-native-gesture-handler';
import { HomeAddMenuItem } from '../../pages/Home/AddMenuItems';
import { ListItem } from 'react-native-elements';
import ListStyles from '../../common/Styles/ListStyles';
import CommonStyles from '../../common/Styles/Styles';

export type Props = {
  menuItems: HomeAddMenuItem[];
  onItemSelected: (item: HomeAddMenuItem) => void;
};

const menuItemKeyExtractor = (item: HomeAddMenuItem) => String(item.kind);


const AddModalContents: React.FC<Props> = ({
  menuItems,
  onItemSelected,
}: Props) => {

  const renderItem = ({ item: menuItem }: { item: HomeAddMenuItem }) => {
    return (
      <ListItem
        bottomDivider
        onPress={() => { onItemSelected(menuItem) }}
      >
        <Image
          source={menuItem.imageSource}
          style={ListStyles.thumbnailImageMedium}
          resizeMode="contain"
        />

        <ListItem.Content style={ListStyles.listItemContentContainer}>
          <ListItem.Title style={ListStyles.listItemTitle}>{menuItem.title}</ListItem.Title>
          <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{menuItem.subtitle}</ListItem.Subtitle>
        </ListItem.Content>

        <ListItem.Chevron />
      </ListItem>
    );
  };

  return (
    <FlatList
      style={styles.rootContainer}
      data={menuItems}
      keyExtractor={menuItemKeyExtractor}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    ...CommonStyles.rootView,
  },
});

export default AddModalContents;
