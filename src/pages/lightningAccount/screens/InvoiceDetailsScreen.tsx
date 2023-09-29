import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import ListStyles from '../../../common/Styles/ListStyles'
import LabeledBalanceDisplay from '../../../components/LabeledBalanceDisplay'
import moment from 'moment'
import Colors from '../../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import Invoice from '../../../models/Invoice'
import Toast from '../../../components/Toast'
import HeaderTitle from '../../../components/HeaderTitle'

export default class TransactionDetailsScreen extends Component {
  constructor( props ) {
    super( props )
    this.state={
      invoice: props.route.params?.invoice || null,
    }
  }

  writeToClipboard = ( text: string ) => {
    Clipboard.setString( text )
    Toast( 'Text Copied' )
  };

  render() {
    const { invoice }: Invoice = this.state
    const {
      fallback_addr,
      r_hash,
      isPaid,
      getMemo,
      receipt,
      creation_date,
      description_hash,
      payment_hash,
      r_preimage,
      cltv_expiry,
      expirationDate,
      payment_request,
      bolt11,
    } = invoice

    const privateInvoice = invoice.private

    return (
      <ScrollView
        contentContainerStyle={styles.rootContainer}
        overScrollMode="never"
        bounces={false}
      >
        <HeaderTitle
          firstLineTitle={'Invoice Details'}
          secondLineTitle={''}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />

        <View style={styles.bodySection}>
          {!!payment_request && (
            <TouchableOpacity
              onPress={() => {
                this.writeToClipboard( payment_request )
              }}
            >
              <View style={styles.lineItem}>
                <Text style={ListStyles.listItemTitleTransaction}>
                  Payment Request
                </Text>
                <Text
                  style={{
                    ...ListStyles.listItemSubtitle,
                    marginBottom: 3,
                  }}
                >
                  {payment_request}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              {isPaid ? 'Paid Amount' : 'Unpaid Amount'}
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {`${invoice.getAmount} sats`}
            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>Memo</Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {getMemo}
            </Text>
          </View>

          {!!receipt && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>Receipt</Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {receipt}
              </Text>
            </View>
          )}

          {isPaid && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                Settle Date
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {moment.unix( parseInt( invoice.settleDate ) ).format(
                  'DD/MM/YY • hh:MMa'
                )}
              </Text>
            </View>
          )}

          {!!creation_date && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                Creation Date
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {moment.unix( parseInt( invoice.creationDate ) ).format(
                  'DD/MM/YY • hh:MMa'
                )}
              </Text>
            </View>
          )}

          {!!invoice.expiry && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                Expiry
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {`${invoice.expiry} seconds`}
              </Text>
            </View>
          )}

          {!!privateInvoice && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                Private Invoice
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {privateInvoice}
              </Text>
            </View>
          )}

          {!!fallback_addr && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                Fallback Address
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {fallback_addr}
              </Text>
            </View>
          )}

          {!!cltv_expiry && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                CLTV Verify
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {cltv_expiry}
              </Text>
            </View>
          )}

          {!!r_hash && typeof r_hash === 'string' && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>R Hash</Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {r_hash}
              </Text>
            </View>
          )}

          {!!r_preimage && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                R Pre-image
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {r_preimage}
              </Text>
            </View>
          )}

          {!!description_hash && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                Description Hash
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {description_hash}
              </Text>
            </View>
          )}

          {!!payment_hash && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                Creation Date
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {invoice.creationDate}
              </Text>
            </View>
          )}
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
