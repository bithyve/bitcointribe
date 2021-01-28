import { useMemo } from 'react'

export type WyreCurrencyCodePickerItem = {
  value: string;
  label;
}

const currencyCodeChoices: WyreCurrencyCodePickerItem[] = [
  {
    value: 'USD',
    label: 'USD',
  },
  {
    value: 'GBP',
    label: 'GBP',
  },
  {
    value: 'EUR',
    label: 'EUR',
  },
  {
    value: 'CAD',
    label: 'CAD',
  },
  {
    value: 'AUD',
    label: 'AUD',
  },
]


export default function useWyreCurrencyCodeChoices() {
  return useMemo( () => {
    return currencyCodeChoices
  }, [] )
}
