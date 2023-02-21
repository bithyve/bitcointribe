import React, { Component, } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { inject, observer } from 'mobx-react'
import PaymentList from './components/PaymentList'

@inject( 'PaymentsStore' )
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
    backgroundColor: Colors.white,
    flex: 1,
  },
  header: {
    color: Colors.darkBlue,
    fontSize: RFValue( 25 ),
    paddingLeft: 10,
    fontFamily: Fonts.Regular,
  },
  activityIndicator: {
    paddingVertical: 40,
  },
} )
