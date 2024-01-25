import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Colors from '../common/Colors';

type Props = {
  onPress: () => void;
};

function UploadImage( { onPress = () => {} }: Props ) {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      style={styles.container}>
      <Text style={styles.text}>Upload from gallery</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create( {
  container: {
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
    backgroundColor: Colors.blue,
    marginBottom: 20,
    marginTop:10
  },
  text: {
    letterSpacing: 0.6,
    fontSize: 16,
    color: Colors.white
  },
} )

export default UploadImage
