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
  // All currencies that use a $ symbol
  'USD', 'AUD', 'BBD', 'BSD', 'BZD', 'BMD', 'BND', 'KHR', 'CAD', 'KYD', 'XCD', 'FJD', 'GYD', 'HKD', 'JMD', 'LRD', 'NAD', 'NZD', 'SGD', 'SBD', 'SRD', 'TTD', 'TVD', 'ZWD', 'MXN', 'COP', 'CLP', 'UYU', 'DOP', 'ARS',
  // All currencies that use a £ symbol
  'EGP', 'FKP', 'GIP', 'GGP', 'IMP', 'JEP', 'SHP', 'SYP', 'GBP'
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

      // below are all the currencies which use a £ symbol
      case 'EGP':
      case 'FKP':
      case 'GIP':
      case 'GGP':
      case 'IMP':
      case 'JEP':
      case 'SHP':
      case 'SYP':
      case 'GBP':
        return 'currency-gbp'

      // below are all the currencies which use a $ symbol
      case 'AUD':
      case 'BBD':
      case 'BSD':
      case 'BZD':
      case 'BMD':
      case 'BND':
      case 'KHR':
      case 'CAD':
      case 'KYD':
      case 'XCD':
      case 'FJD':
      case 'GYD':
      case 'HKD':
      case 'JMD':
      case 'LRD':
      case 'NAD':
      case 'NZD':
      case 'SGD':
      case 'SBD':
      case 'SRD':
      case 'TTD':
      case 'TVD':
      case 'ZWD':
      case 'MXN':
      case 'COP':
      case 'CLP':
      case 'UYU':
      case 'DOP':
      case 'ARS':
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
