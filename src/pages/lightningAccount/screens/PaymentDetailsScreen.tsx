import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native'
import openLink from '../../../utils/OpenLink'
import ListStyles from '../../../common/Styles/ListStyles'
import LabeledBalanceDisplay from '../../../components/LabeledBalanceDisplay'
import Colors from '../../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import moment from 'moment'
import HeaderTitle from '../../../components/HeaderTitle'

export default class PaymentDetailsScreen extends Component {
  constructor( props ) {
    super( props )
    this.state = {
      payment: props.route.params?.payment,
    }
  }

  render() {
    return (
      <ScrollView
        contentContainerStyle={styles.rootContainer}
        overScrollMode="never"
        bounces={false}
      >
        <HeaderTitle
          firstLineTitle={'Payment Details'}
          secondLineTitle={''}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />

        <View style={styles.bodySection}>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>Fee</Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {this.state.payment.getFee}
            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Payment Hash
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {this.state.payment.payment_hash}
            </Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Payment Pre-Image
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {this.state.payment.payment_preimage }
            </Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>Creation Date</Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {moment.unix( parseInt( this.state.payment.creation_date ) ).format( 'DD/MM/YY • hh:MMa' )}
            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Path
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {this.state.payment.enhancedPath}
            </Text>
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexGrow: 1,
    backgroundColor: Colors.backgroundColor,
  },
  textHeader: {
    fontSize: 24,
    color: Colors.blue,
    marginHorizontal: 20,
    marginVertical: 20,
    fontFamily: Fonts.Regular,
  },

  bodySection: {
    marginTop: 24,
    paddingHorizontal: 10,
  },

  lineItem: {
    marginBottom: RFValue( 16 ),
    backgroundColor: 'white',
    padding: 10,
    paddingHorizontal: 10,
    elevation: 4,
    borderRadius: 8,
  },

  containerRec: {
    flexDirection: 'row',
    alignItems: 'center',
  },
} )
