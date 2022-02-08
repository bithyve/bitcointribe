import React, { Component, ReactElement } from 'react'
import { Text, View, FlatList, StyleSheet } from 'react-native'

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";


import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../../common/Colors";
import Fonts from "../../../common/Fonts";
import { inject, observer } from 'mobx-react';
import PaymentList from '../components/PaymentList';
import { ActivityIndicator } from 'react-native-paper';


@inject('PaymentsStore')
@observer
export default class PaymentListScreen extends Component {
  constructor( props: any ) {
    super( props )
  }

  componentDidMount(): void {
      this.props.PaymentsStore.getPayments()
  }

  render() {
    return (
      <View style={styles.container}>
          <Text style={styles.header}>Payments</Text>
          {this.props.PaymentsStore.loading?
            <ActivityIndicator
            color={Colors.blue}
            size="large"
            style={styles.activityIndicator}
          />
          :
          <PaymentList 
          navigation = {this.props.navigation}
          payments = {this.props.PaymentsStore.payments}/>}
      </View>
    )
  }
}


const styles = StyleSheet.create( {
  container: {
    padding: 10,
    backgroundColor: "#F5F5F5",
    flex: 1,
  },
  header: {
    color: Colors.darkBlue,
    fontSize: RFValue(25),
    paddingLeft: 10,
    fontFamily: Fonts.FiraSansRegular,
  },
  activityIndicator: {
    paddingVertical: 40,
  },
} )
