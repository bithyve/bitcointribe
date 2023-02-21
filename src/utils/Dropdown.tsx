import React from 'react'
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP } from 'react-native-responsive-screen'

const styles = StyleSheet.create( {
  dropdownBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 13 ),
    marginRight: 15,
  },
  dropdownBoxModal: {
    borderRadius: 10,
    margin: 20,
    height: 'auto',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: {
      width: 0, height: 10
    },
    backgroundColor: Colors.white,
    marginTop: -10
  },
  dropdownBoxModalElementView: {
    height: 45,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
} )
const DropDown = ( { onClose, dropdownBoxList } ) => {
  return (
    <View style={styles.dropdownBoxModal}>
      <ScrollView
        nestedScrollEnabled={true}
        style={{
          height: heightPercentageToDP( '15%' )
        }}
      >
        {dropdownBoxList.map( ( value, index ) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setTimeout( () => {
                onClose( value )
              }, 70 )
            }}
            style={{
              ...styles.dropdownBoxModalElementView,
              borderTopLeftRadius: index == 0 ? 10 : 0,
              borderTopRightRadius: index == 0 ? 10 : 0,
              borderBottomLeftRadius:
                        index == dropdownBoxList.length - 1 ? 10 : 0,
              borderBottomRightRadius:
                        index == dropdownBoxList.length - 1 ? 10 : 0,
              paddingTop: index == 0 ? 5 : 0,
              // backgroundColor: dropdownBoxValue
              //   ? dropdownBoxValue.id == value.id
              //     ? Colors.lightBlue
              //     : Colors.white
              //   : Colors.white,
            }}
          >
            <Text
              style={{
                // color:
                //     dropdownBoxValue.id == value.id
                //       ? Colors.blue
                //       : Colors.black,
                fontFamily: Fonts.Regular,
                fontSize: RFValue( 12 ),
              }}
            >
              {value.type}
            </Text>
          </TouchableOpacity>
        ) )}
      </ScrollView>
    </View>
  )
}

export default DropDown

