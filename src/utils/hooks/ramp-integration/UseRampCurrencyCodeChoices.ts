import { useMemo } from 'react'

export type RampCurrencyCodePickerItem = {
  value: string;
  label;
}

const currencyCodeChoices: RampCurrencyCodePickerItem[] = [
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


export default function useRampCurrencyCodeChoices() {
  return useMemo( () => {
    return currencyCodeChoices
  }, [] )
}
