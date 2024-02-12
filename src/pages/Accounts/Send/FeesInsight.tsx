import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { GraphData } from 'tempDB'
import { transformData } from 'src/utils/sending/GetFeesDataStatement'
import { ScrollView } from 'react-native-gesture-handler'
import Fonts from 'src/common/Fonts'
import Colors from 'src/common/Colors'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import FeesGraph from './FeesGraph'


interface Props{
  close:()=>void
}

const FeesInsight = (props:Props) => {
  const [feesHistory, setFeesHistory] = useState([])
  const [feesStatement, setFeesStatement] = useState('')

useEffect(() => {
  handleAxios()
}, [])

const handleAxios=async ()=>{
    setFeesHistory([...GraphData])
    const getStatement = transformData(GraphData);
    setFeesStatement(getStatement)
  }

  return (
    <View>
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
      <FontAwesome name="info" color={Colors.blue} size={19} />
        <Text style={styles.title}>Fees</Text>
        <View style={styles.divider}/>
        <TouchableOpacity onPress={props.close}>
         <FontAwesome name="close" color={Colors.gray10} size={19} />
        </TouchableOpacity>
      </View>
        <Text style={styles.statementLabel}>{feesStatement}</Text>
        <FeesGraph feesData={GraphData} />
    </View>
    </View>
  )
}

export default FeesInsight

const styles = StyleSheet.create({
    container:{
        backgroundColor:'#fff',
    },
    headerWrapper:{
      width:'100%',
      flexDirection:'row',
      alignItems:'center',
      paddingHorizontal:15,
      marginTop:10
    },
    title:{
      fontFamily:Fonts.Medium,
      color:Colors.blue,
      fontSize: 20,
      marginLeft:5
    },
    divider:{
      flex:1
    },
    statementLabel:{
      fontFamily:Fonts.Medium,
      color:Colors.gray5,
      fontSize: 14,
      marginTop:10,
      paddingHorizontal:15,
      marginBottom:20
    }

})