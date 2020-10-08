enum SubAccountKind {
  TEST,

  /**
   * E.g.: Checking Accounts
   */
  REGULAR,

  /**
   * E.g.: Savings Accounts
   */
  SECURE,

  /**
   * E.g.: "Friend & Family"/"Joint" Account
   */
  TRUSTED_CONTACTS,

  DONATION,

  /**
   * E.g.: Fast Bitcoins, Swan
   */
  SERVICE,

  WATCH_ONLY_IMPORTED_WALLET,

  FULLY_IMPORTED_WALLET,
};

export default SubAccountKind;
