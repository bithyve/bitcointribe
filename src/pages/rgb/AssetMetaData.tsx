import moment from 'moment'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import { wp } from '../../common/data/responsiveness/responsive'
import HeaderTitle from '../../components/HeaderTitle'
import RGBServices from '../../services/RGBServices'

const styles = StyleSheet.create( {
  lineItem: {
    marginBottom: RFValue( 2 ),
    padding: 2,
    paddingHorizontal: 10,
    flexDirection: 'row'
  },
  textTitle: {
    flex: 2.5,
    fontSize: RFValue( 13 ),
    color: '#6C7074',
    fontFamily: Fonts.Medium
  },
  title: {
    fontSize: RFValue( 15 ),
    color: '#A36363',
    fontFamily: Fonts.Medium,
    marginVertical: 10
  },
  textValue: {
    flex: 4,
    fontSize: RFValue( 14 ),
    color: '#2C3E50',
    fontFamily: Fonts.Regular
  },
  selectedContactsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blue,
    borderRadius: 5,
    height: 30,
    width: 100,
    paddingHorizontal: wp( 2 ),
    marginTop: 15,
    alignSelf: 'flex-end'
  },
  addNewText: {
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    color: Colors.white,
  },
} )

export const DetailsItem = ( { name, value } ) => {
  return(
    <View style={styles.lineItem}>
      <Text style={styles.textTitle}>{name}</Text>
      <Text
        selectable
        numberOfLines={1}
        ellipsizeMode="middle"
        style={styles.textValue}
      >
        {value}
      </Text>
    </View>
  )
}

const AssetMetaData = ( props ) => {
  const [ loading, setLoading ] = useState( true )
  const asset = props.route.params.asset
  const [ metaData, setMetaData ] = useState( {
  } )

  useEffect( () => {
    getMetaData()
  }, [] )

  const getMetaData = async () => {
    try {
      const data = await RGBServices.getRgbAssetMetaData( asset.assetId )
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
        firstLineTitle={'Asset Details'}
        secondLineTitle={asset.name}
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
            padding: 20, flex: 1
          }}>
            {
              asset.dataPaths && (
                <View>
                  <Image
                    style={{
                      height: '60%'
                    }}
                    resizeMode="contain"
                    source={{
                      uri: Platform.select( {
                        android: `file://${asset.dataPaths[ 0 ].filePath}`,
                        ios: asset.dataPaths[ 0 ].filePath
                      } )
                    }}
                  />
                  <TouchableOpacity onPress={() => {
                  }}>
                    <LinearGradient colors={[ Colors.blue, Colors.blue ]}
                      start={{
                        x: 0, y: 0
                      }} end={{
                        x: 1, y: 0
                      }}
                      locations={[ 0.2, 1 ]}
                      style={{
                        ...styles.selectedContactsView, backgroundColor: Colors.lightBlue,
                      }}
                    >
                      <Text style={styles.addNewText}>Download</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )
            }
            <Text style={styles.title}>Asset Meta Data</Text>
            <DetailsItem
              name="Asset ID"
              value={asset.assetId}
            />

            <DetailsItem
              name="Issued Supply"
              value={metaData.issuedSupply.toLocaleString()}
            />

            <DetailsItem
              name="Asset Type"
              value={metaData.assetIface}
            />

            <DetailsItem
              name="Issue Date"
              value={moment.unix( metaData.timestamp ).format( 'DD/MM/YY • hh:MMa' )}
            />

            {
              metaData.description && (
                <DetailsItem
                  name="Description"
                  value={metaData.description}
                />
              )
            }


          </ScrollView>
      }


    </SafeAreaView>
  )
}

export default AssetMetaData
