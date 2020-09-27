enum BitcoinUnit {
  SATS,
  BTC,
  TSATS,
}


export function displayNameForBitcoinUnit(unit: BitcoinUnit): string {
  switch (unit) {
    case BitcoinUnit.SATS:
      return "Sats";
    case BitcoinUnit.BTC:
      return "BTC";
    case BitcoinUnit.TSATS:
      return "T-Sats";
  }
}

export default BitcoinUnit;
