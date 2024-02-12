import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LineChart, LineChartBicolor } from "react-native-gifted-charts";


interface Props{
    feesData: Array<{
        avgFee_100: number,
        timestamp: number
    }>
}

const FeesGraph = (props:Props) => {
    const [graphData, setGraphData] = useState([])
    useEffect(() => {
        transformData()
    }, [])

    function formatDate(timestamp) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const date = new Date(timestamp * 1000);
        
        const day = date.getDate(); // Get day of the month
        const month = months[date.getMonth()]; // Get month (0-indexed, hence the array)
      
        return `${day} ${month}`;
      }
      

    const transformData=()=>{
        try{
            const chartData = props.feesData.map(item => ({
                value: item.avgFee_100,
                label: formatDate(item.timestamp)// Converting UNIX timestamp to readable date
              }));
            setGraphData(chartData)
            console.log(chartData)
        }catch(err){
            console.log("err",err)

        }
    }
    
  return (
    <View style={styles.container}>
        <LineChart data={graphData} disableScroll={false}/>
    </View>
  )
}

export default FeesGraph

const styles = StyleSheet.create({
    container:{
        width:"100%",
        height:300
    }
})