import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const materialIconCurrencyCodes = [
  'BRL',
  'CNY',
  'JPY',
  'GBP',
  'KRW',
  'RUB',
  'TRY',
  'INR',
  'EUR',
];

export interface Props {
  iconName: string;
  color: string;
  size: number;
}

const MaterialCurrencyCodeIcon: React.FC<Props> = ({
  iconName,
  color,
  size,
}: Props) => {
  return (
    <MaterialCommunityIcons
      name={iconName}
      color={color}
      size={size}
    />
  );
};

export default MaterialCurrencyCodeIcon;
