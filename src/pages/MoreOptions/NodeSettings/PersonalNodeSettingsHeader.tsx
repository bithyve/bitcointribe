import React, { useMemo } from 'react'
import { Image, Switch, StyleSheet, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import CommonStyles from '../../../common/Styles/Styles'
import HeaderTitle from '../../../components/HeaderTitle'

export type Props = {
  isConnectionEnabled: boolean;
  onToggle: ( value: boolean ) => void;
  containerStyle?: Record<string, unknown>;
  navigation: any;
};

const PersonalNodeSettingsHeader: React.FC<Props> = ( {
  isConnectionEnabled,
  onToggle,
  containerStyle = {
  },
  navigation
}: Props ) => {
  const strings  = translations[ 'settings' ]


  const subtitleText = useMemo( () => {
    return isConnectionEnabled ?
      strings.Disconnectyour
      : strings.Disconnectfrom
  }, [ isConnectionEnabled ] )

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        // backgroundColor: Colors.backgroundColor
      } ]}>
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
      <HeaderTitle
        firstLineTitle={'Node Settings'}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <ListItem
        containerStyle={styles.rootContainer}
        bottomDivider
        disabled
      >
        <Image
          source={require( '../../../assets/images/icons/icon_contact.png' )}
          style={[ styles.thumbnailImage, {
            tintColor: Colors.theam_icon_color
          } ]}
          resizeMode="contain"
        />

        <ListItem.Content style={styles.titleSection}>
          <ListItem.Title
            style={ListStyles.listItemTitle}
            numberOfLines={1}
          >
            {strings.Connecttomynode}
          </ListItem.Title>

          <ListItem.Subtitle
            style={ListStyles.listItemSubtitle}
            numberOfLines={2}
          >
            {subtitleText}
          </ListItem.Subtitle>
        </ListItem.Content>

        <Switch
          value={isConnectionEnabled}
          onValueChange={onToggle}
          thumbColor={isConnectionEnabled ? Colors.white : Colors.white}
          trackColor={{
            false: Colors.borderColor, true: Colors.THEAM_TEXT_COLOR
          }}
          onTintColor={Colors.blue}
        />
      </ListItem>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingHorizontal: 24,
  },

  thumbnailImage: {
    ...ImageStyles.thumbnailImageSmall,
    marginRight: 14,
  },

  titleSection: {
    flex: 1,
  },
} )

export default PersonalNodeSettingsHeader
