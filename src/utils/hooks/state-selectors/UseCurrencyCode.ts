import { useSelector } from 'react-redux'

export default function useCurrencyCode( defaultCode = 'USD' ): string {
  return useSelector( ( state ) => {
    return state.preferences.currencyCode || defaultCode
  } )
}
