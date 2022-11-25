import React, { FC } from 'react'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { hp } from '../common/data/responsiveness/responsive'
import Ionicons from 'react-native-vector-icons/Ionicons'

type Props = {
  onPressNumber: ( string ) => void;
}

const KeyPad: FC<Props> = ( { onPressNumber } ) => {
  return (
    <View style={ {
      marginTop: 'auto',
    } }>
      <View style={ styles.keyPadRow }>
        <TouchableOpacity
          onPress={ () => onPressNumber( '1' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( '1' ) }
          >
            1
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => onPressNumber( '2' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( '2' ) }
          >
            2
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => onPressNumber( '3' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( '3' ) }
          >
            3
          </Text>
        </TouchableOpacity>
      </View>
      <View style={ styles.keyPadRow }>
        <TouchableOpacity
          onPress={ () => onPressNumber( '4' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( '4' ) }
          >
            4
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => onPressNumber( '5' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( '5' ) }
          >
            5
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => onPressNumber( '6' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( '6' ) }
          >
            6
          </Text>
        </TouchableOpacity>
      </View>
      <View style={ styles.keyPadRow }>
        <TouchableOpacity
          onPress={ () => onPressNumber( '7' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( '7' ) }
          >
            7
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => onPressNumber( '8' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( '8' ) }
          >
            8
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => onPressNumber( '9' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( '9' ) }
          >
            9
          </Text>
        </TouchableOpacity>
      </View>
      <View style={ styles.keyPadRow }>
        <View style={ styles.keyPadElementTouchable }>
          <Text style={ {
            flex: 1, padding: 15
          } }></Text>
        </View>
        <TouchableOpacity
          onPress={ () => onPressNumber( '0' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( '0' ) }
          >
            0
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => onPressNumber( 'x' ) }
          style={ styles.keyPadElementTouchable }
        >
          <Text
            style={ styles.keyPadElementText }
            onPress={ () => onPressNumber( 'x' ) }
          >
            <Ionicons name="ios-backspace" size={ 30 } color={ Colors.blue } />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default KeyPad

const styles = StyleSheet.create( {
  keyPadElementText: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    fontFamily: Fonts.FiraSansRegular,
    fontStyle: 'normal'
  },
  keyPadRow: {
    flexDirection: 'row',
    height: hp( 70 )
  },
  keyPadElementTouchable: {
    flex: 1,
    height: hp( 70 ),
    fontSize: RFValue( 18 ),
    justifyContent: 'center',
    alignItems: 'center'
  },
} )
