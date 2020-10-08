import { useMemo } from "react";
import { displayNameForBitcoinUnit } from "../../../common/data/enums/BitcoinUnit";
import CurrencyKind from "../../../common/data/enums/CurrencyKind";
import useCurrencyCode from "../state-selectors/UseCurrencyCode";
import useCurrencyKind from "../state-selectors/UseCurrencyKind";
import AccountShell from "../../../common/data/models/AccountShell";


export default function useFormattedUnitText(
  accountShell: AccountShell,
): string {
  const currencyKind = useCurrencyKind();
  const fiatCurrencyCode = useCurrencyCode();

  const prefersBitcoin: boolean = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);

  if (prefersBitcoin) {
    return displayNameForBitcoinUnit(accountShell.unit);
  } else {
    return fiatCurrencyCode.toLocaleLowerCase();
  }
}
