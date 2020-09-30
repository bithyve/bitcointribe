import React, { useMemo } from 'react';
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
  'USD',
];


function getCurrencyCodeIconName(currencyCode: string): string {
  switch (currencyCode) {
    case 'BRL':
      return 'currency-brl';
    case 'CNY':
    case 'JPY':
      return 'currency-cny';
    case 'GBP':
      return 'currency-gbp';
    case 'KRW':
      return 'currency-krw';
    case 'RUB':
      return 'currency-rub';
    case 'TRY':
      return 'currency-try';
    case 'INR':
      return 'currency-inr';
    case 'EUR':
      return 'currency-eur';
    case 'USD':
      return 'currency-usd';
    default:
      return 'currency-usd';
  }
};

export interface Props {
  currencyCode: string;
  color: string;
  size: number;
}

const MaterialCurrencyCodeIcon: React.FC<Props> = ({
  currencyCode,
  color,
  size,
}: Props) => {
  const iconName = useMemo(() => {
    return getCurrencyCodeIconName(currencyCode);
  }, [currencyCode]);

  return (
    <MaterialCommunityIcons
      name={iconName}
      color={color}
      size={size}
    />
  );
};

export default MaterialCurrencyCodeIcon;
