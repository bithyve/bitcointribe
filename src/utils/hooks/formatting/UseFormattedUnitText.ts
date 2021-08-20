
import { useMemo } from 'react'
import BitcoinUnit, { displayNameForBitcoinUnit } from '../../../common/data/enums/BitcoinUnit'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import useCurrencyCode from '../state-selectors/UseCurrencyCode'
import useCurrencyKind from '../state-selectors/UseCurrencyKind'

export type Props = {
  bitcoinUnit?: BitcoinUnit;
  currencyKind?: CurrencyKind;
};

export default function useFormattedUnitText( {
  bitcoinUnit = BitcoinUnit.SATS,
  currencyKind = useCurrencyKind(),
}: Props ): string {
  const fiatCurrencyCode = useCurrencyCode()

  const prefersBitcoin: boolean = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  if ( prefersBitcoin ) {
    return displayNameForBitcoinUnit( bitcoinUnit )
  } else {
    return fiatCurrencyCode
  }
}
