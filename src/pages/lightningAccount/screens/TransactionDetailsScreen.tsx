import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import {
  SafeAreaView, ScrollView, StyleSheet, Text,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import HeaderTitle from '../../../components/HeaderTitle'
import openLink from '../../../utils/OpenLink'

@inject(
  'NodeInfoStore',
)
@observer
export default class TransactionDetailsScreen extends Component {
  constructor( props ) {
    super( props )
    this.state = {
      transaction: props.route.params?.transaction,
      accountShellId: props.route.params?.accountShellId,
    }
  }

  render() {
    return (
      <ScrollView
        contentContainerStyle={styles.rootContainer}
        overScrollMode="never"
        bounces={false}
      >
        <SafeAreaView style={styles.rootContainer}>
          <HeaderTitle
            firstLineTitle={'Transaction Details'}
            secondLineTitle={''}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />

          <View style={styles.bodySection}>
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>Amount</Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {`${this.state.transaction.amount} sats`}
              </Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
              Transaction ID
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
                onPress={() =>{
                  if( this.props.NodeInfoStore.nodeInfo.testnet ){
                    openLink(
                      `https://blockstream.info/testnet/tx/${this.state.transaction.tx_hash}`
                    )
                  } else {
                    openLink(
                      `https://blockstream.info/tx/${this.state.transaction.tx_hash}`
                    )
                  }

                }

                }
              >
                {this.state.transaction.tx_hash}
              </Text>
            </View>

            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
              Destination Addresses
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {this.state.transaction.dest_addresses.join( '\n' ) }
              </Text>
            </View>

            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>Fees</Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {`${this.state.transaction.total_fees} sats`}
              </Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
              Confirmations
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {this.state.transaction.num_confirmations > 6
                  ? '6+'
                  : this.state.transaction.num_confirmations}
              </Text>
            </View>
          </View>
        </SafeAreaView>
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
