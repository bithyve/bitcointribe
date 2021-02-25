enum BitcoinUnit {
  SATS = 'SATS',
  BTC = 'BTC',
  TSATS = 'TSATS',
}


export function displayNameForBitcoinUnit( unit: BitcoinUnit ): string {
  switch ( unit ) {
      case BitcoinUnit.SATS:
        return 'sats'
      case BitcoinUnit.BTC:
        return 'BTC'
      case BitcoinUnit.TSATS:
        return 't-sats'
  }
}

export default BitcoinUnit
