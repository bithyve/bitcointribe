import React, { Component, ReactElement } from "react";
import { Text, View, FlatList, TouchableOpacity, Button, StyleSheet } from "react-native";
import RESTUtils from "../../../utils/ln/RESTUtils";
import ChannelItem from "../components/channels/ChannelListComponent";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { inject, observer } from "mobx-react";
import ListStyles from '../../../common/Styles/ListStyles'
import LabeledBalanceDisplay from '../../../components/LabeledBalanceDisplay'
import moment from 'moment'

export default class TransactionDetailsScreen extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props.)
    this.state = {
        transaction: this.props.navigation.getParam('transaction')
    }
  }

  render() {
      console.log(this.props.navigation.getParam('transaction'), "transac")
    return (
    <View style={styles.rootContainer}>
    </View>
    );
  }
}


const styles = StyleSheet.create( {
    rootContainer: {
      paddingVertical: 16,
      paddingHorizontal: 18,
      backgroundColor: 'white',
      margin: 10,
      elevation: 4,
      borderRadius: 8,
    },
  
    contentContainer: {
      flexDirection: 'row',
      alignContent: 'center',
    },
  
    avatarImage: {
      // ...ImageStyles.thumbnailImageMedium,
      width: widthPercentageToDP( 12 ),
      height: widthPercentageToDP( 12 ),
      marginRight: 14,
      // borderRadius: 9999,
    },
  } )
