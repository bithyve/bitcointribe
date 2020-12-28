const iconPrefixGray = 'gray_'
const iconPrefixDark = 'dark_'
const defaultSymbol = 'blank'

//Add all valid currencies and the location below

const currencySymbols = {
  dark_USD: require( '../../assets/images/currencySymbols/currency_icon_dark_USD.png' ),
  gray_USD: require( '../../assets/images/currencySymbols/currency_icon_gray_USD.png' ),
  dark_GBP: require( '../../assets/images/currencySymbols/currency_icon_dark_GBP.png' ),
  gray_GBP: require( '../../assets/images/currencySymbols/currency_icon_gray_GBP.png' ),
  dark_blank: require( '../../assets/images/currencySymbols/currency_icon_dark_blank.png' ),
  gray_blank: require( '../../assets/images/currencySymbols/currency_icon_gray_blank.png' ),
}

export default function currencyIconSource(
  currencyCode: string | null,
  dark: boolean | false,
): string {
  const iconPrefix = dark ? iconPrefixDark : iconPrefixGray

  return (
    currencySymbols[ iconPrefix + currencyCode ] ||
    currencySymbols[ iconPrefix + defaultSymbol ]
  )
}
