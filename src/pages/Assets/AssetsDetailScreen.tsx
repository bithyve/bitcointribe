import React, { useState } from 'react'
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import { translations } from '../../common/content/LocContext'

export default function AssetsDetailScreen ( props ) {
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]

  const [ assetType, setAssetType ] = useState( 'RGB 20' )
  const [ issueSupply, setIssueSupply ] = useState( '20,000,000' )
  const [ issuanceDate, setIssuanceDate ] = useState( '23 January 2023' )
  const [ name, setName ] = useState( 'Eye of the Beholder' )
  const [ description, setDescription ] = useState( 'rud exercitation ullamco ' )
  const [ assetPrecision, setAssetPrecision ] = useState( '0' )
  const [ ticker, setTicker ] = useState( 'BTC' )

  function downloadClick() {

  }
  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView style={{
        flex: 0
      }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <ScrollView style={{
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
        <Text style={styles.headerTitleText}>{'Asset Details'}</Text>
        <Text style={styles.headerSubTitleText}>{'Lorem ipsum dolor sit amet, consec tetur'}</Text>

        <View style={styles.bodySection}>
          <View style={styles.ImageContainer}>
            <Image style={styles.image}
              source={require( '../../assets/images/BottomSheetMessages/success-stars.png' )}/>
          </View>
          <View style={styles.footerSection}>
            <TouchableOpacity onPress={downloadClick}>
              <LinearGradient colors={[ Colors.blue, Colors.blue ]}
                start={{
                  x: 0, y: 0
                }} end={{
                  x: 1, y: 0
                }}
                locations={[ 0.2, 1 ]}
                style={styles.IssueAssetWrapper}
              >
                <Text style={styles.IssueAssetText}>{'Download'}</Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>
          <Text style={styles.subTitleText}>{'Asset Meta Data'}</Text>
          <View style={styles.metaDataContainer}>
            <Text style={styles.assetTitleText}>{'Asset Type'}</Text>
            <Text style={styles.assetText}>{assetType}</Text>
          </View>
          <View style={styles.metaDataContainer}>
            <Text style={styles.assetTitleText}>{'Issued Supply'}</Text>
            <Text style={styles.assetText}>{issueSupply}</Text>
          </View>
          <View style={styles.metaDataContainer}>
            <Text style={styles.assetTitleText}>{'Issuance Date'}</Text>
            <Text style={styles.assetText}>{issuanceDate}</Text>
          </View>
          <View style={styles.metaDataContainer}>
            <Text style={styles.assetTitleText}>{'Asset Name'}</Text>
            <Text style={styles.assetText}>{name}</Text>
          </View>
          <View style={styles.metaDataContainer}>
            <Text style={styles.assetTitleText}>{'Asset Description'}</Text>
            <Text style={styles.assetText}>{description}</Text>
          </View>
          <View style={styles.metaDataContainer}>
            <Text style={styles.assetTitleText}>{'Asset Precision'}</Text>
            <Text style={styles.assetText}>{assetType}</Text>
          </View>
          <View style={styles.metaDataContainer}>
            <Text style={styles.assetTitleText}>{'Asset Ticker'}</Text>
            <Text style={styles.assetText}>{ticker}</Text>
          </View>
        </View>
      </ScrollView>
    </View>

  )
}

const styles = StyleSheet.create( {
  bodySection: {
    paddingHorizontal: 16,
    // alignItems: 'center'
  },
  footerSection: {
    paddingHorizontal: 10,
    alignItems: 'flex-end',
    marginTop: 20,
    alignSelf: 'flex-end'
  },
  IssueAssetWrapper: {
    height: wp( '8%' ),
    width: wp( '25%' ),
    justifyContent: 'center',
    borderRadius: 6,
    alignItems: 'center',
  },
  IssueAssetText: {
    color: Colors.white,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Medium
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 20 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
  },
  headerSubTitleText: {
    fontSize: RFValue( 12 ),
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontFamily: Fonts.Regular,
    marginLeft: 20,
    marginTop:6,
    marginBottom: 20
  },
  ImageContainer: {
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 10,
    // margin:20,
    justifyContent:'center',
    alignItems:'center',
    height: '45%',
    width: '100%',
    alignSelf: 'center'
  },
  image: {
    height: '100%',
    width: '100%',
  },
  subTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 15 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
    marginBottom:5,
    marginTop:10
  },
  assetTitleText: {
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    fontSize: RFValue( 12 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
    flex: 0.4,
  },
  assetText: {
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    flex: 0.6,
    fontSize: RFValue( 12 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
  },
  metaDataContainer:{
    flexDirection: 'row',
    marginVertical: 5
  }
} )
