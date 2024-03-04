import moment from 'moment'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import RNFS from 'react-native-fs'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import RNFetchBlob from 'rn-fetch-blob'
import Colors from '../../common/Colors'
import { hp, wp } from '../../common/data/responsiveness/responsive'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import HeaderTitle from '../../components/HeaderTitle'
import Toast from '../../components/Toast'
import RGBServices from '../../services/RGBServices'

const styles = StyleSheet.create({
  lineItem: {
    marginBottom: RFValue(2),
    padding: 2,
    paddingHorizontal: 10,
    flexDirection: 'row',
    width: '100%'
  },
  textTitle: {
    fontSize: RFValue(13),
    color: '#6C7074',
    fontFamily: Fonts.Medium,
    width: '40%'
  },
  title: {
    fontSize: RFValue(15),
    color: '#A36363',
    fontFamily: Fonts.Medium,
    marginVertical: 10,
    width: '60%'
  },
  textValue: {
    flex: 4,
    fontSize: RFValue(14),
    color: '#2C3E50',
    fontFamily: Fonts.Regular,
    flexWrap: 'wrap'
  },
  selectedContactsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blue,
    borderRadius: 5,
    height: 30,
    width: 100,
    paddingHorizontal: wp(2),
    marginTop: 15,
    alignSelf: 'flex-end'
  },
  addNewText: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Regular,
    color: Colors.white,
  },
})

export const DetailsItem = ({ name, value }) => {
  return (
    <View style={styles.lineItem}>
      <Text style={styles.textTitle}>{name}</Text>
      <Text
        selectable
        numberOfLines={2}
        ellipsizeMode="middle"
        style={styles.textValue}
      >
        {value}
      </Text>
    </View>
  )
}

const AssetMetaData = (props) => {
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const asset = props.route.params.asset
  const [metaData, setMetaData] = useState({
  })

  useEffect(() => {
    getMetaData()
  }, [])

  const getMetaData = async () => {
    try {
      const data = await RGBServices.getRgbAssetMetaData(asset.assetId)
      if (data) {
        setMetaData(data)
        setLoading(false)
      } else {
        props.navigation.goBack()
      }

    } catch (error) {
      props.navigation.goBack()
      console.log(error)
    }
  }

  const requestPermission=async ()=>{
    if(Platform.OS==='ios'){
      return true;
    }
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
  
      if (granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        && granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }

  const downloadFile=async()=>{
    const result = await requestPermission();
    if(!result){
      Toast("Please grant storage permission to download asset. ")
      return;
    }
    setDownloading(true)
    const localFilePath = Platform.select({
      android: `file://${asset.dataPaths[0].filePath}`,
      ios: asset.dataPaths[0].filePath.replace('/private','')
    })
    const timestamp = new Date().getTime()
    const mime = asset.dataPaths[0].mime || 'application/octet-stream'
    const extension = mime.split('/')[1]
    const destinationPath = Platform.select({
      android:`${RNFS.DownloadDirectoryPath}/${timestamp}.${extension}`,
      ios: `${RNFS.DocumentDirectoryPath}/${timestamp}.${extension}`
    })
      RNFetchBlob.fs.cp(localFilePath, destinationPath)
        .then(() => {
          console.log(`File copied from ${localFilePath} to ${destinationPath}`);
          Toast(`Asset Downloaded in ${destinationPath}` )
          setDownloading(false)
        })
        .catch(error => {
          Toast("Failed to download, please try again.")
          setDownloading(false)
        });
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
          }} /> :
          <ScrollView style={{ height: '100%', padding: 20 }}>
            {
              asset?.dataPaths.length > 0 && (
                <View >
                  <Image
                    style={{
                      height: hp(250),
                      width: '100%'
                    }}
                    resizeMode="contain"
                    source={{
                      uri: Platform.select({
                        android: `file://${asset.dataPaths[0].filePath}`,
                        ios: asset.dataPaths[0].filePath.replace('/private','')
                      })
                    }}
                  />
                  <TouchableOpacity disabled={downloading ? true : false} onPress={() => {downloadFile()}}>
                    <View
                      style={{
                        ...styles.selectedContactsView, backgroundColor: downloading ? Colors.textColorGrey : Colors.blue,
                      }}
                    >
                      {downloading ? (<ActivityIndicator size="small" style={{
                        height: '70%'
                      }} />) : (<Text style={styles.addNewText}>Download</Text>)}
                    </View>
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
              value={moment.unix(metaData.timestamp).format('DD/MM/YY • hh:MMa')}
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
