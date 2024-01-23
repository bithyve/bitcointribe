import React from 'react'
import { FlatList, ImageSourcePropType, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ListItem } from 'react-native-elements'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import Colors from '../../../../common/Colors'
import ListStyles from '../../../../common/Styles/ListStyles'
// import ImageStyles from '../../../../common/Styles/ImageStyles'
import IconSettings from '../../../../assets/images/svgs/icon_accntSettings.svg'
import { translations } from '../../../../common/content/LocContext'
import { hp } from '../../../../common/data/responsiveness/responsive'
import CommonStyles from '../../../../common/Styles/Styles'
import HeaderTitle from '../../../../components/HeaderTitle'


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
  const accountMgt = translations[ 'accManagement' ]
  const menuOptions: MenuOption[] = [
    {
      title: strings[ 'ShowAllAccounts' ],
      subtitle: strings[ 'ShowAllAccountsSub' ],
      imageSource: '',
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
        {/* <Image
          source={menuOption.imageSource}
          style={ImageStyles.thumbnailImageMedium}
          resizeMode="contain"
        /> */}
        <IconSettings/>

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
      <SafeAreaView />
      <StatusBar barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.pop()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.headerWrapper}>
        <HeaderTitle
          firstLineTitle={accountMgt[ 'AccountManagement' ]}
          secondLineTitle={accountMgt.Rearrange}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />
      </View>
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
  headerWrapper:{
    marginBottom: hp( 20 )
  }
} )

export default PanAccountSettingsContainerScreen
