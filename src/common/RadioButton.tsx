import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import styles from './styles';

const RadioButton = (props: any) => {

  const select = (value: any) => {
    props.onSelecting(value);
  }

  const { buttonContainer, circle, checkedCircle } = styles;

  return (
    <TouchableOpacity
      style={circle}
      onPress={() => select(props.value)}
    >
      <View style={buttonContainer}>
        {props.selected === props.value && (<View style={checkedCircle} />)}
        <Text>{props.label}</Text>
      </View>
    </TouchableOpacity>
  )
};
const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
  }
});

export default RadioButton;