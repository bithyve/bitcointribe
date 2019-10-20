import React from 'react';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import IcomoonConfig from '@up-theme/selection.json';

const Icomoon = createIconSetFromIcoMoon(IcomoonConfig);
const SvgIcon = (props: any) => {
  return (
    <Icomoon
      color={props.color}
      size={props.size}
      name={props.name}
      style={props.style}
    />
  );
};
export default SvgIcon;
