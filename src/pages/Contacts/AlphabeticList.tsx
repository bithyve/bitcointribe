import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { RFValue } from 'react-native-responsive-fontsize'
const alphabets = Array.from( {
  length: 26
}, ( _, i ) => String.fromCharCode( 65 + i ) )


interface Props{
    selected: string;
    onPress:( char:string )=>void
}

const AlphabeticList = ( props:Props ) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={props.selected==='#'?styles.highlight:{
      }}>
        <Text  style={props.selected==='#'?styles.highlightLetter:styles.letter}>#</Text>
      </TouchableOpacity>
      {alphabets.map( ( letter, index ) => (
        <TouchableOpacity key={index} style={props.selected===letter?styles.highlight:{
        }}>
          <Text style={props.selected===letter?styles.highlightLetter:styles.letter}>{letter}</Text>
        </TouchableOpacity>
      ) )}
    </View>
  )
}

export default AlphabeticList

const styles = StyleSheet.create( {
  container:{
    flex:1,
    position:'absolute',
    right:10,
    justifyContent:'center',
    alignItems:'center',
    zIndex:10
  },
  letter:{
    fontSize:RFValue( 12 ),
    color:'gray'
  },
  highlight:{
    backgroundColor:'#69A2B0',
    borderRadius:RFValue( 14 ),
    justifyContent:'center',
    paddingHorizontal:4.5,
    paddingVertical:1,
    alignItems:'center',
  },
  highlightLetter:{
    fontSize:RFValue( 10 ),
    color:'white'
  }
} )
