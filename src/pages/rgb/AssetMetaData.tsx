import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
  ActivityIndicator,
  ScrollView
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import { RFValue } from 'react-native-responsive-fontsize'
import useAccountByAccountShell from '../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import RGBServices from '../../services/RGBServices'
import moment from 'moment'
import HeaderTitle from '../../components/HeaderTitle'
import ListStyles from '../../common/Styles/ListStyles'

const styles = StyleSheet.create( {
  lineItem: {
    marginBottom: RFValue( 16 ),
    backgroundColor: 'white',
    padding: 10,
    paddingHorizontal: 10,
    elevation: 4,
    borderRadius: 8,
  },
} )

export const DetailsItem = ( { name, value } ) => {
  return(
    <View style={styles.lineItem}>
      <Text style={ListStyles.listItemTitleTransaction}>{name}</Text>
      <Text
        selectable
        style={{
          ...ListStyles.listItemSubtitle,
          marginBottom: 3,
        }}
      >
        {value}
      </Text>
    </View>
  )
}

const AssetMetaData = ( props ) => {
  const [ loading, setLoading ] = useState( true )
  const asset = props.navigation.getParam( 'asset' )
  const accountShell = props.navigation.getParam( 'accountShell' )
  const account = useAccountByAccountShell( accountShell )
  const { rgbConfig } = account
  const [ metaData, setMetaData ] = useState( {
  } )

  useEffect( () => {
    getMetaData()
  }, [] )

  const getMetaData = async () => {
    try {
      const data = await RGBServices.getRgbAssetMetaData( rgbConfig.mnemonic, rgbConfig.xpub, asset.assetId )
      if ( data ) {
        setMetaData( data )
        setLoading( false )
      } else {
        props.navigation.goBack()
      }

    } catch ( error ) {
      props.navigation.goBack()
      console.log( error )
    }
  }


  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
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
        firstLineTitle={asset.name}
        secondLineTitle={asset.ticker}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      {
        loading ?
          <ActivityIndicator size="large" style={{
            height: '70%'
          }}/> :
          <ScrollView contentContainerStyle={{
            padding: 20
          }}>

            <DetailsItem
              name="Asset ID"
              value={metaData.assetId}
            />

            <DetailsItem
              name="Issued Supply"
              value={metaData.issuedSupply}
            />

            <DetailsItem
              name="Asset Type"
              value={metaData.assetType}
            />

            <DetailsItem
              name="Timestamp"
              value={moment.unix( metaData.timestamp ).format( 'DD/MM/YY • hh:MMa' )}
            />

          </ScrollView>
      }


    </SafeAreaView>
  )
}

export default AssetMetaData
