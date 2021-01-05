import React, { useMemo } from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export const materialIconCurrencyCodes = [
  'BRL',
  'BDT',
  'CNY',
  'JPY',
  'GBP',
  'KRW',
  'KZT',
  'RUB',
  'TRY',
  'INR',
  'ILS',
  'MNT',
  'NGN',
  'PHP',
  'EUR',
  'TWD',
  'USD',
]


function getCurrencyCodeIconName( currencyCode: string ): string {
  switch ( currencyCode ) {
      case 'BRL':
        return 'currency-brl'
      case 'BDT':
        return 'currency-bdt'
      case 'CNY':
        return 'currency-cny'
      case 'JPY':
        return 'currency-jpy'
      case 'GBP':
        return 'currency-gbp'
      case 'KRW':
        return 'currency-krw'
      case 'RUB':
        return 'currency-rub'
      case 'TRY':
        return 'currency-try'
      case 'TWD':
        return 'currency-twd'
      case 'INR':
        return 'currency-inr'
      case 'ILS':
        return 'currency-ils'
      case 'KZT':
        return 'currency-kzt'
      case 'MNT':
        return 'currency-mnt'
      case 'NGN':
        return 'currency-ngn'
      case 'PHP':
        return 'currency-php' 
      case 'EUR':
        return 'currency-eur'
      case 'USD':
        return 'currency-usd'
      default:
        return 'currency-usd'
  }
}

export interface Props {
  currencyCode: string;
  color: string;
  size: number;
  style?: Record<string, unknown>;
}

const MaterialCurrencyCodeIcon: React.FC<Props> = ( {
  currencyCode,
  color,
  size,
  style = {
  },
}: Props ) => {
  const iconName = useMemo( () => {
    return getCurrencyCodeIconName( currencyCode )
  }, [ currencyCode ] )

  return (
    <MaterialCommunityIcons
      style={style}
      name={iconName}
      color={color}
      size={size}
    />
  )
}

export default MaterialCurrencyCodeIcon
