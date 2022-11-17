import React from 'react';
import { View } from 'react-native';
export interface Props {
  height?: number;
  width?: number;
  color?: string;
  radius?: number;
  newTransaction: false
}
const DotView = (props: Props) => {
  return ( 
    <View
      
        style={{
            height: props.height,
            width: props.width,
            borderRadius: props.radius,
            backgroundColor: props.color
        }}
    >
    </View>
  )
};
export default DotView;
