enum SubAccountKind {
  TEST_ACCOUNT = 'TEST_ACCOUNT',

  /**
   * E.g.: Checking Accounts
   */
  REGULAR_ACCOUNT = 'REGULAR_ACCOUNT',

  /**
   * E.g.: Savings Accounts
   */
  SECURE_ACCOUNT = 'SECURE_ACCOUNT',

  /**
   * E.g.: "Friend & Family"/"Joint" Account
   */
  TRUSTED_CONTACTS = 'TRUSTED_CONTACTS',

  DONATION_ACCOUNT = 'DONATION_ACCOUNT',

  /**
   * E.g.: Fast Bitcoins = 'Bitcoins', Swan
   */
  SERVICE = 'SERVICE',

  WATCH_ONLY_IMPORTED_WALLET = 'WATCH_ONLY_IMPORTED_WALLET',

  FULLY_IMPORTED_WALLET = 'FULLY_IMPORTED_WALLET',
}

export default SubAccountKind
