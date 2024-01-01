import moment from 'moment'
import React from 'react'
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import ListStyles from '../../common/Styles/ListStyles'
import CommonStyles from '../../common/Styles/Styles'
import HeaderTitle from '../../components/HeaderTitle'

const styles = StyleSheet.create( {
  lineItem: {
    marginBottom: RFValue( 2 ),
    padding: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    marginVertical: 10,
    borderRadius: 5
  },
} )

const DetailsItem = ( { name, value, subDetailPressable = false } ) => {
  return(
    <View style={styles.lineItem}>
      <Text style={ListStyles.listItemTitleTransaction}>{name}</Text>
      <Text
        onPress={() => {
          if ( subDetailPressable ) {
            Linking.canOpenURL( `https://blockstream.info/testnet/tx/${value}` ).then( supported => {
              if( supported ) {
                Linking.openURL( `https://blockstream.info/testnet/tx/${value}` )
              }
            } )
          }
        }}
        selectable
        numberOfLines={1}
        ellipsizeMode="middle"
        style={[ ListStyles.listItemSubtitle, {
          marginBottom: 3,
          textDecorationLine: subDetailPressable ? 'underline' : 'none',
          color: subDetailPressable ? Colors.primaryAccent : Colors.greyTextColor
        } ]}
      >
        {value}
      </Text>
    </View>
  )
}

const AssetTransferDetails = ( props ) => {
  const asset = props.route.params.asset
  const item = props.route.params.item

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
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
        firstLineTitle={'Transfer Details'}
        secondLineTitle={asset.ticker}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <ScrollView contentContainerStyle={{
        padding: 20
      }}>
        <DetailsItem
          name="Amount"
          value={item.amount}
        />
        {item.kind !== 'ISSUANCE' && (
          <DetailsItem
            name="Transaction ID"
            value={item.txid}
            subDetailPressable
          />
        )}
        {item.kind !== 'ISSUANCE' && item.changeUtxo?.txid && (
          <DetailsItem
            name="Change UTXO"
            value={item.changeUtxo.txid}
            subDetailPressable
          />
        )}
        <DetailsItem
          name="Date"
          value={moment.unix( item.updatedAt ).format( 'DD/MM/YY • hh:MM' )}
        />
        <DetailsItem
          name="Status"
          value={item.status}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default AssetTransferDetails
