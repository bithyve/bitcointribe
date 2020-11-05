import { useMemo } from "react";
import BitcoinUnit, { displayNameForBitcoinUnit } from "../../../common/data/enums/BitcoinUnit";
import CurrencyKind from "../../../common/data/enums/CurrencyKind";
import useCurrencyCode from "../state-selectors/UseCurrencyCode";
import useCurrencyKind from "../state-selectors/UseCurrencyKind";


export default function useFormattedUnitText(
  bitcoinUnit: BitcoinUnit,
): string {
  const currencyKind = useCurrencyKind();
  const fiatCurrencyCode = useCurrencyCode();

  const prefersBitcoin: boolean = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);

  if (prefersBitcoin) {
    return displayNameForBitcoinUnit(bitcoinUnit);
  } else {
    return fiatCurrencyCode.toLocaleLowerCase();
  }
}
