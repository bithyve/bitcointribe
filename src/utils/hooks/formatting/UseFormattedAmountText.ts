import { SATOSHIS_IN_BTC } from "../../../common/constants/BitcionConstants";
import CurrencyKind from "../../../common/data/enums/CurrencyKind";
import { UsNumberFormat } from "../../../common/utilities";
import useCurrencyCode from "../state-selectors/UseCurrencyCode";
import useCurrencyKind from "../state-selectors/UseCurrencyKind";
import useExchangeRates from "../state-selectors/UseExchangeRates";

export default function useFormattedAmountText(
  balance: number,
): string {
  const currencyKind = useCurrencyKind();
  const fiatCurrencyCode = useCurrencyCode();
  const exchangeRates = useExchangeRates();

  if (currencyKind === CurrencyKind.BITCOIN) {
    return UsNumberFormat(balance);
  } else if (
    exchangeRates !== undefined &&
    exchangeRates[fiatCurrencyCode] !== undefined &&
    exchangeRates[fiatCurrencyCode].last !== undefined
  ) {
    return (
      (balance / SATOSHIS_IN_BTC) * exchangeRates[fiatCurrencyCode].last
    ).toFixed(2);
  } else {
    return `${balance}`;
  }
}
