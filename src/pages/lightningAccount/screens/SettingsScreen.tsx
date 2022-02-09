import React, { Component } from 'react'
import { Text, View, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { Button } from 'react-native-elements'
import Fonts from '../../../common/Fonts.js'
import Colors from '../../../common/Colors'
import ListStyles from '../../../common/Styles/ListStyles'
import { ListItem } from 'react-native-elements'
import CommonStyles from '../../../common/Styles/Styles'

export default class SettingsScreen extends Component {
  constructor( props: any ) {
    super( props )
    this.state = {
      navigation: this.props.navigation.getParam( 'navigation' ),
    }
    this.settingOptions = [
      {
        Screen: 'ChannelsListScreen',
        Title: 'Channels',
        Description: 'view and manage channels',
      },
      {
        Screen: 'ChannelsListScreen',
        Title: 'Payments',
        Description: 'My LN payments',
      },

    ]
  }

  uniqueKey = ( item: any, index: number ) => index.toString();

  renderTemplate = ( { item }: { item: any } ): ReactElement => {
    return (
      <ListItem
        bottomDivider
        onPress={() => {
          if( item.Title==='Channels' ) {
            this.props.navigation.navigate( item.Screen )
          } else if( item.Title==='Payments' ) {
            this.props.navigation.navigate( 'Payments' )
          }
        }}
        // disabled={listItem.title === 'Archive Account' && primarySubAccount.type === AccountType.CHECKING_ACCOUNT}
      >
        <ListItem.Content
          style={[
            ListStyles.listItemContentContainer,
            {
              paddingVertical: 10,
            },
          ]}
        >
          <ListItem.Title style={ListStyles.listItemTitle}>
            {item.Title}
          </ListItem.Title>
          <ListItem.Subtitle style={ListStyles.listItemSubtitle}>
            {item.Description}
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron size={22} />
      </ListItem>
    )
  };
  render() {
    return (
      <View>
        {/* <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            this.props.navigation.goBack();
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity> */}
        <FlatList
          style={{
            margin: 5,
          }}
          data={this.settingOptions}
          renderItem={this.renderTemplate}
          keyExtractor={this.uniqueKey}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create( {
} )
