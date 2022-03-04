import React, { Component } from 'react'
import {  View, StyleSheet, FlatList, Text, StatusBar, Dimensions } from 'react-native'
import ListStyles from '../../../common/Styles/ListStyles'
import { ListItem } from 'react-native-elements'
import Node from '../../../assets/images/svgs/node.svg'
import Channels from '../../../assets/images/svgs/channels.svg'
import Bitcoin from '../../../assets/images/accIcons/bitcoin.svg'
import Colors from '../../../common/Colors.js'
import HeaderTitle from '../../../components/HeaderTitle'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { TouchableOpacity } from '@gorhom/bottom-sheet'

const windowHeight = Dimensions.get( 'window' ).height
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
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate( item.Screen )
        }}
        activeOpacity={0.5}
      >
        <ListItem
          containerStyle={{
            borderRadius:10,
            height:hp( windowHeight >= 850 ? 8 : windowHeight >= 750 ? 10 :windowHeight >= 650 && 11  )
          }}
          style={{
            ...styles.lineItem,
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
            <ListItem.Title style={{
              ...ListStyles.listItemTitle, fontSize:RFValue( 13 ), color:Colors.darkBlue
            }}>
              {item.Title}
            </ListItem.Title>
            <ListItem.Subtitle style={{
              ...ListStyles.listItemSubtitle, fontSize:RFValue( 13 ), color:Colors.textColorGrey
            }}>
              {item.Description}
            </ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron size={22} />
        </ListItem>
      </TouchableOpacity>
    )
  };
  render() {
    return (
      <View style={{
        backgroundColor:Colors.offWhite,
        flex: 1,
      }}>
        <StatusBar barStyle="dark-content"/>

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
        <View style={{
          paddingTop:30
        }}>
          <HeaderTitle
            firstLineTitle={'Settings'}
            secondLineBoldTitle={''}
            secondLineTitle={''}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />
        </View>
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
  lineItem: {
    marginBottom: RFValue( 2 ),
    padding: 10,
    paddingHorizontal: 10,
    elevation: 4,
  },
} )
