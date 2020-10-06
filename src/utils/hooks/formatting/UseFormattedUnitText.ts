import { useMemo } from "react";
import AccountKind from "../../../common/data/enums/AccountKind";
import { displayNameForBitcoinUnit } from "../../../common/data/enums/BitcoinUnit";
import CurrencyKind from "../../../common/data/enums/CurrencyKind";
import AccountPayload from "../../../common/data/models/AccountPayload/Interfaces";
import useCurrencyCode from "../state-selectors/UseCurrencyCode";
import useCurrencyKind from "../state-selectors/UseCurrencyKind";


export default function useFormattedUnitText(
  accountPayload: AccountPayload,
): string {
  const currencyKind = useCurrencyKind();
  const fiatCurrencyCode = useCurrencyCode();

  const prefersBitcoin: boolean = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);

  const isUsingBitcoinUnits: boolean = useMemo(() => {
    return prefersBitcoin || accountPayload.kind === AccountKind.TEST;
  }, [prefersBitcoin, accountPayload])


  if (isUsingBitcoinUnits) {
    return displayNameForBitcoinUnit(accountPayload.unit);
  } else {
    return fiatCurrencyCode.toLocaleLowerCase();
  }
}
