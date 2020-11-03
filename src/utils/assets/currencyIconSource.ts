const currencyIconBasePath = '../../assets/images/currencySymbols/';
const iconPrefixGray = 'currency_icon_gray_';
const iconPrefixDark = 'currency_icon_dark_';
const iconExtension = '.png';
const validCurrencies = ['USD', 'GBP'];

export default function getFormattedStringFromQRString(
  currencyCode: string | null,
  dark: boolean | false,
): string {
  let imageName = 'blank';

  const iconPrefix = dark ? iconPrefixDark : iconPrefixGray;

  if (validCurrencies.includes(currencyCode)) imageName = currencyCode;

  return `${currencyIconBasePath}${iconPrefix}${imageName}${iconExtension}`;
}
