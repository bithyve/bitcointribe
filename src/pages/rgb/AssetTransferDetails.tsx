import React, {  } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import moment from 'moment'
import HeaderTitle from '../../components/HeaderTitle'
import { DetailsItem } from './AssetMetaData'

const AssetTransferDetails = ( props ) => {
  const asset = props.navigation.getParam( 'asset' )
  const item = props.navigation.getParam( 'item' )

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
        <DetailsItem
          name="Transaction ID"
          value={item.txid}
        />
        <DetailsItem
          name="Date"
          value={moment.unix( item.createdAt ).format( 'DD/MM/YY • hh:MMa' )}
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
