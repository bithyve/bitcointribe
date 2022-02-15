import React, { Component } from 'react'
import {  View, StyleSheet, FlatList, } from 'react-native'
import ListStyles from '../../../common/Styles/ListStyles'
import { ListItem } from 'react-native-elements'
import Node from '../../../assets/images/svgs/node.svg'
import Channels from '../../../assets/images/svgs/channels.svg'
import Bitcoin from '../../../assets/images/accIcons/bitcoin.svg'

export default class SettingsScreen extends Component {
  constructor( props: any ) {
    super( props )
    this.state = {
      navigation: this.props.navigation.getParam( 'navigation' ),
    }
    this.settingOptions = [
      {
        Screen: 'NodeInfoScreen',
        Title: 'Node Information',
        Description: 'View Node Information',
        image: () => <Node />
      },
      {
        Screen: 'ChannelsListScreen',
        Title: 'Channels',
        Description: 'View and Manage Channels',
        image: () => <Channels />
      },
      {
        Screen: 'Payments',
        Title: 'Payments',
        Description: 'My Lightning Payments',
        image: () => <Bitcoin />
      }
    ]
  }

  uniqueKey = ( item: any, index: number ) => index.toString();

  renderTemplate = ( { item }: { item: any } ): ReactElement => {
    return (
      <ListItem
        bottomDivider
        onPress={() => {
          this.props.navigation.navigate( item.Screen )
        }}
      >

        <View style={ListStyles.thumbnailImageSmall}>
          {item.image()}
        </View>
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
