import React from 'react'
import { StyleSheet, Image, FlatList, ImageSourcePropType, View, SafeAreaView, StatusBar } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../../../common/Styles/ListStyles'
import ImageStyles from '../../../../common/Styles/ImageStyles'
import { translations } from '../../../../common/content/LocContext'
import CustomToolbar from '../../../../components/home/CustomToolbar'
import { hp } from '../../../../common/data/responsiveness/responsive'
import Colors from '../../../../common/Colors'

export type Props = {
  navigation: any;
};

interface MenuOption {
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  screenName?: string;
  onOptionPressed?: () => void;
}

const listItemKeyExtractor = ( item: MenuOption ) => item.title


const PanAccountSettingsContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const strings = translations[ 'stackTitle' ]
  const menuOptions: MenuOption[] = [
    {
      title: strings[ 'ShowAllAccounts' ],
      subtitle: strings[ 'ShowAllAccountsSub' ],
      imageSource: require( '../../../../assets/images/icons/account-visibility/icon_visible.png' ),
      screenName: 'EnterPasscode',
    },
  ]

  function handleListItemPress( menuOption: MenuOption ) {
    if ( typeof menuOption.onOptionPressed === 'function' ) {
      menuOption.onOptionPressed()
    } else if ( menuOption.screenName !== undefined ) {
      navigation.navigate( menuOption.screenName )
    }
  }

  const renderItem = ( { item: menuOption }: { item: MenuOption } ) => {
    return (
      <ListItem
        bottomDivider
        onPress={() => { handleListItemPress( menuOption ) }}
      >
        <Image
          source={menuOption.imageSource}
          style={ImageStyles.thumbnailImageMedium}
          resizeMode="contain"
        />

        <ListItem.Content style={ListStyles.listItemContentContainer}>
          <ListItem.Title style={ListStyles.listItemTitle}>{menuOption.title}</ListItem.Title>
          <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{menuOption.subtitle}</ListItem.Subtitle>
        </ListItem.Content>

        {menuOption.screenName !== undefined && (
          <ListItem.Chevron />
        )}

      </ListItem>
    )
  }

  return (
    <View>
      <SafeAreaView style={{
        backgroundColor: Colors.appPrimary
      }}/>
      <StatusBar backgroundColor={Colors.appPrimary} barStyle="dark-content" />

      <CustomToolbar
        onBackPressed={() => navigation.pop()}
        toolbarTitle={strings[ 'AccountSettings' ]}
        showSwitch={false}
        containerStyle={{
          height: hp( 100 )
        }} />
      <FlatList
        style={styles.rootContainer}
        data={menuOptions}
        keyExtractor={listItemKeyExtractor}
        renderItem={renderItem}
      />
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingHorizontal: 10,
  },
} )

export default PanAccountSettingsContainerScreen
