import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { WebView } from 'react-native-webview'
import Toast from '../components/Toast'
import { useNavigation, useRoute } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ActivityIndicator } from 'react-native-paper'




const AppWebView = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const url = route.params?.url
  const [ loading, setLoading ] = useState( true )

  const stopLoading=()=>{
    setLoading( false )
  }

  const errorMessage=()=>{
    setLoading( false )
    Toast( 'Error occured loading website' )
  }

  const errorView=()=>{
    return (
      <View style={styles.errorWrapper}>
        <Text style={styles.errorLabel}>Error Occured</Text>
      </View>
    )
  }

  const goBack=()=>{
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      {loading && <View style={styles.loadingBackdrop}>
        <ActivityIndicator color={Colors.textColorGrey}/>
      </View>}
      <View style={styles.header}>
        <View style={styles.opacityPlaceholder}></View>
        <TouchableOpacity onPress={goBack} style={styles.headerWrapper}>
          <FontAwesome
            name="long-arrow-left"
            color={Colors.homepageButtonColor}
            size={17}
            style={styles.backIconWrapper}
          />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>
      <WebView
        source={{
          uri:url || ''
        }}
        onLoadStart={stopLoading}
        onError={errorMessage}
        onHttpError={errorMessage}
        renderError={errorView}
      />
    </View>
  )
}

export default AppWebView

const styles = StyleSheet.create( {
  container:{
    flex:1,
    backgroundColor:'#fff'
  },
  header:{
    width:'100%',
    height:50,
    flexDirection:'row',
    alignItems:'center',
  },
  headerWrapper:{
    height:50,
    flexDirection:'row',
    alignItems:'center',
  },
  backIconWrapper:{
    marginLeft:10
  },
  backLabel:{
    color:Colors.black,
    marginLeft:10,
    fontFamily:Fonts.Regular,
    fontSize:RFValue( 16 ),
  },
  opacityPlaceholder:{
    width:'100%',
    height:'100%',
    position:'absolute',
    zIndex:-1,
    opacity:0.5,
    backgroundColor:Colors.white
  },
  bodyWrapper:{
    flex:1
  },
  errorWrapper:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  errorLabel:{
    fontSize:RFValue( 16 ),
    color:Colors.textColorGrey,
    fontFamily:Fonts.Regular
  },
  loadingBackdrop:{
    width:'100%',
    height:'100%',
    position:'absolute',
    zIndex:2,
    alignItems:'center',
    justifyContent:'center'
  }
} )
